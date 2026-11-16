import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Card";
import { OddsButton } from "@/components/betslip/OddsButton";
import { formatKickoff } from "@/lib/format";
import { toSelection } from "@/lib/selection";
import type { IconName } from "@/lib/icons";
import type { League, Market, Match } from "@/lib/schemas";

export function MatchHero({ match, league, icon }: { match: Match; league?: League; icon: IconName }) {
  const live = match.status === "live";
  return (
    <section aria-label="Scoreboard" className="flex flex-col items-center gap-3.5 rounded-lg bg-brand-primary px-6 pb-6 pt-4.5 text-white">
      <p className="flex items-center gap-2 text-label font-medium text-icon-light">
        <Icon name={icon} size={14} />
        {league?.name}{league?.round ? ` · ${league.round}` : ""}
      </p>
      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-10">
        {[match.home, match.away].map((team, i) => (
          <div key={team} className={`flex flex-col items-center gap-2.5 ${i === 1 ? "order-3" : ""}`}>
            <span className="flex size-16 items-center justify-center rounded-full bg-card text-ink"><Icon name="team" size={28} /></span>
            <h1 className="text-center text-heading font-bold">{team}</h1>
          </div>
        ))}
        <div className="order-2 flex flex-col items-center gap-1.5">
          <span className="text-hero font-bold tabular-nums">{live ? match.live?.score : "VS"}</span>
          <span className="text-center text-caption font-semibold text-brand-green-light">
            {live ? match.live?.clock : formatKickoff(match.startsAt)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-label">
        {match.stream ? <span className="flex h-[30px] items-center gap-2 rounded bg-brand-dark px-3.5"><Icon name="youtube" size={14} />Live stream</span> : null}
        <span className="flex h-[30px] items-center gap-2 rounded bg-brand-dark px-3.5"><Icon name="stats" size={14} />{match.marketCount} markets</span>
      </div>
    </section>
  );
}

export function MarketGroup({ match, market }: { match: Match; market: Market }) {
  const title = market.line !== undefined ? `${market.name} (${market.line})` : market.name;
  const cols = market.outcomes.length === 2 || market.outcomes.length === 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
  return (
    <Section title={title} id={`market-${market.id.split(":").pop()}`}>
      <div className={`grid gap-2 ${cols}`}>
        {market.outcomes.map(o => <OddsButton key={o.id} variant="market" selection={toSelection(match, market, o)} />)}
      </div>
    </Section>
  );
}
