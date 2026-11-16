import { describe, expect, it } from "vitest";
import { POST as placeBet } from "@/app/api/bets/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";

const ORIGIN = "http://localhost:3000";

function req(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(`${ORIGIN}/api/x`, {
    method: "POST",
    body: text,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", ...headers },
  });
}

const selection = (id: string, odds = 2) => ({
  matchId: id, matchLabel: "A – B", href: `/line/football/l/${id}`, marketId: `${id}:1x2`, marketName: "1X2",
  outcomeId: `${id}:1x2:1`, outcomeLabel: "1", odds, live: false,
});

describe("route handlers (demo mode)", () => {
  it("rejects cross-site requests (CSRF)", async () => {
    const res = await placeBet(req({}, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    const noOrigin = new Request(`${ORIGIN}/api/bets`, { method: "POST", body: "{}", headers: { "content-type": "application/json", host: "localhost:3000" } });
    expect((await placeBet(noOrigin)).status).toBe(403);
  });

  it("rejects wrong content type, bad JSON, oversized and invalid bodies", async () => {
    expect((await placeBet(req("{}", { "content-type": "text/plain" }))).status).toBe(415);
    expect((await placeBet(req("{not json"))).status).toBe(400);
    expect((await placeBet(req("x".repeat(20_000)))).status).toBe(413);
    const invalid = await placeBet(req({ mode: "single", stakeCents: 1, selections: [] }));
    expect(invalid.status).toBe(422);
    expect((await invalid.json()).fields).toBeTruthy();
  });

  it("accepts a valid bet and computes the potential win on the server", async () => {
    const res = await placeBet(req({ mode: "accumulator", stakeCents: 100_00, selections: [selection("a", 2), selection("b", 1.5)] }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.bet.potentialWinCents).toBe(300_00);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("logs in (demo) and validates registration codes", async () => {
    expect((await login(req({ login: "0712345678", password: "secret123" }))).status).toBe(200);
    expect((await register(req({ phone: "0712345678", code: "000000" }))).status).toBe(422);
    expect((await register(req({ phone: "0712345678", code: "123456" }))).status).toBe(200);
  });
});
