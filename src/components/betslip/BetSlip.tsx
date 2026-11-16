"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormMessage } from "@/components/auth/fields";
import { useStore } from "@/lib/client/store";
import { dispatchSlip, openAuth, placedBetsStore, sessionStore, slipStore } from "@/lib/client/stores";
import { postJson } from "@/lib/client/api";
import { encodeSlip, parseStake, summarize, validateSlip, LIMITS } from "@/lib/betslip";
import { formatMoney, formatOdds } from "@/lib/format";
import { cn } from "@/lib/cn";

const QUICK_STAKES = [100_00, 500_00, 1_000_00, 5_000_00];

function Tabs<T extends string>({ value, onChange, items }: {
  value: T; onChange: (v: T) => void; items: { id: T; label: string; icon?: "download" | "upload" }[];
}) {
  return (
    <div className="flex" role="tablist">
      {items.map((t, i) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex h-8 flex-1 items-center justify-center gap-2 text-label font-medium text-white",
            i === 0 ? "bg-brand-dark" : "bg-brand-primary",
            value !== t.id && "opacity-80 hover:opacity-100",
          )}
        >
          {t.icon ? <Icon name={t.icon} size={14} /> : null}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Bet slip / My Bet card from the right sidebar. */
export function BetSlipCard() {
  const [tab, setTab] = useState<"slip" | "mine">("slip");
  return (
    <section aria-label="Bet slip" className="overflow-hidden rounded-lg bg-card">
      <Tabs value={tab} onChange={setTab} items={[{ id: "slip", label: "Bet slip" }, { id: "mine", label: "My Bet" }]} />
      <div className="flex flex-col gap-2 p-2">{tab === "slip" ? <SlipBody /> : <MyBets />}</div>
    </section>
  );
}

function SlipBody() {
  const uid = useId();
  const slip = useStore(slipStore);
  const session = useStore(sessionStore);
  const [stakeText, setStakeText] = useState<string | null>(null);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const summary = summarize(slip);
  const shownStake = stakeText ?? String(slip.stakeCents / 100);
  const n = slip.selections.length;

  async function share() {
    if (!n) return;
    try {
      await navigator.clipboard.writeText(encodeSlip(slip.selections));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({ tone: "error", text: "Could not copy. Use Save below instead." });
    }
  }

  async function place() {
    setStatus(null);
    const problem = validateSlip(slip);
    if (problem) return setStatus({ tone: "error", text: problem });
    if (session.status !== "user") return openAuth("login");
    setPending(true);
    const res = await postJson<{ bet: { id: string; potentialWinCents: number } }>("/api/bets", {
      mode: slip.mode, stakeCents: slip.stakeCents, selections: slip.selections,
    });
    setPending(false);
    if (!res.ok) return setStatus({ tone: "error", text: res.error });
    placedBetsStore.set(prev => [{
      id: res.data.bet.id, placedAt: new Date().toISOString(), mode: slip.mode, stakeCents: summary.totalStakeCents,
      potentialWinCents: res.data.bet.potentialWinCents, selections: slip.selections,
    }, ...prev].slice(0, 50));
    dispatchSlip({ type: "clear" });
    setStatus({ tone: "success", text: `Bet accepted: ${res.data.bet.id}` });
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="text-label font-medium text-strong">Your Bets</span>
        {n ? <span className="rounded bg-brand-primary px-1.5 text-caption font-semibold text-white">{n}</span> : null}
        <button type="button" onClick={share} disabled={!n} aria-label="Copy bet slip code" title={copied ? "Copied" : "Copy bet slip code"}
          className="ml-auto flex size-6 items-center justify-center rounded bg-neutral text-gray disabled:opacity-50">
          <Icon name={copied ? "check" : "share"} size={12} />
        </button>
        <button type="button" onClick={() => dispatchSlip({ type: "clear" })} disabled={!n} aria-label="Clear bet slip" title="Clear bet slip"
          className="flex size-6 items-center justify-center rounded bg-neutral text-gray disabled:opacity-50">
          <Icon name="trash" size={12} />
        </button>
      </div>

      {!n ? (
        <div className="flex h-[135px] items-center justify-center rounded-md bg-page px-6 text-center text-body text-gray">
          Add events to the bet slip or enter a code to load events
        </div>
      ) : (
        <>
          {n > 1 ? (
            <div className="grid grid-cols-2 gap-1 rounded-md bg-page p-1" role="radiogroup" aria-label="Bet type">
              {(["single", "accumulator"] as const).map(m => (
                <button key={m} type="button" role="radio" aria-checked={slip.mode === m} onClick={() => dispatchSlip({ type: "mode", mode: m })}
                  className={cn("h-7 rounded text-caption font-semibold capitalize", slip.mode === m ? "bg-brand-primary text-white" : "text-gray hover:bg-white")}>
                  {m === "single" ? `Singles (${n})` : "Accumulator"}
                </button>
              ))}
            </div>
          ) : null}
          <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {slip.selections.map(s => (
              <li key={s.outcomeId} className="rounded-md bg-page p-2">
                <div className="flex items-start gap-2">
                  <Link href={s.href} className="min-w-0 flex-1 text-caption font-semibold text-ink hover:underline">
                    {s.live ? <span className="mr-1 rounded bg-brand-green px-1 text-white">LIVE</span> : null}
                    {s.matchLabel}
                  </Link>
                  <button type="button" onClick={() => dispatchSlip({ type: "remove", outcomeId: s.outcomeId })} aria-label={`Remove ${s.matchLabel}`}
                    className="text-muted hover:text-ink"><Icon name="close" size={12} /></button>
                </div>
                <div className="mt-1 flex items-center justify-between text-caption text-gray">
                  <span className="truncate">{s.marketName}: <b className="font-semibold text-strong">{s.outcomeLabel}</b></span>
                  <span className="font-bold tabular-nums text-strong">{formatOdds(s.odds)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${uid}-stake`} className="text-caption font-medium text-gray">
              {slip.mode === "accumulator" ? "Stake" : n > 1 ? "Stake per bet" : "Stake"} (LKR)
            </label>
            <input
              id={`${uid}-stake`}
              inputMode="decimal"
              value={shownStake}
              onChange={e => {
                setStakeText(e.target.value);
                const cents = parseStake(e.target.value);
                if (cents !== null) dispatchSlip({ type: "stake", stakeCents: cents });
              }}
              onBlur={() => setStakeText(null)}
              className="h-[30px] rounded bg-page px-3 text-label font-semibold tabular-nums text-strong focus:outline-2 focus:outline-brand-accent"
            />
            <div className="grid grid-cols-4 gap-1">
              {QUICK_STAKES.map(c => (
                <button key={c} type="button" onClick={() => { setStakeText(null); dispatchSlip({ type: "stake", stakeCents: c }); }}
                  className="h-6 rounded bg-odds text-caption font-medium text-strong hover:bg-[#d9e2ea]">
                  {(c / 100).toLocaleString("en-US")}
                </button>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-y-1 text-caption">
            {slip.mode === "accumulator" || n === 1 ? (<><dt className="text-gray">Total odds</dt><dd className="text-right font-bold tabular-nums">{formatOdds(summary.totalOdds)}</dd></>) : null}
            <dt className="text-gray">Total stake</dt><dd className="text-right font-semibold tabular-nums">{formatMoney(summary.totalStakeCents)}</dd>
            <dt className="text-gray">Potential win</dt><dd className="text-right font-bold tabular-nums text-brand-green">{formatMoney(summary.potentialWinCents)}</dd>
          </dl>
          {summary.capped ? <p className="text-caption text-gray">Capped at the maximum payout of {formatMoney(LIMITS.maxPayoutCents)}.</p> : null}
        </>
      )}

      {status ? <FormMessage tone={status.tone}>{status.text}</FormMessage> : null}

      {session.status === "user" ? (
        <Button variant="yellow" size={32} block bold onClick={place} disabled={!n || pending}>
          {pending ? "Placing…" : "Place bet"}
        </Button>
      ) : (
        <>
          <Button variant="green" size={32} block onClick={() => openAuth("register")}>Registration</Button>
          {n ? (
            <button type="button" onClick={() => openAuth("login")} className="text-caption font-semibold text-brand-primary underline">
              Log in to place your bet
            </button>
          ) : null}
        </>
      )}
    </>
  );
}

function MyBets() {
  const session = useStore(sessionStore);
  const bets = useStore(placedBetsStore);
  if (session.status !== "user") {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-body text-gray">Log in to see your bets</p>
        <Button variant="dark" onClick={() => openAuth("login")}>Login</Button>
      </div>
    );
  }
  if (!bets.length) return <p className="py-6 text-center text-body text-gray">You have no bets yet.</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {bets.map(b => (
        <li key={b.id} className="rounded-md bg-page p-2 text-caption">
          <div className="flex justify-between font-semibold text-ink"><span>{b.id}</span><span className="capitalize">{b.mode}</span></div>
          <p className="mt-1 truncate text-gray">{b.selections.map(s => s.matchLabel).join(" · ")}</p>
          <div className="mt-1 flex justify-between"><span>Stake {formatMoney(b.stakeCents)}</span><span className="font-bold text-brand-green">{formatMoney(b.potentialWinCents)}</span></div>
        </li>
      ))}
    </ul>
  );
}

export { Tabs as SplitTabs };
