"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { logout } from "@/components/auth/session";
import { useStore } from "@/lib/client/store";
import { sessionStore } from "@/lib/client/stores";

/** Registration card for guests; account summary once logged in. */
export function AccountCard() {
  const session = useStore(sessionStore);
  if (session.status === "user" && session.user) {
    return (
      <Card>
        <p className="text-center text-label text-strong">Welcome, <b>{session.user.name}</b></p>
        {session.demo ? <p className="text-center text-caption text-gray">Demo mode – no real money or accounts.</p> : null}
        <Button variant="dark" size={32} block onClick={() => void logout()}>Log out</Button>
      </Card>
    );
  }
  return (
    <Card bodyClassName="gap-2.5 p-3">
      <RegisterForm variant="card" />
    </Card>
  );
}
