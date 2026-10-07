import { redirect } from "next/navigation";
import { ExpenseApp } from "@/components/ExpenseApp";
import { getCurrentUser } from "@/lib/auth";

// 沒登入就導到登入頁；登入狀態由 httpOnly cookie 保持
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <ExpenseApp user={user} />;
}
