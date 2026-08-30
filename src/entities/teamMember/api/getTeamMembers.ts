import "server-only";

import type { GenerationGroup, TeamMember } from "../model/types";
import {
  cleanGithubId,
  readGeneration,
  readText,
  readVisible,
  resolveFields,
  type NotionPage,
} from "../lib/notion";

/* The team, read from Notion on the server and cached for an hour.

   This is the whole reason the site moved off Vite. Calling Notion from a
   browser fails twice over — their API sends no CORS headers, and the
   integration secret would be sitting in the bundle for anyone to read. In
   a server component the secret stays on the server and the visitor gets
   HTML with the team already in it.

   Cached rather than fetched per request: a landing page does not need to
   see a Notion edit the second it happens, and 33 members is 33 rows that
   would otherwise be re-fetched for every visitor. An hour is the same
   window readygsm-client uses. */
const REVALIDATE_SECONDS = 3600;

/* Deliberately the version themoment-team/readygsm-client pins. Notion
   reworked databases into data sources in 2025-09-03 — the query endpoint
   moves and the response nests differently — and nothing here wants it.
   Change it in both repos or neither. */
const NOTION_VERSION = "2022-06-28";

const collator = new Intl.Collator("ko");

async function queryAll(databaseId: string, secret: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  /* Notion answers 100 rows at a time and says whether there are more.
     readygsm-client reads the first page and stops, which stays invisible
     until the 101st member joins. */
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 }),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["team-members"] },
    });

    if (!res.ok) {
      /* 404 here almost never means a wrong id. Notion hides every database
         from an integration until someone shares it, and answers "not
         found" rather than "not shared" — so a perfect id fails exactly
         like a typo until the integration is added under ⋯ → Connections. */
      const hint = res.status === 404 ? " (is the integration added to the database under ⋯ → Connections?)" : "";
      throw new Error(`Notion ${res.status} ${res.statusText}${hint}`);
    }

    const json = (await res.json()) as { results?: NotionPage[]; has_more?: boolean; next_cursor?: string };
    pages.push(...(json.results ?? []));
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);

  return pages;
}

/* Generation, then whatever order the database gives, then the name.

   readygsm-client shuffles with Math.random(), which fights its own hourly
   cache: the order is not random to a visitor, it is arbitrary and frozen
   until the cache turns over. Ordering here makes it a property of the data
   instead. Anyone without a generation sorts to the end rather than to the
   front, which is what Infinity is doing. */
function compare(a: TeamMember, b: TeamMember): number {
  const ga = a.generation ?? Number.POSITIVE_INFINITY;
  const gb = b.generation ?? Number.POSITIVE_INFINITY;
  if (ga !== gb) return ga - gb;

  const oa = a.order ?? Number.POSITIVE_INFINITY;
  const ob = b.order ?? Number.POSITIVE_INFINITY;
  if (oa !== ob) return oa - ob;

  return collator.compare(a.name, b.name);
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const secret = process.env.NOTION_SECRET_API_KEY;
  const databaseId = process.env.NOTION_MEMBER_DATABASE_ID;

  /* No key is a normal state for a fresh checkout, not a crash. The section
     renders its empty state and says so; readygsm-client's member fetch
     omits this guard and requests /databases/undefined/query instead. */
  if (!secret || !databaseId) {
    console.warn("[team] NOTION_SECRET_API_KEY / NOTION_MEMBER_DATABASE_ID not set — see .env.example");
    return [];
  }

  let pages: NotionPage[];
  try {
    pages = await queryAll(databaseId, secret);
  } catch (err) {
    /* A Notion outage should cost the page its team section, not the whole
       render. Everything else on the page is static. */
    console.error("[team]", err instanceof Error ? err.message : err);
    return [];
  }

  if (!pages.length) return [];

  const fields = resolveFields(pages[0].properties);

  const members = pages
    .map((page): TeamMember & { visible: boolean } => {
      const read = (field: keyof typeof fields) => {
        const column = fields[field];
        return column ? readText(page.properties[column]) : "";
      };

      const { generation, generationLabel } = readGeneration(read("generation"));
      const githubId = cleanGithubId(read("githubId"));
      const order = read("order");
      const avatar = read("avatar");

      return {
        id: page.id,
        name: read("name"),
        githubId,
        role: read("role"),
        generation,
        generationLabel,
        status: read("status"),
        tagline: read("tagline"),
        /* A picture the database points at wins; otherwise GitHub draws
           one. github.com/{id}.png redirects to the account's avatar, and
           GitHub gives every account an identicon even when nobody uploaded
           anything — so this is empty only when there is no GitHub id at
           all. When the id is wrong the request 404s in the browser and the
           card falls back to initials; see MemberCard. */
        avatarUrl: avatar || (githubId ? `https://github.com/${githubId}.png` : ""),
        link: read("link") || (githubId ? `https://github.com/${githubId}` : ""),
        order: order === "" ? null : Number(order),
        visible: readVisible(read("visible")),
      };
    })
    /* A row with no name is a blank line someone left in Notion. */
    .filter((m) => m.visible && m.name)
    .map(({ visible: _visible, ...member }) => member);

  members.sort(compare);
  return members;
}

/* The design tabs the team by part, but Design is two people and DevOps two
   more — four columns would be two long ones and two stubs. Generations cut
   the same 33 people into even groups, so that is what the page shows. */
export function groupByGeneration(members: TeamMember[]): GenerationGroup[] {
  const groups = new Map<string, GenerationGroup>();

  for (const member of members) {
    const key = member.generationLabel || "기타";
    const existing = groups.get(key);
    if (existing) existing.members.push(member);
    else groups.set(key, { key, label: key, members: [member] });
  }

  /* The members are already sorted, so the first member of each group
     carries the group's own position. */
  return [...groups.values()];
}
