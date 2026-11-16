"use client";
/** Browser → Next.js route handlers (/api/*). Never throws; always returns a result. */

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; fields?: Record<string, string> };

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function getJson<T>(url: string): Promise<ApiResult<T>> {
  return request<T>(url, { method: "GET" });
}

async function request<T>(url: string, init: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}) },
    });
  } catch {
    return { ok: false, status: 0, error: "No connection. Check your internet and try again." };
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (res.ok) return { ok: true, status: res.status, data: data as T };
  const d = (data ?? {}) as { error?: unknown; message?: unknown; fields?: unknown };
  const error = typeof d.error === "string" ? d.error : typeof d.message === "string" ? d.message : `Request failed (${res.status})`;
  const fields = d.fields && typeof d.fields === "object" ? (d.fields as Record<string, string>) : undefined;
  return { ok: false, status: res.status, error, fields };
}
