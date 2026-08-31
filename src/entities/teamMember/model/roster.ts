import type { TeamMember } from "./types";

/* The team, written down.

   This is the list the section actually renders today. The Notion reader in
   ../api/getTeamMembers is finished and wired, but nobody has put an
   integration secret in .env.local yet, so it has nothing to read — and a
   landing page whose team section says "could not load" is worse than one
   carrying a list that is correct as of the day it was typed.

   It stays after Notion is connected, as the fallback: a contributor with no
   key still gets a working site, and a Notion outage does not take the
   section down with it. Which of the two is in use is decided in
   getTeamMembers, not here.

   Ordered by generation, and within a generation by part — Server, then
   Frontend, then Design and DevOps. That order is carried by `order` below
   rather than left to the sort, which would otherwise fall back to sorting
   names alphabetically and scatter the parts. */

type Row = [name: string, generation: number, role: string, githubId: string];

const ROWS: Row[] = [
  ["전지환", 4, "Server", "jyeonjyan"],
  ["정시원", 4, "Server", "siwony"],
  ["이선우", 4, "Frontend", "sunwoo0706"],
  ["서채운", 4, "DevOps", "coodns"],

  ["김성길", 5, "Server", "SungGil-5125"],
  ["양시준", 5, "Server", "YangSiJun528"],
  ["김형록", 5, "Frontend", "hyeongrok7874"],
  ["유시온", 5, "Frontend", "yoosion030"],

  ["최장우", 6, "Server", "jangwooooo"],
  ["하제우", 6, "Server", "hajeu"],
  ["이승제", 6, "Frontend", "frorong"],
  ["전예빈", 6, "Frontend", "yebin0310"],
  ["김하온", 6, "Design", "haonee"],

  ["김겸비", 7, "Server", "kimkyumbi"],
  ["신희성", 7, "Server", "vumrra"],
  ["김재균", 7, "Frontend", "gjaegyun"],
  ["방가온", 7, "Frontend", "gaoooon"],
  ["김주은", 7, "DevOps", "jueuunn7"],

  ["김태은", 8, "Server", "snowykte0426"],
  ["이세민", 8, "Server", "wwwcomcomcomcom"],
  ["이상혁", 8, "Frontend", "LeeSangHyeok0731"],
  ["전준연", 8, "Frontend", "junjuny0227"],
  ["정효주", 8, "Frontend", "h-0y28"],

  ["배재현", 9, "Server", "ZaMan0806"],
  ["홍지민", 9, "Server", "hongjm0912"],
  ["김서연", 9, "Frontend", "s2yeons"],
  ["정연돈", 9, "Frontend", "yeondon125"],
  ["김유찬", 9, "Design", "KIEYU5"],

  ["김대은", 10, "Server", "s26006-sys"],
  ["김영원", 10, "Server", "kim-kiwi"],
  ["한승헌", 10, "Server", "s26071-seungheon"],
  ["강동혁", 10, "Frontend", "lililililill2"],
  ["최민준", 10, "Frontend", "10mxun"],
];

export const ROSTER: TeamMember[] = ROWS.map(([name, generation, role, githubId], i) => ({
  /* Every one of them has a GitHub account, so the handle is both unique and
     stable — which is what a React key wants, and two members could share a
     name. */
  id: githubId,
  name,
  githubId,
  role,
  generation,
  generationLabel: `${generation}기`,
  status: "",
  tagline: "",
  /* github.com/{handle}.png redirects to the account's picture, and GitHub
     draws an identicon for accounts that never uploaded one — so this is
     only ever empty if the handle is wrong, and the card falls back to
     initials when the request 404s. */
  avatarUrl: `https://github.com/${githubId}.png`,
  link: `https://github.com/${githubId}`,
  order: i,
}));
