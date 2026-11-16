import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroBanner } from "@/components/casino/Games";
import { CASINO_TABS, GameLobby, GridSkeleton } from "@/components/casino/GameLobby";

export const metadata: Metadata = { title: "Slots and live casino", description: "Slots, jackpots, live roulette, blackjack and baccarat." };

export default function CasinoPage(props: PageProps<"/casino">) {
  return (
    <>
      <h1 className="sr-only">Casino</h1>
      <HeroBanner kicker="Slots" title="Thousands of slots" sub="New games every week" cta="Play now" href="/casino?tab=new" height={200} />
      <Suspense fallback={<GridSkeleton />}>
        <GameLobby
          searchParams={props.searchParams}
          basePath="/casino"
          tabs={CASINO_TABS}
          scope={{ kind: ["slot", "live", "table"] }}
          providers
          tileHeight={170}
        />
      </Suspense>
    </>
  );
}
