import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[1920px] p-2">
      <div className="flex w-full flex-col items-center gap-4 rounded-lg bg-card px-6 py-20 text-center">
        <Logo size={44} href={null} />
        <h1 className="text-heading font-bold text-ink">This page is not available</h1>
        <p className="max-w-md text-label text-gray">The event may have finished or the link is wrong. Find more matches and games below.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/" variant="yellow" bold>Home</ButtonLink>
          <ButtonLink href="/line" variant="dark">Sports</ButtonLink>
          <ButtonLink href="/live" variant="dark">Live</ButtonLink>
        </div>
      </div>
    </main>
  );
}
