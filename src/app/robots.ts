import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/shared/config/site";

/* There was no robots.txt at all, which is not fatal — a crawler with no
   instructions crawls — but it is the file every crawler asks for first, and
   it is the only place a sitemap can be announced to one that arrived
   without being told where to look.

   Nothing is disallowed. It is a one-page site with nothing on it that is
   not meant to be read. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
