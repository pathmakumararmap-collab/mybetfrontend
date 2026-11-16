import Link from "next/link";
import type { ReactNode } from "react";
import { Artwork } from "@/components/ui/Artwork";
import { Section } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PromoAction } from "@/components/promo/PromoAction";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";
import type { Game } from "@/lib/schemas";

export function gameHref(game: Pick<Game, "slug" | "kind" | "provider">): string {
  return game.kind === "mybet" || game.kind === "crash"
    ? `/allgamesentrance/${game.slug}`
    : `/casino/brand?game=${encodeURIComponent(game.slug)}&product=${encodeURIComponent(game.provider)}`;
}

const KIND_ICON: Record<Game["kind"], IconName> = { mybet: "dice", crash: "fire", slot: "coins", live: "live", table: "crown" };

export function GameTile({ game, href, height = 128, label }: { game?: Game; href: string; height?: number; label?: string }) {
  const name = label ?? game?.name ?? "";
  return (
    <Link href={href} className="group flex min-w-0 flex-col overflow-hidden rounded-md bg-brand-dark" style={{ height }}>
      <Artwork
        src={game?.image}
        alt=""
        icon={game ? KIND_ICON[game.kind] : "gamepad"}
        label={name}
        className="min-h-0 flex-1 transition group-hover:brightness-110"
      />
      <span className="flex h-6 shrink-0 items-center justify-center truncate px-2 text-label font-medium text-white">{name}</span>
    </Link>
  );
}

/** Row of tiles under the homepage banner. */
export function GameTilesRow({ children }: { children: ReactNode }) {
  return <div className="scrollbar-none grid auto-cols-[minmax(140px,1fr)] grid-flow-col gap-1.5 overflow-x-auto">{children}</div>;
}

export function GameGrid({ games, tileHeight = 150 }: { games: Game[]; tileHeight?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
      {games.map(g => <GameTile key={g.slug} game={g} href={gameHref(g)} height={tileHeight} />)}
    </div>
  );
}

export function HeroBanner({ kicker, title, sub, cta, href, height = 248, image }: {
  kicker: string; title: string; sub: string; cta: string;
  /** Path, or "register" to open the registration dialog. */
  href: string; height?: number; image?: string;
}) {
  return (
    <section aria-label={kicker} className="relative overflow-hidden rounded-lg" style={{ minHeight: height }}>
      <Artwork src={image} alt="" icon="crown" fill className="[&>div]:hidden" sizes="(min-width: 1280px) 1400px, 100vw" priority />
      <div className="relative flex h-full flex-col items-start justify-center gap-4 px-6 py-8 sm:flex-row sm:items-center sm:gap-10 sm:px-[120px]" style={{ minHeight: height }}>
        <Logo size={0} href={null} className="text-[44px] sm:text-[64px]" />
        <div className="flex flex-col items-start gap-2.5">
          <p className="text-hero font-bold text-brand-accent">{kicker}</p>
          <h2 className="text-heading font-bold text-white">{title}</h2>
          <p className="text-label text-white">{sub}</p>
          {href === "register" ? (
            <PromoAction action="register" label={cta} size={36} className="h-10 rounded-full px-6" />
          ) : (
            <ButtonLink href={href} variant="yellow" size={36} bold className="h-10 rounded-full px-6">
              {cta}
              <Icon name="chevron-right" size={12} />
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}

/** Game window placeholder with toolbar (the provider's iframe goes here). */
export function GameStage({ game, providerName }: { game: Game; providerName?: string }) {
  return (
    <section aria-label={game.name} className="overflow-hidden rounded-lg bg-brand-dark">
      <div className="flex h-11 items-center gap-2 px-4">
        <h1 className="truncate text-label font-bold uppercase text-white">{game.name}</h1>
        {providerName ? <span className="hidden text-caption text-icon-light sm:inline">by {providerName}</span> : null}
        <div className="ml-auto flex items-center gap-2">
          <ButtonLink href="#rules" variant="gray" className="w-[90px]">Rules</ButtonLink>
          <ButtonLink href="/information/payment-methods" variant="green" className="w-[140px]">Play for real</ButtonLink>
        </div>
      </div>
      <div className={cn("relative aspect-video max-h-[680px] w-full")}>
        <Artwork src={game.image} alt={`${game.name} game window`} icon="gamepad" label={`${game.name} — game window`} fill sizes="100vw" />
      </div>
    </section>
  );
}

export function ProviderChips({ providers, active, hrefFor }: {
  providers: { slug: string; name: string }[]; active?: string; hrefFor: (slug?: string) => string;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      <li>
        <Link href={hrefFor(undefined)} aria-current={!active ? "page" : undefined}
          className={cn("flex h-9 items-center rounded-full px-[18px] text-label font-medium", !active ? "bg-brand-primary text-white" : "bg-odds text-ink hover:bg-[#d9e2ea]")}>
          All providers
        </Link>
      </li>
      {providers.map(p => (
        <li key={p.slug}>
          <Link href={hrefFor(p.slug)} aria-current={active === p.slug ? "page" : undefined}
            className={cn("flex h-9 items-center rounded-full px-[18px] text-label font-medium", active === p.slug ? "bg-brand-primary text-white" : "bg-odds text-ink hover:bg-[#d9e2ea]")}>
            {p.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function gameFacts(game: Game, providerName?: string): [string, string][] {
  return [
    ["Provider", providerName ?? game.provider],
    ["Category", game.kind === "crash" ? "Crash" : game.kind === "mybet" ? "Mybet Games" : game.kind === "live" ? "Live casino" : game.kind === "table" ? "Table game" : "Slot"],
    ["RTP", game.rtp ? `${game.rtp}%` : "—"],
    ["Minimum bet", "LKR 10"],
    ["Maximum bet", "LKR 100,000"],
  ];
}

export function GameFacts({ game, providerName }: { game: Game; providerName?: string }) {
  return (
    <Section title="Game info" bodyClassName="p-0">
      <dl className="divide-y divide-list-divider">
        {gameFacts(game, providerName).map(([k, v]) => (
          <div key={k} className="flex h-10 items-center justify-between px-4 text-label">
            <dt className="text-gray">{k}</dt>
            <dd className="font-semibold text-strong">{v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
