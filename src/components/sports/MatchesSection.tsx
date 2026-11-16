/**
 * Matches block bound to the URL (?tab, ?q, ?streams). Always render it
 * inside <Suspense>: it reads searchParams, which is request-time data.
 */
import { connection } from "next/server";
import { LeagueBlock, MatchesCard, NoMatches, SportFilter, TabsBar, withParams } from "./MatchList";
import { getLeagues, getMatches, getSports, type MatchQuery } from "@/lib/data";
import { filterMatches, groupByLeague, param, pickTab, type Tab } from "@/lib/filters";
import type { Sport } from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export interface MatchesSectionProps {
  searchParams: SearchParams;
  basePath: string;
  tabs: readonly Tab[];
  scope?: MatchQuery;
  /** With the default tab and no search, show only these leagues (homepage). */
  defaultLeagues?: string[];
  /** Sports shown in the filter row, in order; defaults to the TOP sports. */
  filterSports?: string[];
  activeSport?: string;
  streamsToggle?: boolean;
  crumbs?: boolean;
  empty?: string;
}

const todayInColombo = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export async function MatchesSection(p: MatchesSectionProps) {
  const sp = await p.searchParams;
  const tab = pickTab(p.tabs, param(sp.tab));
  const q = param(sp.q);
  const streams = param(sp.streams) === "1";
  if (tab === "today") await connection();

  const [matches, leagues, sports] = await Promise.all([getMatches(p.scope), getLeagues(p.scope?.sport), getSports()]);
  const isDefault = tab === p.tabs[0].id && !q && !streams;
  let list = filterMatches(matches, { tab, q, streams, today: tab === "today" ? todayInColombo() : undefined });
  if (isDefault && p.defaultLeagues?.length) list = list.filter(m => p.defaultLeagues!.includes(m.league));
  const groups = groupByLeague(list, leagues, p.defaultLeagues);

  const bySlug = new Map(sports.map(s => [s.slug, s]));
  const filter: Sport[] = (p.filterSports ?? sports.filter(s => s.top).map(s => s.slug))
    .map(slug => bySlug.get(slug)).filter((s): s is Sport => Boolean(s));
  const query = { tab: tab === p.tabs[0].id ? undefined : tab, q: q || undefined, streams: streams ? "1" : undefined };

  return (
    <MatchesCard>
      <TabsBar tabs={p.tabs} active={tab} basePath={p.basePath} query={{ q: query.q, streams: query.streams }} crumbs={p.crumbs} />
      <SportFilter
        sports={filter}
        active={p.activeSport}
        streams={p.streamsToggle === false ? undefined : { on: streams, href: withParams(p.basePath, { ...query, streams: streams ? undefined : "1" }) }}
      />
      {groups.length ? groups.map(g => <LeagueBlock key={g.league.slug} group={g} sports={sports} />) : (
        <NoMatches text={q ? `No matches found for “${q}”.` : p.empty} />
      )}
    </MatchesCard>
  );
}

export function MatchesSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg bg-card" aria-busy="true" aria-label="Loading matches">
      <div className="h-8 bg-brand-dark" />
      <div className="h-10 bg-brand-primary" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i}>
          <div className="h-[50px] animate-pulse bg-league" />
          <div className="h-[82px] animate-pulse border-b border-divider bg-card" />
        </div>
      ))}
    </div>
  );
}
