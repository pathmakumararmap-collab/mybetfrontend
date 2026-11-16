import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroBanner } from "@/components/casino/Games";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { SPORTS_TABS } from "@/lib/filters";

export const metadata: Metadata = { title: "Esports betting", description: "CS 2, Dota 2, League of Legends and more." };

export default function EsportsPage(props: PageProps<"/cyber/esports">) {
  return (
    <>
      <h1 className="sr-only">Esports</h1>
      <HeroBanner kicker="Esports" title="Bet on the biggest tournaments" sub="CS 2 · Dota 2 · League of Legends · Valorant" cta="Bet now" href="/live" height={200} />
      <Suspense fallback={<MatchesSkeleton rows={3} />}>
        <MatchesSection
          searchParams={props.searchParams}
          basePath="/cyber/esports"
          tabs={SPORTS_TABS}
          scope={{ esport: true }}
          filterSports={["esports"]}
          activeSport="esports"
          empty="No esports events right now."
        />
      </Suspense>
    </>
  );
}
