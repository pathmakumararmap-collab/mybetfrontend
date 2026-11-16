/**
 * Server-side data access. With API_BASE_URL set, every function calls the
 * Mybet (Laravel) API and validates the response with the zod schemas;
 * without it, the built-in mock data is used. Pages never import mock data
 * directly, so switching to the real backend needs no page changes.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import {
  GameSchema, InfoPageSchema, LeagueSchema, MatchDetailSchema, MatchSchema, PromotionSchema, ProviderSchema, SportSchema,
  TournamentSchema,
  type Game, type GameKind, type GameTag, type InfoPage, type League, type Match, type MatchDetail, type Promotion,
  type Provider, type Sport, type Tournament,
} from "./schemas";
import { FEATURED_MATCH_ID, HOME_LEAGUES, LEAGUES, MATCHES, SPORTS, TOTALS } from "./mock/sports";
import { fullMarkets } from "./mock/odds";
import { GAMES, HOME_TILES, PROVIDERS } from "./mock/casino";
import { INFO_PAGES, PROMOTIONS, TOURNAMENTS } from "./mock/content";

const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/+$/, "") || "";
const API_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** GET from the backend; `null` on 404. Throws ApiError on any other failure. */
async function api<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (err) {
    throw new ApiError(`Mybet API unreachable (${path}): ${(err as Error).message}`);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(`Mybet API ${path} responded ${res.status}`, res.status);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError(`Mybet API ${path} returned an unexpected shape: ${z.prettifyError(parsed.error)}`);
  return parsed.data;
}

const seg = encodeURIComponent;
const list = <T,>(schema: z.ZodType<T>) => z.array(schema);

// ---------------------------------------------------------------- sports
export async function getSports(): Promise<Sport[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("sports");
  if (API_BASE_URL) return (await api("/sports", list(SportSchema))) ?? [];
  return SPORTS;
}

export async function getSport(slug: string): Promise<Sport | null> {
  const sports = await getSports();
  return sports.find(s => s.slug === slug) ?? null;
}

export async function getTotals(): Promise<{ all: number; withStreams: number }> {
  "use cache";
  cacheLife("minutes");
  if (API_BASE_URL) {
    return (await api("/sports/totals", z.object({ all: z.number().int(), withStreams: z.number().int() }))) ?? { all: 0, withStreams: 0 };
  }
  return TOTALS;
}

export async function getLeagues(sport?: string): Promise<League[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("leagues");
  if (API_BASE_URL) return (await api(sport ? `/sports/${seg(sport)}/leagues` : "/leagues", list(LeagueSchema))) ?? [];
  return sport ? LEAGUES.filter(l => l.sport === sport) : LEAGUES;
}

export async function getLeague(sport: string, slug: string): Promise<League | null> {
  const leagues = await getLeagues(sport);
  return leagues.find(l => l.slug === slug) ?? null;
}

export interface MatchQuery {
  sport?: string;
  league?: string;
  status?: Match["status"];
  esport?: boolean;
}

export async function getMatches(q: MatchQuery = {}): Promise<Match[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("matches");
  if (API_BASE_URL) {
    const params = new URLSearchParams();
    if (q.sport) params.set("sport", q.sport);
    if (q.league) params.set("league", q.league);
    if (q.status) params.set("status", q.status);
    if (q.esport !== undefined) params.set("esport", q.esport ? "1" : "0");
    return (await api(`/matches?${params}`, list(MatchSchema))) ?? [];
  }
  const esportSlugs = new Set(SPORTS.filter(s => s.esport).map(s => s.slug));
  return MATCHES.filter(m =>
    (!q.sport || m.sport === q.sport) &&
    (!q.league || m.league === q.league) &&
    (!q.status || m.status === q.status) &&
    (q.esport === undefined || esportSlugs.has(m.sport) === q.esport));
}

export async function getMatch(id: string): Promise<MatchDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`match:${id}`);
  if (API_BASE_URL) return api(`/matches/${seg(id)}`, MatchDetailSchema);
  const m = MATCHES.find(x => x.id === id);
  return m ? { ...m, markets: fullMarkets(m.id, m.rowMarkets) } : null;
}

export async function getFeaturedMatch(): Promise<Match | null> {
  "use cache";
  cacheLife("minutes");
  if (API_BASE_URL) return api("/matches/featured", MatchSchema);
  return MATCHES.find(m => m.id === FEATURED_MATCH_ID) ?? null;
}

/** League slugs shown on the homepage matches block, in display order. */
export async function getHomeLeagueSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  if (API_BASE_URL) return (await api("/home/leagues", z.array(z.string()))) ?? [];
  return HOME_LEAGUES;
}

// ---------------------------------------------------------------- casino
export interface GameQuery { kind?: GameKind | GameKind[]; tag?: GameTag; provider?: string }

export async function getGames(q: GameQuery = {}): Promise<Game[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("games");
  const kinds = q.kind === undefined ? undefined : Array.isArray(q.kind) ? q.kind : [q.kind];
  if (API_BASE_URL) {
    const params = new URLSearchParams();
    kinds?.forEach(k => params.append("kind", k));
    if (q.tag) params.set("tag", q.tag);
    if (q.provider) params.set("provider", q.provider);
    return (await api(`/games?${params}`, list(GameSchema))) ?? [];
  }
  return GAMES.filter(g =>
    (!kinds || kinds.includes(g.kind)) && (!q.tag || g.tags.includes(q.tag)) && (!q.provider || g.provider === q.provider));
}

export async function getGame(slug: string): Promise<Game | null> {
  "use cache";
  cacheLife("hours");
  if (API_BASE_URL) return api(`/games/${seg(slug)}`, GameSchema);
  return GAMES.find(g => g.slug === slug) ?? null;
}

export async function getHomeTiles(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  if (API_BASE_URL) return (await api("/home/tiles", z.array(z.string()))) ?? [];
  return HOME_TILES;
}

export async function getProviders(): Promise<Provider[]> {
  "use cache";
  cacheLife("days");
  if (API_BASE_URL) return (await api("/providers", list(ProviderSchema))) ?? [];
  return PROVIDERS;
}

// --------------------------------------------------------------- content
export async function getPromotions(): Promise<Promotion[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("promotions");
  if (API_BASE_URL) return (await api("/promotions", list(PromotionSchema))) ?? [];
  return PROMOTIONS;
}

export async function getPromotion(slug: string): Promise<Promotion | null> {
  const all = await getPromotions();
  return all.find(p => p.slug === slug) ?? null;
}

export async function getTournament(id: string): Promise<Tournament | null> {
  "use cache";
  cacheLife("minutes");
  if (API_BASE_URL) return api(`/tournaments/${seg(id)}`, TournamentSchema);
  return TOURNAMENTS.find(t => t.id === id) ?? null;
}

export async function getTournamentIds(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  if (API_BASE_URL) return (await api("/tournaments", list(TournamentSchema)))?.map(t => t.id) ?? [];
  return TOURNAMENTS.map(t => t.id);
}

export async function getInfoPages(): Promise<InfoPage[]> {
  "use cache";
  cacheLife("days");
  if (API_BASE_URL) return (await api("/pages", list(InfoPageSchema))) ?? [];
  return INFO_PAGES;
}

export async function getInfoPage(slug: string): Promise<InfoPage | null> {
  const all = await getInfoPages();
  return all.find(p => p.slug === slug) ?? null;
}

export const usingMockData = !API_BASE_URL;
