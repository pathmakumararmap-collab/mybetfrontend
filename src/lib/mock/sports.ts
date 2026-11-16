/**
 * Mock sportsbook data. Replace by setting API_BASE_URL (see README):
 * the shapes here are exactly what the Laravel API must return.
 */
import type { League, Match, Sport } from "@/lib/schemas";
import { rowMarkets, type RowOdds } from "./odds";

export const SPORTS: Sport[] = [
  { slug: "football", name: "Football", icon: "football", top: true, esport: false, events: 65 },
  { slug: "cricket", name: "Cricket", icon: "cricket", top: true, esport: false, events: 75 },
  { slug: "basketball", name: "Basketball", icon: "basketball", top: true, esport: false, events: 78 },
  { slug: "tennis", name: "Tennis", icon: "baseball", top: true, esport: false, events: 21 },
  { slug: "table-tennis", name: "Table Tennis", icon: "table-tennis", top: true, esport: false, events: 36 },
  { slug: "ice-hockey", name: "Ice Hockey", icon: "ice-hockey", top: true, esport: false, events: 12 },
  { slug: "volleyball", name: "Volleyball", icon: "volleyball", top: true, esport: false, events: 24 },
  { slug: "horse-racing", name: "Horse Racing", icon: "horse", top: true, esport: false, events: 3 },
  { slug: "bandy", name: "Bandy", icon: "ice-hockey", top: false, esport: false, events: 3 },
  { slug: "american-football", name: "American Football", icon: "american-football", top: false, esport: false, events: 3 },
  { slug: "australian-rules", name: "Australian Rules", icon: "american-football", top: false, esport: false, events: 8 },
  { slug: "basketball-3x3", name: "Basketball 3x3", icon: "basketball", top: false, esport: false, events: 6 },
  { slug: "bicycle-racing", name: "Bicycle Racing", icon: "bicycle", top: false, esport: false, events: 13 },
  { slug: "chess", name: "Chess", icon: "chess", top: false, esport: false, events: 15 },
  { slug: "esports", name: "E Sports", icon: "esports", top: false, esport: true, events: 18 },
  { slug: "formula", name: "Formula", icon: "car", top: false, esport: false, events: 9 },
];

const L = (sport: string, slug: string, name: string, country: string, top = false, extra: Partial<League> = {}): League =>
  ({ sport, slug, name, country, top, ...extra });

export const LEAGUES: League[] = [
  L("cricket", "abu-dhabi-t10-league", "Abu Dhabi. T10 League", "UAE", true),
  L("cricket", "pro50-championship", "Pro50 Championship", "Zimbabwe"),
  L("cricket", "namibia-super-50-franchise", "Namibia. Super 50 Franchise", "Namibia"),
  L("cricket", "chandigarh-league", "Chandigarh League", "India"),
  L("cricket", "india-indoor-series", "India. Indoor Series", "India"),
  L("football", "england-premier-league", "England. Premier League", "England", true, { round: "Round 12", teams: 20 }),
  L("football", "spain-la-liga", "Spain. La Liga", "Spain", true, { round: "Round 13", teams: 20 }),
  L("football", "italy-serie-a", "Italy. Serie A", "Italy", true, { round: "Round 12", teams: 20 }),
  L("football", "germany-bundesliga", "Germany. Bundesliga", "Germany", true, { round: "Round 11", teams: 18 }),
  L("football", "france-ligue-1", "France. Ligue 1", "France", true, { round: "Round 13", teams: 18 }),
  L("football", "uefa-champions-league", "UEFA Champions League", "Europe", true, { round: "League phase", teams: 36 }),
  L("football", "australia-a-league", "Australia. A League", "Australia", false, { round: "Tour 4", teams: 12 }),
  L("basketball", "usa-nba", "USA. NBA", "USA", true, { teams: 30 }),
  L("tennis", "atp-finals", "ATP. Finals", "World", true),
  L("table-tennis", "setka-cup", "Setka Cup", "World"),
  L("ice-hockey", "usa-nhl", "USA. NHL", "USA", true, { teams: 32 }),
  L("volleyball", "italy-superlega", "Italy. SuperLega", "Italy"),
  L("esports", "cs2-iem-cologne", "CS 2. IEM Cologne", "World", true),
  L("esports", "dota-2-the-international", "Dota 2. The International", "World", true),
  L("esports", "league-of-legends-ldl", "League of Legends. LDL", "China"),
];

