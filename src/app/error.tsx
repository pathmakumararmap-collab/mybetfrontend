"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/** Error boundary for pages. Details stay in the logs; users get a retry. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto flex w-full max-w-[1920px] p-2">
      <div className="flex w-full flex-col items-center gap-3 rounded-lg bg-card px-6 py-20 text-center">
        <h1 className="text-heading font-bold text-ink">Something went wrong</h1>
        <p className="max-w-md text-label text-gray">
          We could not load this page. Please try again in a moment.
          {error.digest ? <span className="mt-1 block text-caption text-subtle">Reference: {error.digest}</span> : null}
        </p>
        <Button variant="yellow" bold onClick={() => retry()}>Try again</Button>
      </div>
    </main>
  );
}
