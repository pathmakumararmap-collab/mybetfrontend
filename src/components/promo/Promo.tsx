import Link from "next/link";
import type { ReactNode } from "react";
import { Artwork } from "@/components/ui/Artwork";
import { ButtonLink } from "@/components/ui/Button";
import { PromoAction } from "./PromoAction";
import type { Promotion } from "@/lib/schemas";

export function PromoCard({ promo }: { promo: Promotion }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-card">
      <Link href={`/bonus/rules/${promo.slug}`} tabIndex={-1} aria-hidden>
        <Artwork src={promo.image} alt="" icon="gift" label={promo.title} className="h-[170px]" sizes="(min-width: 1280px) 460px, 100vw" />
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="text-caption font-semibold uppercase text-brand-primary">{promo.kicker}</p>
        <h3 className="text-label font-bold text-ink">
          <Link href={`/bonus/rules/${promo.slug}`} className="hover:underline">{promo.title}</Link>
        </h3>
        <p className="flex-1 text-body leading-[19px] text-gray">{promo.summary}</p>
        <div className="flex gap-2">
          <PromoAction action={promo.action} label={promo.cta} className="flex-1" />
          <ButtonLink href={`/bonus/rules/${promo.slug}`} variant="gray" size={32} className="w-[90px]">Rules</ButtonLink>
        </div>
      </div>
    </article>
  );
}

export interface Column<T> { key: string; header: string; className?: string; render: (row: T, index: number) => ReactNode }

export function DataTable<T>({ columns, rows, caption, highlight = 0 }: {
  columns: Column<T>[]; rows: T[]; caption: string; highlight?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-league">
            {columns.map(c => <th key={c.key} scope="col" className={`h-9 px-4 text-caption font-semibold text-gray ${c.className ?? ""}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-list-divider ${i < highlight ? "bg-odds" : "bg-card"}`}>
              {columns.map(c => <td key={c.key} className={`h-10 px-4 text-label text-strong ${c.className ?? ""}`}>{c.render(r, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
