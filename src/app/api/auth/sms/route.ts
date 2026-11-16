import { SmsRequestSchema } from "@/lib/validation";
import { checkOrigin, DEMO_MODE, DEMO_SMS_CODE, json, proxy, readJson } from "@/lib/server/http";

/** Step 1 of registration: send a one-time code to the phone. */
export async function POST(req: Request) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;
  const body = await readJson(req, SmsRequestSchema);
  if (!body.ok) return body.response;

  if (DEMO_MODE) return json({ ok: true, demo: true, resendIn: 60, demoCode: DEMO_SMS_CODE });
  return proxy(req, "/auth/register/code", { body: body.data });
}
