import type { Metadata, Viewport } from "next";
import {
  IS_INDEXABLE,
  SITE_DESCRIPTION,
  SITE_HEADING,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SOCIALS,
  SITE_TITLE,
  SITE_URL,
} from "@/shared/config/site";
import { WORK } from "@/widgets/work/model/projects";
import "./globals.css";

/* What a search engine is told the page is, in the vocabulary it parses
   rather than the one it guesses at. The page's own name is a wordmark
   drawn out of particles on a canvas, which is not text to anything that
   is not looking at it — so the name, the description and the accounts the
   team actually posts from are stated here as well.

   Kept next to the metadata rather than in the sections it describes,
   because it describes the site, not any one part of it.

   Written as a @graph rather than a lone Organization. Three separate
   script blocks would be three unrelated assertions; one graph with @id
   references is one statement about one entity, and it is what lets the
   project list say "made by the team described above" instead of repeating
   a name and hoping the two are joined up. */

const ORG_ID = `${SITE_ORIGIN}/#organization`;

const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  /* Every spelling this team is written as, because the query is almost
     never the wordmark. "더모먼트" is what a person types, "팀 더모먼트" is
     how the blog and the bots refer to it, and "the_moment" is the handle
     on GitHub and Instagram. */
  alternateName: ["더모먼트", "팀 더모먼트", "THE MOMENT", "the moment"],
  description: SITE_DESCRIPTION,
  url: SITE_ORIGIN,
  /* Google's logo guidance wants at least 112px on a side and a raster it
     can crop; the same 192 the favicon declares clears both. */
  logo: `${SITE_ORIGIN}/icon-192.png`,
  image: `${SITE_ORIGIN}/og.png`,
  email: "yuchan.7im@gmail.com",
  sameAs: SITE_SOCIALS,
  parentOrganization: {
    "@type": "EducationalOrganization",
    name: "광주소프트웨어마이스터고등학교",
    alternateName: ["광주소프트웨어마이스터고", "GSM"],
    url: "http://gsm.gen.hs.kr",
  },
  /* Where the team is. Half the phrases anyone would use to find it start
     with 광주, and nothing else on the page says so in a parseable form. */
  location: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "광주광역시",
      addressCountry: "KR",
    },
  },
  knowsAbout: ["웹 서비스 개발", "소프트웨어 엔지니어링", "학교 서비스 개발"],
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  url: SITE_ORIGIN,
  name: SITE_TITLE,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
  publisher: { "@id": ORG_ID },
};

/* The four services, named and attributed to the entity above.

   This is the one lever the page actually has. Nothing links to this
   address yet, but HelloGSM, DataGSM and EveryGSM are already known,
   already searched, and already this team's — and hellogsm.kr is where a
   crawler currently finds the team described. Stating the relationship in a
   form a crawler parses is how the landing gets to stand next to those
   names rather than behind them. */
