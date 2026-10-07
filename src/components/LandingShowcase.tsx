import { CategoryIcon } from "@/components/CategoryIcon";

const FEATURES = [
  { icon: "💬", title: "一句話記帳", text: "打「午餐拉麵 180」就好，不用選分類、填表單" },
  { icon: "🪄", title: "AI 自動整理", text: "自動判斷日期、金額與分類，一次多筆也沒問題" },
  { icon: "📊", title: "統計一目了然", text: "每日、每月、每年的花費與分類比例清清楚楚" },
  { icon: "👥", title: "多人一起記", text: "和家人、室友共用帳本，誰記的都看得到" },
] as const;

/** 登入頁的產品介紹：AI 記帳示範 + 功能列表 */
export function LandingShowcase() {
  return (
    <div className="flex flex-col gap-8">
      {/* 示範卡片：輸入一句話 → AI 拆成紀錄 */}
      <div className="relative">
        <div className="rounded-[28px] bg-surface p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm">🙂</span>
            <p className="rounded-2xl rounded-tl-md bg-surface-2 px-4 py-2.5 text-[15px]">
              午餐拉麵 180，下班搭捷運 35
            </p>
          </div>
          <div className="my-4 flex items-center gap-2 text-xs font-semibold text-accent">
            <span className="h-px flex-1 bg-line" />
            <span className="flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1">✨ AI 已整理成 2 筆</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <ul className="flex flex-col gap-2">
            {(
              [
                ["午餐拉麵", "餐飲", 180],
                ["下班搭捷運", "交通", 35],
              ] as const
            ).map(([description, category, amount]) => (
              <li key={description} className="flex items-center gap-3 rounded-2xl px-1 py-1">
                <CategoryIcon category={category} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{description}</p>
                  <p className="text-xs text-ink-3">{category} · 今天</p>
                </div>
                <span className="font-semibold tabular-nums">-${amount}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 漂浮的小統計卡 */}
        <div className="animate-float absolute -top-6 -right-2 hidden rounded-2xl bg-surface px-4 py-3 shadow-card sm:block">
          <p className="text-[11px] font-medium text-ink-3">本月支出</p>
          <p className="text-lg font-bold tabular-nums">$12,480</p>
          <div className="mt-1.5 flex h-6 items-end gap-1">
            {[40, 70, 35, 90, 55, 75, 60].map((h, i) => (
              <span key={i} className="w-1.5 rounded-full bg-brand" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-3xl bg-surface/70 p-4 ring-1 ring-line backdrop-blur">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-lg">
              {icon}
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-3">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
