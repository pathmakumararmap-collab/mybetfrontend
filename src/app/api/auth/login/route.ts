import { LoginSchema } from "@/lib/validation";
import { checkOrigin, DEMO_MODE, json, proxy, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;
  const body = await readJson(req, LoginSchema);
  if (!body.ok) return body.response;

  if (DEMO_MODE) {
    const name = body.data.login.includes("@") ? body.data.login.split("@")[0] : `Player ${body.data.login.slice(-4)}`;
    return json({ ok: true, demo: true, user: { name } });
  }
  return proxy(req, "/auth/login", { body: body.data });
}
