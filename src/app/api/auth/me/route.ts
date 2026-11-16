import { connection } from "next/server";
import { DEMO_MODE, json, proxy } from "@/lib/server/http";

/** Current session (from the backend's session cookie). */
export async function GET(req: Request) {
  await connection();
  if (DEMO_MODE) return json({ user: null, demo: true });
  return proxy(req, "/auth/me", { method: "GET" });
}
