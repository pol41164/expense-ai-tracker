"use client";

import { useMemo, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import type { ExpenseDTO } from "@/lib/expenseConstants";
import { toDayKey, todayKey } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { isExpense, summarizeExpenses } from "@/lib/stats";

type Props = {
  year: number;
  expenses: ExpenseDTO[];
  loading: boolean;
  onChangeYear: (year: number) => void;
  /** 點某個月的長條，切到該月統計 */
  onSelectMonth: (monthKey: string) => void;
};

const CHART_HEIGHT = 140;

export function YearlyStats({ year, expenses, loading, onChangeYear, onSelectMonth }: Props) {
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const today = todayKey();
  const isCurrentYear = year === Number(today.slice(0, 4));
  // 今年只算到本月，未來的月份不能點
  const elapsedMonths = isCurrentYear ? Number(today.slice(5, 7)) : 12;

  const stats = useMemo(() => {
    const monthly = Array.from({ length: 12 }, () => 0);
    for (const item of expenses) {
      if (isExpense(item)) monthly[Number(toDayKey(item.date).slice(5, 7)) - 1] += item.amount;
    }
    const summary = summarizeExpenses(expenses);
    return { ...summary, monthly, monthlyAverage: summary.expense / elapsedMonths };
  }, [expenses, elapsedMonths]);

  const maxMonthly = Math.max(...stats.monthly, 1);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <PeriodSwitcher
        label={`${year} 年`}
        prevLabel="前一年"
        nextLabel="後一年"
        onPrev={() => onChangeYear(year - 1)}
        onNext={() => onChangeYear(year + 1)}
        nextDisabled={isCurrentYear}
      />

      {/* 年度總覽 */}
      <section className="rounded-3xl bg-surface p-5 shadow-card">
        <p className="text-sm text-ink-3">{isCurrentYear ? "今年目前支出" : "全年支出"}</p>
        {loading ? (
          <div className="mt-2 h-10 w-40 animate-pulse rounded-xl bg-surface-2" />
        ) : (
          <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{formatMoney(stats.expense)}</p>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
            <dt className="text-ink-3">收入</dt>
            <dd className="font-semibold tabular-nums text-income">{formatMoney(stats.income)}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
            <dt className="text-ink-3">結餘</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(stats.income - stats.expense)}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
            <dt className="text-ink-3">月均支出</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(Math.round(stats.monthlyAverage))}</dd>
          </div>
        </dl>
      </section>

      {/* 每月支出 */}
      <section className="rounded-3xl bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-semibold">每月支出</h3>
          <span className="text-xs text-ink-3">點長條看該月統計</span>
        </div>
        <div className="relative">
          {!loading && stats.expense > 0 && (
            <span className="absolute -top-1 right-0 text-[10px] tabular-nums text-ink-3">
              {formatMoney(maxMonthly)}
            </span>
          )}
          {hoverMonth !== null && (
            <div
              className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs text-background shadow"
              style={{ left: `clamp(48px, ${((hoverMonth + 0.5) / 12) * 100}%, calc(100% - 48px))` }}
            >
              {hoverMonth + 1} 月　{formatMoney(stats.monthly[hoverMonth])}
            </div>
          )}
          <div
            className="flex items-end gap-1.5 border-b border-line"
            style={{ height: CHART_HEIGHT }}
            role="group"
            aria-label={`${year} 年每月支出長條圖`}
            onPointerLeave={() => setHoverMonth(null)}
          >
            {stats.monthly.map((amount, i) => {
              const height = amount === 0 ? 0 : Math.max((amount / maxMonthly) * (CHART_HEIGHT - 14), 3);
              const disabled = i >= elapsedMonths;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  aria-label={`${i + 1} 月 ${formatMoney(amount)}`}
                  onPointerEnter={() => !disabled && setHoverMonth(i)}
                  onClick={() => onSelectMonth(`${year}-${String(i + 1).padStart(2, "0")}`)}
                  className="flex h-full flex-1 cursor-pointer items-end disabled:cursor-default"
                >
                  <span
                    className={`w-full rounded-t-lg transition-colors ${hoverMonth === i ? "bg-brand" : "bg-accent-soft"}`}
                    style={{ height }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex gap-1.5 text-[10px] tabular-nums text-ink-3">
            {stats.monthly.map((_, i) => (
              <span key={i} className={`flex-1 text-center ${i >= elapsedMonths ? "opacity-40" : ""}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CategoryBreakdown
        categories={stats.categories}
        total={stats.expense}
        loading={loading}
        emptyText="這一年還沒有支出紀錄"
      />
    </div>
  );
}
