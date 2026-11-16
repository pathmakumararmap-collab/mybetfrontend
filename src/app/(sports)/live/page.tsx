import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Card";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { LIVE_TABS } from "@/lib/filters";

export const metadata: Metadata = { title: "Live betting", description: "In-play odds and live streams." };

export default function LivePage(props: PageProps<"/live">) {
  return (
    <>
      <Breadcrumbs items={[{ label: "Live" }]} />
      <h1 className="sr-only">Live betting</h1>
      <Suspense fallback={<MatchesSkeleton />}>
        <MatchesSection
          searchParams={props.searchParams}
          basePath="/live"
          tabs={LIVE_TABS}
          scope={{ status: "live" }}
          streamsToggle={false}
          empty="No live events right now."
        />
      </Suspense>
    </>
  );
}
