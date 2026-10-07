import { getCurrentUser } from "@/lib/auth";

// GET /api/auth/me  目前登入的使用者；未登入回傳 { user: null }
export async function GET() {
  try {
    return Response.json({ user: await getCurrentUser() });
  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return Response.json({ error: "讀取使用者失敗" }, { status: 500 });
  }
}
