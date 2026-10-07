"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CurrentUser } from "@/lib/auth";

export function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 點選單外面就關閉
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="帳號選單"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-accent-ink shadow-brand ring-2 ring-surface"
      >
        {user.name.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-60 rounded-3xl bg-surface p-2 shadow-xl shadow-slate-900/10 ring-1 ring-line">
          <div className="px-3 py-2">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-rose-50 active:bg-rose-50 disabled:opacity-50"
          >
            {loggingOut ? "登出中…" : "登出"}
          </button>
        </div>
      )}
    </div>
  );
}
