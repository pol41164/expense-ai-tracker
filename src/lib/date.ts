// 所有「哪一天」的判斷都以台北時間為準

const TIME_ZONE = "Asia/Taipei";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** Date → "YYYY-MM-DD"（台北時間） */
export function toDayKey(date: Date | string) {
  return dayKeyFormatter.format(new Date(date));
}

export function todayKey() {
  return toDayKey(new Date());
}

/** "YYYY-MM-DD" → 台北時間當天 00:00 的 Date */
export function dayKeyToDate(dayKey: string) {
  return new Date(`${dayKey}T00:00:00+08:00`);
}

/** 在 dayKey 上加減天數 */
export function addDays(dayKey: string, days: number) {
  const date = dayKeyToDate(dayKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toDayKey(date);
}

/** "YYYY-MM-DD" → "YYYY-MM" */
export function monthKeyOf(dayKey: string) {
  return dayKey.slice(0, 7);
}

/** "YYYY-MM" → 該月第一天與下個月第一天（台北時間） */
export function monthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const nextMonthKey =
    month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  return { start: dayKeyToDate(`${monthKey}-01`), end: dayKeyToDate(`${nextMonthKey}-01`) };
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/** dayKey → 星期幾（"一"～"日"） */
export function weekdayOf(dayKey: string) {
  return WEEKDAYS[new Date(`${dayKey}T12:00:00Z`).getUTCDay()];
}
