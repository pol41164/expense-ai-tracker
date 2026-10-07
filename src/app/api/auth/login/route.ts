import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

// POST /api/auth/login  body: { email, password }
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "請輸入 Email 與密碼" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await UserModel.findOne({ email }).select("+passwordHash");

    // 帳號不存在或密碼錯誤都回同一個訊息，避免被試出哪些 email 已註冊
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }

    await setAuthCookie(user.id);
    return Response.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return Response.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
