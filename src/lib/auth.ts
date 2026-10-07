import { SignJWT, jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const AUTH_COOKIE = "token";
const MAX_AGE = 30 * 24 * 60 * 60; // 保持登入 30 天（秒）

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("缺少環境變數 JWT_SECRET");
  return new TextEncoder().encode(secret);
}

// JWT 只放使用者 id（sub），不放 email 等個資
async function signToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getKey());
}

// 被竄改、過期、格式錯誤一律回傳 null
async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    return payload.sub && isValidObjectId(payload.sub) ? payload.sub : null;
  } catch {
    return null;
  }
}

// httpOnly：前端 JS 讀不到 token，避免被 XSS 偷走
export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, await signToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 本機 http 開發時不能加 secure
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

/** 從 cookie 取得登入者 id（不查資料庫）；未登入回傳 null */
export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(AUTH_COOKIE)?.value);
}

export type CurrentUser = { id: string; email: string; name: string; role: string; ledger: string };

/** 從 cookie 取得登入者；未登入或帳號已被刪除回傳 null */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  await connectDB();
  const user = await UserModel.findById(userId, "email name role ledger").lean();
  if (!user) return null;
  return { id: String(user._id), email: user.email, name: user.name, role: user.role, ledger: user.ledger };
}

export const unauthorized = () => Response.json({ error: "請先登入" }, { status: 401 });
