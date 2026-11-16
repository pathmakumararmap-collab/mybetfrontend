# Images

Put artwork here and reference it from the data (`image` field):

| Folder | Used by | Field |
|---|---|---|
| `games/` | Game tiles, game window | `Game.image`, e.g. `/images/games/crash.jpg` (4:3, ≥ 400 px wide) |
| `promos/` | Promotion cards and banners | `Promotion.image`, e.g. `/images/promos/first-deposit.jpg` |
| `../partners/` | Footer partner circles | `PARTNERS[].logo` in `src/lib/site.ts` |

Without an image the components show a branded gradient placeholder.
Remote images (CDN) also work: add the host to `images.remotePatterns` in `next.config.ts`.
