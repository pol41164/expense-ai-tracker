import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from "@/lib/expenseConstants";

const expenseSchema = new Schema(
  {
    // 記下這筆的使用者
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: EXPENSE_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    // 使用者輸入的原始文字，方便之後回查 AI 的判讀結果
    rawText: { type: String, required: true },
  },
  { timestamps: true },
);

// 查詢都是「帳本成員 + 日期區間」
expenseSchema.index({ user: 1, date: -1 });

export type Expense = InferSchemaType<typeof expenseSchema>;

// 開發模式下 HMR 會保留舊的 model，先移除才能套用修改後的 schema
if (process.env.NODE_ENV === "development" && models.Expense) deleteModel("Expense");

export const ExpenseModel: Model<Expense> =
  (models.Expense as Model<Expense>) ?? model<Expense>("Expense", expenseSchema);
