/* The handful of facts the page states about itself, in one place because
   four different files have to agree on them: the document's metadata, the
   robots file, the sitemap, and the structured data. */

/* The team's own name, set the way the site sets it. This is the wordmark —
   what the page calls itself in the corner and in an Open Graph card's
   siteName — and nothing else. It is deliberately NOT the title: a result
   reading "the_moment" and nothing else matches no query anyone types. */
export const SITE_NAME = "the_moment";

/* What the <title> says, which is the strongest single thing this page can
   tell a search engine and the line a person reads in a result.

   Front-loaded with the name someone would search, then the school, because
   a title is weighted from the left and truncated from the right. Both
   spellings are in it: "더모먼트" is the query, "the_moment" is what the
   site is called and what the team is called on GitHub and Instagram. */
export const SITE_TITLE = "더모먼트(the_moment) — 광주소프트웨어마이스터고 전공동아리";

/* Google shows around 150 characters of this. The first sentence answers
   who, so a truncation still lands somewhere sensible; the second names the
   services, because those names — HelloGSM above all — are what this team
   is actually searched by, and the landing page is the only place that says
   the team and the services are the same people. */
export const SITE_DESCRIPTION =
  "더모먼트는 광주소프트웨어마이스터고등학교의 전공동아리입니다. HelloGSM · DataGSM · EveryGSM · ReadyGSM 등 학교에 필요한 서비스를 직접 기획하고 개발합니다.";

/* What the page calls itself where the name has to be readable rather than
   styled — the heading a crawler and a screen reader get. */
export const SITE_HEADING = "더모먼트 — 광주소프트웨어마이스터고 전공동아리";

/* Every account and profile that is unambiguously this team. sameAs is how
   an entity is joined up across the web: a crawler that already knows the
   GitHub organisation can be told that this page is the same team, which is
   the one piece of authority the landing has available to it while nothing
   links to it yet. */
export const SITE_SOCIALS = [
  "https://www.instagram.com/team.the_moment/",
  "https://github.com/themoment-team",
];

/* Absolute URLs are not optional for any of the four: Open Graph images,
   canonicals, sitemap entries and structured data all have to name a host.
   Next builds them off metadataBase, and when that is unset it falls back to
   localhost with a warning — a card pointing at localhost/og.png, which
   nothing can fetch.

   Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment — the
   project's stable production host, not the per-deployment one — so this
   comes out right with nothing configured. NEXT_PUBLIC_SITE_URL overrides
   it, and HAS TO once there is a custom domain: that variable keeps naming
   the vercel.app host after a domain is attached, so every canonical the
   site emits would point away from the address people actually visit and
   the two hosts would compete for the same result. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

/* For the two files that cannot leave the host out — a sitemap entry
   without one is not a sitemap entry. Locally that is the dev server, which
   is the honest answer there. */
export const SITE_ORIGIN = SITE_URL ?? "http://localhost:3000";

/* Whether this deployment is the one that should be in an index.

   Vercel gives every branch and every pull request its own public URL, and
   nothing about those URLs asks not to be crawled. They serve the same page
   as production, so left alone they are duplicates of it competing for the
   same query — and a preview outranking production is a real outcome, not a
   hypothetical one. VERCEL_ENV is "production" only on the production
   deployment; it is unset outside Vercel, where there is nothing public to
   index either way. */
export const IS_INDEXABLE = process.env.VERCEL_ENV === "production";
