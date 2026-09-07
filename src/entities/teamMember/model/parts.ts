import type { TeamMember } from "./types";

/* The parts, in the order the comp lists them as tabs. */
export const PARTS = ["Frontend", "Server", "Design", "DevOps"];

export interface PartGroup {
  part: string;
  members: TeamMember[];
}

/* Cut the roster into those parts.

   `role` is an enum in everything but type: it arrives from Notion as rich
   text somebody typed. When the section was a row of tabs a misspelling cost
   the team a tidy tab order; now that each part is its own section, a member
   whose role does not match one of the four would disappear from the page
   entirely — the one failure mode a team page must not have.

   So nothing is dropped. Unmatched roles are warned about by name and then
   given a section of their own, under whatever the data actually said. A
   "Serverr" section on the page is a bug anyone can see and fix in Notion; a
   missing person is not.

   The order inside a part is the order it was handed: getTeamMembers sorts
   by generation, then the database's own order, then name, and a filter
   preserves that. */
export function groupByPart(members: TeamMember[]): PartGroup[] {
  const buckets = new Map<string, TeamMember[]>(PARTS.map((part) => [part, []]));
  const unknown: TeamMember[] = [];

  for (const member of members) {
    const bucket = buckets.get(member.role);
    if (bucket) {
      bucket.push(member);
      continue;
    }
    unknown.push(member);
    /* Keyed on the role as written, so several people sharing one typo share
       a section rather than getting one each. A member with no role at all
       has no name to file them under, so they collect together. */
    const key = member.role || "기타";
    const strays = buckets.get(key) ?? [];
    strays.push(member);
    buckets.set(key, strays);
  }

  if (unknown.length > 0) {
    console.warn(
      `[team] 알 수 없는 role ${unknown.length}명 —`,
      unknown.map((m) => `${m.name}(${m.role || "없음"})`).join(", "),
    );
  }

  /* Empty parts are dropped here rather than in the section: a heading with
     a count of zero over an empty rail says nothing the absence would not. */
  return [...buckets]
    .filter(([, list]) => list.length > 0)
    .map(([part, list]) => ({ part, members: list }));
}
