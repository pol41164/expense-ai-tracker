import type { ExpenseCategory, ExpenseDTO } from "@/lib/expenseConstants";

export type CategoryTotal = { category: ExpenseCategory; amount: number; count: number };

/** 收支合計與分類排行 */
export function summarizeExpenses(expenses: ExpenseDTO[]) {
  const byCategory = new Map<ExpenseCategory, { amount: number; count: number }>();
  let expense = 0;
  let income = 0;

  for (const item of expenses) {
    if (item.type === "income") {
      income += item.amount;
      continue;
    }
    expense += item.amount;
    const entry = byCategory.get(item.category) ?? { amount: 0, count: 0 };
    entry.amount += item.amount;
    entry.count++;
    byCategory.set(item.category, entry);
  }

  const categories: CategoryTotal[] = [...byCategory.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.amount - a.amount);

  return { expense, income, categories };
}

/** 只算支出，用來畫每日／每月長條圖 */
export function isExpense(item: ExpenseDTO) {
  return item.type === "expense";
}
