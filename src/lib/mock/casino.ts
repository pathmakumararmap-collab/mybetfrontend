import type { Game, GameKind, GameTag, Provider } from "@/lib/schemas";

export const PROVIDERS: Provider[] = [
  { slug: "mybet-studio", name: "Mybet Studio" },
  { slug: "lumen-gaming", name: "Lumen Gaming" },
  { slug: "redrock-studio", name: "RedRock Studio" },
  { slug: "nova-play", name: "Nova Play" },
  { slug: "orbit-games", name: "Orbit Games" },
  { slug: "tiger-spin", name: "Tiger Spin" },
  { slug: "atlas-live", name: "Atlas Live" },
  { slug: "pixel-forge", name: "Pixel Forge" },
  { slug: "monsoon-games", name: "Monsoon Games" },
];

const toSlug = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function g(name: string, kind: GameKind, provider: string, tags: GameTag[] = [], rtp?: number): Game {
  return { slug: toSlug(name), name, kind, provider, tags, rtp };
}

export const GAMES: Game[] = [
  // Mybet Games (instant games)
  g("Crash", "crash", "mybet-studio", ["popular"], 97),
  g("Crystal", "mybet", "mybet-studio", ["popular"], 96),
  g("Solitaire", "mybet", "mybet-studio", ["cards", "classic"], 96),
  g("Baccarat", "mybet", "mybet-studio", ["cards", "popular"], 98.9),
  g("Blackjack", "mybet", "mybet-studio", ["cards"], 99.4),
  g("Andar Bahar", "mybet", "mybet-studio", ["cards", "popular"], 97.8),
  g("African Roulette", "mybet", "mybet-studio", ["roulette"], 97.3),
  g("Dice", "mybet", "mybet-studio", ["dice", "new"], 97),
  g("Battle City", "mybet", "mybet-studio", ["new"], 96),
  g("Bingo Bonanza", "mybet", "mybet-studio", ["lottery"], 95),
  g("Crown & Anchor", "mybet", "mybet-studio", ["dice"], 96.5),
  g("Cyber 2077", "mybet", "mybet-studio", ["new"], 96),
  g("Battleships", "mybet", "mybet-studio", [], 96),
  g("Commander", "mybet", "mybet-studio", ["new"], 96),
  g("Bura", "mybet", "mybet-studio", ["cards"], 97),
  g("Circus Poker", "mybet", "mybet-studio", ["cards"], 97),
  g("Cases", "mybet", "mybet-studio", ["lottery"], 95),
  g("Bottle", "mybet", "mybet-studio", [], 96),
  g("Cards", "mybet", "mybet-studio", ["cards"], 96),
  g("Jackpot", "mybet", "mybet-studio", ["lottery", "jackpot"], 95),
  g("Lucky Wheel", "mybet", "mybet-studio", ["lottery", "popular"], 95),
  g("Keno", "mybet", "mybet-studio", ["lottery"], 95),
  g("Hi-Lo", "mybet", "mybet-studio", ["cards"], 97),
  g("Mines", "crash", "mybet-studio", ["new", "popular"], 97),
  // Slots (on the homepage as drawn)
  g("Burning Hot", "slot", "lumen-gaming", ["popular", "classic"], 96.3),
  g("Midgards Zombies", "slot", "redrock-studio", ["popular", "megaways"], 96.1),
  g("Wester Slot", "slot", "nova-play", ["new"], 96),
  // Slots catalogue
  g("Golden Pharaoh", "slot", "lumen-gaming", ["popular", "jackpot"], 95.8),
  g("Fruit Fiesta", "slot", "orbit-games", ["classic"], 96.5),
  g("Dragon's Hoard", "slot", "tiger-spin", ["megaways", "bonus-buy"], 96.2),
  g("Wild Safari", "slot", "pixel-forge", ["new"], 96),
  g("Neon Nights", "slot", "monsoon-games", ["new", "bonus-buy"], 96.4),
  g("Lucky Sevens", "slot", "lumen-gaming", ["classic"], 95.5),
  g("Ocean Treasure", "slot", "nova-play", ["popular"], 96.1),
  g("Mystic Forest", "slot", "orbit-games", ["megaways"], 96.3),
  g("Viking Gold", "slot", "redrock-studio", ["jackpot"], 95.9),
  g("Sweet Candy", "slot", "tiger-spin", ["popular", "bonus-buy"], 96.5),
  g("Aztec Sun", "slot", "pixel-forge", ["megaways"], 96.2),
  g("Fire Seven", "slot", "monsoon-games", ["classic", "jackpot"], 95.7),
  g("Star Queen", "slot", "nova-play", ["new"], 96),
  g("Jungle Gems", "slot", "orbit-games", ["popular"], 96.1),
  g("Tiger Fortune", "slot", "tiger-spin", ["jackpot", "popular"], 96),
  g("Pirate Bay", "slot", "redrock-studio", ["bonus-buy"], 96.3),
  // Live casino / tables
  g("Live Roulette", "live", "atlas-live", ["roulette", "popular"], 97.3),
  g("Live Blackjack", "live", "atlas-live", ["cards"], 99.3),
  g("Live Baccarat", "live", "atlas-live", ["cards", "popular"], 98.9),
  g("Teen Patti", "table", "atlas-live", ["cards", "popular"], 96.6),
  g("Dragon Tiger", "table", "atlas-live", ["cards"], 96.3),
];

/** Tiles shown on the homepage, in the order drawn. "mybet-games" is the lobby tile. */
export const HOME_TILES = ["mybet-games", "crash", "crystal", "burning-hot", "midgards-zombies", "wester-slot", "solitaire"];
