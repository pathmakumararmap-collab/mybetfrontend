import { Suspense } from "react";
import { HeroBanner, GameTile, GameTilesRow, gameHref } from "@/components/casino/Games";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { getGames, getHomeLeagueSlugs, getHomeTiles } from "@/lib/data";
import { MATCH_TABS } from "@/lib/filters";

const HOME_FILTER = ["cricket", "football", "basketball", "tennis", "table-tennis", "ice-hockey", "volleyball", "horse-racing"];

async function HomeTiles() {
  const [slugs, games] = await Promise.all([getHomeTiles(), getGames()]);
  return (
    <GameTilesRow>
      {slugs.map(slug => {
        if (slug === "mybet-games") return <GameTile key={slug} href="/allgamesentrance" label="Mybet Games" />;
        const game = games.find(g => g.slug === slug);
        return game ? <GameTile key={slug} game={game} href={gameHref(game)} /> : null;
      })}
    </GameTilesRow>
  );
}

async function HomeMatches({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const leagues = await getHomeLeagueSlugs();
  return (
    <MatchesSection
      searchParams={searchParams}
      basePath="/"
      tabs={MATCH_TABS}
      defaultLeagues={leagues}
      filterSports={HOME_FILTER}
      empty="No events right now. Check back soon."
    />
  );
}

export default function HomePage(props: PageProps<"/">) {
  return (
    <>
      <h1 className="sr-only">Mybet – sports betting, live and casino</h1>
      <HeroBanner kicker="Live Casino" title="Feel the Thrill at mybet!" sub="Play More. Win Bigger." cta="Play now" href="/casino?tab=live" />
      <HomeTiles />
      <Suspense fallback={<MatchesSkeleton rows={5} />}>
        <HomeMatches searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
