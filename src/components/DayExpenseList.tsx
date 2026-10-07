import { CategoryIcon } from "@/components/CategoryIcon";
import type { ExpenseDTO } from "@/lib/expenseConstants";
import { formatMoney } from "@/lib/format";
import { weekdayOf } from "@/lib/date";

type Props = {
  day: string;
  expenses: ExpenseDTO[];
  loading: boolean;
  /** 用來把自己記的標成「我」 */
  currentUserId: string;
};

export function DayExpenseList({ day, expenses, loading, currentUserId }: Props) {
  const dayExpense = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="px-4">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {Number(day.slice(5, 7))}月{Number(day.slice(8))}日
          <span className="ml-1.5 text-sm font-normal text-ink-3">星期{weekdayOf(day)}</span>
        </h2>
        {expenses.length > 0 && (
          <span className="text-sm text-ink-2">
            支出 <span className="font-semibold tabular-nums text-ink">{formatMoney(dayExpense)}</span>
          </span>
        )}
      </div>

      {loading && expenses.length === 0 ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-3xl bg-surface shadow-card" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-3xl bg-surface px-6 py-12 text-center shadow-card">
          <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-tint text-2xl">📝</span>
          <p className="font-semibold">這天還沒有紀錄</p>
          <p className="text-sm text-ink-3">點下方的 ＋ 用一句話記帳</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-3xl bg-surface shadow-card">
          {expenses.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0"
            >
              <CategoryIcon category={item.category} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.description}</p>
                <p className="truncate text-xs text-ink-3">
                  {item.category} · {item.user._id === currentUserId ? "我" : item.user.name}
                </p>
              </div>
              <span
                className={`shrink-0 font-semibold tabular-nums ${
                  item.type === "income" ? "text-income" : "text-expense"
                }`}
              >
                {item.type === "income" ? "+" : "-"}
                {formatMoney(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
