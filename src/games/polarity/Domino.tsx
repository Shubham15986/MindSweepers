import { memo, useEffect, useRef } from "react";
import { BOARD } from "./config";
import { QMARK, type Action } from "./usePolarity";

type Props = {
  d: number;
  a: number;
  b: number;
  cols: number;
  state: number;
  wrong: boolean;
  clashA: boolean;
  clashB: boolean;
  /** 0 none, 1 cursor on a, 2 cursor on b */
  cursor: number;
  interactive: boolean;
  onAct: (x: number, action: Action | "tap") => void;
};

const poleName = (p: number) => (p > 0 ? "positive pole" : p < 0 ? "negative pole" : "");

// One domino spanning two grid tracks. Memoized so only the changed domino re-renders.
function DominoImpl({ a, b, cols, state, wrong, clashA, clashB, cursor, interactive, onAct }: Props) {
  const horiz = b === a + 1;
  const r = Math.floor(a / cols), c = a % cols;
  const press = useRef<{ t: number | undefined; fired: boolean }>({ t: undefined, fired: false });
  useEffect(() => () => clearTimeout(press.current.t), []);

  const half = (x: number, which: 1 | 2, clash: boolean) => {
    const p = state === 1 || state === 2 ? ((state === 1) === (which === 1) ? 1 : -1) : 0;
    const desc = p ? poleName(p) : state === 0 ? "blank" : state === QMARK ? "magnet, polarity unknown" : "undecided";
    return (
      <button
        type="button"
        data-cell={x}
        tabIndex={cursor === which ? 0 : -1}
        aria-label={"Row " + (Math.floor(x / cols) + 1) + ", column " + ((x % cols) + 1) + ", " + desc + (clash ? ", touching a like pole" : "") + (wrong ? ", incorrect" : "")}
        className={"pl-half" + (cursor === which ? " is-cursor" : "") + (clash ? " is-clash" : "")}
        onClick={() => { if (press.current.fired) { press.current.fired = false; return; } if (interactive) onAct(x, "tap"); }}
        onContextMenu={(e) => { e.preventDefault(); if (interactive) onAct(x, "blank"); }}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch" || !interactive) return;
          press.current.fired = false;
          press.current.t = window.setTimeout(() => { press.current.fired = true; onAct(x, "long"); }, BOARD.longPressMs);
        }}
        onPointerUp={() => clearTimeout(press.current.t)}
        onPointerLeave={() => clearTimeout(press.current.t)}
        onPointerCancel={() => clearTimeout(press.current.t)}
      >
        {p > 0 && <span key={state} className="pl-ring is-plus" aria-hidden></span>}
        {p < 0 && <span key={state} className="pl-ring is-minus" aria-hidden></span>}
        {state === QMARK && <span className="pl-q" aria-hidden>?</span>}
        {clash && <span className="pl-badge" aria-hidden>!</span>}
      </button>
    );
  };

  return (
    <div
      className={"pl-dom" + (horiz ? "" : " is-v") + (state === 0 ? " is-blank" : "") + (wrong ? " is-wrong" : "")}
      style={{ gridColumn: c + 2 + " / span " + (horiz ? 2 : 1), gridRow: r + 2 + " / span " + (horiz ? 1 : 2) }}
    >
      <span className="pl-fill" />
      {half(a, 1, clashA)}
      {half(b, 2, clashB)}
      {wrong && <span className="pl-badge is-x" aria-hidden>×</span>}
    </div>
  );
}

export default memo(DominoImpl);
