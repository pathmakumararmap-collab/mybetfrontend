import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/icons";

/** White card with an optional maroon header (right-sidebar style). */
export function Card({ title, icon, children, className, bodyClassName, as: Tag = "section" }: {
  title?: string; icon?: IconName; children: ReactNode; className?: string; bodyClassName?: string; as?: "section" | "div";
}) {
  return (
    <Tag className={cn("overflow-hidden rounded-lg bg-card", className)} aria-label={title}>
      {title ? (
        <div className="flex h-8 items-center justify-center gap-2 bg-brand-primary text-label font-medium text-white">
          {icon ? <Icon name={icon} size={14} /> : null}
          {title}
        </div>
      ) : null}
      <div className={cn("flex flex-col gap-2.5 p-3", bodyClassName)}>{children}</div>
    </Tag>
  );
}

/** Grey-header content section used across inner pages. */
export function Section({ title, right, children, className, bodyClassName, id }: {
  title: string; right?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string;
}) {
  return (
    <section id={id} aria-label={title} className={cn("overflow-hidden rounded-lg bg-card", className)}>
      <header className="flex h-10 items-center gap-2.5 bg-league px-4">
        <h2 className="text-label font-semibold text-ink">{title}</h2>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </header>
      <div className={cn("flex flex-col gap-3 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function TitleBar({ title, right, as: Tag = "h1" }: { title: string; right?: ReactNode; as?: "h1" | "h2" }) {
  return (
    <div className="flex h-11 items-center gap-3 rounded-lg bg-brand-dark px-4">
      <Tag className="text-label font-bold uppercase text-white">{title}</Tag>
      <div className="ml-auto flex items-center gap-2 text-label text-icon-light">{right}</div>
    </div>
  );
}

export interface Crumb { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex h-7 items-center px-1">
      <ol className="flex min-w-0 flex-wrap items-center gap-2 text-caption">
        <li>
          <Link href="/" aria-label="Home" className="text-ink hover:text-brand-primary">
            <Icon name="home" size={14} />
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-2">
              <Icon name="chevron-right" size={8} className="text-muted" />
              {item.href && !last ? (
                <Link href={item.href} className="truncate font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last ? "font-semibold text-ink" : "font-medium text-muted")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StatTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex min-w-[110px] flex-1 flex-col items-center gap-1 rounded-md bg-odds px-4 py-3", className)}>
      <span className="text-heading font-bold text-ink">{value}</span>
      <span className="text-caption font-medium text-muted">{label}</span>
    </div>
  );
}

export function Prose({ sections }: { sections: { heading: string; paragraphs: string[] }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map(s => (
        <div key={s.heading} className="flex flex-col gap-2">
          <h3 className="text-label font-bold text-ink">{s.heading}</h3>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="text-body leading-[19px] text-strong">{p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-card px-6 py-12 text-center">
      <p className="text-label font-semibold text-ink">{title}</p>
      {children ? <div className="text-body text-gray">{children}</div> : null}
    </div>
  );
}
