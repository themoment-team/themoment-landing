import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/shared/config/site";

/* One page, so one entry — which is exactly why it is worth having. A
   sitemap for a single route does not help a crawler find anything it could
   not have found, but it is what Search Console asks for when you add the
   property, and submitting one is the difference between waiting to be
   discovered and being read now. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
