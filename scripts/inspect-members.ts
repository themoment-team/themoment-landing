/* What the Notion member database actually looks like, and what this code
   made of it.

     npm run members:inspect

   Run it against any database you have not seen before. It prints every
   column Notion really has, its type, a sample value off the first row, and
   which logical field claimed it. A column that comes back unclaimed is one
   line in FIELD_MAP away from working — add the real name to that row
   rather than renaming it in Notion, since another repo reads the same
   database.

   Written in TypeScript and run straight by Node, which strips the types on
   the way in, so it shares FIELD_MAP with the app instead of keeping a
   second copy that drifts. It imports the property reader only — nothing
   here touches the server-only fetch. */

import {
  FIELD_MAP,
  readProperty,
  resolveFields,
  type LogicalField,
  type NotionPage,
} from "../src/entities/teamMember/lib/notion.ts";

const NOTION_VERSION = "2022-06-28";

async function main() {
  const secret = process.env.NOTION_SECRET_API_KEY;
  const databaseId = process.env.NOTION_MEMBER_DATABASE_ID;

  if (!secret || !databaseId) {
    console.error(
      "[members] NOTION_SECRET_API_KEY / NOTION_MEMBER_DATABASE_ID not set — copy .env.example to .env.local",
    );
    process.exit(1);
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  if (!res.ok) {
    /* Notion hides a database from an integration until someone shares it,
       and answers "not found" rather than "not shared" — so a correct id
       fails exactly like a typo. */
    console.error(`[members] Notion ${res.status} ${res.statusText}`);
    if (res.status === 404) {
      console.error("[members] 404 usually means the integration has not been added to the database.");
      console.error("[members] Open it in Notion → ⋯ → Connections → add the integration, then retry.");
    }
    console.error(`[members] ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
  }

  const json = (await res.json()) as { results?: NotionPage[]; has_more?: boolean };
  const pages = json.results ?? [];

  if (!pages.length) {
    console.error("[members] the database is empty.");
    process.exit(1);
  }

  const fields = resolveFields(pages[0].properties);
  const claimedBy = new Map(Object.entries(fields).map(([field, column]) => [column, field]));

  console.log(`\n[members] ${pages.length} row(s)${json.has_more ? "+ (more pages)" : ""}. Columns on the first row:\n`);
  console.table(
    Object.entries(pages[0].properties).map(([column, prop]) => {
      const sample = String(readProperty(prop) ?? "").replace(/\s+/g, " ");
      return {
        column,
        type: prop.type,
        "mapped to": claimedBy.get(column) ?? "—",
        sample: sample.length > 40 ? `${sample.slice(0, 39)}…` : sample,
      };
    }),
  );

  const unmapped = (Object.keys(FIELD_MAP) as LogicalField[]).filter((f) => !fields[f]);
  if (unmapped.length) {
    console.log(`[members] no column matched: ${unmapped.join(", ")}`);
    console.log("[members] add the real name to that row in src/entities/teamMember/lib/notion.ts\n");
  } else {
    console.log("[members] every logical field found a column.\n");
  }
}

main().catch((err) => {
  console.error("[members]", err);
  process.exit(1);
});
