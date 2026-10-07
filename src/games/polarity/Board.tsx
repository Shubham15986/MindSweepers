import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Clues, Layout } from "./solver";
import { pole } from "./solver";
import { BOARD } from "./config";
import { useFitCell } from "../common/useFit";
import { QMARK, UNDECIDED, type Action } from "./usePolarity";
import Domino from "./Domino";
import ClueCell, { type ClueStatus } from "./ClueCell";

type Props = {
  layout: Layout & { empty: number; clues: Clues };
  states: number[];
  wrong?: number[];
  done?: string[];
  cursor?: number;
  interactive: boolean;
  minCell: number;
  className?: string;
  /** fit to the box height too (off for the demo) */
  fitHeight?: boolean;
  onAct?: (x: number, action: Action | "tap") => void;
  onToggleDone?: (id: string) => void;
};

const noop = () => {};

export default function Board({ layout, states, wrong = [], done = [], cursor = -1, interactive, minCell, className = "", fitHeight = true, onAct = noop, onToggleDone = noop }: Props) {
  const { rows, cols, dom, doms, empty, clues } = layout;
  const root = useRef<HTMLDivElement>(null);
  const actRef = useRef(onAct);
  actRef.current = onAct;
  const act = useCallback((x: number, a: Action | "tap") => actRef.current(x, a), []);
  const doneRef = useRef(onToggleDone);
  doneRef.current = onToggleDone;
  const toggle = useCallback((id: string) => { if (interactive) doneRef.current(id); }, [interactive]);

  // Validation: pole per cell, like poles touching orthogonally.
  const { clash } = useMemo(() => {
    const cp = new Array(rows * cols).fill(0);
    doms.forEach((d, i) => { if (states[i] === 1 || states[i] === 2) for (const x of d) cp[x] = pole(d, states[i], x); });
    const clash = new Set<number>();
    for (let x = 0; x < rows * cols; x++) {
      if (!cp[x]) continue;
      if (x % cols + 1 < cols && cp[x + 1] === cp[x]) clash.add(x).add(x + 1);
      if (x + cols < rows * cols && cp[x + cols] === cp[x]) clash.add(x).add(x + cols);
    }
    return { clash };
  }, [doms, states, rows, cols]);

  // Clue status: ok when the count matches with nothing undecided in the line;
  // bad when exceeded, or unreachable even if every undecided domino adds one pole.
  const status = useMemo(() => {
    const plus: ClueStatus[] = [], minus: ClueStatus[] = [];
    for (let li = 0; li < rows + cols; li++) {
      const cells = li < rows ? Array.from({ length: cols }, (_, c) => li * cols + c) : Array.from({ length: rows }, (_, r) => r * cols + li - rows);
      let p = 0, m = 0;
      const und = new Set<number>();
      for (const x of cells) {
        const d = dom[x];
        if (d < 0) continue;
        const s = states[d];
        if (s === UNDECIDED || s === QMARK) und.add(d);
        else if (s) { if (pole(doms[d], s, x) > 0) p++; else m++; }
      }
      const st = (have: number, k: number): ClueStatus => (k < 0 ? "none" : have > k || have + und.size < k ? "bad" : have === k && !und.size ? "ok" : "none");
      plus.push(st(p, clues.plus[li]));
      minus.push(st(m, clues.minus[li]));
    }
    return { plus, minus };
  }, [rows, cols, dom, doms, states, clues]);

  const wrongSet = useMemo(() => new Set(wrong), [wrong]);
  const doneSet = useMemo(() => new Set(done), [done]);

  // Keep keyboard focus on the cursor cell while navigating.
  useEffect(() => {
    const el = root.current;
    if (el && el.contains(document.activeElement)) el.querySelector<HTMLElement>('[data-cell="' + cursor + '"]')?.focus();
  }, [cursor]);

  const clue = (kind: "plus" | "minus", li: number, row: number, col: number) => {
    const id = kind[0] + li;
    const where = li < rows ? "Row " + (li + 1) + ", " + (kind === "plus" ? "left" : "right") + " clue" : "Column " + (li - rows + 1) + ", " + (kind === "plus" ? "top" : "bottom") + " clue";
    return (
      <div key={id} style={{ gridRow: row, gridColumn: col }} className="grid">
        <ClueCell id={id} where={where} sign={kind === "plus" ? "+" : "−"} value={clues[kind][li]} status={status[kind][li]} done={doneSet.has(id)} onToggle={toggle} />
      </div>
    );
  };

  const items: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) { items.push(clue("plus", rows + c, 1, c + 2), clue("minus", rows + c, rows + 2, c + 2)); }
  for (let r = 0; r < rows; r++) { items.push(clue("plus", r, r + 2, 1), clue("minus", r, r + 2, cols + 2)); }
  doms.forEach(([a, b], d) => items.push(
    <Domino key={d} d={d} a={a} b={b} cols={cols} state={states[d]} wrong={wrongSet.has(d)} clashA={clash.has(a)} clashB={clash.has(b)}
      cursor={interactive ? (cursor === a ? 1 : cursor === b ? 2 : 0) : 0} interactive={interactive} onAct={act} />,
  ));
  if (empty >= 0) items.push(<div key="gap" className="pl-gap" aria-label="Unused square" style={{ gridRow: Math.floor(empty / cols) + 2, gridColumn: (empty % cols) + 2 }} />);

  const ratio = BOARD.clueRatio;
  const chrome = 2 * BOARD.pad + 2;
  const { box, cell } = useFitCell(cols + 2 * ratio, rows + 2 * ratio, chrome + (cols + 1) * BOARD.gap, chrome + (rows + 1) * BOARD.gap, minCell, BOARD.maxCellPx, fitHeight);
  const track = (n: number) => Math.round(cell * ratio) + "px repeat(" + n + ", " + cell + "px) " + Math.round(cell * ratio) + "px";

  return (
    <div ref={box} className={"pl-box " + className}>
      <div ref={root} role="grid" aria-label={cols + " by " + rows + " magnet grid"} className="pl-grid"
        style={{ gridTemplateColumns: track(cols), gridTemplateRows: track(rows), ["--u" as string]: cell + "px", ["--gap" as string]: BOARD.gap + "px", ["--pad" as string]: BOARD.pad + "px" }}>
        {items}
      </div>
    </div>
  );
}
