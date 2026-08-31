/* The handful of facts the page states about itself, in one place because
   four different files have to agree on them: the document's metadata, the
   robots file, the sitemap, and the structured data. */

/* The team's own name, set the way the site sets it. Worth knowing what it
   costs: a search result for this page shows "the_moment" and nothing else,
   so the words someone would actually search for — 광주소프트웨어마이스터고,
   전공동아리 — are carried entirely by the description. */
export const SITE_NAME = "the_moment";

/* The same two lines the About section opens with, which is the shortest
   honest answer to what this page is. Google shows around 150 characters of
   it; the first sentence says who, so a truncation still lands somewhere
   sensible. */
export const SITE_DESCRIPTION =
  "더모먼트는 광주소프트웨어마이스터고의 전공동아리입니다. 항상 새로운 비즈니스 모델에 대해 고민하고, 기술을 통해 사용자의 경험을 향상시키려 노력합니다.";

/* What the page calls itself where the name has to be readable rather than
   styled — the heading a crawler and a screen reader get. */
export const SITE_HEADING = "더모먼트 — 광주소프트웨어마이스터고 전공동아리";

export const SITE_SOCIALS = ["https://www.instagram.com/team.the_moment/"];

/* Absolute URLs are not optional for any of the four: Open Graph images,
   canonicals, sitemap entries and structured data all have to name a host.
   Next builds them off metadataBase, and when that is unset it falls back to
   localhost with a warning — a card pointing at localhost/og.png, which
   nothing can fetch.

   Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment — the
   project's stable production host, not the per-deployment one — so this
   comes out right with nothing configured. NEXT_PUBLIC_SITE_URL overrides
   it, and has to, because that variable stays the vercel.app host after a
   custom domain is attached. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

/* For the two files that cannot leave the host out — a sitemap entry
   without one is not a sitemap entry. Locally that is the dev server, which
   is the honest answer there. */
export const SITE_ORIGIN = SITE_URL ?? "http://localhost:3000";
