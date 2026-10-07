export type Tab = "list" | "stats";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  onAdd: () => void;
};

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M5 20V11M12 20V4M19 20v-6" />
    </svg>
  );
}

export function BottomNav({ tab, onTabChange, onAdd }: Props) {
  const item = (value: Tab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => onTabChange(value)}
      aria-current={tab === value ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
        tab === value ? "text-accent" : "text-ink-3"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center rounded-[28px] bg-surface/85 shadow-card ring-1 ring-line backdrop-blur-xl">
        {item("list", "明細", <ListIcon />)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="新增記帳"
            className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-accent-ink shadow-brand ring-4 ring-background transition-transform active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        {item("stats", "統計", <StatsIcon />)}
      </div>
    </nav>
  );
}
