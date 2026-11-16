import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { OddsButton } from "@/components/betslip/OddsButton";
import { CollapseButton } from "./SidebarFrame";
import { sportIcon } from "@/components/sports/MatchList";
import { getFeaturedMatch, getInfoPages, getLeagues, getMatches, getProviders, getSports, getTotals } from "@/lib/data";
import { matchHref } from "@/lib/filters";
import { isIconName, type IconName } from "@/lib/icons";
import { toSelection } from "@/lib/selection";
import { CASINO_MENU, PROMO_MENU } from "@/lib/site";
import type { League, Match, Sport } from "@/lib/schemas";

// --------------------------------------------------------------- pieces
function Accordion({ label, icon, children }: { label: string; icon: IconName; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex h-8 cursor-pointer list-none gap-0.5 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-1 items-center gap-2.5 rounded-l-md bg-brand-primary px-3 text-label font-medium text-white">
          <Icon name={icon} size={14} />
          {label}
        </span>
        <span className="flex w-8 items-center justify-center rounded-r-md bg-brand-primary text-white">
          <Icon name="chevron-down" size={12} className="transition group-open:rotate-180" />
        </span>
      </summary>
      <div className="mt-0.5 flex flex-col overflow-hidden rounded-md bg-card">{children}</div>
    </details>
  );
}

function MenuLink({ href, icon, children, muted }: { href: string; icon?: IconName; children: ReactNode; muted?: boolean }) {
  return (
    <Link href={href} className="flex min-h-8 items-center gap-2.5 border-b border-list-divider px-3.5 py-1.5 text-label text-strong last:border-b-0 hover:bg-odds">
      {icon ? <Icon name={icon} size={14} className="text-ink" /> : null}
      <span className={muted ? "text-gray" : undefined}>{children}</span>
    </Link>
  );
}

function SportRow({ sport, leagues }: { sport: Sport; leagues: League[] }) {
  const icon = sportIcon(sport);
  return (
    <details className="group border-b border-list-divider bg-card">
      <summary className="flex h-8 cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-center gap-2.5 px-3.5 text-label text-strong">
          <Icon name={icon} size={14} className="text-ink" />
          <span className="truncate">{sport.name} ({sport.events})</span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border-l border-list-divider text-strong">
          <Icon name="chevron-down" size={12} className="transition group-open:rotate-180" />
        </span>
      </summary>
      <div className="flex flex-col bg-page/60 pl-6">
        <MenuLink href={`/line/${sport.slug}`}>All {sport.name}</MenuLink>
        {leagues.map(l => <MenuLink key={l.slug} href={`/line/${sport.slug}/${l.slug}`} muted>{l.name}</MenuLink>)}
      </div>
    </details>
  );
}

function Strip({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`flex h-[30px] items-center gap-2 px-3.5 text-label ${className}`}>{children}</div>;
}

