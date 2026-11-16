"use client";
import { useStore } from "@/lib/client/store";
import { dispatchSlip, slipStore } from "@/lib/client/stores";
import type { Selection } from "@/lib/betslip";
import { formatOdds } from "@/lib/format";
import { cn } from "@/lib/cn";

type Variant = "row" | "chip" | "market";

const STYLE: Record<Variant, { base: string; on: string }> = {
  // Row: flexible with its label on narrow match lists, fixed 58px odds-only from 640px (container query).
  row: { base: "h-8 flex-1 justify-between rounded-md bg-odds px-2 text-caption font-medium text-strong hover:bg-[#d9e2ea] @[640px]:w-[58px] @[640px]:flex-none @[640px]:justify-center @[640px]:px-0", on: "bg-brand-primary text-white hover:bg-brand-primary" },
  chip: { base: "h-[22px] flex-1 justify-between rounded bg-odds-soft px-2 text-caption text-strong hover:bg-[#dedede]", on: "bg-brand-primary text-white hover:bg-brand-primary" },
  market: { base: "h-[34px] justify-between rounded-md bg-odds px-3 text-caption hover:bg-[#d9e2ea]", on: "bg-brand-primary text-white hover:bg-brand-primary" },
};

/** Odds cell that adds/removes its outcome in the bet slip. */
export function OddsButton({ selection, variant = "row", showLabel = variant !== "row" }: {
  selection: Selection; variant?: Variant; showLabel?: boolean;
}) {
  const slip = useStore(slipStore);
  const on = slip.selections.some(s => s.outcomeId === selection.outcomeId);
  const s = STYLE[variant];
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${selection.matchLabel}: ${selection.marketName} ${selection.outcomeLabel} at ${formatOdds(selection.odds)}`}
      onClick={() => dispatchSlip({ type: "toggle", selection })}
      className={cn("flex shrink-0 items-center tabular-nums transition", s.base, on && s.on)}
    >
      {showLabel ? (
        <span className={cn(variant === "chip" ? "font-semibold" : "font-medium", !on && variant === "market" && "text-muted")}>{selection.outcomeLabel}</span>
      ) : variant === "row" ? (
        <span aria-hidden className={cn("@[640px]:hidden", !on && "text-muted")}>{selection.outcomeLabel}</span>
      ) : null}
      <span className={cn(variant === "market" && "font-semibold", variant === "chip" && "font-medium")}>{formatOdds(selection.odds)}</span>
    </button>
  );
}
