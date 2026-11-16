"use client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { openAuth } from "@/lib/client/stores";

/** Promotion CTA: a link, or "register" which opens the registration dialog. */
export function PromoAction({ action, label, className, size = 32 }: { action: string; label: string; className?: string; size?: 32 | 36 }) {
  if (action === "register") {
    return <Button variant="yellow" size={size} bold className={className} onClick={() => openAuth("register")}>{label}</Button>;
  }
  return <ButtonLink href={action} variant="yellow" size={size} bold className={className}>{label}</ButtonLink>;
}
