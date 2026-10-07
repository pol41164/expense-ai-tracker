"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LandingShowcase } from "@/components/LandingShowcase";

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl bg-surface-2 px-4 py-3 text-base outline-none ring-1 ring-line transition focus:bg-surface focus:ring-2 focus:ring-accent/50";

  return (
    <div className="landing-bg relative min-h-dvh w-full overflow-hidden">
      {/* 頂部導覽 */}
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/login" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-base shadow-brand">✨</span>
          andy 的 AI 家庭記帳本
        </Link>
        <Link
          href={isRegister ? "/login" : "/register"}
          className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-accent shadow-card active:bg-surface-2"
        >
          {isRegister ? "登入" : "免費註冊"}
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pt-6 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-14">
        {/* 標語 */}
        <section className="lg:col-start-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-accent shadow-card backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            用 AI 記帳，比打字還快
          </span>
          <h1 className="mt-5 text-4xl leading-[1.15] font-bold tracking-tight sm:text-5xl lg:text-[56px]">
            說一句話，
            <br />
            <span className="bg-brand bg-clip-text text-transparent">帳就記好了</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-2 sm:text-lg">
            不用選分類、不用填表單。輸入「早餐蛋餅 45，晚上看電影 320」，AI 會自動拆成一筆筆紀錄，幫你整理好每天的花費。
          </p>
        </section>

        {/* 登入／註冊卡片：手機版排在標語下方，桌機版在右側 */}
        <section className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="rounded-[32px] bg-surface p-6 shadow-card ring-1 ring-line sm:p-8">
            <div className="grid grid-cols-2 rounded-full bg-surface-2 p-1 text-sm font-semibold">
              {(
                [
                  ["login", "登入", "/login"],
                  ["register", "註冊", "/register"],
                ] as const
              ).map(([value, label, href]) => (
                <Link
                  key={value}
                  href={href}
                  aria-current={mode === value ? "page" : undefined}
                  className={`rounded-full py-2 text-center transition-all ${
                    mode === value ? "bg-surface text-ink shadow-card" : "text-ink-3"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <h2 className="mt-7 text-2xl font-bold tracking-tight">{isRegister ? "建立你的帳號" : "歡迎回來 👋"}</h2>
            <p className="mt-1.5 text-sm text-ink-3">
              {isRegister ? "註冊後就能用一句話記帳" : "登入後繼續記帳"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {isRegister && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink-2">名稱</span>
                  <input name="name" required maxLength={50} autoComplete="name" className={inputClass} />
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-2">Email</span>
                <input name="email" type="email" required autoComplete="email" className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-2">密碼</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={isRegister ? 8 : undefined}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className={inputClass}
                />
                {isRegister && <span className="text-xs text-ink-3">至少 8 個字元</span>}
              </label>
              {isRegister && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink-2">驗證碼</span>
                  <input name="code" required autoComplete="off" autoCapitalize="none" className={inputClass} />
                </label>
              )}
      
              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-danger ring-1 ring-rose-100" role="alert">
                  {error}
                </p>
              )}
      
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-2xl bg-brand py-3.5 font-semibold text-accent-ink shadow-brand active:opacity-90 disabled:opacity-60"
              >
                {loading ? "請稍候…" : isRegister ? "註冊" : "登入"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-3">
              {isRegister ? "已經有帳號了？" : "還沒有帳號？"}
              <Link href={isRegister ? "/login" : "/register"} className="ml-1 font-semibold text-accent">
                {isRegister ? "登入" : "免費註冊"}
              </Link>
            </p>
          </div>
        </section>

        {/* 產品示範與功能 */}
        <section className="lg:col-start-1">
          <LandingShowcase />
        </section>
      </main>

      <footer className="relative pb-8 text-center text-xs text-ink-3">© 2026 andy 的 AI 家庭記帳本</footer>
    </div>
  );
}
