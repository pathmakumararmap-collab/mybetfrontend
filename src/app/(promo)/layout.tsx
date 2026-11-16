import type { ReactNode } from "react";
import { PageGrid } from "@/components/layout/PageGrid";
import { PromoSidebar } from "@/components/layout/LeftSidebars";

export default function PromoLayout({ children }: { children: ReactNode }) {
  return <PageGrid left={<PromoSidebar />}>{children}</PageGrid>;
}
