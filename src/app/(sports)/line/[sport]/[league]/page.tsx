import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, StatTile } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { sportIcon } from "@/components/sports/MatchList";
import { getLeague, getLeagues, getMatches, getSport } from "@/lib/data";
import { SPORTS_TABS } from "@/lib/filters";

export async function generateStaticParams() {
  const leagues = await getLeagues();
  return leagues.map(l => ({ sport: l.sport, league: l.slug }));
}

export async function generateMetadata(props: PageProps<"/line/[sport]/[league]">): Promise<Metadata> {
  const { sport, league } = await props.params;
  const l = await getLeague(sport, league);
  return l ? { title: `${l.name} odds`, description: `Betting odds for ${l.name}: matches, live and outrights.` } : {};
}

export default async function LeaguePage(props: PageProps<"/line/[sport]/[league]">) {
  const { sport: sportSlug, league: leagueSlug } = await props.params;
  const [sport, league] = await Promise.all([getSport(sportSlug), getLeague(sportSlug, leagueSlug)]);
  if (!sport || !league) notFound();
  const matches = await getMatches({ sport: sportSlug, league: leagueSlug });
  const live = matches.filter(m => m.status === "live").length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Sports", href: "/line" }, { label: sport.name, href: `/line/${sport.slug}` }, { label: league.name }]} />
      <section aria-label={league.name} className="flex flex-col gap-4 rounded-lg bg-brand-primary px-6 py-5 sm:flex-row sm:items-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-dark">
          <Icon name={sportIcon(sport)} size={28} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading font-bold text-white">{league.name}</h1>
          <p className="text-label text-icon-light">
            {[sport.name, league.round, league.teams ? `${league.teams} teams` : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <StatTile label="Matches" value={String(matches.length)} />
          <StatTile label="Live" value={String(live)} />
        </div>
      </section>
      <Suspense fallback={<MatchesSkeleton rows={2} />}>
        <MatchesSection
          searchParams={props.searchParams}
          basePath={`/line/${sportSlug}/${leagueSlug}`}
          tabs={SPORTS_TABS}
          scope={{ sport: sportSlug, league: leagueSlug }}
          activeSport={sportSlug}
          empty="No matches scheduled in this league right now."
        />
      </Suspense>
    </>
  );
}
