import { Logo } from "@/components/ui/Logo";
import { IconLink } from "@/components/ui/Button";
import { AccountIconButton, AuthButtons, LanguageMenu, SettingsMenu } from "./HeaderControls";

/** 53px maroon header, as drawn: logo left, actions right. */
export function Header() {
  return (
    <header className="bg-brand-primary">
      <div className="mx-auto flex h-[53px] max-w-[1920px] items-center gap-3 pl-3 pr-2 sm:pl-[45px]">
        <Logo size={30} />
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <IconLink icon="gift" label="Promotions" href="/bonus" />
            <AccountIconButton />
            <IconLink icon="dollar" label="Deposit" href="/information/payment-methods" />
          </div>
          <AuthButtons />
          <div className="hidden items-center gap-2 md:flex">
            <SettingsMenu />
            <LanguageMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
