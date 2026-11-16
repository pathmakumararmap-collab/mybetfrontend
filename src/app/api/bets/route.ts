import { BetRequestSchema } from "@/lib/validation";
import { summarize } from "@/lib/betslip";
import { checkOrigin, DEMO_MODE, json, proxy, readJson } from "@/lib/server/http";

/**
 * Place a bet. The backend re-prices every selection and owns the decision;
 * this handler only validates shape and limits before forwarding.
 */
export async function POST(req: Request) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;
  const body = await readJson(req, BetRequestSchema);
  if (!body.ok) return body.response;

  if (DEMO_MODE) {
    const { potentialWinCents } = summarize(body.data);
    return json({ ok: true, demo: true, bet: { id: `D-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, potentialWinCents } }, 201);
  }
  return proxy(req, "/bets", { body: body.data });
}
