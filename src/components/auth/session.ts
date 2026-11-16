"use client";
import { getJson, postJson } from "@/lib/client/api";
import { sessionStore, placedBetsStore, type SessionUser } from "@/lib/client/stores";

interface MeResponse { user: SessionUser | null; demo?: boolean }

let started = false;

/** Loads the current session once per page load. */
export async function loadSession(): Promise<void> {
  if (started) return;
  started = true;
  const res = await getJson<MeResponse>("/api/auth/me");
  const user = res.ok && res.data?.user && typeof res.data.user.name === "string" ? { name: res.data.user.name.slice(0, 60) } : null;
  // A demo login made in this tab survives the check (demo mode has no server session).
  const current = sessionStore.get();
  if (!user && current.status === "user" && current.demo) return;
  sessionStore.set({ status: user ? "user" : "guest", user, demo: res.ok ? Boolean(res.data?.demo) : false });
}

export function signedIn(user: SessionUser, demo: boolean): void {
  sessionStore.set({ status: "user", user: { name: user.name.slice(0, 60) }, demo });
}

export async function logout(): Promise<void> {
  await postJson("/api/auth/logout", {});
  placedBetsStore.set([]);
  sessionStore.set({ status: "guest", user: null, demo: sessionStore.get().demo });
}
