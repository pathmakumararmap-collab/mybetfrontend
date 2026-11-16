/** Builds bet-slip selections from match data (server or client). */
import type { Market, Match, Outcome } from "./schemas";
import type { Selection } from "./betslip";
import { matchHref } from "./filters";

export function toSelection(match: Match, market: Market, outcome: Outcome): Selection {
  return {
    matchId: match.id,
    matchLabel: `${match.home} – ${match.away}`,
    href: matchHref(match),
    marketId: market.id,
    marketName: market.line !== undefined ? `${market.name} (${market.line})` : market.name,
    outcomeId: outcome.id,
    outcomeLabel: outcome.label,
    odds: outcome.odds,
    live: match.status === "live",
  };
}
