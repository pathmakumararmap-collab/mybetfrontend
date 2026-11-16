import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Card";
import { MarketGroup, MatchHero } from "@/components/sports/MatchDetail";
import { sportIcon } from "@/components/sports/MatchList";
import { getLeague, getMatch, getMatches, getSport } from "@/lib/data";

export async function generateStaticParams() {
  const matches = await getMatches();
  return matches.map(m => ({ sport: m.sport, league: m.league, match: m.id }));
}

export async function generateMetadata(props: PageProps<"/line/[sport]/[league]/[match]">): Promise<Metadata> {
  const { match } = await props.params;
  const m = await getMatch(match);
  return m ? { title: `${m.home} – ${m.away} odds`, description: `${m.marketCount} betting markets for ${m.home} vs ${m.away}.` } : {};
}

export default async function MatchPage(props: PageProps<"/line/[sport]/[league]/[match]">) {
  const { sport: sportSlug, league: leagueSlug, match: matchId } = await props.params;
  const [sport, league, match] = await Promise.all([getSport(sportSlug), getLeague(sportSlug, leagueSlug), getMatch(matchId)]);
  // The URL must match the match's own sport and league.
  if (!sport || !league || !match || match.sport !== sportSlug || match.league !== leagueSlug) notFound();
  const icon = sportIcon(sport);
  const half = Math.ceil(match.markets.length / 2);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Sports", href: "/line" },
        { label: sport.name, href: `/line/${sport.slug}` },
        { label: league.name, href: `/line/${sport.slug}/${league.slug}` },
        { label: `${match.home} – ${match.away}` },
      ]} />
      <MatchHero match={match} league={league} icon={icon} />
      <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
        <div className="flex flex-col gap-2">{match.markets.slice(0, half).map(mk => <MarketGroup key={mk.id} match={match} market={mk} />)}</div>
        <div className="flex flex-col gap-2">{match.markets.slice(half).map(mk => <MarketGroup key={mk.id} match={match} market={mk} />)}</div>
      </div>
    </>
  );
}
