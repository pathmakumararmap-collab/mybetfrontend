import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Prose, Section, StatTile } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { HeroBanner } from "@/components/casino/Games";
import { DataTable } from "@/components/promo/Promo";
import { getTournament, getTournamentIds } from "@/lib/data";
import { formatCount, formatDate } from "@/lib/format";
import type { Tournament } from "@/lib/schemas";

export async function generateStaticParams() {
  return (await getTournamentIds()).map(id => ({ id }));
}

export async function generateMetadata(props: PageProps<"/bonus/casino/tournaments/[id]">): Promise<Metadata> {
  const t = await getTournament((await props.params).id);
  return t ? { title: t.title, description: t.summary } : {};
}

type Row = Tournament["leaderboard"][number];

export default async function TournamentPage(props: PageProps<"/bonus/casino/tournaments/[id]">) {
  const t = await getTournament((await props.params).id);
  if (!t) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "Promotions", href: "/bonus" }, { label: "Tournaments", href: "/bonus?tab=tournaments" }, { label: t.title }]} />
      <HeroBanner kicker="Tournament" title={t.title} sub={t.summary} cta="Take part" href="register" height={200} />
      <div className="flex flex-wrap gap-2">
        <StatTile label="Prize pool" value={t.prizePool} className="bg-card" />
        <StatTile label="Participants" value={formatCount(t.participants)} className="bg-card" />
        <StatTile label="Ends" value={formatDate(t.endsAt)} className="bg-card" />
      </div>
      <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
        <Section title="Leaderboard" bodyClassName="p-0">
          <DataTable<Row>
            caption={`${t.title} leaderboard`}
            rows={t.leaderboard}
            highlight={3}
            columns={[
              { key: "place", header: "Place", className: "w-20", render: r => (
                <span className="flex items-center gap-1.5 font-semibold">
                  {r.place <= 3 ? <Icon name="trophy" size={14} className="text-brand-accent" /> : null}{r.place}
                </span>
              ) },
              { key: "player", header: "Player", render: r => r.player },
              { key: "points", header: "Points", className: "text-right tabular-nums", render: r => formatCount(r.points) },
              { key: "prize", header: "Prize", className: "text-right", render: r => r.prize },
            ]}
          />
        </Section>
        <Section title="Tournament rules"><Prose sections={t.sections} /></Section>
      </div>
    </>
  );
}
