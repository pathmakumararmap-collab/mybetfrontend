import { RegisterSchema } from "@/lib/validation";
import { checkOrigin, DEMO_MODE, DEMO_SMS_CODE, json, proxy, readJson } from "@/lib/server/http";

/** Step 2 of registration: verify the code and create the account. */
export async function POST(req: Request) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;
  const body = await readJson(req, RegisterSchema);
  if (!body.ok) return body.response;

  if (DEMO_MODE) {
    if (body.data.code !== DEMO_SMS_CODE) return json({ error: "Invalid code", fields: { code: "Invalid code" } }, 422);
    return json({ ok: true, demo: true, user: { name: `Player ${body.data.phone.slice(-4)}` } });
  }
  return proxy(req, "/auth/register", { body: body.data });
}
