import type { ReactNode } from "react";
import { PageGrid } from "@/components/layout/PageGrid";
import { CasinoSidebar } from "@/components/layout/LeftSidebars";

export default function CasinoLayout({ children }: { children: ReactNode }) {
  return <PageGrid left={<CasinoSidebar />}>{children}</PageGrid>;
}
