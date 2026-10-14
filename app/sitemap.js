import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  return ["", "/privacy", "/terms", "/login", "/signup"].map((p) => ({
    url: SITE_URL + p,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.5,
  }));
}