// ------------------------------------------------------------ top games
export function TopGamesCard({ match, league, sport }: { match: Match; league?: League; sport?: Sport }) {
  const [homeScore, awayScore] = (match.live?.score ?? "").split(":").map(s => s.trim());
  const m1x2 = match.rowMarkets[0];
  const chipLabel: Record<string, string> = { "1": "W1", X: "X", "2": "W2" };
  return (
    <section aria-label="Top Games" className="overflow-hidden rounded-md">
      <div className="flex h-8 items-center gap-2.5 bg-brand-primary px-3 text-label font-medium text-white">
        <Icon name="medal" size={14} />
        Top Games
      </div>
      <div className="flex flex-col gap-1.5 bg-card px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Icon name={sportIcon(sport)} size={12} className="text-ink" />
          <span className="truncate text-label font-semibold text-ink">{league?.name ?? match.league}</span>
          {match.stream ? <Icon name="youtube" size={14} className="ml-auto text-brand-primary" title="Live stream" /> : null}
        </div>
        <p className="text-caption font-medium text-brand-green">
          {match.live?.clock ?? formatStart(match)}{league?.round ? ` / ${league.round}` : ""}
        </p>
        {[[match.home, homeScore], [match.away, awayScore]].map(([team, score]) => (
          <div key={team} className="flex items-center gap-2 text-caption font-medium text-strong">
            <Icon name="team" size={12} className="text-pin" />
            <span className="truncate">{team}</span>
            <span className="ml-auto tabular-nums">{score}</span>
          </div>
        ))}
        <Link href={matchHref(match)} className="flex items-center gap-1 text-caption font-medium text-muted hover:text-ink">
          Detailed score <Icon name="chevron-down" size={8} />
        </Link>
        {m1x2 ? (
          <div className="flex gap-1">
            {m1x2.outcomes.map(o => (
              <OddsButton key={o.id} variant="chip" selection={{ ...toSelection(match, m1x2, o), outcomeLabel: chipLabel[o.label] ?? o.label }} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatStart(match: Match): string {
  return match.status === "live" ? "Live" : "Pre-match";
}

// --------------------------------------------------------------- sports
export async function SportsSidebar() {
  const [sports, totals, featured, leagues, matches] = await Promise.all([
    getSports(), getTotals(), getFeaturedMatch(), getLeagues(), getMatches(),
  ]);
  const top = sports.filter(s => s.top);
  const az = sports.filter(s => !s.top); // order as configured (as drawn)
  const leaguesOf = (slug: string) => leagues.filter(l => l.sport === slug);
  const recommended = matches.filter(m => m.recommended).slice(0, 6);
  const topLeagues = leagues.filter(l => l.top).slice(0, 8);

  return (
    <>
      <CollapseButton side="left" />
      <div className="flex flex-col gap-0.5">
        <Accordion label="Favorite matches" icon="star">
          <p className="px-3.5 py-2.5 text-body text-gray">Tap ☆ next to a match to keep it here.</p>
        </Accordion>
        <Accordion label="Recommended" icon="hand-point">
          {recommended.map(m => <MenuLink key={m.id} href={matchHref(m)}>{m.home} – {m.away}</MenuLink>)}
        </Accordion>
        <Accordion label="Top competitions" icon="trophy">
          {topLeagues.map(l => <MenuLink key={l.slug} href={`/line/${l.sport}/${l.slug}`}>{l.name}</MenuLink>)}
        </Accordion>
      </div>
      {featured ? (
        <TopGamesCard
          match={featured}
          league={leagues.find(l => l.slug === featured.league)}
          sport={sports.find(s => s.slug === featured.sport)}
        />
      ) : null}
      <nav aria-label="Sports" className="overflow-hidden rounded-md bg-card">
        <div className="flex">
          <Link href="/live" className="flex h-8 flex-1 items-center justify-center gap-2 bg-brand-dark text-label font-medium text-white">
            <Icon name="live" size={14} className="text-brand-green-light" />
            LIVE
          </Link>
          <Link href="/line" className="flex h-8 flex-1 items-center justify-center bg-brand-primary text-label font-medium text-white">
            SPORTS
          </Link>
        </div>
        <Strip className="bg-row-all text-strong">
          <span>ALL {totals.all}</span>
          <Icon name="youtube" size={14} className="text-brand-primary" />
          <span>{totals.withStreams}</span>
          <Icon name="globe" size={14} className="ml-auto text-ink" />
        </Strip>
        <Strip className="bg-row-top text-gray">TOP</Strip>
        {top.map(s => <SportRow key={s.slug} sport={s} leagues={leaguesOf(s.slug)} />)}
        <Strip className="justify-center bg-row-category font-medium text-ink">Categories from A to Z</Strip>
        {az.map(s => <SportRow key={s.slug} sport={s} leagues={leaguesOf(s.slug)} />)}
      </nav>
    </>
  );
}

// ---------------------------------------------------------------- menus
function MenuCard({ title, items }: { title: string; items: { label: string; href: string; icon: IconName }[] }) {
  return (
    <nav aria-label={title} className="overflow-hidden rounded-md bg-card">
      <div className="flex h-8 items-center bg-brand-primary px-3.5 text-label font-medium text-white">{title}</div>
      {items.map(i => <MenuLink key={i.href + i.label} href={i.href} icon={i.icon}>{i.label}</MenuLink>)}
    </nav>
  );
}

export async function CasinoSidebar() {
  const providers = await getProviders();
  return (
    <>
      <CollapseButton side="left" />
      <MenuCard title="CATEGORIES" items={CASINO_MENU} />
      <MenuCard title="PROVIDERS" items={providers.map(p => ({ label: p.name, href: `/casino?provider=${p.slug}`, icon: "gamepad" as const }))} />
    </>
  );
}

export function PromoSidebar() {
  return (
    <>
      <CollapseButton side="left" />
      <MenuCard title="PROMOTIONS" items={PROMO_MENU} />
    </>
  );
}

export async function InfoSidebar() {
  const pages = await getInfoPages();
  return (
    <>
      <CollapseButton side="left" />
      <MenuCard
        title="INFORMATION"
        items={pages.map(p => ({ label: p.title, href: `/information/${p.slug}`, icon: isIconName(p.icon) ? p.icon : "info" }))}
      />
    </>
  );
}
