"use client";
import type { ReactNode } from "react";
import { openAuth } from "@/lib/client/stores";

/** Text-style button that opens the Login or Registration dialog. */
export function OpenAuthLink({ view, className, children }: { view: "login" | "register"; className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => openAuth(view)} className={className}>
      {children}
    </button>
  );
}
