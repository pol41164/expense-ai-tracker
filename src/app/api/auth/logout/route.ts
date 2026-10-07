import { clearAuthCookie } from "@/lib/auth";

// POST /api/auth/logout  清除登入 cookie
export async function POST() {
  await clearAuthCookie();
  return new Response(null, { status: 204 });
}
