"use client";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormMessage, PhoneField, SelectField, TextField } from "./fields";
import { postJson } from "@/lib/client/api";
import { closeAuth } from "@/lib/client/stores";
import { signedIn } from "./session";
import { RegisterSchema, SmsRequestSchema, fieldErrors } from "@/lib/validation";

interface SmsResponse { ok: true; resendIn?: number; demo?: boolean; demoCode?: string }
interface AuthResponse { ok: true; user: { name: string }; demo?: boolean }

/** Registration by phone (SMS code), as drawn in the right sidebar. */
export function RegisterForm({ variant = "card" }: { variant?: "card" | "dialog" }) {
  const uid = useId();
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [pending, setPending] = useState<"sms" | "register" | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  async function sendCode() {
    setMessage(null);
    const parsed = SmsRequestSchema.safeParse({ phone, channel });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setPending("sms");
    const res = await postJson<SmsResponse>("/api/auth/sms", parsed.data);
    setPending(null);
    if (!res.ok) {
      setErrors(res.fields ?? {});
      return setMessage({ tone: "error", text: res.error });
    }
    setResendIn(res.data.resendIn ?? 60);
    setMessage({
      tone: "info",
      text: res.data.demo && res.data.demoCode
        ? `Demo mode: no SMS is sent. Use code ${res.data.demoCode}.`
        : `We sent a code to +94 ${phone.replace(/^\+?94|^0/, "")}.`,
    });
  }

  async function register(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const parsed = RegisterSchema.safeParse({ phone, code });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setPending("register");
    const res = await postJson<AuthResponse>("/api/auth/register", parsed.data);
    setPending(null);
    if (!res.ok) {
      setErrors(res.fields ?? {});
      return setMessage({ tone: "error", text: res.error });
    }
    signedIn(res.data.user, Boolean(res.data.demo));
    closeAuth();
  }

  return (
    <form onSubmit={register} noValidate className="flex flex-col gap-2.5">
      {variant === "card" ? <p className="text-center text-label text-strong">REGISTRATION</p> : null}
      <div className="flex h-8 items-center justify-center gap-2 rounded bg-brand-dark text-label text-white" aria-hidden>
        <Icon name="phone" size={14} />
        By phone
      </div>
      <p className="text-center text-label font-bold text-strong">By phone</p>
      <p className="text-center text-body text-strong">
        To register on the website, enter your phone number and choose how you want to receive the code
      </p>
      <PhoneField id={`${uid}-phone`} value={phone} onChange={setPhone} error={errors.phone} />
      <SelectField id={`${uid}-channel`} label="Receive the code by" value={channel} onChange={v => setChannel(v === "whatsapp" ? "whatsapp" : "sms")}>
        <option value="sms">SMS</option>
        <option value="whatsapp">WhatsApp</option>
      </SelectField>
      <Button variant="dark" size={32} block onClick={sendCode} disabled={pending !== null || resendIn > 0}>
        {pending === "sms" ? "Sending…" : resendIn > 0 ? `Resend in ${resendIn}s` : `Send via ${channel === "sms" ? "SMS" : "WhatsApp"}`}
      </Button>
      <TextField
        id={`${uid}-code`}
        label="Confirmation code"
        placeholder="Confirmation code*"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
        error={errors.code}
        className="text-center"
      />
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
      <Button type="submit" variant="yellow" size={32} block disabled={pending !== null}>
        {pending === "register" ? "Registering…" : "Register"}
      </Button>
      <p className="text-center text-caption leading-3 text-strong">
        By clicking this button you confirm that you have read and agree to the{" "}
        <Link href="/information/terms" className="underline">Mybet Terms and Conditions</Link> and{" "}
        <Link href="/information/privacy" className="underline">Privacy Policy</Link> of the company and confirm that you are of legal age
      </p>
    </form>
  );
}
