import type { ReactNode } from "react";
import { PageGrid } from "@/components/layout/PageGrid";
import { InfoSidebar } from "@/components/layout/LeftSidebars";

export default function InfoLayout({ children }: { children: ReactNode }) {
  return <PageGrid left={<InfoSidebar />}>{children}</PageGrid>;
}
