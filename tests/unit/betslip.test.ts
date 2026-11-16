import { describe, expect, it } from "vitest";
import {
  EMPTY_SLIP, LIMITS, decodeSlip, encodeSlip, parseStake, slipReducer, summarize, totalOdds, validateSlip,
  type Selection, type SlipState,
} from "@/lib/betslip";

const sel = (matchId: string, outcome: string, odds: number): Selection => ({
  matchId, matchLabel: `${matchId} home – away`, href: `/line/football/l/${matchId}`,
  marketId: `${matchId}:1x2`, marketName: "1X2", outcomeId: `${matchId}:1x2:${outcome}`, outcomeLabel: outcome, odds, live: false,
});

const apply = (state: SlipState, ...actions: Parameters<typeof slipReducer>[1][]) => actions.reduce(slipReducer, state);

describe("slipReducer", () => {
  it("adds, then removes the same outcome on a second click", () => {
    const a = sel("m1", "1", 1.936);
    const s1 = apply(EMPTY_SLIP, { type: "toggle", selection: a });
    expect(s1.selections).toHaveLength(1);
    expect(apply(s1, { type: "toggle", selection: a }).selections).toHaveLength(0);
  });

  it("replaces a pick from the same match instead of adding a second one", () => {
    const s = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 1.9) }, { type: "toggle", selection: sel("m1", "2", 2.1) });
    expect(s.selections).toHaveLength(1);
    expect(s.selections[0].outcomeLabel).toBe("2");
  });

  it("switches to accumulator at two selections and back to single at one", () => {
    const s2 = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 1.5) }, { type: "toggle", selection: sel("m2", "1", 2) });
    expect(s2.mode).toBe("accumulator");
    expect(apply(s2, { type: "remove", outcomeId: "m2:1x2:1" }).mode).toBe("single");
  });

  it("refuses accumulator mode with fewer than two selections", () => {
    const s = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 1.5) }, { type: "mode", mode: "accumulator" });
    expect(s.mode).toBe("single");
  });

  it("stops at the selection limit", () => {
    let s = EMPTY_SLIP;
    for (let i = 0; i < LIMITS.maxSelections + 5; i++) s = slipReducer(s, { type: "toggle", selection: sel(`m${i}`, "1", 1.1) });
    expect(s.selections).toHaveLength(LIMITS.maxSelections);
  });

  it("clamps the stake and ignores non-finite values", () => {
    expect(apply(EMPTY_SLIP, { type: "stake", stakeCents: -5 }).stakeCents).toBe(0);
    expect(apply(EMPTY_SLIP, { type: "stake", stakeCents: 10 ** 15 }).stakeCents).toBe(LIMITS.maxStakeCents);
    expect(apply(EMPTY_SLIP, { type: "stake", stakeCents: Number.NaN }).stakeCents).toBe(EMPTY_SLIP.stakeCents);
  });

  it("keeps one selection per match when loading", () => {
    const s = apply(EMPTY_SLIP, { type: "load", selections: [sel("m1", "1", 2), sel("m1", "2", 3), sel("m2", "x", 3.2)] });
    expect(s.selections.map(x => x.outcomeId)).toEqual(["m1:1x2:1", "m2:1x2:x"]);
    expect(s.mode).toBe("accumulator");
  });
});

describe("summarize", () => {
  it("computes a single exactly in cents", () => {
    const s = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 1.936) }, { type: "stake", stakeCents: 100_00 });
    expect(summarize(s)).toMatchObject({ totalStakeCents: 100_00, totalOdds: 1.936, potentialWinCents: 193_60 });
  });

  it("multiplies accumulator odds and rounds them to 3 decimals", () => {
    const sels = [sel("m1", "1", 1.936), sel("m2", "2", 1.896)];
    expect(totalOdds(sels)).toBe(3.671); // 3.670656
    const s = apply(EMPTY_SLIP, { type: "load", selections: sels }, { type: "stake", stakeCents: 100_00 });
    expect(summarize(s).potentialWinCents).toBe(367_10);
  });

  it("charges stake per selection for singles", () => {
    const s = apply(EMPTY_SLIP, { type: "load", selections: [sel("m1", "1", 2), sel("m2", "1", 3)] }, { type: "mode", mode: "single" }, { type: "stake", stakeCents: 50_00 });
    expect(summarize(s)).toMatchObject({ totalStakeCents: 100_00, potentialWinCents: 250_00 });
  });

  it("never pays out more than the cap", () => {
    const sels = Array.from({ length: 10 }, (_, i) => sel(`m${i}`, "1", 50));
    const s = apply(EMPTY_SLIP, { type: "load", selections: sels }, { type: "stake", stakeCents: 1_000_00 });
    const sum = summarize(s);
    expect(sum.capped).toBe(true);
    expect(sum.potentialWinCents).toBe(LIMITS.maxPayoutCents);
  });

  it("does not round a payout up (floating-point edge)", () => {
    const s = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 1.005) }, { type: "stake", stakeCents: 333 });
    expect(summarize(s).potentialWinCents).toBe(334); // 3.34665 → 3.34
  });
});

describe("validateSlip", () => {
  it("reports empty slip, minimum and maximum stake", () => {
    expect(validateSlip(EMPTY_SLIP)).toMatch(/at least one/);
    const one = apply(EMPTY_SLIP, { type: "toggle", selection: sel("m1", "1", 2) });
    expect(validateSlip({ ...one, stakeCents: 49_99 })).toMatch(/Minimum stake is LKR 50/);
    expect(validateSlip({ ...one, stakeCents: 100_00 })).toBeNull();
  });
});

describe("slip codes", () => {
  it("round-trips selections, including non-ASCII text", () => {
    const sels = [{ ...sel("m1", "1", 1.9), matchLabel: "යස් ලයන්ස් – Emirates" }, sel("m2", "x", 3.1)];
    expect(decodeSlip(encodeSlip(sels))).toEqual(sels);
  });

  it("rejects tampered, foreign and oversized codes", () => {
    const code = encodeSlip([sel("m1", "1", 1.9)]);
    expect(decodeSlip(code.slice(0, -4) + "AAAA")).toBeNull();
    expect(decodeSlip("hello")).toBeNull();
    expect(decodeSlip("MB1." + "A".repeat(9000))).toBeNull();
    const evil = "MB1." + Buffer.from(JSON.stringify([{ ...sel("m1", "1", 1.9), href: "javascript:alert(1)" }])).toString("base64url");
    expect(decodeSlip(evil)).toBeNull();
    const badOdds = "MB1." + Buffer.from(JSON.stringify([{ ...sel("m1", "1", 1.9), odds: 1 }])).toString("base64url");
    expect(decodeSlip(badOdds)).toBeNull();
  });
});

describe("parseStake", () => {
  it.each([
    ["100", 100_00], ["1,250.50", 1_250_50], ["0.5", 50], [" 20 ", 20_00],
  ])("parses %s", (input, cents) => expect(parseStake(input)).toBe(cents));

  it.each(["", "abc", "-5", "1.234", "1e5", "10000000000"])("rejects %s", input => expect(parseStake(input)).toBeNull());
});
