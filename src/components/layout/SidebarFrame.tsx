"use client";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/client/store";
import { drawerStore, layoutStore, slipStore } from "@/lib/client/stores";

type Side = "left" | "right";
const DRAWER: Record<Side, "menu" | "slip"> = { left: "menu", right: "slip" };

/**
 * One sidebar element that is a fixed 250px column on desktop and an
 * off-canvas drawer below the breakpoint (left: lg, right: xl). On desktop it
 * can be collapsed to a thin rail ("Collapse block").
 */
export function SidebarFrame({ side, label, children }: { side: Side; label: string; children: ReactNode }) {
  const drawer = useStore(drawerStore);
  const layout = useStore(layoutStore);
  const open = drawer === DRAWER[side];
  const collapsed = side === "left" ? layout.leftCollapsed : layout.rightCollapsed;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && drawerStore.set(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Following a link inside the drawer closes it.
  const onClick = (e: MouseEvent) => {
    if (open && (e.target as HTMLElement).closest("a[href]")) drawerStore.set(null);
  };

  const desktop = side === "left" ? "lg" : "xl";
  return (
    <>
      {open ? (
        <div
          aria-hidden
          onClick={() => drawerStore.set(null)}
          className={cn("fixed inset-0 z-40 bg-black/50", desktop === "lg" ? "lg:hidden" : "xl:hidden")}
        />
      ) : null}
      <aside
        aria-label={label}
        onClick={onClick}
        data-open={open || undefined}
        className={cn(
          "fixed inset-y-0 z-50 w-[280px] overflow-y-auto bg-page p-2 transition-transform duration-200",
          side === "left" ? "left-0 -translate-x-full data-open:translate-x-0" : "right-0 translate-x-full data-open:translate-x-0",
          desktop === "lg"
            ? "lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:p-0 lg:transition-none"
            : "xl:static xl:z-auto xl:w-auto xl:translate-x-0 xl:overflow-visible xl:bg-transparent xl:p-0 xl:transition-none",
        )}
      >
        <div className={cn("flex flex-col", side === "left" ? "gap-1.5" : "gap-2", collapsed && (desktop === "lg" ? "lg:hidden" : "xl:hidden"), desktop === "lg" ? "lg:w-[250px]" : "xl:w-[250px]")}>
          {children}
        </div>
        {collapsed ? (
          <button
            type="button"
            onClick={() => layoutStore.set(s => (side === "left" ? { ...s, leftCollapsed: false } : { ...s, rightCollapsed: false }))}
            aria-label="Expand block"
            title="Expand block"
            className={cn("hidden h-32 w-8 items-center justify-center rounded-md bg-brand-dark text-white", desktop === "lg" ? "lg:flex" : "xl:flex")}
          >
            <Icon name={side === "left" ? "chevron-right" : "chevron-left"} size={12} />
          </button>
        ) : null}
      </aside>
    </>
  );
}

/** "<< Collapse block" / "Collapse block >>"; closes the drawer on mobile. */
export function CollapseButton({ side }: { side: Side }) {
  const drawer = useStore(drawerStore);
  const inDrawer = drawer === DRAWER[side];
  return (
    <button
      type="button"
      onClick={() => {
        if (inDrawer) drawerStore.set(null);
        else layoutStore.set(s => (side === "left" ? { ...s, leftCollapsed: true } : { ...s, rightCollapsed: true }));
      }}
      className="flex h-8 w-full items-center justify-center rounded-md bg-brand-dark text-label text-white hover:bg-[#4a0d20]"
    >
      {inDrawer ? "Close" : side === "left" ? "<< Collapse block" : "Collapse block >>"}
    </button>
  );
}

/** Floating bet-slip button shown while the right sidebar is a drawer. */
export function MobileSlipButton() {
  const slip = useStore(slipStore);
  const count = slip.selections.length;
  return (
    <button
      type="button"
      onClick={() => drawerStore.set("slip")}
      className="fixed bottom-4 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-brand-accent px-5 text-label font-bold text-strong shadow-lg xl:hidden"
    >
      Bet slip
      <span className="flex size-6 items-center justify-center rounded-full bg-brand-primary text-caption text-white">{count}</span>
    </button>
  );
}
