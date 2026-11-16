import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { CollapseButton } from "./SidebarFrame";
import { AccountCard } from "./AccountCard";
import { BetSlipCard } from "@/components/betslip/BetSlip";
import { SaveLoadCard } from "@/components/betslip/SaveLoad";
import { SITE } from "@/lib/site";

function AndroidAppCard() {
  const href = SITE.androidApkUrl || "/information/mobile-app";
  return (
    <Card title="Android" icon="android">
      <div className="flex items-center gap-3">
        <div className="flex h-[110px] w-24 shrink-0 items-center justify-center rounded-[14px] border-4 border-neutral bg-card p-3.5" aria-hidden>
          <div className="grid size-14 grid-cols-4 gap-0.5">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} className={(i * 7) % 3 === 0 ? "bg-strong" : "bg-neutral"} />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
          <Logo size={22} href={null} />
          <p className="text-caption font-semibold text-subtle">MOBILE APPLICATION</p>
          <Link href={href} className="inline-flex h-[26px] items-center gap-1.5 rounded bg-brand-green px-2.5 text-caption font-semibold uppercase text-white">
            <Icon name="android" size={12} />
            Free download
          </Link>
        </div>
      </div>
    </Card>
  );
}

/** Right sidebar as drawn: registration, bet slip, save/load, Android app. */
export function RightSidebar() {
  return (
    <>
      <CollapseButton side="right" />
      <AccountCard />
      <BetSlipCard />
      <SaveLoadCard />
      <AndroidAppCard />
    </>
  );
}
