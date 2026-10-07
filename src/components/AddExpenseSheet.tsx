"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ExpenseDTO } from "@/lib/expenseConstants";

const EXAMPLES = ["午餐拉麵 180", "昨天搭計程車 250", "全聯買菜 632，飲料 55", "這個月薪水 45000"];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (expenses: ExpenseDTO[]) => void;
};

export function AddExpenseSheet({ open, onClose, onCreated }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => textareaRef.current?.focus(), 250);
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 401) {
        router.replace("/login"); // 登入過期
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      if (data.expenses.length === 0) {
        setError("沒有辨識到收支資訊，試著寫出品項和金額");
        return;
      }
      setText("");
      onCreated(data.expenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="AI 記帳"
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[32px] bg-surface px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-slate-900/20 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-base shadow-brand">✨</span>
            用一句話記帳
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-medium text-ink-2 active:bg-line"
          >
            取消
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter 送出，Shift+Enter 換行；輸入法選字中不送出
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="例如：早餐蛋餅 45，晚上和朋友看電影 320"
          rows={3}
          maxLength={1000}
          disabled={loading}
          className="w-full resize-none rounded-2xl bg-surface-2 p-4 text-base ring-1 ring-line transition placeholder:text-ink-3 focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:outline-none disabled:opacity-60"
        />

        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setText(example)}
              className="shrink-0 rounded-full bg-accent-tint px-3.5 py-1.5 text-sm font-medium text-accent active:bg-accent-soft/60"
            >
              {example}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-accent-ink shadow-brand transition-opacity active:opacity-85 disabled:opacity-40 disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
              AI 分析中…
            </>
          ) : (
            "記一筆"
          )}
        </button>
      </form>
    </div>
  );
}
