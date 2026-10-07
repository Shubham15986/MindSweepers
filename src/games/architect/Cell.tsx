import { memo } from "react";
import { AlertTriangle } from "lucide-react";
import { BOARD } from "./config";

type Props = {
  idx: number;
  n: number;
  value: number;
  notes: number;
  given: boolean;
  selected: boolean;
  peer: boolean;
  dup: boolean;
  wrong: boolean;
  dimmed?: boolean;
  cellSize: number;
  boardRotZ: number;
  onSelect: (idx: number) => void;
};

// Memoized on primitives so only cells whose props change re-render.
function CellImpl({ idx, n, value, notes, given, selected, peer, dup, wrong, dimmed, cellSize, boardRotZ, onSelect }: Props) {
  const r = Math.floor(idx / n) + 1, c = (idx % n) + 1;
  const frac = (value / n) * BOARD.towerMax;
  const label = "Row " + r + ", column " + c + ", " + (value ? "height " + value : "empty") + (given ? ", locked" : "") + (dup ? ", duplicate" : "") + (wrong ? ", incorrect" : "");
  return (
    <button
      type="button"
      style={{ opacity: dimmed ? 0.3 : 1 }}
      data-idx={idx}
      role="gridcell"
      aria-label={label}
      aria-selected={selected}
      aria-readonly={given || undefined}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(idx)}
      className={"ar-cell" + (given ? " is-given" : "") + (selected ? " is-sel" : "") + (peer && !selected ? " is-peer" : "") + (dup ? " is-dup" : "") + (wrong ? " is-wrong" : "")}
    >
      <div className="ar-tower-3d" style={{ opacity: value ? 1 : 0 }}>
        <div className="ar-face top" style={{ transform: `translateZ(${frac * cellSize * 1.5}px)` }}>
          {value ? <span className="ar-num-3d" style={{ transform: `rotateZ(${-boardRotZ}deg) translateZ(2px)` }}>{value}</span> : null}
        </div>
        <div className="ar-face front" style={{ height: `${frac * cellSize * 1.5}px`, transform: `rotateX(-90deg)` }} />
        <div className="ar-face right" style={{ width: `${frac * cellSize * 1.5}px`, transform: `rotateY(90deg)` }} />
        <div className="ar-face back" style={{ height: `${frac * cellSize * 1.5}px`, transform: `rotateX(90deg)` }} />
        <div className="ar-face left" style={{ width: `${frac * cellSize * 1.5}px`, transform: `rotateY(-90deg)` }} />
      </div>
      {!value && notes ? (
        <span className="ar-notes" aria-hidden>
          {Array.from({ length: n }, (_, k) => <span key={k}>{notes & (1 << (k + 1)) ? k + 1 : ""}</span>)}
        </span>
      ) : null}
      {(dup || wrong) && <AlertTriangle size={10} strokeWidth={2.5} className="ar-mark" aria-hidden />}
    </button>
  );
}

export default memo(CellImpl);
