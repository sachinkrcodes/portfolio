import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** One page: the whole portfolio lives on the home page (the islands and case studies open inside it). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl(), lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
