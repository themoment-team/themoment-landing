/* Reading Notion's shape without letting it leak any further than this file.

   The database came first and already has members in it, so the code bends
   to the database rather than the other way round: nothing here asks anyone
   to rename a column. Two things make that work — a table of the names each
   logical field will answer to, and a reader that does not care what type a
   property is. */

/* Notion's property payloads, loosely. Typing these exactly means either a
   dependency on @notionhq/client or several hundred lines of unions, and
   the reader below narrows by `type` at runtime anyway. */
type TextRun = { plain_text?: string };
type NamedOption = { name?: string };

export interface NotionProperty {
  type: string;
  [key: string]: unknown;
}

export interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
}

/* ---------- the mapping ----------

   The two Notion databases this team already runs disagree about language:
   the ReadyGSM member database is English camelCase, its activity database
   is Korean. Both spellings are listed for every field, so either binds.

   If a column comes back unclaimed, add its real name to the row rather
   than renaming it in Notion — someone else is reading that database too.
   `npm run members:inspect` prints what matched and what did not. */
export const FIELD_MAP = {
  name: ["name", "이름", "성명", "멤버"],
  githubId: ["githubId", "github", "깃허브", "깃헙", "github아이디"],
  role: ["role", "역할", "파트", "part", "포지션", "직군"],
  generation: ["generation", "기수", "gen", "cohort"],
  status: ["status", "상태", "활동상태"],
  tagline: ["tagline", "한줄소개", "소개", "설명", "bio"],
  avatar: ["avatar", "프로필", "사진", "image", "프로필사진"],
  link: ["link", "링크", "url", "포트폴리오"],
  order: ["order", "순서", "정렬"],
  visible: ["visible", "노출", "공개", "표시"],
} as const;

export type LogicalField = keyof typeof FIELD_MAP;

const normalise = (s: string) => s.toLowerCase().replace(/[\s_-]/g, "");

/* Which real column answers to which logical field. Resolved once against
   the first row rather than per member. */
export function resolveFields(
  properties: Record<string, NotionProperty>,
): Partial<Record<LogicalField, string>> {
  const byNormalised = new Map(Object.keys(properties).map((n) => [normalise(n), n]));
  const resolved: Partial<Record<LogicalField, string>> = {};

  for (const field of Object.keys(FIELD_MAP) as LogicalField[]) {
    for (const candidate of FIELD_MAP[field]) {
      const hit = byNormalised.get(normalise(candidate));
      if (hit) {
        resolved[field] = hit;
        break;
      }
    }
  }
  return resolved;
}

/* ---------- reading a value ----------

   Type-blind on purpose. `role` is rich text in the ReadyGSM database and
   would just as reasonably be a select here; neither this code nor whoever
   edits Notion should have to care, and changing a column's type in Notion
   should not break a deploy. */
export function readProperty(prop: NotionProperty | undefined): string | boolean {
  if (!prop) return "";

  const runs = (key: string) =>
    ((prop[key] as TextRun[] | undefined) ?? [])
      .map((t) => t.plain_text ?? "")
      .join("")
      .trim();

  switch (prop.type) {
    /* Both are arrays of runs, and Notion splits the array wherever the
       styling changes — bolding one word turns one run into three. Reading
       only the first, as readygsm-client does, silently truncates the cell
       at the first styled character. */
    case "title":
      return runs("title");
    case "rich_text":
      return runs("rich_text");

    case "select":
      return (prop.select as NamedOption | null)?.name ?? "";
    case "status":
      return (prop.status as NamedOption | null)?.name ?? "";
    case "multi_select":
      return ((prop.multi_select as NamedOption[] | undefined) ?? [])
        .map((o) => o.name ?? "")
        .filter(Boolean)
        .join(", ");

    case "number":
      return prop.number === null || prop.number === undefined ? "" : String(prop.number);
    case "url":
      return (prop.url as string | null) ?? "";
    case "email":
      return (prop.email as string | null) ?? "";
    case "phone_number":
      return (prop.phone_number as string | null) ?? "";
    case "checkbox":
      return prop.checkbox === true;
    case "date":
      return (prop.date as { start?: string } | null)?.start ?? "";
    case "people":
      return ((prop.people as NamedOption[] | undefined) ?? [])
        .map((p) => p.name ?? "")
        .filter(Boolean)
        .join(", ");

    /* An uploaded file carries a signed URL that expires in about an hour;
       an external one is a link someone pasted and keeps working. Which is
       why getTeamMembers treats the two differently. */
    case "files": {
      const first = ((prop.files as { file?: { url?: string }; external?: { url?: string } }[]) ?? [])[0];
      return first?.file?.url ?? first?.external?.url ?? "";
    }

    /* A formula or rollup is whatever it resolves to, so unwrap and read
       that instead. */
    case "formula": {
      const f = prop.formula as NotionProperty & { type: string };
      return readProperty({ type: f.type, [f.type]: f[f.type] });
    }
    case "rollup": {
      const r = prop.rollup as NotionProperty & { type: string };
      if (r.type === "array") {
        return ((r.array as NotionProperty[]) ?? [])
          .map((x) => String(readProperty(x)))
          .filter(Boolean)
          .join(", ");
      }
      return readProperty({ type: r.type, [r.type]: r[r.type] });
    }

    default:
      return "";
  }
}

export const readText = (prop: NotionProperty | undefined): string => {
  const value = readProperty(prop);
  return typeof value === "string" ? value.trim() : value ? "true" : "";
};

/* ---------- tidying particular fields ---------- */

/* People write their GitHub in whatever form is to hand — @handle, the full
   profile URL, a trailing slash. All of them mean the same account. */
export function cleanGithubId(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    .trim();
}

/* Generations get written 4기, 4, or "4th" depending on who typed them. The
   number is what sorts and groups; the string is what gets displayed. */
export function readGeneration(raw: string): { generation: number | null; generationLabel: string } {
  const label = (raw ?? "").trim();
  if (!label) return { generation: null, generationLabel: "" };
  const digits = label.match(/\d+/);
  return { generation: digits ? Number(digits[0]) : null, generationLabel: label };
}

/* Absent means shown. A database with no visibility column should not
   publish an empty team section, and neither should a checkbox nobody has
   ticked yet — only an explicit no hides anyone. */
export function readVisible(raw: string | boolean): boolean {
  if (raw === "" || raw === null || raw === undefined) return true;
  if (typeof raw === "boolean") return raw;
  return !["false", "no", "n", "0", "숨김", "비공개", "미노출"].includes(raw.trim().toLowerCase());
}
