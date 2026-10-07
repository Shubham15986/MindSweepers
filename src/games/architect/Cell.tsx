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
  onSelect: (idx: number) => void;
};

// Memoized on primitives so only cells whose props change re-render.
function CellImpl({ idx, n, value, notes, given, selected, peer, dup, wrong, dimmed, onSelect }: Props) {
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
      <span className="ar-tower" style={{ transform: "scaleY(" + frac + ")", opacity: value ? 1 : 0 }} />
      <span className="ar-cap" style={{ bottom: (frac * 100) + "%", opacity: value ? 0.9 : 0 }} />
      {value ? (
        <span className="ar-num">{value}</span>
      ) : notes ? (
        <span className="ar-notes" aria-hidden>
          {Array.from({ length: n }, (_, k) => <span key={k}>{notes & (1 << (k + 1)) ? k + 1 : ""}</span>)}
        </span>
      ) : null}
      {(dup || wrong) && <AlertTriangle size={10} strokeWidth={2.5} className="ar-mark" aria-hidden />}
    </button>
  );
}

export default memo(CellImpl);
