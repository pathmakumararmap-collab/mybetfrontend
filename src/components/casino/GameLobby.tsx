/** Game lobby bound to ?tab, ?q and ?provider. Render inside <Suspense>. */
import { TabsBar } from "@/components/sports/MatchList";
import { GameGrid, ProviderChips } from "./Games";
import { EmptyState } from "@/components/ui/Card";
import { getGames, getProviders, type GameQuery } from "@/lib/data";
import { param, pickTab, type Tab } from "@/lib/filters";
import type { Game, GameKind, GameTag } from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export interface LobbyTab extends Tab { kind?: GameKind; tag?: GameTag }

function applyTab(games: Game[], tab: LobbyTab | undefined): Game[] {
  if (!tab) return games;
  return games.filter(g => (!tab.kind || g.kind === tab.kind) && (!tab.tag || g.tags.includes(tab.tag)));
}

export async function GameLobby({ searchParams, basePath, tabs, scope, providers: showProviders, tileHeight }: {
  searchParams: SearchParams; basePath: string; tabs: readonly LobbyTab[]; scope: GameQuery; providers?: boolean; tileHeight?: number;
}) {
  const sp = await searchParams;
  const tabId = pickTab(tabs, param(sp.tab));
  const tab = tabs.find(t => t.id === tabId);
  const q = param(sp.q).toLowerCase();
  const providerSlug = param(sp.provider, 80);

  const [all, providers] = await Promise.all([getGames(scope), showProviders ? getProviders() : Promise.resolve([])]);
  const provider = providers.find(p => p.slug === providerSlug);
  const games = applyTab(all, tab).filter(g => (!provider || g.provider === provider.slug) && (!q || g.name.toLowerCase().includes(q)));
  const keep = { q: q || undefined, provider: provider?.slug };
  const hrefFor = (slug?: string) => {
    const params = new URLSearchParams();
    if (tabId !== tabs[0].id) params.set("tab", tabId);
    if (slug) params.set("provider", slug);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg">
        <TabsBar tabs={tabs} active={tabId} basePath={basePath} query={keep} crumbs={false} search="Search games" />
      </div>
      {showProviders ? (
        <section aria-label="Providers" className="rounded-lg bg-card p-3">
          <ProviderChips providers={providers.filter(p => all.some(g => g.provider === p.slug))} active={provider?.slug} hrefFor={hrefFor} />
        </section>
      ) : null}
      {games.length ? <GameGrid games={games} tileHeight={tileHeight} /> : (
        <EmptyState title={q ? `No games found for “${q}”` : "No games in this category yet"} />
      )}
    </>
  );
}

export const MYBET_TABS: readonly LobbyTab[] = [
  { id: "all", label: "All games" },
  { id: "popular", label: "Popular", tag: "popular" },
  { id: "new", label: "New", tag: "new" },
  { id: "crash", label: "Crash", kind: "crash" },
  { id: "cards", label: "Cards", tag: "cards" },
  { id: "roulette", label: "Roulette", tag: "roulette" },
  { id: "dice", label: "Dice", tag: "dice" },
  { id: "lottery", label: "Lottery", tag: "lottery" },
];

export const CASINO_TABS: readonly LobbyTab[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular", tag: "popular" },
  { id: "new", label: "New", tag: "new" },
  { id: "jackpot", label: "Jackpots", tag: "jackpot" },
  { id: "megaways", label: "Megaways", tag: "megaways" },
  { id: "bonus-buy", label: "Bonus buy", tag: "bonus-buy" },
  { id: "classic", label: "Classic", tag: "classic" },
  { id: "live", label: "Live casino", kind: "live" },
  { id: "table", label: "Table games", kind: "table" },
];


export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6" aria-busy="true" aria-label="Loading games">
      {Array.from({ length: 12 }, (_, i) => <div key={i} className="h-[150px] animate-pulse rounded-md bg-card" />)}
    </div>
  );
}
