import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Card";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { SPORTS_TABS } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Sports betting",
  description: "Pre-match and live odds on football, cricket, basketball, tennis and more.",
};

export default function SportsPage(props: PageProps<"/line">) {
  return (
    <>
      <Breadcrumbs items={[{ label: "Sports" }]} />
      <h1 className="sr-only">Sports</h1>
      <Suspense fallback={<MatchesSkeleton />}>
        <MatchesSection searchParams={props.searchParams} basePath="/line" tabs={SPORTS_TABS} scope={{ esport: false }} />
      </Suspense>
    </>
  );
}
