import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const MIN_PASSWORD_LENGTH = 8;
// 註冊驗證碼，目前先寫死；只在伺服器端比對，前端看不到
// 用同一個驗證碼註冊的人會加入同一本共享帳本
const REGISTER_CODE = "coding";

// POST /api/auth/register  body: { email, password, name, code }
// 註冊成功後直接登入（設定 cookie）
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (code !== REGISTER_CODE) {
    return Response.json({ error: "驗證碼錯誤" }, { status: 403 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email 格式錯誤" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return Response.json({ error: `密碼至少 ${MIN_PASSWORD_LENGTH} 個字元` }, { status: 400 });
  }
  if (!name || name.length > 50) {
    return Response.json({ error: "請輸入名稱（50 字以內）" }, { status: 400 });
  }

  try {
    await connectDB();
    if (await UserModel.exists({ email })) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }

    const user = await UserModel.create({
      email,
      name,
      ledger: code,
      passwordHash: await bcrypt.hash(password, 10),
    });
    await setAuthCookie(user.id);
    return Response.json({ user: { id: user.id, email, name, role: user.role } }, { status: 201 });
  } catch (error) {
    // 兩個請求同時註冊同一個 email 時，由 unique 索引擋下
    if ((error as { code?: number }).code === 11000) {
      return Response.json({ error: "這個 Email 已經註冊過了" }, { status: 409 });
    }
    console.error("[POST /api/auth/register]", error);
    return Response.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
