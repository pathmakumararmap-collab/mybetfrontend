import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroBanner } from "@/components/casino/Games";
import { GameLobby, GridSkeleton, MYBET_TABS } from "@/components/casino/GameLobby";

export const metadata: Metadata = { title: "Mybet Games", description: "Instant games: crash, cards, dice, roulette and lottery." };

export default function MybetGamesPage(props: PageProps<"/allgamesentrance">) {
  return (
    <>
      <h1 className="sr-only">Mybet Games</h1>
      <HeroBanner kicker="Mybet Games" title="Instant games, instant wins" sub="Crash, cards, dice and more" cta="Play now" href="/allgamesentrance/crash" height={200} />
      <Suspense fallback={<GridSkeleton />}>
        <GameLobby searchParams={props.searchParams} basePath="/allgamesentrance" tabs={MYBET_TABS} scope={{ kind: ["mybet", "crash"] }} />
      </Suspense>
    </>
  );
}

