import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const RULES = [
  "Every domino is either a magnet (one crimson + end, one cyan − end) or blank (neutral on both ends).",
  "Numbers around the grid count the crimson + and cyan − poles in that row or column. + clues are on the top and left, − clues on the bottom and right.",
  "No two identical poles may touch up, down, left or right: + next to + or − next to − repel. Neutral ends can touch anything.",
  "The puzzle is solved when every domino is decided, every shown clue matches, and no like poles touch.",
  "If the grid has an odd number of squares, one square is left empty and unused (a small dark gap).",
];
const TIPS = [
  "Clue 0 means the line has no poles of that type, so those cells must be blank or the other pole.",
  "A domino whose both halves lie in a row with a 0 + clue can only be blank or have its + in another row.",
  "When a row or column already meets its pole counts, the remaining dominoes there must be blank."
];
const CONTROLS = [
  "Tap with no tool: + here, + there, blank, empty. Long press toggles blank.",
  "Right-click toggles blank. Arrows move, Enter places or flips a magnet, Space toggles blank.",
  "Tap a clue to grey it out when you're done with it."
];

export default function HowToPlay({ onClose, firstRun }: { onClose: () => void; firstRun?: boolean }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div className="g-overlay pl-fade" role="dialog" aria-modal="true" aria-labelledby="pl-htp" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
      <div className="g-card relative w-full max-w-lg p-6 md:p-8 pl-rise max-h-full overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-11 h-11 grid place-items-center text-(--dim) hover:text-(--fg)"><X size={18} /></button>
        <p className="g-eyebrow">{firstRun ? "Before you begin" : "How to play"}</p>
        <h2 id="pl-htp" className="text-(--fg) font-light text-4xl mt-1">Two poles. No contact.</h2>
        <ol className="mt-5 space-y-2.5 text-sm text-(--fg)">
          {RULES.map((r, i) => <li key={i} className="flex gap-3"><span className="tabular text-(--accent-ink) font-semibold w-4 shrink-0">{i + 1}</span>{r}</li>)}
        </ol>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs font-medium text-[var(--fg)]">
          <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff416c] to-[#ff4b2b] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-red-500/20">+</span> positive (crimson)</span>
          <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00b4db] to-[#0083b0] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-cyan-500/20">−</span> negative (cyan)</span>
          <span className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-[var(--muted)] border border-[var(--line)] flex items-center justify-center text-[10px] text-[var(--dim)] font-mono">░</span> blank</span>
        </div>
        <p className="g-eyebrow mt-6">Tips</p>
        <ul className="mt-2 space-y-1.5 text-sm text-(--dim)">{TIPS.map((t) => <li key={t}>· {t}</li>)}</ul>
        <p className="g-eyebrow mt-6">Controls</p>
        <ul className="mt-2 space-y-1.5 text-sm text-(--dim)">{CONTROLS.map((t) => <li key={t}>· {t}</li>)}</ul>
        <button ref={btn} type="button" onClick={onClose} className="g-btn-primary w-full mt-7">{firstRun ? "Start" : "Got it"}</button>
        <p className="mt-5 text-[11px] text-(--dim) text-center">Puzzle concept: Janko. Magnets as a collection puzzle: James Harvey.</p>
      </div>
    </div>
  );
}
