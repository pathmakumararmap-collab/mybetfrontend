import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Prose, Section, StatTile } from "@/components/ui/Card";
import { HeroBanner } from "@/components/casino/Games";
import { PromoAction } from "@/components/promo/PromoAction";
import { getPromotion, getPromotions } from "@/lib/data";

export async function generateStaticParams() {
  return (await getPromotions()).map(p => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/bonus/rules/[slug]">): Promise<Metadata> {
  const p = await getPromotion((await props.params).slug);
  return p ? { title: `${p.title} – rules`, description: p.summary } : {};
}

export default async function BonusRulesPage(props: PageProps<"/bonus/rules/[slug]">) {
  const promo = await getPromotion((await props.params).slug);
  if (!promo) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "Promotions", href: "/bonus" }, { label: "Rules" }, { label: promo.title }]} />
      <HeroBanner kicker={promo.kicker} title={promo.title} sub={promo.summary} cta={promo.cta} href={promo.action} height={200} image={promo.image} />
      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-[1fr_360px]">
        <Section title="Bonus rules">
          <Prose sections={promo.sections} />
        </Section>
        <Section title="At a glance">
          {promo.facts.length ? (
            <div className="flex flex-wrap gap-2">{promo.facts.map(f => <StatTile key={f.label} label={f.label} value={f.value} />)}</div>
          ) : null}
          <PromoAction action={promo.action} label={promo.cta} size={36} className="w-full" />
        </Section>
      </div>
    </>
  );
}
