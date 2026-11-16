import type { ReactNode } from "react";
import { SidebarFrame } from "./SidebarFrame";
import { RightSidebar } from "./RightSidebar";

/** Body grid as drawn: 250 | fill | 250 with 8px gutters. */
export function PageGrid({ left, children }: { left: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1920px] items-start gap-2 p-2">
      <SidebarFrame side="left" label="Sections">{left}</SidebarFrame>
      <main id="main" className="flex min-w-0 flex-1 flex-col gap-2">{children}</main>
      <SidebarFrame side="right" label="Bet slip and registration">
        <RightSidebar />
      </SidebarFrame>
    </div>
  );
}
