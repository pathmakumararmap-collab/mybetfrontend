import type { ReactNode } from "react";
import { PageGrid } from "@/components/layout/PageGrid";
import { SportsSidebar } from "@/components/layout/LeftSidebars";

/** Home, sports, live and esports share the sports sidebar. */
export default function SportsLayout({ children }: { children: ReactNode }) {
  return <PageGrid left={<SportsSidebar />}>{children}</PageGrid>;
}
