import { useMemo, useState } from "react";
import { X, ArrowLeft, ChevronRight } from "lucide-react";
import { DEMO } from "./config";
import { computeClues, type Layout } from "./solver";
import { UNDECIDED } from "./usePolarity";
import Board from "./Board";
import { POL_DEMO_CSS } from "./styles";

const DEMO_STEPS = [
  { title: "The Grid", text: "A 4×3 grid of dominoes hidden in silhouettes. Every domino is either a magnet (mint +, coral -) or completely blank.", states: [-1, -1, -1, -1, -1, -1], showClues: false, wrong: [] },
  { title: "The Clues", text: "Numbers around the grid count the poles. Mint (+) clues are top and left. Coral (-) clues are bottom and right.", states: [-1, -1, -1, -1, -1, -1], showClues: true, wrong: [] },
  { title: "Zero Clues", text: "Look at the middle row. It has 0 mint (+) poles. Any domino passing through here can only have coral (-) or be blank.", states: [-1, 0, -1, -1, 0, -1], showClues: true, wrong: [] },
  { title: "Repulsion", text: "Magnets obey physics. Like poles (+ next to + or - next to -) repel and must never touch. Let's see what happens if they do...", states: [-1, -1, 1, -1, -1, 1], showClues: true, wrong: [2, 5] },
  { title: "Stabilization", text: "When flipped correctly, they attract! Fill every domino correctly and match the clues to stabilize the dream.", states: [1, 0, 1, 2, 0, 2], showClues: true, wrong: [] }
];

export default function DemoOverlay({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const layout = useMemo(() => {
    const dom = new Array(DEMO.cols * DEMO.rows).fill(-1);
    DEMO.doms.forEach(([a, b], i) => { dom[a] = dom[b] = i; });
    const L: Layout = { rows: DEMO.rows, cols: DEMO.cols, dom, doms: DEMO.doms };
    return { ...L, empty: -1, clues: computeClues(L, DEMO.solution) };
  }, []);

  const [step, setStep] = useState(0);
  const last = DEMO_STEPS.length - 1;
  const cur = DEMO_STEPS[step];
  const done = step === last;

  return (
    <div className="fixed inset-0 z-50 bg-(--bg)/80 backdrop-blur-md grid place-items-center p-4 pl-fade" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)" }}>
      <style>{POL_DEMO_CSS}</style>
      <div className="pl-rise relative w-full max-w-3xl rounded-3xl bg-(--surface) text-(--fg) overflow-hidden shadow-2xl grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative bg-[#2b3e45] p-8 sm:p-10 grid place-items-center overflow-hidden">
          <div className="pointer-events-none mx-auto w-full max-w-[300px]" aria-hidden>
            <Board layout={layout} states={cur.states} wrong={cur.wrong} interactive={false} minCell={30} fitHeight={false}
              className={"pl-demo-board transition-all duration-700 " + (cur.showClues ? " pl-demo-clues" : "")} />
          </div>
          <span className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] tracking-[0.3em] text-(--dim)">STEP {step + 1} / {DEMO_STEPS.length}</span>
        </div>
        <div className="p-7 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono font-bold text-[10px] tracking-[0.3em] text-(--dim)">GUIDED DEMO</span>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full hover:bg-(--line)"><X size={17} /></button>
          </div>
          <div key={step} className="pl-rise flex-1">
            <p className="font-mono text-xs text-(--plus) mb-2">Step {String(step + 1).padStart(2, "0")}</p>
            <h3 className="text-2xl font-semibold tracking-tight mb-3">{cur.title}</h3>
            <p className="text-(--dim) leading-relaxed">{cur.text}</p>
          </div>
          <div className="flex gap-1.5 my-6">
            {DEMO_STEPS.map((_, i) => <button key={i} onClick={() => setStep(i)} aria-label={"Step " + (i + 1)} className={"h-1.5 rounded-full transition-all " + (i === step ? "w-8 bg-(--fg)" : i < step ? "w-3 bg-(--plus)" : "w-3 bg-(--line)")} />)}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="h-12 w-12 grid place-items-center rounded-2xl border border-(--line) disabled:opacity-30"><ArrowLeft size={18} /></button>
            {done
              ? <button onClick={onStart} className="flex-1 h-12 rounded-2xl bg-(--plus) text-[#16262c] font-semibold flex items-center justify-center gap-2">Enter The Dream <ChevronRight size={18} /></button>
              : <button onClick={() => setStep((s) => s + 1)} className="flex-1 h-12 rounded-2xl bg-(--fg) text-[#16262c] font-medium flex items-center justify-center gap-2">Next <ChevronRight size={18} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}
