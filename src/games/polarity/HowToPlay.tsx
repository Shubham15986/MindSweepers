import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const RULES = [
  "Every domino is either a magnet (one mint + end, one coral − end) or blank (neutral on both ends).",
  "Numbers around the grid count the mint + and coral − poles in that row or column. + clues are on the top and left, − clues on the bottom and right.",
  "No two identical poles may touch up, down, left or right: + next to + or − next to − repel. Neutral ends can touch anything.",
  "The puzzle is solved when every domino is decided, every shown clue matches, and no like poles touch.",
  "If the grid has an odd number of squares, one square is left empty and unused (a small dark gap).",
];
const TIPS = [
  "Clue 0 means the line has no poles of that type, so those cells must be blank or the other pole.",
  "A domino whose both halves lie in a row with a 0 + clue can only be blank or have its + in another row.",
  "When a row or column already meets its pole counts, the remaining dominoes there must be blank.",
  "Use \"cannot be blank\" (?) marks for deductions.",
];
const CONTROLS = [
  "Tap with no tool: + here, + there, blank, ?, empty. Long press toggles blank.",
  "Right-click cycles blank and ?. Arrows move, Enter places or flips a magnet, Space cycles blank and ?.",
  "Tap a clue to grey it out when you're done with it.",
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
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-(--line) p-4 text-xs text-(--dim)">
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-(--plus)" />positive (mint)</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-(--minus)" />negative (coral)</span>
          <span className="flex items-center gap-1.5"><span className="w-7 h-7 rounded-md bg-(--muted)" />blank</span>
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