const PROJECTS = {
  "@type": "ItemList",
  "@id": `${SITE_ORIGIN}/#projects`,
  name: "더모먼트가 만든 서비스",
  numberOfItems: WORK.length,
  itemListElement: WORK.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "SoftwareApplication",
      name: item.name,
      description: item.note,
      applicationCategory: "WebApplication",
      operatingSystem: "Web",
      inLanguage: "ko-KR",
      creator: { "@id": ORG_ID },
      ...(item.href ? { url: item.href } : {}),
    },
  })),
};

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [ORGANIZATION, WEBSITE, PROJECTS],
};

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  /* A template as well as a default, so a second route added later inherits
     the school's name instead of having to remember it. */
  title: { default: SITE_TITLE, template: `%s — ${SITE_HEADING}` },
  description: SITE_DESCRIPTION,
  /* Google has ignored this since 2009. Naver and Daum have not entirely,
     and this is a Korean-language site whose audience searches on both, so
     it is worth the few lines — kept to terms the page genuinely answers
     rather than padded, which is what makes it ignorable rather than
     penalised. */
  keywords: [
    "더모먼트",
    "the_moment",
    "광주소프트웨어마이스터고",
    "광주소프트웨어마이스터고등학교",
    "GSM",
    "전공동아리",
    "HelloGSM",
    "DataGSM",
    "EveryGSM",
  ],
  /* One page, so one canonical URL. Without it every query string someone
     appends is a separate address as far as a crawler is concerned. Only
     emitted once metadataBase knows the host. */
  ...(SITE_URL ? { alternates: { canonical: "/" } } : {}),
  /* Every branch and every pull request gets its own public URL on Vercel,
     serving this same page. Indexed, they are duplicates competing with
     production for the same query, and a preview outranking production is a
     real outcome rather than a hypothetical one. So only the production
     deployment invites a crawler in. Written as an explicit allow as well
     as an explicit refusal rather than left to the default, because the
     default is what put them in the index to begin with. */
  robots: IS_INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
  /* Set these once the properties are claimed. Search Console is what turns
     "wait to be crawled" into "crawl this now", and Naver's Search Advisor
     is the same thing for the half of Korean search Google does not serve —
     neither is optional for a site nothing links to yet. Both take a meta
     tag, and both are read from the environment so no token is committed. */
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  ...(process.env.NAVER_SITE_VERIFICATION
    ? { other: { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } }
    : {}),
  icons: {
    /* Three renderings of one mark, so that whatever asks gets something it
       can read. The .ico is what a browser fetches from the root on its own
       and what anything that will not take a PNG falls back to; the 192 is
       Google's recommended favicon size — they ask for a multiple of 48 —
       and doubles as the Organization logo, which has a 112px floor.

       public/favicon.svg is still the master artwork both generators draw
       from, but it is no longer declared: it frames the mark on a rounded
       plate with a third of the file as margin, which is right at 192px and
       leaves a speck at 16. The rasters crop in. Declaring both would mean
       a tab and a search result showing visibly different icons. */
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    /* What iOS puts on a home screen and what Android uses for a bookmark.
       Neither takes the SVG, and with nothing here iOS screenshots the page
       and uses that. Drawn from the same favicon by scripts/touch-icon.html. */
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    /* KakaoTalk is where this link will actually be pasted, and it reads
       og:url — without one it has no address to attach the card to and
       falls back to whatever the crawler was handed. Every other platform
       treats it as the card's canonical target. */
    ...(SITE_URL ? { url: "/" } : {}),
    /* The hero itself — the mark gathered out of its field of particles —
       rather than a card drawn for the purpose. 1200x675 rather than the
       usual 1200x630: it is the 16:9 the screen is, and every platform that
       crops does so from the centre, which is where the mark is.

       The path is relative because the site has no domain written down in
       the repo yet. Slack and Discord resolve that; Facebook and X want it
       absolute, so set NEXT_PUBLIC_SITE_URL once the domain is settled. */
    images: [{ url: "/og.png", width: 1200, height: 675, alt: SITE_HEADING }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  /* The page's own floor, so a mobile browser's chrome carries the dark
     rather than sitting white above it. */
  themeColor: "#050506",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        {/* The variable font cut into subsets by unicode range, rather than
            the static family. Static Pretendard ships one file per weight
            covering every glyph it knows — around 750KB each, and this page
            uses four weights. None of it is subsetted, so a visitor would
            download every Hanja to read a screen of Korean.

            The variable file carries 45 to 920 in one family and the
            stylesheet splits it into 92 ranges, so only the ranges the page
            actually uses come down. It sets font-display: swap itself,
            which is what stops the text hiding while the font arrives. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          /* The one place a raw string has to be written into the document.
             It is a constant built a few lines up out of other constants,
             with no input from anywhere — no request, no CMS, nothing a
             visitor can reach — so there is nothing here to inject.
             JSON.stringify escapes the quotes; the closing tag is what would
             break out of a script block, and none of these strings contains
             one. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }}
        />
        {children}
      </body>
    </html>
  );
}
