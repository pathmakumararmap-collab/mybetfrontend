import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, Section } from "@/components/ui/Card";
import { GameFacts, GameStage, GameTile, GameTilesRow, gameHref } from "@/components/casino/Games";
import { getGame, getGames, getProviders } from "@/lib/data";
import { param } from "@/lib/filters";

export const metadata: Metadata = { title: "Casino game" };

/** /casino/brand?game=<slug>&product=<provider> (URL shape kept from the sitemap). */
async function CasinoGame({ searchParams }: { searchParams: PageProps<"/casino/brand">["searchParams"] }) {
  const sp = await searchParams;
  const slug = param(sp.game, 120);
  const [game, providers] = await Promise.all([slug ? getGame(slug) : null, getProviders()]);
  if (!game || game.kind === "mybet" || game.kind === "crash") notFound();
  const provider = providers.find(p => p.slug === game.provider);
  const more = (await getGames({ provider: game.provider })).filter(g => g.slug !== game.slug).slice(0, 7);

  return (
    <>
      <Breadcrumbs items={[
        { label: "Slots", href: "/casino" },
        { label: provider?.name ?? game.provider, href: `/casino?provider=${game.provider}` },
        { label: game.name },
      ]} />
      <GameStage game={game} providerName={provider?.name} />
      <GameFacts game={game} providerName={provider?.name} />
      {more.length ? (
        <Section title={`More from ${provider?.name ?? "this provider"}`}>
          <GameTilesRow>{more.map(g => <GameTile key={g.slug} game={g} href={gameHref(g)} />)}</GameTilesRow>
        </Section>
      ) : null}
    </>
  );
}

export default function CasinoGamePage(props: PageProps<"/casino/brand">) {
  return (
    <Suspense fallback={<div className="aspect-video animate-pulse rounded-lg bg-brand-dark" aria-busy="true" aria-label="Loading game" />}>
      <CasinoGame searchParams={props.searchParams} />
    </Suspense>
  );
}
