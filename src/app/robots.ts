import type { MetadataRoute } from "next";
import { IS_INDEXABLE, SITE_ORIGIN } from "@/shared/config/site";

/* There was no robots.txt at all, which is not fatal — a crawler with no
   instructions crawls — but it is the file every crawler asks for first, and
   it is the only place a sitemap can be announced to one that arrived
   without being told where to look.

   On production nothing is disallowed. It is a one-page site with nothing on
   it that is not meant to be read.

   Anywhere else — a branch preview, a pull request deployment — the whole
   host is refused, and no sitemap is offered. Those URLs are public and
   serve this same page, so a crawler left to itself indexes them as separate
   copies of the site and they compete with production for the query it is
   trying to win. The meta robots tag in the layout says the same thing; both
   are here because they are read at different moments — robots.txt before
   the page is fetched at all, the meta tag only after. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    /* Named explicitly so a crawler that only ever reads robots.txt still
       learns which host is the real one. */
    host: SITE_ORIGIN,
  };
}
