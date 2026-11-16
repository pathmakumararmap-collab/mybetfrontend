/**
 * Domain schemas. They are the single source of the app's types (z.infer)
 * and validate every response from the backend API before it is rendered.
 */
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid slug").max(120);
const iconName = z.string().max(40);

export const OutcomeSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(40),
  odds: z.number().gt(1).lt(10_000),
});

export const MarketSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  /** Line for totals / handicaps (e.g. 2.5, 133.5). */
  line: z.number().optional(),
  outcomes: z.array(OutcomeSchema).min(1).max(40),
});

export const LiveStateSchema = z.object({
  score: z.string().max(20),
  clock: z.string().max(60),
  period: z.number().int().min(1).max(10).optional(),
  detail: z.string().max(40).optional(),
});

export const MatchSchema = z.object({
  id: slug,
  sport: slug,
  league: slug,
  home: z.string().min(1).max(80),
  away: z.string().min(1).max(80),
  status: z.enum(["live", "upcoming"]),
  startsAt: z.iso.datetime({ offset: true }),
  live: LiveStateSchema.optional(),
  stream: z.boolean(),
  recommended: z.boolean(),
  /** Markets shown in the match row: 1X2, double chance, individual total. */
  rowMarkets: z.array(MarketSchema).max(3),
  marketCount: z.number().int().min(0),
});

export const MatchDetailSchema = MatchSchema.extend({
  markets: z.array(MarketSchema).max(200),
});

export const LeagueSchema = z.object({
  slug,
  sport: slug,
  name: z.string().min(1).max(120),
  country: z.string().max(60),
  round: z.string().max(60).optional(),
  teams: z.number().int().min(0).optional(),
  top: z.boolean(),
});

export const SportSchema = z.object({
  slug,
  name: z.string().min(1).max(60),
  icon: iconName,
  /** Shown in the TOP block of the sidebar. */
  top: z.boolean(),
  esport: z.boolean(),
  events: z.number().int().min(0),
});

export const GAME_KINDS = ["mybet", "slot", "live", "table", "crash"] as const;
export const GAME_TAGS = [
  "popular", "new", "jackpot", "megaways", "bonus-buy", "classic", "cards", "roulette", "dice", "lottery",
] as const;

export const GameSchema = z.object({
  slug,
  name: z.string().min(1).max(80),
  kind: z.enum(GAME_KINDS),
  provider: slug,
  tags: z.array(z.enum(GAME_TAGS)).max(10),
  /** Path under /public or absolute https URL (configure images.remotePatterns). */
  image: z.string().max(300).optional(),
  rtp: z.number().min(0).max(100).optional(),
});

export const ProviderSchema = z.object({ slug, name: z.string().min(1).max(60) });

export const ContentSectionSchema = z.object({
  heading: z.string().min(1).max(120),
  paragraphs: z.array(z.string().max(2000)).max(20),
});

export const PromotionSchema = z.object({
  slug,
  title: z.string().min(1).max(80),
  kicker: z.string().max(40),
  summary: z.string().max(300),
  cta: z.string().min(1).max(30),
  category: z.enum(["sports", "casino", "games", "tournaments"]),
  /** Where the CTA leads: "register" opens the registration dialog. */
  action: z.union([z.literal("register"), z.string().startsWith("/")]),
  facts: z.array(z.object({ label: z.string().max(30), value: z.string().max(30) })).max(4),
  sections: z.array(ContentSectionSchema).max(20),
  image: z.string().max(300).optional(),
});

export const TournamentSchema = z.object({
  id: slug,
  title: z.string().min(1).max(80),
  summary: z.string().max(200),
  prizePool: z.string().max(30),
  participants: z.number().int().min(0),
  endsAt: z.iso.datetime({ offset: true }),
  leaderboard: z.array(z.object({
    place: z.number().int().min(1),
    player: z.string().max(40),
    points: z.number().int().min(0),
    prize: z.string().max(30),
  })).max(100),
  sections: z.array(ContentSectionSchema).max(20),
});

export const InfoPageSchema = z.object({
  slug,
  title: z.string().min(1).max(80),
  icon: iconName,
  sections: z.array(ContentSectionSchema).max(40),
});

export type Outcome = z.infer<typeof OutcomeSchema>;
export type Market = z.infer<typeof MarketSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type MatchDetail = z.infer<typeof MatchDetailSchema>;
export type League = z.infer<typeof LeagueSchema>;
export type Sport = z.infer<typeof SportSchema>;
export type Game = z.infer<typeof GameSchema>;
export type GameKind = (typeof GAME_KINDS)[number];
export type GameTag = (typeof GAME_TAGS)[number];
export type Provider = z.infer<typeof ProviderSchema>;
export type Promotion = z.infer<typeof PromotionSchema>;
export type Tournament = z.infer<typeof TournamentSchema>;
export type InfoPage = z.infer<typeof InfoPageSchema>;
export type ContentSection = z.infer<typeof ContentSectionSchema>;
