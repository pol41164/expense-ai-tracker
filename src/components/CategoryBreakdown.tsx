import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_COLOR } from "@/lib/expenseConstants";
import { formatMoney } from "@/lib/format";
import type { CategoryTotal } from "@/lib/stats";

type Props = {
  categories: CategoryTotal[];
  total: number;
  loading: boolean;
  emptyText: string;
};

export function CategoryBreakdown({ categories, total, loading, emptyText }: Props) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-card">
      <h3 className="mb-4 font-semibold tracking-tight">各項目花費</h3>
      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
      ) : categories.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-3">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {categories.map(({ category, amount, count }) => {
            const percent = (amount / total) * 100;
            return (
              <li key={category} className="flex items-center gap-3">
                <CategoryIcon category={category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">
                      {category}
                      <span className="ml-1.5 text-xs font-normal text-ink-3">{count} 筆</span>
                    </span>
                    <span className="font-semibold tabular-nums">{formatMoney(amount)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: CATEGORY_COLOR[category].solid }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-ink-3">{percent.toFixed(0)}%</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
