"use client";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/client/store";
import { authDialogStore, closeAuth, openAuth } from "@/lib/client/stores";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { loadSession } from "./session";

/** Login / Registration popup (native <dialog>: focus trap, Esc to close). */
export function AuthDialog() {
  const view = useStore(authDialogStore);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (view && !d.open) d.showModal();
    if (!view && d.open) d.close();
  }, [view]);

  const title = view === "register" ? "Registration" : "Login";
  return (
    <dialog
      ref={ref}
      aria-labelledby="auth-title"
      onClose={() => closeAuth()}
      onClick={e => e.target === ref.current && closeAuth()}
      className="m-auto w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-lg bg-card p-0 shadow-2xl"
    >
      {view ? (
        <>
          <header className="flex h-12 items-center gap-2.5 bg-brand-primary px-4">
            <Logo size={22} href={null} />
            <h2 id="auth-title" className="text-label font-bold uppercase text-white">{title}</h2>
            <button
              type="button"
              onClick={() => closeAuth()}
              aria-label="Close"
              className="ml-auto flex size-7 items-center justify-center rounded bg-brand-dark text-white hover:bg-[#4a0d20]"
            >
              <Icon name="close" size={14} />
            </button>
          </header>
          <div className="max-h-[calc(100dvh-120px)] overflow-y-auto p-5">
            {view === "login" ? <LoginForm /> : (
              <div className="flex flex-col gap-3">
                <RegisterForm variant="dialog" />
                <p className="text-center text-label text-muted">
                  Already have an account?{" "}
                  <button type="button" onClick={() => openAuth("login")} className="font-semibold text-brand-primary underline">Log in</button>
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
