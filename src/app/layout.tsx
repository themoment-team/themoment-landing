import type { Metadata, Viewport } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SOCIALS,
  SITE_URL,
} from "@/shared/config/site";
import "./globals.css";

const TITLE = SITE_NAME;
const DESCRIPTION = SITE_DESCRIPTION;

/* What a search engine is told the page is, in the vocabulary it parses
   rather than the one it guesses at. The page's own name is a wordmark
   drawn out of particles on a canvas, which is not text to anything that
   is not looking at it — so the name, the description and the one account
   the team actually posts from are stated here as well.

   Kept next to the metadata rather than in the section it describes,
   because it describes the site, not any one part of it. */
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: ["더모먼트", "THE MOMENT"],
  description: SITE_DESCRIPTION,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon.svg`,
  image: `${SITE_ORIGIN}/og.png`,
  email: "yuchan.7im@gmail.com",
  sameAs: SITE_SOCIALS,
  parentOrganization: {
    "@type": "EducationalOrganization",
    name: "광주소프트웨어마이스터고등학교",
  },
};

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: TITLE,
  description: DESCRIPTION,
  /* One page, so one canonical URL. Without it every query string someone
     appends is a separate address as far as a crawler is concerned. Only
     emitted once metadataBase knows the host. */
  ...(SITE_URL ? { alternates: { canonical: "/" } } : {}),
  icons: {
    icon: "/favicon.svg",
    /* What iOS puts on a home screen and what Android uses for a bookmark.
       Neither takes the SVG, and with nothing here iOS screenshots the page
       and uses that. Drawn from the same favicon by scripts/touch-icon.html. */
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
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
    images: [{ url: "/og.png", width: 1200, height: 675, alt: DESCRIPTION }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
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
             It is a constant defined a few lines up with no input from
             anywhere — no request, no CMS, nothing a visitor can reach — so
             there is nothing here to inject. JSON.stringify escapes the
             quotes; the closing tag is what would break out of a script
             block, and none of these strings contains one. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
        />
        {children}
      </body>
    </html>
  );
}
