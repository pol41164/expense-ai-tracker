import { CATEGORY_COLOR, CATEGORY_EMOJI, type ExpenseCategory } from "@/lib/expenseConstants";

/** 分類圖示：彩色底的 emoji 方塊 */
export function CategoryIcon({ category }: { category: ExpenseCategory }) {
  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
      style={{ backgroundColor: CATEGORY_COLOR[category].tint }}
    >
      {CATEGORY_EMOJI[category]}
    </span>
  );
}
