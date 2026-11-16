"use client";
/**
 * Minimal external store for useSyncExternalStore, with optional
 * localStorage persistence (validated on load; storage errors are ignored,
 * e.g. private mode or blocked storage).
 */
import { useSyncExternalStore } from "react";
import type { z } from "zod";

export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
  /** Snapshot used during SSR and hydration. */
  server(): T;
}

export function createStore<T>(initial: T, persist?: { key: string; schema: z.ZodType<T> }): Store<T> {
  let state = initial;
  let loaded = !persist;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(persist!.key);
      if (!raw) return;
      const parsed = persist!.schema.safeParse(JSON.parse(raw));
      if (parsed.success) state = parsed.data;
    } catch {
      /* storage unavailable or corrupt – keep defaults */
    }
  };

  return {
    get() {
      load();
      return state;
    },
    set(next) {
      load();
      const value = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      if (persist) {
        try {
          window.localStorage.setItem(persist.key, JSON.stringify(state));
        } catch {
          /* quota or blocked storage – state still works in memory */
        }
      }
      listeners.forEach(l => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    server: () => initial,
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.server);
}
