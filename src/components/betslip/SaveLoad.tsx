"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/auth/fields";
import { SplitTabs } from "./BetSlip";
import { useStore } from "@/lib/client/store";
import { dispatchSlip, slipStore } from "@/lib/client/stores";
import { decodeSlip, encodeSlip } from "@/lib/betslip";

/** Save / Load bet slip card. Codes are validated before anything is loaded. */
export function SaveLoadCard() {
  const uid = useId();
  const slip = useStore(slipStore);
  const [tab, setTab] = useState<"save" | "load">("save");
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const save = async () => {
    setMsg(null);
    if (!slip.selections.length) return setMsg({ tone: "error", text: "Your bet slip is empty." });
    const c = encodeSlip(slip.selections);
    setSaved(c);
    try {
      await navigator.clipboard.writeText(c);
      setMsg({ tone: "success", text: "Code copied. Paste it in Load to restore this bet slip." });
    } catch {
      setMsg({ tone: "success", text: "Code created. Copy it from the box above." });
    }
  };

  const load = () => {
    const selections = decodeSlip(code);
    if (!selections) return setMsg({ tone: "error", text: "This code is not valid." });
    dispatchSlip({ type: "load", selections });
    setCode("");
    setMsg({ tone: "success", text: `Loaded ${selections.length} selection${selections.length > 1 ? "s" : ""}. Odds may have changed.` });
  };

  return (
    <section aria-label="Save or load bet slip" className="overflow-hidden rounded-lg bg-card">
      <SplitTabs
        value={tab}
        onChange={v => { setTab(v); setMsg(null); }}
        items={[{ id: "save", label: "Save", icon: "download" }, { id: "load", label: "Load", icon: "upload" }]}
      />
      <div className="flex flex-col gap-1 p-2">
        {tab === "save" ? (
          <>
            <p className="text-caption font-semibold text-gray">Save bet slip</p>
            <p className="text-body text-subtle">Save your bet slip to get back to it later or share it with friends</p>
            {saved ? (
              <input readOnly value={saved} aria-label="Bet slip code" onFocus={e => e.currentTarget.select()}
                className="mt-1 h-7 rounded bg-page px-2 text-caption text-strong" />
            ) : null}
            <div className="h-1" />
            <Button variant="gray" block bold onClick={save}>Save</Button>
          </>
        ) : (
          <>
            <label htmlFor={`${uid}-code`} className="text-caption font-semibold text-gray">Load bet slip</label>
            <input id={`${uid}-code`} value={code} onChange={e => setCode(e.target.value)} maxLength={8000} placeholder="Paste code"
              className="h-[30px] rounded bg-page px-3 text-label text-strong placeholder:text-placeholder" />
            <div className="h-1" />
            <Button variant="gray" block bold onClick={load} disabled={!code.trim()}>Load</Button>
          </>
        )}
        {msg ? <div className="pt-1"><FormMessage tone={msg.tone}>{msg.text}</FormMessage></div> : null}
      </div>
    </section>
  );
}
