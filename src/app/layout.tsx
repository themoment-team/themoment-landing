import type { Metadata, Viewport } from "next";
import "./globals.css";

const TITLE = "THE MOMENT — 광주소프트웨어마이스터고 전공동아리";
const DESCRIPTION =
  "더모먼트는 광주소프트웨어마이스터고의 전공동아리입니다. 항상 새로운 비즈니스 모델에 대해 고민하고, 기술을 통해 사용자의 경험을 향상시키려 노력합니다.";

/* Open Graph images have to be absolute URLs — Slack and Discord will
   resolve a relative one, Facebook and X will not. Next builds them off
   this, and falls back to localhost with a warning when it is unset, which
   is what ships a card pointing at localhost/og.png. Set
   NEXT_PUBLIC_SITE_URL in the deploy environment once the domain exists. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: TITLE,
  description: DESCRIPTION,
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
    siteName: "THE MOMENT",
    title: TITLE,
    description: DESCRIPTION,
    /* The path is relative because the site has no domain written down in
       the repo yet. Slack and Discord resolve that; Facebook and X want it
       absolute, so set metadataBase once the domain is settled. */
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
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
      <body>{children}</body>
    </html>
  );
}
