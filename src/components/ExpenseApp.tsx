"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { DateStrip } from "@/components/DateStrip";
import { DayExpenseList } from "@/components/DayExpenseList";
import { MonthlyStats } from "@/components/MonthlyStats";
import { UserMenu } from "@/components/UserMenu";
import { YearlyStats } from "@/components/YearlyStats";
import { addDays, monthKeyOf, toDayKey, todayKey } from "@/lib/date";
import type { CurrentUser } from "@/lib/auth";
import type { ExpenseDTO } from "@/lib/expenseConstants";
import { formatMoney } from "@/lib/format";

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const index = year * 12 + (month - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

async function fetchExpenses(query: string): Promise<ExpenseDTO[]> {
  const res = await fetch(`/api/expenses?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "讀取失敗", { cause: res.status });
  return data.expenses;
}

function monthsOfYear(year: number) {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

type StatsPeriod = "month" | "year";

export function ExpenseApp({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("list");
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("month");
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 以月份為單位快取紀錄：{ "2026-10": [...] }
  const [monthCache, setMonthCache] = useState<Record<string, ExpenseDTO[]>>({});

  const selectedMonth = monthKeyOf(selectedDay);
  const monthExpenses = useMemo(() => monthCache[selectedMonth] ?? [], [monthCache, selectedMonth]);
  const monthLoading = !(selectedMonth in monthCache);

  // 已發出請求的月份，避免同一個月重複抓
  const requestedMonths = useRef(new Set<string>());

  const handleLoadError = useCallback(
    (err: unknown) => {
      // 登入過期就回登入頁
      if (err instanceof Error && err.cause === 401) router.replace("/login");
      else setLoadError(err instanceof Error ? err.message : "讀取失敗");
    },
    [router],
  );

  const loadMonth = useCallback((month: string) => {
    requestedMonths.current.add(month);
    fetchExpenses(`month=${month}`).then(
      (expenses) => {
        setMonthCache((cache) => ({ ...cache, [month]: expenses }));
        setLoadError(null);
      },
      (err) => {
        requestedMonths.current.delete(month);
        handleLoadError(err);
      },
    );
  }, [handleLoadError]);

  // 載入選取的月份，順便載入上個月，讓日期列跨月時也有紀錄小圓點
  useEffect(() => {
    for (const month of [selectedMonth, shiftMonth(selectedMonth, -1)]) {
      if (!requestedMonths.current.has(month)) loadMonth(month);
    }
  }, [selectedMonth, loadMonth]);

  // 年度統計：一次抓整年，再拆成各月份放進快取
  const selectedYear = Number(selectedMonth.slice(0, 4));
  const yearMonths = useMemo(() => monthsOfYear(selectedYear), [selectedYear]);
  const yearExpenses = useMemo(() => yearMonths.flatMap((m) => monthCache[m] ?? []), [monthCache, yearMonths]);
  const yearLoading = yearMonths.some((m) => !(m in monthCache));

  useEffect(() => {
    if (tab !== "stats" || statsPeriod !== "year") return;
    const missing = yearMonths.filter((m) => !requestedMonths.current.has(m));
    if (missing.length === 0) return;
    for (const m of missing) requestedMonths.current.add(m);
    fetchExpenses(`year=${selectedYear}`).then(
      (expenses) => {
        const grouped = Object.fromEntries(missing.map((m) => [m, [] as ExpenseDTO[]]));
        for (const e of expenses) grouped[monthKeyOf(toDayKey(e.date))]?.push(e);
        setMonthCache((cache) => ({ ...cache, ...grouped }));
        setLoadError(null);
      },
      (err) => {
        for (const m of missing) requestedMonths.current.delete(m);
        handleLoadError(err);
      },
    );
  }, [tab, statsPeriod, selectedYear, yearMonths, handleLoadError]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const markedDays = useMemo(
    () => new Set(Object.values(monthCache).flat().map((e) => toDayKey(e.date))),
    [monthCache],
  );

  const dayExpenses = useMemo(
    () => monthExpenses.filter((e) => toDayKey(e.date) === selectedDay),
    [monthExpenses, selectedDay],
  );

  const monthSummary = useMemo(() => {
    let expense = 0;
    let income = 0;
    for (const e of monthExpenses) {
      if (e.type === "expense") expense += e.amount;
      else income += e.amount;
    }
    return { expense, income };
  }, [monthExpenses]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  function handleCreated(created: ExpenseDTO[]) {
    setSheetOpen(false);
    setTab("list");
    setToast(`已記錄 ${created.length} 筆`);
    const firstDay = toDayKey(created[0].date);
    setSelectedDay(firstDay);
    for (const month of new Set(created.map((e) => monthKeyOf(toDayKey(e.date))))) {
      loadMonth(month);
    }
  }

  /** 切到指定月份；超過本月就停在本月 */
  function goToMonth(month: string) {
    const today = todayKey();
    const target = month > monthKeyOf(today) ? monthKeyOf(today) : month;
    setSelectedDay(target === monthKeyOf(today) ? today : `${target}-01`);
  }

  function handleChangeMonth(delta: number) {
    goToMonth(shiftMonth(selectedMonth, delta));
  }

  const isToday = selectedDay === todayKey();
  const monthNumber = Number(selectedMonth.slice(5));

  return (
    <div className="app-shell mx-auto flex min-h-dvh w-full max-w-md flex-col pb-32 sm:shadow-2xl sm:shadow-slate-900/10">
      <header className="flex items-end justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent">
            <span className="h-2 w-2 rounded-full bg-brand" />
            andy 的 AI 家庭記帳本
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight">
            {tab === "list" ? `${monthNumber} 月明細` : statsPeriod === "month" ? "月統計" : "年統計"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {tab === "list" && !isToday && (
            <button
              type="button"
              onClick={() => setSelectedDay(todayKey())}
              className="rounded-full bg-surface px-3.5 py-2 text-sm font-semibold text-accent shadow-card active:bg-surface-2"
            >
              回到今天
            </button>
          )}
          <UserMenu user={user} />
        </div>
      </header>

      {loadError && (
        <p className="mx-4 mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-danger ring-1 ring-rose-100">{loadError}</p>
      )}

      {tab === "list" ? (
        <>
          <section className="relative mx-4 mb-2 overflow-hidden rounded-[28px] bg-brand p-6 text-accent-ink shadow-brand">
            {/* 裝飾光暈 */}
            <span className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />
            <div className="relative">
              <p className="text-sm font-medium opacity-85">{monthNumber} 月支出</p>
              <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
                {formatMoney(monthSummary.expense)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/15 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-xs opacity-80">收入</p>
                  <p className="mt-0.5 font-semibold tabular-nums">{formatMoney(monthSummary.income)}</p>
                </div>
                <div className="rounded-2xl bg-white/15 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-xs opacity-80">結餘</p>
                  <p className="mt-0.5 font-semibold tabular-nums">
                    {formatMoney(monthSummary.income - monthSummary.expense)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
            <DateStrip selected={selectedDay} onSelect={setSelectedDay} markedDays={markedDays} />
          </div>

          <div className="mt-2">
            <DayExpenseList day={selectedDay} expenses={dayExpenses} loading={monthLoading} currentUserId={user.id} />
          </div>

          <div className="mt-5 flex justify-center gap-3 text-sm font-medium text-ink-2">
            <button
              type="button"
              onClick={() => setSelectedDay(addDays(selectedDay, -1))}
              className="rounded-full bg-surface px-4 py-2 shadow-card active:bg-surface-2"
            >
              ‹ 前一天
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDay(addDays(selectedDay, 1))}
                className="rounded-full bg-surface px-4 py-2 shadow-card active:bg-surface-2"
              >
                後一天 ›
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 月／年切換 */}
          <div className="mx-4 mb-5 grid grid-cols-2 rounded-full bg-surface/70 p-1 text-sm font-semibold shadow-card" role="tablist">
            {(
              [
                ["month", "月"],
                ["year", "年"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={statsPeriod === value}
                onClick={() => setStatsPeriod(value)}
                className={`rounded-full py-2 transition-all ${
                  statsPeriod === value ? "bg-brand text-accent-ink shadow-brand" : "text-ink-3"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {statsPeriod === "month" ? (
            <MonthlyStats
              month={selectedMonth}
              expenses={monthExpenses}
              loading={monthLoading}
              selectedDay={selectedDay}
              onSelectDay={(day) => {
                setSelectedDay(day);
                setTab("list");
              }}
              onChangeMonth={handleChangeMonth}
              onSelectMonth={goToMonth}
            />
          ) : (
            <YearlyStats
              year={selectedYear}
              expenses={yearExpenses}
              loading={yearLoading}
              onChangeYear={(year) => goToMonth(`${year}${selectedMonth.slice(4)}`)}
              onSelectMonth={(month) => {
                goToMonth(month);
                setStatsPeriod("month");
              }}
            />
          )}
        </>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-32 z-50 flex justify-center px-4" role="status">
          <span className="flex items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-2 text-sm font-medium text-background shadow-xl shadow-slate-900/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs text-ink">✓</span>
            {toast}
          </span>
        </div>
      )}

      <BottomNav tab={tab} onTabChange={setTab} onAdd={() => setSheetOpen(true)} />
      <AddExpenseSheet open={sheetOpen} onClose={closeSheet} onCreated={handleCreated} />
    </div>
  );
}
