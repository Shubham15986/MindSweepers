import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const RULES = [
  "Every tile is either a magnet (one + pole, one − pole) or entirely blank.",
  "The numbers outside the grid tell you exactly how many + and − poles are in that row or column.",
  "Identical poles repel! You cannot have + next to +, or − next to −. Blank tiles can touch anything.",
  "The puzzle is solved when you fill the board, match all the numbers, and no identical poles are touching.",
  "Sometimes there is a completely unused square in the grid (shown as a dark gap).",
];
const TIPS = [
  "If a number is 0, there are absolutely no poles of that type in that line. That's a great place to start!",
  "Once a line has all the poles it needs, fill the rest of the line with blanks."
];
const CONTROLS = [
  "Just tap a domino repeatedly to cycle between its different pole states.",
  "On desktop, you can use Right-Click to quickly make a tile blank.",
  "Tap on a number clue to cross it out once you have finished it."
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
