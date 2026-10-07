"use client";

import { useMemo, useState } from "react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import type { ExpenseDTO } from "@/lib/expenseConstants";
import { monthRange, toDayKey, todayKey } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { isExpense, summarizeExpenses } from "@/lib/stats";

type Props = {
  month: string;
  expenses: ExpenseDTO[];
  loading: boolean;
  selectedDay: string;
  onSelectDay: (dayKey: string) => void;
  onChangeMonth: (delta: number) => void;
  onSelectMonth: (monthKey: string) => void;
};

const CHART_HEIGHT = 120;

export function MonthlyStats({ month, expenses, loading, selectedDay, onSelectDay, onChangeMonth, onSelectMonth }: Props) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const currentMonth = todayKey().slice(0, 7);
  const isCurrentMonth = month === currentMonth;

  const stats = useMemo(() => {
    const { start, end } = monthRange(month);
    const daysInMonth = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    const daily = Array.from({ length: daysInMonth }, () => 0);
    for (const item of expenses) {
      if (isExpense(item)) daily[Number(toDayKey(item.date).slice(8)) - 1] += item.amount;
    }
    const summary = summarizeExpenses(expenses);
    const elapsedDays = isCurrentMonth ? Number(todayKey().slice(8)) : daysInMonth;
    return { ...summary, daily, dailyAverage: summary.expense / elapsedDays };
  }, [expenses, month, isCurrentMonth]);

  const maxDaily = Math.max(...stats.daily, 1);
  const barWidth = 100 / stats.daily.length;
  const [year, monthNumber] = month.split("-").map(Number);
  const selectedDayOfMonth = selectedDay.startsWith(month) ? Number(selectedDay.slice(8)) : null;

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <PeriodSwitcher
        label={`${year} 年 ${monthNumber} 月`}
        prevLabel="上個月"
        nextLabel="下個月"
        onPrev={() => onChangeMonth(-1)}
        onNext={() => onChangeMonth(1)}
        nextDisabled={isCurrentMonth}
      />

      {/* 快速切換同一年的月份 */}
      <div className="grid grid-cols-6 gap-1.5" aria-label={`${year} 年月份`}>
        {Array.from({ length: 12 }, (_, i) => {
          const key = `${year}-${String(i + 1).padStart(2, "0")}`;
          const isSelected = key === month;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              disabled={key > currentMonth}
              onClick={() => onSelectMonth(key)}
              className={`rounded-xl py-2 text-sm tabular-nums transition-all disabled:opacity-30 ${
                isSelected
                  ? "bg-brand font-semibold text-accent-ink shadow-brand"
                  : "bg-surface text-ink-2 shadow-card active:bg-surface-2"
              }`}
            >
              {i + 1}月
            </button>
          );
        })}
      </div>

      {/* 當月總覽 */}
      <section className="rounded-3xl bg-surface p-5 shadow-card">
        <p className="text-sm text-ink-3">{isCurrentMonth ? "本月目前支出" : "當月支出"}</p>
        <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{formatMoney(stats.expense)}</p>
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
            <dt className="text-ink-3">日均支出</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(Math.round(stats.dailyAverage))}</dd>
          </div>
        </dl>
      </section>

      {/* 每日支出 */}
      <section className="rounded-3xl bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-semibold">每日支出</h3>
          <span className="text-xs text-ink-3">點長條切換日期</span>
        </div>
        <div className="relative">
          {stats.expense > 0 && (
            <span className="absolute -top-1 right-0 text-[10px] tabular-nums text-ink-3">
              {formatMoney(maxDaily)}
            </span>
          )}
          {hoverDay !== null && (
            <div
              className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs text-background shadow"
              style={{ left: `clamp(40px, ${(hoverDay + 0.5) * barWidth}%, calc(100% - 40px))` }}
            >
              {monthNumber}/{hoverDay + 1}　{formatMoney(stats.daily[hoverDay])}
            </div>
          )}
          <svg
            viewBox={`0 0 100 ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="h-[120px] w-full"
            role="img"
            aria-label={`${monthNumber} 月每日支出長條圖`}
            onPointerLeave={() => setHoverDay(null)}
          >
            <line x1="0" x2="100" y1={CHART_HEIGHT - 0.5} y2={CHART_HEIGHT - 0.5} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {stats.daily.map((amount, i) => {
              const height = amount === 0 ? 0 : Math.max((amount / maxDaily) * (CHART_HEIGHT - 12), 2);
              const isSelected = selectedDayOfMonth === i + 1;
              const x = i * barWidth;
              const gap = Math.min(barWidth * 0.25, 0.8);
              return (
                <g key={i}>
                  {height > 0 && (
                    <rect
                      x={x + gap / 2}
                      y={CHART_HEIGHT - height}
                      width={barWidth - gap}
                      height={height}
                      rx="0.6"
                      fill={isSelected || hoverDay === i ? "var(--accent)" : "var(--accent-soft)"}
                    />
                  )}
                  {/* 整欄都是點擊範圍，比長條本身大 */}
                  <rect
                    x={x}
                    y={0}
                    width={barWidth}
                    height={CHART_HEIGHT}
                    fill="transparent"
                    className="cursor-pointer"
                    onPointerEnter={() => setHoverDay(i)}
                    onClick={() => onSelectDay(`${month}-${String(i + 1).padStart(2, "0")}`)}
                  />
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-ink-3">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>{stats.daily.length}</span>
          </div>
        </div>
      </section>

      <CategoryBreakdown
        categories={stats.categories}
        total={stats.expense}
        loading={loading && expenses.length === 0}
        emptyText="這個月還沒有支出紀錄"
      />
    </div>
  );
}
