import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const RULES = [
  "Fill the grid with towers of heights 1 to N. No two towers of the same height can be in the same row or column.",
  "The numbers outside the grid tell you how many towers you can see from that side.",
  "A taller tower completely hides any shorter towers behind it.",
  "Darkened towers are already built and cannot be moved.",
  "The puzzle is solved when every outside number is satisfied."
];
const TIPS = [
  "If an outside number is 1, the tallest possible tower must be right on the edge.",
  "If a number is the maximum height, the towers must be arranged from shortest to tallest.",
  "If opposite sides both have a '2', the tallest tower is usually in the middle.",
  "Use the 'N' tool to jot down notes for possible tower heights in a cell.",
];

function Line({ label, row, clue, reverse }: { label: string; row: number[]; clue: number; reverse?: boolean }) {
  // Visible towers counted from the clue's side.
  const seq = reverse ? [...row].reverse() : row;
  let max = 0;
  const vis = new Set<number>();
  seq.forEach((h) => { if (h > max) { max = h; vis.add(h); } });
  const cells = row.map((h) => (
    <span key={h} className={"relative grid place-items-end justify-items-center w-10 h-12 rounded-md border " + (vis.has(h) ? "border-(--accent)" : "border-(--line) opacity-50")}>
      <span className="absolute inset-x-2 bottom-0 bg-(--fg)/10 border-t-2 border-(--accent)" style={{ height: (h / 4) * 80 + "%" }} />
      <span className="relative pb-1 text-(--fg) font-semibold tabular text-sm">{h}</span>
    </span>
  ));
  const c = <span className="w-8 text-center text-(--accent-ink) font-semibold tabular text-lg">{clue}</span>;
  return (
    <div>
      <p className="text-xs text-(--dim) mb-2">{label}</p>
      <div className="flex items-end gap-1.5">{!reverse && c}{cells}{reverse && c}</div>
    </div>
  );
}

export default function HowToPlay({ onClose, firstRun }: { onClose: () => void; firstRun?: boolean }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div className="g-overlay ar-fade" role="dialog" aria-modal="true" aria-labelledby="ar-htp" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
      <div className="g-card relative w-full max-w-lg p-6 md:p-8 ar-rise max-h-full overflow-y-auto">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-11 h-11 grid place-items-center text-(--dim) hover:text-(--fg)"><X size={18} /></button>
        <p className="g-eyebrow">{firstRun ? "Before you build" : "How to play"}</p>
        <h2 id="ar-htp" className="text-(--fg) font-light text-4xl mt-1">Read the skyline</h2>
        <ol className="mt-5 space-y-2.5 text-sm text-(--fg)">
          {RULES.map((r, i) => (
            <li key={i} className="flex gap-3"><span className="tabular text-(--accent-ink) font-semibold w-4 shrink-0">{i + 1}</span>{r}</li>
          ))}
        </ol>
        <div className="mt-6 rounded-xl border border-(--line) p-4 space-y-4">
          <p className="g-eyebrow">Worked example</p>
          <Line label="From the left, 2 1 4 3 shows 2 and 4, so the clue is 2." row={[2, 1, 4, 3]} clue={2} />
          <Line label="From the right, 3 4 1 2 shows 2 and 4, so the clue is 2." row={[3, 4, 1, 2]} clue={2} reverse />
        </div>
        <p className="g-eyebrow mt-6">Tips</p>
        <ul className="mt-2 space-y-1.5 text-sm text-(--dim)">{TIPS.map((t) => <li key={t}>· {t}</li>)}</ul>
        <button ref={btn} type="button" onClick={onClose} className="g-btn-primary w-full mt-7">{firstRun ? "Start building" : "Got it"}</button>
      </div>
    </div>
  );
}
