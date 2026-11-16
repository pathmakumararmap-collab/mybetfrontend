import Link from "next/link";
import { cn } from "@/lib/cn";

/** Mybet wordmark (size 0 = take the size from className). Replace with the SVG logo when available. */
export function Logo({ size = 30, href = "/", className }: { size?: number; href?: string | null; className?: string }) {
  const mark = (
    <span
      className={cn("font-extrabold leading-none tracking-[-0.04em] text-brand-accent select-none", className)}
      style={size ? { fontSize: size } : undefined}
    >
      mybet
    </span>
  );
  if (href === null) return mark;
  return (
    <Link href={href} aria-label="Mybet home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}
