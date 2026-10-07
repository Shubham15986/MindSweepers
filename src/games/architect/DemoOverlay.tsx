import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { DEMO } from "./config";
import { computeClues, SIDES, type Side } from "./solver";
import { lineIndex } from "./useArchitect";

const CAPTIONS = ["Clues count visible towers", "Taller towers hide shorter ones", "Fill every row and column once", "Match every clue to solve it"];
const N = 4;
const CLUES = computeClues(DEMO.grid, N);
// Scenes 1–2 focus on row 0 seen from the left: 2 1 4 3 -> towers 2 and 4 visible.
const ROW = [0, 1, 2, 3];
const VISIBLE = new Set([0, 2]);

// Self-contained looping walkthrough. It never touches real game state.
export default function DemoOverlay({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const [scene, setScene] = useState(0);
  const [loop, setLoop] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (scene === 3) { setScene(0); setLoop((l) => l + 1); } else setScene(scene + 1);
    }, DEMO.sceneMs + (scene === 2 ? 1200 : 0));
    return () => clearTimeout(t);
  }, [scene]);

  const tpl = "0.72fr repeat(4, 1fr) 0.72fr";
  const key = scene + "-" + loop;
  const clue = (side: Side, i: number) => {
    const focus = scene < 2 && side === "left" && i === 0;
    const ok = scene === 3;
    return (
      <div key={side + i} className={"ar-clue" + (ok || focus ? " is-ok" : "")} style={{ opacity: scene < 2 && !focus ? 0.3 : 1 }}>
        {CLUES[side][i]}
        {ok && <Check key={key} size={9} strokeWidth={3} className="ar-clue-icon ar-demo-in" style={{ animationDelay: (SIDES.indexOf(side) * 4 + i) * 60 + "ms" }} aria-hidden />}
      </div>
    );
  };
  const cell = (idx: number) => {
    const v = DEMO.grid[idx];
    const inRow = ROW.includes(idx);
    const shown = scene === 3 || (scene < 2 ? inRow : true);
    const order = scene === 2 ? idx : 0;
    const frac = (v / N) * 0.82;
    return (
      <div key={key + idx} className="ar-cell" style={{ opacity: scene < 2 && !inRow ? 0.35 : 1, cursor: "default" }}>
        {shown && (
          <div className={"absolute inset-0 grid place-items-center" + (scene === 2 ? " ar-demo-pop" : "") + (scene === 1 && inRow && !VISIBLE.has(idx) ? " ar-demo-dim" : "")}
            style={{ transformStyle: 'preserve-3d', animationDelay: scene === 2 ? order * 200 + "ms" : scene === 1 ? "500ms" : undefined }}>
            <div className="ar-tower-3d" style={{ opacity: 1 }}>
              <div className="ar-face top" style={{ transform: `translateZ(${frac * 45 * 1.5}px)` }}>
                <span className="ar-num-3d" style={{ transform: 'translateZ(2px)' }}>{v}</span>
              </div>
              <div className="ar-face front" style={{ height: `${frac * 45 * 1.5}px`, transform: `rotateX(-90deg)` }} />
              <div className="ar-face right" style={{ width: `${frac * 45 * 1.5}px`, transform: `rotateY(90deg)` }} />
              <div className="ar-face back" style={{ height: `${frac * 45 * 1.5}px`, transform: `rotateX(90deg)` }} />
              <div className="ar-face left" style={{ width: `${frac * 45 * 1.5}px`, transform: `rotateY(-90deg)` }} />
            </div>
          </div>
        )}
        {scene === 0 && VISIBLE.has(idx) && <span className="ar-demo-ring" style={{ animationDelay: 400 + idx * 300 + "ms" }} />}
      </div>
    );
  };

  const items: React.ReactNode[] = [<div key="a" />];
  for (let c = 0; c < N; c++) items.push(clue("top", c));
  items.push(<div key="b" />);
  for (let r = 0; r < N; r++) {
    items.push(clue("left", r));
    for (let c = 0; c < N; c++) items.push(cell(lineIndex(N, "left", r, c)));
    items.push(clue("right", r));
  }
  items.push(<div key="c" />);
  for (let c = 0; c < N; c++) items.push(clue("bottom", c));
  items.push(<div key="d" />);

  return (
    <div className="g-overlay ar-fade" role="dialog" aria-modal="true" aria-label="ARCHITECT demo">
      <div className="g-card w-full max-w-sm p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between">
          <span className="g-eyebrow">Demo</span>
          <div className="flex gap-1.5">{CAPTIONS.map((_, k) => <span key={k} className={"ar-dot" + (k === scene ? " is-on" : "")} />)}</div>
        </div>
        <p key={key} className="ar-demo-caption ar-rise" aria-live="polite">{CAPTIONS[scene]}</p>
        <div className="ar-board-scene">
          <div className="ar-board-container" style={{ transform: "rotateX(25deg) rotateZ(0deg)", width: "min(100%, 300px)", margin: "0 auto" }}>
            <div className="ar-board pointer-events-none" aria-hidden
              style={{ gridTemplateColumns: tpl, gridTemplateRows: tpl, gap: 4, ["--ar-fs" as string]: "20px" }}>
              {items}
            </div>
          </div>
        </div>
        <div className="text-sm text-(--dim) space-y-1.5 px-1 pb-2">
          <p className="font-semibold text-(--fg)">How to play:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fill the grid so every row and column has towers of height 1 to {N} exactly once.</li>
            <li>The clues on the edges tell you how many towers are visible looking down that line.</li>
            <li>Taller towers block the view of shorter towers behind them.</li>
          </ul>
          <p className="font-semibold text-(--fg) mt-3">Example: Look at the top row (2, 1, 4, 3)</p>
          <ul className="list-disc pl-5 space-y-2 mt-1">
            <li><strong>From the left side (Clue is 2):</strong> You can see the <strong>2</strong>-tower. It completely hides the shorter 1-tower behind it. Then you see the giant <strong>4</strong>-tower, which completely hides the 3-tower. Total towers you can see = 2.</li>
            <li><strong>From the right side (Clue is 2):</strong> You can see the <strong>3</strong>-tower, and the taller <strong>4</strong>-tower behind it. The giant 4-tower blocks everything else. Total towers you can see = 2.</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="g-btn-ghost flex-1">Skip demo</button>
          <button type="button" onClick={onStart} className="g-btn-primary flex-1">Start game</button>
        </div>
      </div>
    </div>
  );
}
