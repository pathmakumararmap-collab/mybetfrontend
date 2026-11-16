import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { OpenAuthLink } from "@/components/auth/OpenAuthLink";
import { FOOTER_COLUMNS, PARTNERS, SITE } from "@/lib/site";
import { usingMockData } from "@/lib/data";

const COPYRIGHT_YEAR = 2026;

/** Footer as drawn: link columns, partners, copyright / support / social. */
export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1920px] flex-col gap-2 px-2 pb-2 pt-4 text-white">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 rounded-lg bg-brand-primary px-6 py-8 sm:grid-cols-3 lg:grid-cols-6 lg:px-10">
        {FOOTER_COLUMNS.map(col => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <h2 className="text-heading font-bold">{col.title}</h2>
            <ul className="flex flex-col gap-3">
              {col.links.map(l => (
                <li key={l.label}>
                  {l.href === "action:register" ? (
                    <OpenAuthLink view="register" className="text-label hover:text-brand-accent">{l.label}</OpenAuthLink>
                  ) : (
                    <Link href={l.href} className="text-label hover:text-brand-accent">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="flex flex-col gap-3">
          <h2 className="text-heading font-bold">APPS</h2>
          <Link href={SITE.androidApkUrl || "/information/mobile-app"} className="flex items-center gap-1.5 text-label hover:text-brand-accent">
            <Icon name="android" size={14} />
            Android
          </Link>
        </div>
      </div>

      <section aria-label="Partners" className="flex flex-col gap-4 rounded-lg bg-brand-primary px-8 pb-8 pt-6">
        <h2 className="text-heading font-bold">PARTNERS</h2>
        <ul className="flex flex-wrap justify-center gap-8 xl:gap-28">
          {PARTNERS.map(p => {
            const body = p.logo ? <Image src={p.logo} alt={p.name} width={120} height={120} className="size-3/4 object-contain" /> : p.name;
            return (
              <li key={p.name} className="flex size-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-card bg-black text-label font-bold xl:size-40">
                {p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer" className="flex size-full items-center justify-center">{body}</a> : body}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-2 xl:flex-row">
        <div className="flex flex-1 flex-col justify-center rounded-lg bg-brand-primary px-6 py-4 text-heading font-light leading-[35px] lg:px-10">
          <p>Copyright © {COPYRIGHT_YEAR} {SITE.name} .</p>
          <p>
            {SITE.name} uses cookies to ensure the best user experience. By remaining on the website, you consent to the use of your
            cookie files on {SITE.name}. <Link href="/information/cookies" className="underline">Find out more</Link>
          </p>
          {usingMockData ? <p className="text-label leading-6 text-icon-light">Demo data – connect the Mybet API to go live.</p> : null}
        </div>
        <a href={`tel:${SITE.supportPhone}`} className="flex items-center gap-5 rounded-lg bg-brand-primary px-6 py-4 xl:w-[420px]">
          <Icon name="headset" size={64} />
          <span className="text-heading font-light leading-[35px]">
            24/7 customer support service<br />{SITE.supportPhone}
          </span>
        </a>
        <div className="flex flex-col gap-2 xl:w-[370px]">
          <div className="flex gap-2">
            <ul className="flex h-14 flex-1 items-center justify-center gap-8 rounded-lg bg-brand-primary px-5" aria-label="Social media">
              {SITE.social.map(s => (
                <li key={s.name}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="hover:text-brand-accent">
                      <Icon name={s.icon} size={30} />
                    </a>
                  ) : (
                    <Icon name={s.icon} size={30} title={s.name} />
                  )}
                </li>
              ))}
            </ul>
            <Link href="/information/responsible-gaming" aria-label="18+ Responsible gaming"
              className="flex h-14 w-[70px] items-center justify-center rounded-lg bg-brand-primary text-hero font-bold">
              18+
            </Link>
          </div>
          <Link href="/information/mobile-app" className="flex items-center justify-center rounded-lg bg-brand-primary px-5 py-2.5 text-display">
            Mobile version
          </Link>
        </div>
      </div>
    </footer>
  );
}
