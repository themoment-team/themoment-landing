/* One member of the team, as the rest of the app wants them — not as Notion
   stores them. Everything here is already unwrapped, trimmed and defaulted,
   so no component has to know that Notion keeps a name as an array of
   styled text runs. */
export interface TeamMember {
  /* The Notion page id. React keys hang off it, and it is the only field
     guaranteed unique — two members can share a name. */
  id: string;
  name: string;
  /* Empty when the database has no GitHub for them. Everything derived from
     it — the avatar, the profile link — is empty too, and the card draws
     initials instead. */
  githubId: string;
  role: string;
  /* The number sorts and groups; the label is what the database actually
     said, so "4기" survives as written. A member with no generation gets
     null and falls to the end. */
  generation: number | null;
  generationLabel: string;
  status: string;
  tagline: string;
  /* Either a picture the database points at or github.com/{id}.png. Empty
     means neither exists. */
  avatarUrl: string;
  link: string;
  order: number | null;
}
