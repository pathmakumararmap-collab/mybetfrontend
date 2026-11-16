import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState, TitleBar } from "@/components/ui/Card";
import { PromoCard } from "@/components/promo/Promo";
import { TabsBar } from "@/components/sports/MatchList";
import { getPromotions } from "@/lib/data";
import { param, pickTab } from "@/lib/filters";

export const metadata: Metadata = { title: "Promotions", description: "Welcome bonus, cashback, tournaments and more." };

const TABS = [
  { id: "all", label: "All" },
  { id: "sports", label: "Sports" },
  { id: "casino", label: "Casino" },
  { id: "games", label: "Mybet Games" },
  { id: "tournaments", label: "Tournaments" },
] as const;

async function PromoGrid({ searchParams }: { searchParams: PageProps<"/bonus">["searchParams"] }) {
  const tab = pickTab(TABS, param((await searchParams).tab));
  const promos = (await getPromotions()).filter(p => tab === "all" || p.category === tab);
  return (
    <>
      <div className="overflow-hidden rounded-lg">
        <TabsBar tabs={TABS} active={tab} basePath="/bonus" crumbs={false} search={null} />
      </div>
      {promos.length ? (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
          {promos.map(p => <PromoCard key={p.slug} promo={p} />)}
        </div>
      ) : <EmptyState title="No promotions in this category right now" />}
    </>
  );
}

export default function PromotionsPage(props: PageProps<"/bonus">) {
  return (
    <>
      <TitleBar title="Promotions" />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-card" aria-busy="true" aria-label="Loading promotions" />}>
        <PromoGrid searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
