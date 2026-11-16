"use client";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormMessage, TextField } from "./fields";
import { postJson } from "@/lib/client/api";
import { closeAuth, openAuth } from "@/lib/client/stores";
import { signedIn } from "./session";
import { LoginSchema, fieldErrors } from "@/lib/validation";

interface AuthResponse { ok: true; user: { name: string }; demo?: boolean }

export function LoginForm() {
  const uid = useId();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = LoginSchema.safeParse({ login, password, remember });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setPending(true);
    const res = await postJson<AuthResponse>("/api/auth/login", parsed.data);
    setPending(false);
    if (!res.ok) {
      setErrors(res.fields ?? {});
      // Same message for unknown user and wrong password (no account enumeration).
      return setError(res.status === 401 || res.status === 422 ? "Wrong login or password." : res.error);
    }
    setPassword("");
    signedIn(res.data.user, Boolean(res.data.demo));
    closeAuth();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField
        id={`${uid}-login`}
        label="Phone number or e-mail"
        placeholder="Phone number or e-mail"
        autoComplete="username"
        maxLength={100}
        value={login}
        onChange={e => setLogin(e.target.value)}
        error={errors.login}
        className="h-9"
      />
      <div className="relative">
        <TextField
          id={`${uid}-password`}
          label="Password"
          placeholder="Password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          className="h-9 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-[18px] -translate-y-1/2 p-1 text-muted hover:text-ink"
        >
          <Icon name={show ? "eye-off" : "eye"} size={14} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-label text-strong">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="size-3.5 accent-brand-primary" />
          Remember me
        </label>
        <Link href="/information/contacts" onClick={() => closeAuth()} className="text-label text-brand-primary underline">
          Forgot password?
        </Link>
      </div>
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <Button type="submit" variant="yellow" size={36} bold block disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-label text-muted">No account yet?</p>
      <Button variant="green" size={36} bold block onClick={() => openAuth("register")}>Registration</Button>
    </form>
  );
}
