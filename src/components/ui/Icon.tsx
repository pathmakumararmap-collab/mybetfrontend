import { ICONS, type IconName } from "@/lib/icons";
import { cn } from "@/lib/cn";

interface IconProps {
  name: IconName;
  /** Rendered box size in px (glyph keeps its aspect ratio). */
  size?: number;
  className?: string;
  /** Accessible label; omit for decorative icons. */
  title?: string;
}

/** Inline SVG icon, coloured with `currentColor` (use text-* utilities). */
export function Icon({ name, size = 14, className, title }: IconProps) {
  const [width, height, , , path] = ICONS[name].icon;
  const paths = Array.isArray(path) ? path : [path];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      className={cn("shrink-0 fill-current", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
