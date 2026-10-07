import { getCurrentUser, unauthorized } from "@/lib/auth";
import { dayKeyToDate, monthRange } from "@/lib/date";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/Expense";
import { UserModel } from "@/models/User";

// GET /api/expenses?month=YYYY-MM → 共享帳本裡該月所有紀錄（台北時間）
// GET /api/expenses?year=YYYY    → 共享帳本裡該年所有紀錄（台北時間）
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const month = params.get("month");
  const year = params.get("year");

  let range: { start: Date; end: Date };
  if (month !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    range = monthRange(month);
  } else if (month === null && year !== null && /^\d{4}$/.test(year)) {
    range = { start: dayKeyToDate(`${year}-01-01`), end: dayKeyToDate(`${Number(year) + 1}-01-01`) };
  } else {
    return Response.json({ error: "需提供 month（YYYY-MM）或 year（YYYY）" }, { status: 400 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    await connectDB();
    // 同一本帳本的所有成員的紀錄，並帶出是誰記的
    const members = await UserModel.find({ ledger: user.ledger }).distinct("_id");
    const expenses = await ExpenseModel.find({ user: { $in: members }, date: { $gte: range.start, $lt: range.end } })
      .sort({ date: -1, createdAt: -1 })
      .populate("user", "name")
      .lean();

    return Response.json({ expenses });
  } catch (error) {
    console.error("[GET /api/expenses]", error);
    return Response.json({ error: "讀取紀錄失敗，請稍後再試" }, { status: 500 });
  }
}
