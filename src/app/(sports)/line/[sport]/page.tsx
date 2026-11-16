import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs, Section, TitleBar } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { MatchesSection, MatchesSkeleton } from "@/components/sports/MatchesSection";
import { getLeagues, getMatches, getSport, getSports } from "@/lib/data";
import { SPORTS_TABS } from "@/lib/filters";
import type { League } from "@/lib/schemas";

export async function generateStaticParams() {
  const sports = await getSports();
  return sports.map(s => ({ sport: s.slug }));
}

export async function generateMetadata(props: PageProps<"/line/[sport]">): Promise<Metadata> {
  const { sport } = await props.params;
  const s = await getSport(sport);
  return s ? { title: `${s.name} betting`, description: `${s.name} odds: ${s.events} events, live and pre-match.` } : {};
}

function LeagueChips({ leagues, counts }: { leagues: League[]; counts: Map<string, number> }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
      {leagues.map(l => (
        <li key={l.slug}>
          <Link href={`/line/${l.sport}/${l.slug}`} className="flex h-10 items-center gap-2.5 rounded-md bg-odds px-3 hover:bg-[#d9e2ea]">
            <span aria-hidden className="size-5 shrink-0 rounded-full bg-brand-green" />
            <span className="truncate text-label font-medium text-ink">{l.name}</span>
            <span className="ml-auto text-caption font-medium text-muted">{counts.get(l.slug) ?? 0}</span>
            <Icon name="chevron-right" size={10} className="text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SportPage(props: PageProps<"/line/[sport]">) {
  const { sport: slug } = await props.params;
  const sport = await getSport(slug);
  if (!sport) notFound();
  const [leagues, matches] = await Promise.all([getLeagues(slug), getMatches({ sport: slug })]);
  const counts = new Map<string, number>();
  for (const m of matches) counts.set(m.league, (counts.get(m.league) ?? 0) + 1);
  const top = leagues.filter(l => l.top);
  const rest = [...leagues].sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));

  return (
    <>
      <Breadcrumbs items={[{ label: "Sports", href: "/line" }, { label: sport.name }]} />
      <TitleBar title={sport.name} right={<span>{sport.events} events</span>} />
      {top.length ? <Section title="Top leagues"><LeagueChips leagues={top} counts={counts} /></Section> : null}
      {rest.length ? <Section title="All leagues A–Z"><LeagueChips leagues={rest} counts={counts} /></Section> : null}
      <Suspense fallback={<MatchesSkeleton />}>
        <MatchesSection
          searchParams={props.searchParams}
          basePath={`/line/${slug}`}
          tabs={SPORTS_TABS}
          scope={{ sport: slug }}
          activeSport={slug}
          empty={`No ${sport.name} events right now.`}
        />
      </Suspense>
    </>
  );
}
