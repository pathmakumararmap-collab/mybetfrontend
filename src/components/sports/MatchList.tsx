/**
 * Matches block as drawn on the homepage: tabs bar, sport filter, league
 * headers and match rows with three odds groups (1X2 · double chance ·
 * individual total). Groups 2–3 hide when the column is narrow (container queries).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { OddsButton } from "@/components/betslip/OddsButton";
import { cn } from "@/lib/cn";
import { formatKickoff, formatLine } from "@/lib/format";
import { matchHref, type LeagueGroup, type Tab } from "@/lib/filters";
import { isIconName, type IconName } from "@/lib/icons";
import { toSelection } from "@/lib/selection";
import type { League, Match, Sport } from "@/lib/schemas";

// ----------------------------------------------------------------- urls
export function withParams(path: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function sportIcon(sport: Pick<Sport, "icon"> | undefined): IconName {
  return sport && isIconName(sport.icon) ? sport.icon : "trophy";
}

// ------------------------------------------------------------- tabs bar
export function TabsBar({ tabs, active, basePath, query = {}, crumbs = true, search = "Search by match", defaultTab }: {
  tabs: readonly Tab[];
  active: string;
  basePath: string;
  query?: Record<string, string | undefined>;
  crumbs?: boolean;
  /** Placeholder for the search box; null hides it. */
  search?: string | null;
  defaultTab?: string;
}) {
  const first = defaultTab ?? tabs[0]?.id;
  return (
    <div className="flex h-8 items-center gap-1 bg-brand-dark px-3">
      {crumbs ? (
        <div className="hidden shrink-0 items-center gap-1.5 pr-[30px] text-white md:flex" aria-hidden>
          <Icon name="home" size={16} />
          <Icon name="chevron-right" size={10} />
          <Icon name="football" size={16} />
          <Icon name="chevron-right" size={10} />
          <Icon name="trophy" size={16} />
        </div>
      ) : null}
      <ul className="scrollbar-none flex h-full min-w-0 items-stretch overflow-x-auto" role="list">
        {tabs.map(t => {
          const on = t.id === active;
          return (
            <li key={t.id} className="flex">
              <Link
                href={withParams(basePath, { ...query, tab: t.id === first ? undefined : t.id })}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex items-center whitespace-nowrap border-b-2 px-2.5 text-label font-medium text-white transition hover:text-brand-green-light",
                  on ? "border-brand-green-light" : "border-transparent",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {search !== null ? (
        <form action={basePath} method="get" role="search" className="ml-auto flex h-6 w-40 shrink-0 items-center rounded-full bg-strong/25 pl-2.5 pr-1.5">
          {active !== first ? <input type="hidden" name="tab" value={active} /> : null}
          {Object.entries(query).map(([k, v]) => (k !== "q" && v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
          <label htmlFor={`q-${basePath}`} className="sr-only">{search}</label>
          <input
            id={`q-${basePath}`}
            name="q"
            defaultValue={query.q ?? ""}
            maxLength={60}
            placeholder={search}
            className="min-w-0 flex-1 bg-transparent text-caption font-medium text-white placeholder:text-white focus:outline-none"
          />
          <button type="submit" aria-label="Search" className="text-white"><Icon name="search" size={12} /></button>
        </form>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------- sport filter
export function SportFilter({ sports, active, streams }: {
  sports: Sport[];
  active?: string;
  /** Live-streams toggle; omit to hide it. */
  streams?: { on: boolean; href: string };
}) {
  return (
    <div className="scrollbar-none flex h-10 items-center gap-1.5 overflow-x-auto bg-brand-primary px-3">
      {streams ? (
        <Link
          href={streams.href}
          scroll={false}
          role="switch"
          aria-checked={streams.on}
          className="flex shrink-0 items-center gap-2.5 border-r border-white/30 pr-3 text-label font-medium text-white"
        >
          <span className={cn("flex h-[18px] w-[34px] items-center rounded-full p-0.5 transition", streams.on ? "bg-brand-green-light" : "bg-card")}>
            <span className={cn("size-3.5 rounded-full bg-strong transition", streams.on && "translate-x-4")} />
          </span>
          With live streams
        </Link>
      ) : null}
      {sports.map(s => (
        <Link
          key={s.slug}
          href={`/line/${s.slug}`}
          aria-current={s.slug === active ? "page" : undefined}
          className={cn("flex h-10 shrink-0 items-center gap-2 px-2.5 text-label font-medium text-white hover:bg-brand-dark", s.slug === active && "bg-brand-dark")}
        >
          <Icon name={sportIcon(s)} size={16} />
          {s.name}
        </Link>
      ))}
      <div className="ml-auto hidden shrink-0 items-center gap-1.5 pl-3 text-white lg:flex" aria-hidden>
        <Icon name="list" size={18} />
        <Icon name="chevron-down" size={10} />
        <Icon name="gamepad" size={18} />
        <Icon name="chevron-down" size={10} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- odds
/** Odds group: full-width strip on narrow columns, fixed 3×58px block from 640px. */
const GROUP = "flex h-12 flex-1 items-center gap-2 border-t border-divider px-3 @[640px]:h-auto @[640px]:flex-none @[640px]:gap-[9px] @[640px]:border-l @[640px]:border-t-0 @[640px]:px-2";
const HEAD_GROUP = "hidden h-full shrink-0 items-center gap-[9px] px-2";
const GROUP_HEADS = [["1", "X", "2"], ["1X", "12", "2X"], ["O", "IT1", "U"]];
const groupVisibility = (i: number) => (i === 0 ? "flex" : i === 1 ? "hidden @[860px]:flex" : "hidden @[1080px]:flex");
const headVisibility = (i: number) => (i === 0 ? "@[640px]:flex" : i === 1 ? "@[860px]:flex" : "@[1080px]:flex");

export function LeagueHeader({ league, icon, more }: { league: League; icon: IconName; more?: number }) {
  return (
    <div className="flex h-[50px] items-center bg-league">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
        <Icon name={icon} size={16} className="text-ink" />
        <span aria-hidden className="size-5 shrink-0 rounded-full bg-brand-green" />
        <Link href={`/line/${league.sport}/${league.slug}`} className="truncate text-label font-medium text-ink hover:underline">
          {league.name}
        </Link>
      </div>
      {GROUP_HEADS.map((g, gi) => (
        <div key={gi} className={cn(HEAD_GROUP, headVisibility(gi))} aria-hidden>
          {g.map((label, i) => (
            <div key={label} className="flex w-[58px] flex-col items-center gap-0.5 text-caption font-medium text-strong">
              {label}
              {i === 1 ? <Icon name="chevron-down" size={8} className="text-gray" /> : null}
            </div>
          ))}
        </div>
      ))}
      <div className="hidden h-full w-[76px] shrink-0 items-center justify-center text-caption font-medium text-strong @[640px]:flex" aria-hidden>
        {more ? `+${more}` : ""}
      </div>
    </div>
  );
}

export function MatchRow({ match, icon }: { match: Match; icon: IconName }) {
  const href = matchHref(match);
  const live = match.status === "live";
  return (
    <div className="flex flex-wrap items-stretch border-b border-divider bg-card last:border-b-0 @[640px]:min-h-[82px] @[640px]:flex-nowrap">
      <div className="flex w-full min-w-0 items-center gap-2.5 py-2 pl-4 pr-3 @[640px]:w-auto @[640px]:flex-1">
        <div className="flex flex-col gap-2.5 border-r border-divider pr-2.5">
          <Icon name="pin" size={14} className="text-pin" />
          <Icon name="star-outline" size={14} className="text-brand-green-light" />
        </div>
        <Link href={href} className="flex min-w-0 flex-1 flex-col gap-1.5 group">
          {[match.home, match.away].map(team => (
            <span key={team} className="flex min-w-0 items-center gap-2">
              <Icon name="team" size={14} className="text-pin" />
              <span className="truncate text-caption font-medium text-strong group-hover:text-ink">{team}</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-caption text-strong">
            {live ? match.live?.clock ?? "Event in progress" : formatKickoff(match.startsAt)}
            <span className="flex items-center gap-1.5 text-ink" aria-hidden>
              {match.stream ? <Icon name="youtube" size={10} /> : null}
              <Icon name="stats" size={10} />
              <Icon name="users" size={10} />
              <Icon name="list" size={10} />
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1 text-label font-bold text-ink">
          {live ? (
            <>
              <span>{match.live?.score}</span>
              {match.live?.detail ? (
                <span className="flex items-center gap-1.5"><Icon name={icon} size={14} />{match.live.detail}</span>
              ) : null}
            </>
          ) : (
            <span className="text-caption font-semibold text-muted">Pre-match</span>
          )}
          <Icon name="chevron-down" size={10} />
        </div>
      </div>
      {match.rowMarkets.map((market, gi) => (
        <div key={market.id} className={cn(GROUP, groupVisibility(gi))}>
          {gi === 2 ? (
            <>
              <OddsButton selection={toSelection(match, market, market.outcomes[0])} />
              <span className="w-12 shrink-0 text-center text-caption font-medium text-strong @[640px]:w-[58px]">{market.line !== undefined ? formatLine(market.line) : ""}</span>
              {market.outcomes[1] ? <OddsButton selection={toSelection(match, market, market.outcomes[1])} /> : null}
            </>
          ) : (
            market.outcomes.map(o => <OddsButton key={o.id} selection={toSelection(match, market, o)} />)
          )}
        </div>
      ))}
      <Link
        href={href}
        aria-label={`All ${match.marketCount} markets`}
        className="flex h-12 shrink-0 items-center justify-center border-t border-divider px-3 text-caption font-medium text-ink underline @[640px]:h-auto @[640px]:w-[76px] @[640px]:border-l @[640px]:border-t-0 @[640px]:px-0"
      >
        +{match.marketCount}
      </Link>
    </div>
  );
}

export function LeagueBlock({ group, sports }: { group: LeagueGroup; sports: Sport[] }) {
  const icon = sportIcon(sports.find(s => s.slug === group.league.sport));
  return (
    <section aria-label={group.league.name}>
      <LeagueHeader league={group.league} icon={icon} more={4} />
      {group.matches.map(m => <MatchRow key={m.id} match={m} icon={icon} />)}
    </section>
  );
}

export function MatchesCard({ children }: { children: ReactNode }) {
  return <div className="@container overflow-hidden rounded-lg bg-card">{children}</div>;
}

export function NoMatches({ text = "No events match your filters." }: { text?: string }) {
  return <p className="px-4 py-10 text-center text-label text-gray">{text}</p>;
}
