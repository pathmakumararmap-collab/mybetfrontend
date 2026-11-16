import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  GameSchema, InfoPageSchema, LeagueSchema, MatchDetailSchema, MatchSchema, PromotionSchema, SportSchema, TournamentSchema,
} from "@/lib/schemas";
import { LEAGUES, MATCHES, SPORTS } from "@/lib/mock/sports";
import { GAMES, HOME_TILES, PROVIDERS } from "@/lib/mock/casino";
import { INFO_PAGES, PROMOTIONS, TOURNAMENTS } from "@/lib/mock/content";
import { getMatch, getMatches, getGames, getLeague, getSport, getHomeLeagueSlugs } from "@/lib/data";
import { isIconName } from "@/lib/icons";

describe("mock data matches the API contract", () => {
  it.each([
    ["sports", z.array(SportSchema), SPORTS],
    ["leagues", z.array(LeagueSchema), LEAGUES],
    ["matches", z.array(MatchSchema), MATCHES],
    ["games", z.array(GameSchema), GAMES],
    ["promotions", z.array(PromotionSchema), PROMOTIONS],
    ["tournaments", z.array(TournamentSchema), TOURNAMENTS],
    ["info pages", z.array(InfoPageSchema), INFO_PAGES],
  ] as const)("%s", (_name, schema, data) => {
    const r = (schema as z.ZodType).safeParse(data);
    expect(r.success ? "ok" : z.prettifyError(r.error)).toBe("ok");
  });

  it("has unique slugs and valid references", () => {
    const unique = (xs: string[]) => new Set(xs).size === xs.length;
    expect(unique(SPORTS.map(s => s.slug))).toBe(true);
    expect(unique(MATCHES.map(m => m.id))).toBe(true);
    expect(unique(GAMES.map(g => g.slug))).toBe(true);
    for (const l of LEAGUES) expect(SPORTS.some(s => s.slug === l.sport), l.slug).toBe(true);
    for (const m of MATCHES) expect(LEAGUES.some(l => l.slug === m.league && l.sport === m.sport), m.id).toBe(true);
    for (const g of GAMES) expect(PROVIDERS.some(p => p.slug === g.provider), g.slug).toBe(true);
    for (const t of HOME_TILES) expect(t === "mybet-games" || GAMES.some(g => g.slug === t), t).toBe(true);
    for (const s of SPORTS) expect(isIconName(s.icon), s.icon).toBe(true);
    for (const p of INFO_PAGES) expect(isIconName(p.icon), p.icon).toBe(true);
  });

  it("shows the odds drawn on the homepage", () => {
    const m = MATCHES.find(x => x.id === "yas-lions-emirates-eagles")!;
    expect(m.rowMarkets.map(mk => mk.outcomes.map(o => o.odds))).toEqual([[1.936, 30, 1.896], [1.92, 1.003, 1.88], [1.92, 1.87]]);
    expect(m.rowMarkets[2].line).toBe(133.5);
  });
});

describe("data access (mock mode)", () => {
  it("filters matches and returns null for unknown ids", async () => {
    expect((await getMatches({ status: "live" })).every(m => m.status === "live")).toBe(true);
    expect((await getMatches({ esport: true })).every(m => m.sport === "esports")).toBe(true);
    expect(await getMatch("does-not-exist")).toBeNull();
    expect(await getSport("nope")).toBeNull();
    expect(await getLeague("cricket", "england-premier-league")).toBeNull();
  });

  it("returns full markets for a match page", async () => {
    const m = await getMatch("arsenal-chelsea");
    expect(MatchDetailSchema.safeParse(m).success).toBe(true);
    expect(m!.markets.length).toBeGreaterThan(5);
  });

  it("filters games by several kinds", async () => {
    const games = await getGames({ kind: ["mybet", "crash"] });
    expect(games.length).toBeGreaterThan(10);
    expect(games.every(g => g.kind === "mybet" || g.kind === "crash")).toBe(true);
  });

  it("keeps the homepage league order as drawn", async () => {
    expect(await getHomeLeagueSlugs()).toEqual([
      "abu-dhabi-t10-league", "pro50-championship", "namibia-super-50-franchise", "chandigarh-league", "india-indoor-series",
    ]);
  });
});
