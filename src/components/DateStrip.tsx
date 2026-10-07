"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDays, todayKey, weekdayOf } from "@/lib/date";

const DAYS_BACK = 120;

type Props = {
  selected: string;
  onSelect: (dayKey: string) => void;
  /** 有紀錄的日期，會在日期下方顯示小圓點 */
  markedDays: Set<string>;
};

export function DateStrip({ selected, onSelect, markedDays }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const today = todayKey();

  const days = useMemo(() => {
    const defaultStart = addDays(today, -DAYS_BACK);
    let day = selected < defaultStart ? addDays(selected, -7) : defaultStart;
    const end = selected > today ? selected : today;
    const result: string[] = [];
    while (day <= end) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [selected, today]);

  // 選取的日期自動捲到中間
  useEffect(() => {
    const scroller = scrollerRef.current;
    const target = scroller?.querySelector<HTMLElement>(`[data-day="${selected}"]`);
    if (!scroller || !target) return;
    scroller.scrollTo({
      left: target.offsetLeft - scroller.clientWidth / 2 + target.clientWidth / 2,
      behavior: hasScrolled.current ? "smooth" : "instant",
    });
    hasScrolled.current = true;
  }, [selected, days]);

  return (
    <div
      ref={scrollerRef}
      className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-3"
      role="listbox"
      aria-label="選擇日期"
    >
      {days.map((day) => {
        const isSelected = day === selected;
        const dayOfMonth = Number(day.slice(8));
        return (
          <button
            key={day}
            data-day={day}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(day)}
            className={`relative flex h-[70px] w-[50px] shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
              isSelected
                ? "bg-brand text-accent-ink shadow-brand"
                : day === today
                  ? "bg-surface text-accent shadow-card ring-1 ring-accent/30 active:bg-surface-2"
                  : "bg-surface text-ink shadow-card active:bg-surface-2"
            }`}
          >
            <span className={`text-[11px] font-medium ${isSelected ? "opacity-90" : day === today ? "" : "text-ink-3"}`}>
              {dayOfMonth === 1 ? `${Number(day.slice(5, 7))}月` : day === today ? "今天" : weekdayOf(day)}
            </span>
            <span className="text-lg font-semibold leading-none tabular-nums">{dayOfMonth}</span>
            <span
              className={`h-1 w-1 rounded-full ${
                markedDays.has(day) ? (isSelected ? "bg-accent-ink" : "bg-accent") : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
