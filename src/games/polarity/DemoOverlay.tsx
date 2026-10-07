import { useEffect, useMemo, useState } from "react";
import { DEMO } from "./config";
import { computeClues, type Layout } from "./solver";
import { UNDECIDED } from "./usePolarity";
import Board from "./Board";
import { POL_DEMO_CSS } from "./styles";

const CAPTIONS = ["Silhouettes hide magnets and blanks", "Clues count mint and coral poles", "Same colours must never touch", "Fill every domino to solve"];
const FILL_MS = 380;

// Self-contained looping walkthrough on a fixed 4x3 board. It never touches real game state.
export default function DemoOverlay({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const layout = useMemo(() => {
    const dom = new Array(DEMO.cols * DEMO.rows).fill(-1);
    DEMO.doms.forEach(([a, b], i) => { dom[a] = dom[b] = i; });
    const L: Layout = { rows: DEMO.rows, cols: DEMO.cols, dom, doms: DEMO.doms };
    return { ...L, empty: -1, clues: computeClues(L, DEMO.solution) };
  }, []);
  const [scene, setScene] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Scene 2 flips after a beat; scene 3 fills one domino per step.
    const steps = scene === 2 ? 1 : scene === 3 ? DEMO.doms.length : 0;
    const t = step < steps
      ? window.setTimeout(() => setStep(step + 1), scene === 2 ? 1700 : FILL_MS)
      : window.setTimeout(() => { setScene((scene + 1) % 4); setStep(0); }, scene === 3 ? 1800 : DEMO.sceneMs - (scene === 2 ? 1700 : 0));
    return () => clearTimeout(t);
  }, [scene, step]);

  const states = useMemo(() => {
    const st = new Array(DEMO.doms.length).fill(UNDECIDED);
    if (scene === 2) {
      // Show only the two magnets that meet: wrong way round first, then flipped.
      st[2] = DEMO.solution[2];
      st[DEMO.flip] = step === 0 ? 3 - DEMO.solution[DEMO.flip] : DEMO.solution[DEMO.flip];
    }
    if (scene === 3) for (let d = 0; d < step; d++) st[d] = DEMO.solution[d];
    return st;
  }, [scene, step]);

  return (
    <div className="g-overlay pl-fade" role="dialog" aria-modal="true" aria-label="POLARITY demo">
      <style>{POL_DEMO_CSS}</style>
      <div className="g-card w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="g-eyebrow">Demo</span>
          <div className="flex gap-1.5">{CAPTIONS.map((_, k) => <span key={k} className={"pl-dot" + (k === scene ? " is-on" : "")} />)}</div>
        </div>
        <p key={scene} className="pl-demo-caption pl-rise" aria-live="polite">{CAPTIONS[scene]}</p>
        <div className="pointer-events-none mx-auto w-full max-w-[300px]" aria-hidden>
          <Board layout={layout} states={states} interactive={false} minCell={30} fitHeight={false}
            className={"pl-demo-board" + (scene === 1 ? " pl-demo-clues" : "")} />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="g-btn-ghost flex-1">Skip demo</button>
          <button type="button" onClick={onStart} className="g-btn-primary flex-1">Start game</button>
        </div>
      </div>
    </div>
  );
}
