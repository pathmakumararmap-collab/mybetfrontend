import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/icons";

export type ButtonVariant = "green" | "dark" | "yellow" | "gray" | "primary";

const VARIANTS: Record<ButtonVariant, string> = {
  green: "bg-brand-green text-white hover:brightness-110",
  dark: "bg-brand-dark text-white hover:bg-[#4a0d20]",
  yellow: "bg-brand-accent text-strong hover:brightness-105",
  gray: "bg-neutral text-gray hover:bg-[#cfcfcf]",
  primary: "bg-brand-primary text-white hover:brightness-110",
};

interface Common {
  variant?: ButtonVariant;
  icon?: IconName;
  /** Height in px (design uses 30 and 32). */
  size?: 26 | 30 | 32 | 36;
  block?: boolean;
  bold?: boolean;
  className?: string;
  children: ReactNode;
}

const base = "inline-flex shrink-0 items-center justify-center gap-2 rounded px-3.5 text-label uppercase transition disabled:cursor-not-allowed disabled:opacity-50";
const height = { 26: "h-[26px]", 30: "h-[30px]", 32: "h-8", 36: "h-9" } as const;

function classes({ variant = "dark", size = 30, block, bold, className }: Omit<Common, "children" | "icon">) {
  return cn(base, VARIANTS[variant], height[size], block && "w-full", bold && "font-semibold", className);
}

export function Button({ variant, icon, size, block, bold, className, children, type = "button", ...rest }:
  Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type={type} className={classes({ variant, size, block, bold, className })} {...rest}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, icon, size, block, bold, className, children, href, ...rest }:
  Common & { href: string } & Omit<ComponentProps<typeof Link>, "children" | "className" | "href">) {
  return (
    <Link href={href} className={classes({ variant, size, block, bold, className })} {...rest}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </Link>
  );
}

const iconBox = "inline-flex size-[30px] shrink-0 items-center justify-center rounded bg-brand-dark text-white transition hover:bg-[#4a0d20]";

export function IconLink({ icon, label, href, className }: { icon: IconName; label: string; href: string; className?: string }) {
  return (
    <Link href={href} aria-label={label} title={label} className={cn(iconBox, className)}>
      <Icon name={icon} size={16} />
    </Link>
  );
}

export function iconButtonClass(className?: string) {
  return cn(iconBox, className);
}
