import { checkOrigin, DEMO_MODE, json, proxy } from "@/lib/server/http";

export async function POST(req: Request) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;
  if (DEMO_MODE) return json({ ok: true, demo: true });
  return proxy(req, "/auth/logout", { body: {} });
}
