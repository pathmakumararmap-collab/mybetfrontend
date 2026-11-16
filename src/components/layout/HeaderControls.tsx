"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button, iconButtonClass } from "@/components/ui/Button";
import { useStore } from "@/lib/client/store";
import { openAuth, sessionStore } from "@/lib/client/stores";
import { logout } from "@/components/auth/session";
import { formatClock } from "@/lib/format";
import { createStore } from "@/lib/client/store";
import { z } from "zod";

// ------------------------------------------------------------------ clock
function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}
const clockSnapshot = () => formatClock(new Date());
const clockServer = () => "";

function Clock() {
  const time = useSyncExternalStore(subscribeClock, clockSnapshot, clockServer);
  return <span suppressHydrationWarning className="tabular-nums">{time || "--:--"}</span>;
}

// --------------------------------------------------------------- language
const LANGS = [
  { code: "SI", label: "සිංහල" },
  { code: "EN", label: "English" },
] as const;
const langStore = createStore<"SI" | "EN">("SI", { key: "mybet.lang", schema: z.enum(["SI", "EN"]) });

export function LanguageMenu() {
  const lang = useStore(langStore);
  return (
    <details className="group relative">
      <summary className="flex h-[30px] cursor-pointer list-none items-center gap-1.5 rounded bg-brand-dark px-2.5 text-label text-white [&::-webkit-details-marker]:hidden">
        <span>{lang}</span>
        <span aria-hidden>/</span>
        <Clock />
        <Icon name="chevron-down" size={10} className="transition group-open:rotate-180" />
      </summary>
      <ul className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-md bg-card py-1 shadow-lg ring-1 ring-black/10">
        {LANGS.map(l => (
          <li key={l.code}>
            <button
              type="button"
              onClick={e => {
                langStore.set(l.code);
                e.currentTarget.closest("details")?.removeAttribute("open");
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-label text-strong hover:bg-odds"
            >
              {l.label}
              {lang === l.code ? <Icon name="check" size={12} className="text-brand-green" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

// --------------------------------------------------------------- settings
const SETTINGS_LINKS = [
  { label: "Responsible gaming", href: "/information/responsible-gaming" },
  { label: "Payment methods", href: "/information/payment-methods" },
  { label: "Betting rules", href: "/information/betting-rules" },
  { label: "Contacts", href: "/information/contacts" },
];

export function SettingsMenu() {
  return (
    <details className="group relative">
      <summary aria-label="Settings" className={iconButtonClass("w-auto cursor-pointer list-none gap-1 px-2 [&::-webkit-details-marker]:hidden")}>
        <Icon name="gear" size={16} />
        <Icon name="chevron-down" size={10} className="transition group-open:rotate-180" />
      </summary>
      <ul className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-md bg-card py-1 shadow-lg ring-1 ring-black/10">
        {SETTINGS_LINKS.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="block px-3 py-2 text-label text-strong hover:bg-odds">{l.label}</Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

// ------------------------------------------------------------- auth area
export function AuthButtons() {
  const session = useStore(sessionStore);
  if (session.status === "user" && session.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-40 truncate text-label text-white sm:inline">
          {session.user.name}
          {session.demo ? <span className="ml-1 rounded bg-white/15 px-1 text-caption">demo</span> : null}
        </span>
        <Button variant="dark" className="w-[100px]" onClick={() => void logout()}>Log out</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="green" className="px-2 sm:w-[116px]" onClick={() => openAuth("register")}>Registration</Button>
      <Button variant="dark" className="px-2 sm:w-[100px]" onClick={() => openAuth("login")}>Login</Button>
    </div>
  );
}

export function AccountIconButton() {
  const session = useStore(sessionStore);
  return (
    <button
      type="button"
      aria-label={session.status === "user" ? "My account" : "Log in"}
      title={session.status === "user" ? "My account" : "Log in"}
      onClick={() => (session.status === "user" ? undefined : openAuth("login"))}
      className={iconButtonClass()}
    >
      <Icon name="user-tie" size={16} />
    </button>
  );
}
