import type { MetadataRoute } from "next";
import { getGames, getInfoPages, getLeagues, getMatches, getPromotions, getSports, getTournamentIds } from "@/lib/data";
import { matchHref } from "@/lib/filters";
import { gameHref } from "@/components/casino/Games";
import { SITE } from "@/lib/site";

/** /sitemap.xml generated from the same data as the pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sports, leagues, matches, games, promos, tournaments, info] = await Promise.all([
    getSports(), getLeagues(), getMatches(), getGames(), getPromotions(), getTournamentIds(), getInfoPages(),
  ]);
  // Next.js writes <loc> verbatim, so "&" in query strings must be escaped for valid XML.
  const url = (path: string) => new URL(path, SITE.url).toString().replace(/&/g, "&amp;");
  const entry = (path: string, changeFrequency: "always" | "hourly" | "daily" | "weekly", priority: number) =>
    ({ url: url(path), changeFrequency, priority });

  return [
    entry("/", "always", 1),
    entry("/line", "hourly", 0.9),
    entry("/live", "always", 0.9),
    entry("/cyber/esports", "hourly", 0.7),
    entry("/allgamesentrance", "daily", 0.8),
    entry("/casino", "daily", 0.8),
    entry("/bonus", "daily", 0.7),
    ...sports.map(s => entry(`/line/${s.slug}`, "hourly", 0.8)),
    ...leagues.map(l => entry(`/line/${l.sport}/${l.slug}`, "hourly", 0.7)),
    ...matches.map(m => entry(matchHref(m), "hourly", 0.6)),
    ...games.map(g => entry(gameHref(g), "weekly", 0.5)),
    ...promos.map(p => entry(`/bonus/rules/${p.slug}`, "weekly", 0.5)),
    ...tournaments.map(id => entry(`/bonus/casino/tournaments/${id}`, "daily", 0.5)),
    ...info.map(p => entry(`/information/${p.slug}`, "weekly", 0.3)),
  ];
}
