"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { MAIN_NAV } from "@/lib/site";
import { cn } from "@/lib/cn";
import { drawerStore } from "@/lib/client/stores";

/**
 * Label of the nav item for `path`: most specific prefix wins (/line/cricket → CRICKET).
 * The homepage has no highlighted item, as drawn.
 */
export function activeNavLabel(path: string): string | null {
  let best: { label: string; len: number } | null = null;
  for (const item of MAIN_NAV) {
    for (const p of item.match ?? []) {
      if (p !== "/" && (path === p || path.startsWith(`${p}/`)) && (!best || p.length > best.len)) best = { label: item.label, len: p.length };
    }
  }
  return best?.label ?? null;
}

/** 37px nav bar; scrolls horizontally on small screens. */
export function MainNavView({ active }: { active: string | null }) {
  return (
    <nav aria-label="Main" className="bg-brand-dark">
      <div className="mx-auto flex h-[37px] max-w-[1920px] items-stretch">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => drawerStore.set("menu")}
          className="flex w-10 shrink-0 items-center justify-center text-white lg:hidden"
        >
          <Icon name="menu" size={16} />
        </button>
        <ul className="scrollbar-none flex min-w-0 items-stretch overflow-x-auto lg:pl-3">
          {MAIN_NAV.map(item => {
            const on = item.label === active;
            return (
              <li key={item.label} className="flex">
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 text-label font-bold transition hover:text-brand-accent",
                    on ? "border-brand-accent text-brand-accent" : "border-transparent text-white",
                  )}
                >
                  {item.icon ? <Icon name={item.icon} size={14} className="text-brand-accent" /> : null}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function MainNav() {
  return <MainNavView active={activeNavLabel(usePathname())} />;
}
