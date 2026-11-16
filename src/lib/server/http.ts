/**
 * Route-handler helpers: same-origin check (CSRF), bounded JSON parsing with
 * zod, and a proxy to the Mybet (Laravel) API that forwards cookies.
 */
import "server-only";
import type { z } from "zod";
import { fieldErrors } from "@/lib/validation";

const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

export const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/+$/, "") || "";
export const DEMO_MODE = !API_BASE_URL;
/** Demo mode accepts only this registration code, so the flow can be tried without SMS. */
export const DEMO_SMS_CODE = "123456";

export function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Rejects state-changing requests that do not come from this site. */
export function checkOrigin(req: Request): Response | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return json({ error: "Forbidden" }, 403);
  try {
    if (new URL(origin).host !== host) return json({ error: "Forbidden" }, 403);
  } catch {
    return json({ error: "Forbidden" }, 403);
  }
  return null;
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<Parsed<z.output<S>>> {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, response: json({ error: "Expected application/json" }, 415) };
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return { ok: false, response: json({ error: "Request too large" }, 413) };
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { ok: false, response: json({ error: "Request too large" }, 413) };
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, response: json({ error: "Invalid JSON" }, 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, response: json({ error: "Invalid input", fields: fieldErrors(parsed.error) }, 422) };
  return { ok: true, data: parsed.data };
}

/**
 * Forwards a request to `${API_BASE_URL}${path}` with the browser's cookies
 * and returns the upstream JSON, status and Set-Cookie headers.
 */
export async function proxy(req: Request, path: string, init: { method?: string; body?: unknown } = {}): Promise<Response> {
  const headers = new Headers({ Accept: "application/json" });
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const ip = req.headers.get("x-forwarded-for");
  if (ip) headers.set("x-forwarded-for", ip);
  if (init.body !== undefined) headers.set("content-type", "application/json");

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method ?? "POST",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    return json({ error: "Service temporarily unavailable. Please try again." }, 503);
  }

  const out = new Headers({ "Cache-Control": "no-store", "content-type": "application/json" });
  for (const c of upstream.headers.getSetCookie()) out.append("set-cookie", c);
  let data: unknown = {};
  try {
    data = await upstream.json();
  } catch {
    data = upstream.ok ? {} : { error: `Request failed (${upstream.status})` };
  }
  return new Response(JSON.stringify(data), { status: upstream.status, headers: out });
}
