import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Prose, Section, TitleBar } from "@/components/ui/Card";
import { getInfoPage, getInfoPages } from "@/lib/data";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  return (await getInfoPages()).map(p => ({ page: p.slug }));
}

export async function generateMetadata(props: PageProps<"/information/[page]">): Promise<Metadata> {
  const p = await getInfoPage((await props.params).page);
  return p ? { title: p.title } : {};
}

export default async function InfoPage(props: PageProps<"/information/[page]">) {
  const page = await getInfoPage((await props.params).page);
  if (!page) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "Information", href: "/information/about" }, { label: page.title }]} />
      <TitleBar title={page.title} />
      <Section title={page.title} bodyClassName="p-6">
        <Prose sections={page.sections} />
      </Section>
      {page.slug === "contacts" ? (
        <Section title="Contact channels" bodyClassName="p-0">
          <dl className="divide-y divide-list-divider">
            {[["Phone", SITE.supportPhone, `tel:${SITE.supportPhone}`], ...SITE.social.filter(s => s.href).map(s => [s.name, s.href, s.href])].map(([k, v, href]) => (
              <div key={k} className="flex min-h-10 items-center justify-between gap-4 px-4 text-label">
                <dt className="text-gray">{k}</dt>
                <dd><a href={href} className="font-semibold text-ink underline">{v}</a></dd>
              </div>
            ))}
            <div className="flex min-h-10 items-center justify-between px-4 text-label">
              <dt className="text-gray">Hours</dt><dd className="font-semibold text-strong">24/7</dd>
            </div>
          </dl>
        </Section>
      ) : null}
    </>
  );
}
