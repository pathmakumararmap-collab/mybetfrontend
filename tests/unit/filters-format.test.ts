import { describe, expect, it } from "vitest";
import { filterMatches, groupByLeague, matchHref, param, pickTab, MATCH_TABS } from "@/lib/filters";
import { formatKickoff, formatMoney, formatOdds, formatLine } from "@/lib/format";
import { LEAGUES, MATCHES } from "@/lib/mock/sports";

describe("filters", () => {
  it("param() takes the first value and limits length", () => {
    expect(param(["a", "b"])).toBe("a");
    expect(param(undefined)).toBe("");
    expect(param("x".repeat(100), 10)).toHaveLength(10);
  });

  it("pickTab() falls back to the first tab", () => {
    expect(pickTab(MATCH_TABS, "recommended")).toBe("recommended");
    expect(pickTab(MATCH_TABS, "<script>")).toBe("matches");
  });

  it("filters by tab, search and streams", () => {
    expect(filterMatches(MATCHES, { tab: "recommended" }).every(m => m.recommended)).toBe(true);
    expect(filterMatches(MATCHES, { tab: "period-2" }).every(m => m.live?.period === 2)).toBe(true);
    expect(filterMatches(MATCHES, { q: "LIONS" }).map(m => m.home)).toEqual(["Yas Lions", "Yas Lions"]);
    expect(filterMatches(MATCHES, { streams: true }).every(m => m.stream)).toBe(true);
    expect(filterMatches(MATCHES, { tab: "today", today: "2026-11-14" }).every(m => m.startsAt.startsWith("2026-11-14"))).toBe(true);
  });

  it("groups by league in the requested order", () => {
    const order = ["pro50-championship", "abu-dhabi-t10-league"];
    const groups = groupByLeague(MATCHES.filter(m => m.sport === "cricket"), LEAGUES, order);
    expect(groups.slice(0, 2).map(g => g.league.slug)).toEqual(order);
  });

  it("builds match URLs from sport/league/id", () => {
    expect(matchHref({ sport: "football", league: "england-premier-league", id: "arsenal-chelsea" }))
      .toBe("/line/football/england-premier-league/arsenal-chelsea");
  });
});

describe("format", () => {
  it("formats odds without trailing zeros", () => {
    expect(formatOdds(1.936)).toBe("1.936");
    expect(formatOdds(30)).toBe("30");
    expect(formatOdds(1.5)).toBe("1.5");
    expect(formatLine(133.5)).toBe("133.5");
  });

  it("formats kickoff in Sri Lanka time", () => {
    expect(formatKickoff("2026-11-14T15:15:00Z")).toBe("14 Nov, 20:45");
  });

  it("formats money from cents", () => {
    expect(formatMoney(193_60)).toBe("LKR 193.6");
    expect(formatMoney(1_000_000_00)).toBe("LKR 1,000,000");
  });
});
