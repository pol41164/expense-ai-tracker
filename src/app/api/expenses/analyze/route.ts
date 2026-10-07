import { analyzeExpenseText } from "@/lib/analyzeExpense";
import { getCurrentUserId, unauthorized } from "@/lib/auth";
import { dayKeyToDate } from "@/lib/date";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/Expense";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ error: "請提供要分析的文字（text）" }, { status: 400 });
  }
  if (text.length > 1000) {
    return Response.json({ error: "文字長度不可超過 1000 字" }, { status: 400 });
  }

  try {
    const [analysis] = await Promise.all([analyzeExpenseText(text), connectDB()]);

    const expenses = await ExpenseModel.insertMany(
      analysis.items.map((item) => ({
        ...item,
        user: userId,
        date: dayKeyToDate(item.date),
        rawText: text,
      })),
    );
    // 跟列表 API 一樣帶出是誰記的
    await ExpenseModel.populate(expenses, { path: "user", select: "name", model: UserModel });

    return Response.json({ analysis, expenses }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/expenses/analyze]", error);
    return Response.json({ error: "分析或儲存失敗，請稍後再試" }, { status: 500 });
  }
}
