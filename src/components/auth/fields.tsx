"use client";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const field = "h-[30px] w-full rounded bg-page px-3 text-label text-strong placeholder:text-placeholder focus:outline-2 focus:outline-brand-accent";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} role="alert" className="text-caption font-medium text-[#b42318]">{message}</p>;
}

export function TextField({ label, error, id, className, ...rest }: ComponentProps<"input"> & { label: string; error?: string; id: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(field, error && "outline-1 outline-[#b42318]", className)}
        {...rest}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function PhoneField({ id, value, onChange, error, disabled }: {
  id: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className={cn("flex h-[30px] overflow-hidden rounded bg-page", error && "outline-1 outline-[#b42318]")}>
        <span className="flex w-[46px] shrink-0 items-center justify-center bg-input-prefix text-label font-semibold text-strong">+94</span>
        <label htmlFor={id} className="sr-only">Mobile number</label>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="71 234 5678"
          maxLength={16}
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 text-label text-strong placeholder:text-placeholder focus:outline-none"
        />
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function SelectField({ id, label, value, onChange, children }: {
  id: string; label: string; value: string; onChange: (v: string) => void; children: ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(field, "appearance-none pr-8")}
      >
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 fill-strong">
        <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
      </svg>
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "info" | "success"; children: ReactNode }) {
  const cls = { error: "bg-[#fdecea] text-[#b42318]", info: "bg-odds text-ink", success: "bg-[#eef6e3] text-[#3f6212]" }[tone];
  return <p role={tone === "error" ? "alert" : "status"} className={cn("rounded px-3 py-2 text-body", cls)}>{children}</p>;
}
