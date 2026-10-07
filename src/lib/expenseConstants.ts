// 前後端共用的常數，不能 import mongoose，client component 也會用到

export const EXPENSE_TYPES = ["expense", "income"] as const;

export const EXPENSE_CATEGORIES = [
  "餐飲",
  "交通",
  "購物",
  "娛樂",
  "居住",
  "醫療",
  "教育",
  "薪資",
  "投資",
  "其他",
] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  餐飲: "🍜",
  交通: "🚕",
  購物: "🛍️",
  娛樂: "🎮",
  居住: "🏠",
  醫療: "💊",
  教育: "📚",
  薪資: "💰",
  投資: "📈",
  其他: "📦",
};

/** 分類的代表色：tint 是圖示底色，solid 是比例長條 */
export const CATEGORY_COLOR: Record<ExpenseCategory, { tint: string; solid: string }> = {
  餐飲: { tint: "#fff1e6", solid: "#fb923c" },
  交通: { tint: "#e6f4ff", solid: "#38bdf8" },
  購物: { tint: "#ffe8f3", solid: "#f472b6" },
  娛樂: { tint: "#f1ebff", solid: "#a78bfa" },
  居住: { tint: "#e3f8f4", solid: "#2dd4bf" },
  醫療: { tint: "#ffe9ec", solid: "#fb7185" },
  教育: { tint: "#fff6db", solid: "#fbbf24" },
  薪資: { tint: "#e4f8ee", solid: "#34d399" },
  投資: { tint: "#e9edff", solid: "#818cf8" },
  其他: { tint: "#eef1f6", solid: "#94a3b8" },
};

/** API 回傳給前端的單筆紀錄 */
export type ExpenseDTO = {
  _id: string;
  /** 記下這筆的使用者 */
  user: { _id: string; name: string };
  type: ExpenseType;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  rawText: string;
  createdAt: string;
};
