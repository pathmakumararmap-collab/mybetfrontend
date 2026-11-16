import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/icons";

/**
 * Image slot: renders `src` when the data provides one, otherwise a branded
 * gradient with an icon, so pages look complete before artwork is added.
 * `fill` makes it cover its positioned parent (absolute inset-0).
 */
export function Artwork({ src, alt, icon = "gamepad", label, className, sizes = "200px", priority, fill = false }: {
  src?: string; alt: string; icon?: IconName; label?: string; className?: string; sizes?: string; priority?: boolean; fill?: boolean;
}) {
  const position = fill ? "absolute inset-0" : "relative";
  if (src) {
    return (
      <div className={cn(position, "overflow-hidden", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        position,
        "flex items-center justify-center overflow-hidden bg-[radial-gradient(120%_90%_at_30%_20%,#8a1f40_0%,#6e1430_45%,#3d0a1a_100%)]",
        className,
      )}
    >
      <span aria-hidden className="absolute -right-6 -top-6 size-24 rounded-full bg-brand-accent/15" />
      <span aria-hidden className="absolute -bottom-8 -left-4 size-20 rounded-full bg-white/5" />
      <div className="relative flex flex-col items-center gap-1.5 text-brand-accent">
        <Icon name={icon} size={30} />
        {label ? <span className="px-2 text-center text-caption font-extrabold uppercase tracking-wide text-white/90">{label}</span> : null}
      </div>
    </div>
  );
}
