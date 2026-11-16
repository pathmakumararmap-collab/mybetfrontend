"use client";
/** App-wide client state: bet slip, session, dialogs and drawers. */
import { z } from "zod";
import { createStore } from "./store";
import { EMPTY_SLIP, SelectionSchema, SlipStateSchema, slipReducer, type SlipAction, type SlipState } from "@/lib/betslip";

// ---------------------------------------------------------------- bet slip
export const slipStore = createStore<SlipState>(EMPTY_SLIP, { key: "mybet.slip.v1", schema: SlipStateSchema });
export const dispatchSlip = (action: SlipAction) => slipStore.set(prev => slipReducer(prev, action));

export const PlacedBetSchema = z.object({
  id: z.string().max(60),
  placedAt: z.string().max(40),
  mode: z.enum(["single", "accumulator"]),
  stakeCents: z.number().int(),
  potentialWinCents: z.number().int(),
  selections: z.array(SelectionSchema).max(20),
});
export type PlacedBet = z.infer<typeof PlacedBetSchema>;
/** Bets placed in this browser session (the backend's /bets list replaces this when connected). */
export const placedBetsStore = createStore<PlacedBet[]>([]);

// ---------------------------------------------------------------- session
export interface SessionUser { name: string }
export interface Session { status: "unknown" | "guest" | "user"; user: SessionUser | null; demo: boolean }
export const sessionStore = createStore<Session>({ status: "unknown", user: null, demo: false });

// ---------------------------------------------------------------- dialogs
export type AuthView = "login" | "register" | null;
export const authDialogStore = createStore<AuthView>(null);
export const openAuth = (view: Exclude<AuthView, null>) => authDialogStore.set(view);
export const closeAuth = () => authDialogStore.set(null);

// ---------------------------------------------------------------- layout
export interface LayoutState { leftCollapsed: boolean; rightCollapsed: boolean }
export const layoutStore = createStore<LayoutState>(
  { leftCollapsed: false, rightCollapsed: false },
  { key: "mybet.layout.v1", schema: z.object({ leftCollapsed: z.boolean(), rightCollapsed: z.boolean() }) },
);

export type Drawer = "menu" | "slip" | null;
export const drawerStore = createStore<Drawer>(null);
