/**
 * Deterministic odds for mock data: the same match id always yields the same
 * prices, so pages prerender identically on every build.
 */
import type { Market } from "@/lib/schemas";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pseudo-random number in [min, max) seeded by `seed`. */
export function seeded(seed: string, min: number, max: number): number {
  return min + (hash(seed) / 0xffffffff) * (max - min);
}

export function price(seed: string, min: number, max: number, decimals = 2): number {
  const p = 10 ** decimals;
  return Math.round(seeded(seed, min, max) * p) / p;
}

const o = (marketId: string, key: string, label: string, odds: number) => ({ id: `${marketId}:${key}`, label, odds });

export function rowMarkets(matchId: string, preset?: RowOdds): Market[] {
  const v = preset ?? {
    w1: price(`${matchId}w1`, 1.4, 3.6, 3),
    x: price(`${matchId}x`, 2.8, 4.6, 2),
    w2: price(`${matchId}w2`, 1.5, 4.2, 3),
    d1x: price(`${matchId}1x`, 1.05, 1.6),
    d12: price(`${matchId}12`, 1.1, 1.4, 3),
    d2x: price(`${matchId}2x`, 1.1, 1.9),
    line: Math.round(seeded(`${matchId}line`, 1, 4)) + 0.5,
    over: price(`${matchId}over`, 1.6, 2.3),
    under: price(`${matchId}under`, 1.6, 2.3),
  };
  const m1 = `${matchId}:1x2`, m2 = `${matchId}:dc`, m3 = `${matchId}:it1`;
  return [
    { id: m1, name: "1X2", outcomes: [o(m1, "1", "1", v.w1), o(m1, "x", "X", v.x), o(m1, "2", "2", v.w2)] },
    { id: m2, name: "Double chance", outcomes: [o(m2, "1x", "1X", v.d1x), o(m2, "12", "12", v.d12), o(m2, "2x", "2X", v.d2x)] },
    { id: m3, name: "Individual total 1", line: v.line, outcomes: [o(m3, "o", "O", v.over), o(m3, "u", "U", v.under)] },
  ];
}

export interface RowOdds {
  w1: number; x: number; w2: number;
  d1x: number; d12: number; d2x: number;
  line: number; over: number; under: number;
}

/** Full market list for the match page. */
export function fullMarkets(matchId: string, row: Market[]): Market[] {
  const mk = (key: string, name: string, outcomes: [string, string, number][], line?: number): Market => {
    const id = `${matchId}:${key}`;
    return { id, name, line, outcomes: outcomes.map(([k, label, odds]) => o(id, k, label, odds)) };
  };
  const p = (k: string, a: number, b: number) => price(`${matchId}${k}`, a, b);
  return [
    ...row.slice(0, 2),
    mk("total", "Total", [
      ["o25", "Over 2.5", p("o25", 1.5, 2.1)], ["u25", "Under 2.5", p("u25", 1.7, 2.4)],
      ["o35", "Over 3.5", p("o35", 2.2, 3.2)], ["u35", "Under 3.5", p("u35", 1.3, 1.6)],
      ["o45", "Over 4.5", p("o45", 3.8, 5.5)], ["u45", "Under 4.5", p("u45", 1.1, 1.25)],
    ]),
    mk("hcp", "Handicap", [
      ["h1m1", "1 (-1)", p("h1m1", 1.9, 2.6)], ["h2p1", "2 (+1)", p("h2p1", 1.5, 1.9)],
      ["h1m15", "1 (-1.5)", p("h1m15", 2.5, 3.2)], ["h2p15", "2 (+1.5)", p("h2p15", 1.3, 1.5)],
    ]),
    mk("btts", "Both teams to score", [["y", "Yes", p("btty", 1.6, 1.9)], ["n", "No", p("bttn", 1.9, 2.3)]]),
    mk("cs", "Correct score", [
      ["10", "1:0", p("cs10", 5, 7)], ["21", "2:1", p("cs21", 7, 10)], ["20", "2:0", p("cs20", 6.5, 9)],
      ["00", "0:0", p("cs00", 8, 11)], ["11", "1:1", p("cs11", 5.5, 7)], ["01", "0:1", p("cs01", 9, 13)],
    ]),
    row[2],
  ];
}