/** Odds as drawn on the Mybet homepage (every cricket row shows these). */
const DESIGN_ODDS: RowOdds = { w1: 1.936, x: 30, w2: 1.896, d1x: 1.92, d12: 1.003, d2x: 1.88, line: 133.5, over: 1.92, under: 1.87 };

interface Seed {
  id: string; sport: string; league: string; home: string; away: string; startsAt: string;
  live?: Match["live"]; stream?: boolean; recommended?: boolean; odds?: RowOdds; marketCount?: number;
}

const cricketLive = { score: "0/0", clock: "Event in progress", detail: "34/2 (6.0)" };

const SEEDS: Seed[] = [
  // cricket – homepage block (live)
  { id: "yas-lions-emirates-eagles", sport: "cricket", league: "abu-dhabi-t10-league", home: "Yas Lions", away: "Emirates Eagles", startsAt: "2026-11-12T13:30:00+05:30", live: cricketLive, stream: true, recommended: true, odds: DESIGN_ODDS, marketCount: 50 },
  { id: "matabeleland-tuskers-mid-west-rhinos", sport: "cricket", league: "pro50-championship", home: "Matabeleland Tuskers", away: "Mid West Rhinos", startsAt: "2026-11-12T12:00:00+05:30", live: cricketLive, stream: true, odds: DESIGN_ODDS, marketCount: 50 },
  { id: "eavion-eagles-pupkewitz-motors-wildcats", sport: "cricket", league: "namibia-super-50-franchise", home: "Eavion Eagles", away: "Pupkewitz Motors Wildcats", startsAt: "2026-11-12T14:00:00+05:30", live: cricketLive, odds: DESIGN_ODDS, marketCount: 50 },
  { id: "gamdevi-cc-aghadi", sport: "cricket", league: "chandigarh-league", home: "Gamdevi CC", away: "Aghadi", startsAt: "2026-11-12T15:00:00+05:30", live: cricketLive, recommended: true, odds: DESIGN_ODDS, marketCount: 50 },
  { id: "yas-lions-emirates-eagles-indoor", sport: "cricket", league: "india-indoor-series", home: "Yas Lions", away: "Emirates Eagles", startsAt: "2026-11-12T16:00:00+05:30", live: cricketLive, odds: DESIGN_ODDS, marketCount: 50 },
  // football
  { id: "adelaide-united-melbourne-victory", sport: "football", league: "australia-a-league", home: "Adelaide United", away: "Melbourne Victory", startsAt: "2026-11-12T14:05:00+05:30", live: { score: "1 : 2", clock: "2nd half, 68 minutes", period: 2 }, stream: true, recommended: true, odds: { ...DESIGN_ODDS, w1: 1.33, x: 30, w2: 3.44, line: 2.5 }, marketCount: 212 },
  { id: "arsenal-chelsea", sport: "football", league: "england-premier-league", home: "Arsenal", away: "Chelsea", startsAt: "2026-11-14T20:45:00+05:30", stream: true, recommended: true, marketCount: 320 },
  { id: "liverpool-tottenham", sport: "football", league: "england-premier-league", home: "Liverpool", away: "Tottenham", startsAt: "2026-11-14T22:00:00+05:30", recommended: true, marketCount: 298 },
  { id: "everton-brighton", sport: "football", league: "england-premier-league", home: "Everton", away: "Brighton", startsAt: "2026-11-15T18:30:00+05:30", marketCount: 240 },
  { id: "man-city-newcastle", sport: "football", league: "england-premier-league", home: "Man City", away: "Newcastle", startsAt: "2026-11-15T19:00:00+05:30", stream: true, marketCount: 305 },
  { id: "aston-villa-fulham", sport: "football", league: "england-premier-league", home: "Aston Villa", away: "Fulham", startsAt: "2026-11-15T21:30:00+05:30", marketCount: 233 },
  { id: "west-ham-brentford", sport: "football", league: "england-premier-league", home: "West Ham", away: "Brentford", startsAt: "2026-11-16T18:00:00+05:30", marketCount: 221 },
  { id: "sevilla-valencia", sport: "football", league: "spain-la-liga", home: "Sevilla", away: "Valencia", startsAt: "2026-11-14T21:00:00+05:30", marketCount: 260 },
  { id: "villarreal-real-betis", sport: "football", league: "spain-la-liga", home: "Villarreal", away: "Real Betis", startsAt: "2026-11-14T23:30:00+05:30", recommended: true, marketCount: 251 },
  { id: "lazio-napoli", sport: "football", league: "italy-serie-a", home: "Lazio", away: "Napoli", startsAt: "2026-11-14T23:15:00+05:30", marketCount: 270 },
  { id: "roma-bologna", sport: "football", league: "italy-serie-a", home: "Roma", away: "Bologna", startsAt: "2026-11-15T19:00:00+05:30", marketCount: 244 },
  { id: "bayern-leverkusen", sport: "football", league: "germany-bundesliga", home: "Bayern", away: "Leverkusen", startsAt: "2026-11-15T20:00:00+05:30", stream: true, recommended: true, marketCount: 310 },
  { id: "marseille-lyon", sport: "football", league: "france-ligue-1", home: "Marseille", away: "Lyon", startsAt: "2026-11-16T01:15:00+05:30", marketCount: 236 },
  { id: "dortmund-psg", sport: "football", league: "uefa-champions-league", home: "Borussia Dortmund", away: "Paris SG", startsAt: "2026-11-25T01:30:00+05:30", stream: true, marketCount: 340 },
  { id: "inter-benfica", sport: "football", league: "uefa-champions-league", home: "Inter", away: "Benfica", startsAt: "2026-11-25T01:30:00+05:30", marketCount: 330 },
  // other sports
  { id: "lakers-celtics", sport: "basketball", league: "usa-nba", home: "LA Lakers", away: "Boston Celtics", startsAt: "2026-11-12T06:30:00+05:30", live: { score: "88 : 91", clock: "4th quarter, 07:12", period: 4 }, stream: true, recommended: true, marketCount: 140 },
  { id: "warriors-bucks", sport: "basketball", league: "usa-nba", home: "Golden State", away: "Milwaukee", startsAt: "2026-11-13T08:00:00+05:30", marketCount: 132 },
  { id: "sinner-alcaraz", sport: "tennis", league: "atp-finals", home: "J. Sinner", away: "C. Alcaraz", startsAt: "2026-11-15T19:30:00+05:30", stream: true, recommended: true, marketCount: 88 },
  { id: "kowalski-novak", sport: "table-tennis", league: "setka-cup", home: "P. Kowalski", away: "M. Novak", startsAt: "2026-11-12T17:40:00+05:30", live: { score: "2 : 1", clock: "4th set", period: 4 }, marketCount: 24 },
  { id: "rangers-bruins", sport: "ice-hockey", league: "usa-nhl", home: "NY Rangers", away: "Boston Bruins", startsAt: "2026-11-13T05:30:00+05:30", marketCount: 96 },
  { id: "perugia-trentino", sport: "volleyball", league: "italy-superlega", home: "Perugia", away: "Trentino", startsAt: "2026-11-15T22:30:00+05:30", marketCount: 40 },
  // esports
  { id: "cloud9-fnatic", sport: "esports", league: "cs2-iem-cologne", home: "Cloud9", away: "Fnatic", startsAt: "2026-11-12T17:00:00+05:30", live: { score: "1 : 0", clock: "Map 2", period: 2 }, stream: true, recommended: true, marketCount: 64 },
  { id: "mouz-astralis", sport: "esports", league: "cs2-iem-cologne", home: "MOUZ", away: "Astralis", startsAt: "2026-11-12T20:00:00+05:30", marketCount: 58 },
  { id: "spirit-liquid", sport: "esports", league: "dota-2-the-international", home: "Team Spirit", away: "Team Liquid", startsAt: "2026-11-13T18:00:00+05:30", stream: true, marketCount: 46 },
  { id: "invictus-jd-gaming", sport: "esports", league: "league-of-legends-ldl", home: "Invictus Gaming", away: "JD Gaming", startsAt: "2026-11-13T14:00:00+05:30", marketCount: 40 },
];

export const MATCHES: Match[] = SEEDS.map(s => ({
  id: s.id,
  sport: s.sport,
  league: s.league,
  home: s.home,
  away: s.away,
  status: s.live ? "live" : "upcoming",
  startsAt: s.startsAt,
  live: s.live,
  stream: s.stream ?? false,
  recommended: s.recommended ?? false,
  rowMarkets: rowMarkets(s.id, s.odds),
  marketCount: s.marketCount ?? 40,
}));

/** "ALL 998" and the live-stream count in the sidebar, as drawn. */
export const TOTALS = { all: 998, withStreams: 406 };

export const FEATURED_MATCH_ID = "adelaide-united-melbourne-victory";

/** Leagues on the homepage, in the order drawn. */
export const HOME_LEAGUES = [
  "abu-dhabi-t10-league", "pro50-championship", "namibia-super-50-franchise", "chandigarh-league", "india-indoor-series",
];
