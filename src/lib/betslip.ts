/**
 * Bet slip domain logic (pure, framework-free, unit-tested).
 * Money is handled in integer cents; odds are rounded to thousandths before
 * multiplying so payouts are exact and never over-credited.
 */
import { z } from "zod";

export const LIMITS = {
  minStakeCents: 50_00, // LKR 50
  maxStakeCents: 1_000_000_00, // LKR 1,000,000
  maxSelections: 20,
  maxPayoutCents: 50_000_000_00, // LKR 50,000,000
} as const;

export const SelectionSchema = z.object({
  matchId: z.string().min(1).max(120),
  matchLabel: z.string().min(1).max(170),
  href: z.string().startsWith("/").max(300),
  marketId: z.string().min(1).max(80),
  marketName: z.string().min(1).max(80),
  outcomeId: z.string().min(1).max(80),
  outcomeLabel: z.string().min(1).max(40),
  odds: z.number().gt(1).lt(10_000),
  live: z.boolean(),
});
export type Selection = z.infer<typeof SelectionSchema>;

export const SLIP_MODES = ["single", "accumulator"] as const;
export type SlipMode = (typeof SLIP_MODES)[number];

export const SlipStateSchema = z.object({
  selections: z.array(SelectionSchema).max(LIMITS.maxSelections),
  mode: z.enum(SLIP_MODES),
  /** Accumulator: total stake. Singles: stake per selection. */
  stakeCents: z.number().int().min(0).max(LIMITS.maxStakeCents),
});
export type SlipState = z.infer<typeof SlipStateSchema>;

export const EMPTY_SLIP: SlipState = Object.freeze({ selections: [], mode: "single", stakeCents: 100_00 }) as SlipState;

export type SlipAction =
  | { type: "toggle"; selection: Selection }
  | { type: "remove"; outcomeId: string }
  | { type: "clear" }
  | { type: "mode"; mode: SlipMode }
  | { type: "stake"; stakeCents: number }
  | { type: "load"; selections: Selection[] };

function autoMode(prev: SlipState, selections: Selection[]): SlipMode {
  if (selections.length < 2) return "single";
  return prev.selections.length < 2 ? "accumulator" : prev.mode;
}

export function slipReducer(state: SlipState, action: SlipAction): SlipState {
  switch (action.type) {
    case "toggle": {
      const s = action.selection;
      if (state.selections.some(x => x.outcomeId === s.outcomeId)) {
        const selections = state.selections.filter(x => x.outcomeId !== s.outcomeId);
        return { ...state, selections, mode: autoMode(state, selections) };
      }
      // One outcome per match: a new pick from the same match replaces the old one.
      const sameMatch = state.selections.findIndex(x => x.matchId === s.matchId);
      if (sameMatch !== -1) {
        const selections = state.selections.map((x, i) => (i === sameMatch ? s : x));
        return { ...state, selections };
      }
      if (state.selections.length >= LIMITS.maxSelections) return state;
      const selections = [...state.selections, s];
      return { ...state, selections, mode: autoMode(state, selections) };
    }
    case "remove": {
      const selections = state.selections.filter(x => x.outcomeId !== action.outcomeId);
      return { ...state, selections, mode: autoMode(state, selections) };
    }
    case "clear":
      return { ...state, selections: [], mode: "single" };
    case "mode":
      if (action.mode === "accumulator" && state.selections.length < 2) return state;
      return { ...state, mode: action.mode };
    case "stake": {
      const v = Math.round(action.stakeCents);
      if (!Number.isFinite(v)) return state;
      return { ...state, stakeCents: Math.min(Math.max(v, 0), LIMITS.maxStakeCents) };
    }
    case "load": {
      const selections = dedupeByMatch(action.selections).slice(0, LIMITS.maxSelections);
      return { ...state, selections, mode: selections.length > 1 ? "accumulator" : "single" };
    }
  }
}

function dedupeByMatch(selections: Selection[]): Selection[] {
  const seen = new Set<string>();
  return selections.filter(s => (seen.has(s.matchId) ? false : (seen.add(s.matchId), true)));
}

const milli = (odds: number) => Math.round(odds * 1000);

/** Accumulator odds = product of selection odds, rounded to 3 decimals. */
export function totalOdds(selections: Selection[]): number {
  if (!selections.length) return 0;
  const product = selections.reduce((acc, s) => acc * s.odds, 1);
  return Math.round(product * 1000) / 1000;
}

export interface SlipSummary {
  totalStakeCents: number;
  totalOdds: number;
  potentialWinCents: number;
  capped: boolean;
}

export function summarize(state: SlipState): SlipSummary {
  const { selections, stakeCents, mode } = state;
  if (!selections.length) return { totalStakeCents: 0, totalOdds: 0, potentialWinCents: 0, capped: false };
  let win: number;
  let odds: number;
  let totalStake: number;
  if (mode === "accumulator") {
    odds = totalOdds(selections);
    totalStake = stakeCents;
    win = Math.floor((stakeCents * milli(odds)) / 1000);
  } else {
    odds = selections.length === 1 ? selections[0].odds : 0;
    totalStake = stakeCents * selections.length;
    win = selections.reduce((sum, s) => sum + Math.floor((stakeCents * milli(s.odds)) / 1000), 0);
  }
  const capped = win > LIMITS.maxPayoutCents;
  return { totalStakeCents: totalStake, totalOdds: odds, potentialWinCents: capped ? LIMITS.maxPayoutCents : win, capped };
}

/** First reason the slip cannot be placed, or null. */
export function validateSlip(state: SlipState): string | null {
  if (!state.selections.length) return "Add at least one selection.";
  if (state.mode === "accumulator" && state.selections.length < 2) return "An accumulator needs at least two selections.";
  if (state.stakeCents < LIMITS.minStakeCents) return `Minimum stake is LKR ${LIMITS.minStakeCents / 100}.`;
  if (state.stakeCents > LIMITS.maxStakeCents) return `Maximum stake is LKR ${(LIMITS.maxStakeCents / 100).toLocaleString("en-US")}.`;
  return null;
}

// ------------------------------------------------------------ slip codes
const CODE_PREFIX = "MB1.";
const CodeSchema = z.array(SelectionSchema).min(1).max(LIMITS.maxSelections);
const MAX_CODE_LENGTH = 8000;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

/** Shareable code for a bet slip (self-contained; no server needed). */
export function encodeSlip(selections: Selection[]): string {
  return CODE_PREFIX + toBase64Url(JSON.stringify(selections));
}

/** Parses and validates a code. Untrusted input: returns null on anything unexpected. */
export function decodeSlip(code: string): Selection[] | null {
  const c = code.trim();
  if (!c.startsWith(CODE_PREFIX) || c.length > MAX_CODE_LENGTH || !/^[A-Za-z0-9_-]*$/.test(c.slice(CODE_PREFIX.length))) return null;
  try {
    const parsed = CodeSchema.safeParse(JSON.parse(fromBase64Url(c.slice(CODE_PREFIX.length))));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Parses a stake typed by the user ("1,250.50") into cents; null if invalid. */
export function parseStake(input: string): number | null {
  const clean = input.replace(/[,\s]/g, "");
  if (!/^\d{1,9}(\.\d{0,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}
