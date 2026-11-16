/** Pure helpers for match lists: tabs, search, grouping. */
import type { League, Match } from "./schemas";

export interface Tab { id: string; label: string }

export const MATCH_TABS = [
  { id: "matches", label: "Matches" },
  { id: "recommended", label: "Recommended" },
  { id: "upcoming", label: "Upcoming events" },
  { id: "period-1", label: "1st period" },
  { id: "period-2", label: "2nd period" },
] as const satisfies readonly Tab[];

export const SPORTS_TABS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming events" },
  { id: "recommended", label: "Recommended" },
] as const satisfies readonly Tab[];

export const LIVE_TABS = [
  { id: "all", label: "All live" },
  { id: "streams", label: "With live streams" },
  { id: "recommended", label: "Recommended" },
] as const satisfies readonly Tab[];

/** First value of a search param, trimmed and length-limited. */
export function param(value: string | string[] | undefined, max = 60): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").trim().slice(0, max);
}

/** Returns `value` if it is one of the tab ids, else the first tab. */
export function pickTab<T extends readonly Tab[]>(tabs: T, value: string): T[number]["id"] {
  return (tabs.find(t => t.id === value) ?? tabs[0]).id;
}

export interface MatchFilter {
  tab?: string;
  q?: string;
  streams?: boolean;
  /** "Today" in Sri Lanka time as YYYY-MM-DD, passed in so this stays pure. */
  today?: string;
}

const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

export function filterMatches(matches: Match[], f: MatchFilter): Match[] {
  const q = (f.q ?? "").toLowerCase();
  return matches.filter(m => {
    if (f.streams && !m.stream) return false;
    if (q && !`${m.home} ${m.away}`.toLowerCase().includes(q)) return false;
    switch (f.tab) {
      case "recommended": return m.recommended;
      case "upcoming": return m.status === "upcoming";
      case "live": return m.status === "live";
      case "streams": return m.stream;
      case "period-1": return m.status === "live" && m.live?.period === 1;
      case "period-2": return m.status === "live" && m.live?.period === 2;
      case "today": return f.today ? dayKey(m.startsAt) === f.today : true;
      default: return true;
    }
  });
}

export interface LeagueGroup { league: League; matches: Match[] }

/** Groups matches by league, keeping `order` (league slugs) first. */
export function groupByLeague(matches: Match[], leagues: League[], order: string[] = []): LeagueGroup[] {
  const bySlug = new Map(leagues.map(l => [l.slug, l]));
  const groups = new Map<string, LeagueGroup>();
  for (const m of matches) {
    const league = bySlug.get(m.league);
    if (!league) continue;
    const g = groups.get(league.slug) ?? { league, matches: [] };
    g.matches.push(m);
    groups.set(league.slug, g);
  }
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? order.length : i;
  };
  return [...groups.values()].sort((a, b) =>
    rank(a.league.slug) - rank(b.league.slug) || Number(b.league.top) - Number(a.league.top) || a.league.name.localeCompare(b.league.name));
}

export function matchHref(m: Pick<Match, "sport" | "league" | "id">): string {
  return `/line/${m.sport}/${m.league}/${m.id}`;
}
