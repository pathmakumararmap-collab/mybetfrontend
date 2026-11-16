import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/inter";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { MainNav, MainNavView } from "@/components/layout/MainNav";
import { Footer } from "@/components/layout/Footer";
import { MobileSlipButton } from "@/components/layout/SidebarFrame";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – Sports betting, live and casino`, template: `%s | ${SITE.name}` },
  description: "Bet on cricket, football and 30+ sports live, play Mybet Games and slots. Play More. Win Bigger.",
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, type: "website", locale: "en_LK" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#6e1430",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-brand-accent focus:px-3 focus:py-2 focus:text-strong">
          Skip to content
        </a>
        <Header />
        <Suspense fallback={<MainNavView active={null} />}>
          <MainNav />
        </Suspense>
        {children}
        <Footer />
        <MobileSlipButton />
        <AuthDialog />
      </body>
    </html>
  );
}
