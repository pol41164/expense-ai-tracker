type Props = {
  label: string;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export function PeriodSwitcher({ label, prevLabel, nextLabel, onPrev, onNext, nextDisabled }: Props) {
  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-2 shadow-card transition-colors active:bg-surface-2 disabled:opacity-30";
  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={onPrev} aria-label={prevLabel} className={buttonClass}>
        <Chevron direction="left" />
      </button>
      <span className="text-lg font-semibold tracking-tight">{label}</span>
      <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel} className={buttonClass}>
        <Chevron direction="right" />
      </button>
    </div>
  );
}
