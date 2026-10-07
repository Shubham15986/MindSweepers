import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Puzzle } from "./generator";
import { SIDES, visible, type Side } from "./solver";
import { BOARD } from "./config";
import { lineIndex } from "./useArchitect";
import Cell from "./Cell";
import { useFitCell } from "../common/useFit";
import ClueCell, { type ClueStatus } from "./ClueCell";

type Props = {
  puzzle: Puzzle;
  cells: number[];
  notes: number[];
  selected: number;
  wrong: number[];
  dim: boolean;
  interactive: boolean;
  onSelect: (i: number) => void;
  className?: string;
};

export default function Board({ puzzle, cells, notes, selected, wrong, dim, interactive, onSelect, className = "" }: Props) {
  const n = puzzle.n;
  const root = useRef<HTMLDivElement>(null);
  const selRef = useRef(onSelect);
  selRef.current = onSelect;
  const handleSelect = useCallback((i: number) => { if (interactive) selRef.current(i); }, [interactive]);

  // Duplicate warning: a height repeated in the same row or column.
  const dups = useMemo(() => {
    const d = new Set<number>();
    for (let i = 0; i < n * n; i++) {
      if (!cells[i]) continue;
      const r = Math.floor(i / n), c = i % n;
      for (let k = 0; k < n; k++) {
        const a = r * n + k, b = k * n + c;
        if (a !== i && cells[a] === cells[i]) d.add(i).add(a);
        if (b !== i && cells[b] === cells[i]) d.add(i).add(b);
      }
    }
    return d;
  }, [cells, n]);

  // Clue check: neutral until its line is full, then compare the visible count.
  const status = useMemo(() => {
    const out = {} as Record<Side, ClueStatus[]>;
    for (const side of SIDES) {
      out[side] = puzzle.clues[side].map((clue, i) => {
        if (!clue) return "none";
        const line = Array.from({ length: n }, (_, k) => cells[lineIndex(n, side, i, k)]);
        if (line.some((v) => !v)) return "none";
        return visible(line) === clue ? "ok" : "bad";
      });
    }
    return out;
  }, [cells, n, puzzle.clues]);

  const wrongSet = useMemo(() => new Set(wrong), [wrong]);

  // Keep keyboard focus on the selected cell when selection moves.
  useEffect(() => {
    const el = root.current;
    if (el && el.contains(document.activeElement) && document.activeElement !== el) {
      el.querySelector<HTMLElement>('[data-idx="' + selected + '"]')?.focus();
    }
  }, [selected]);

  const sr = Math.floor(selected / n), sc = selected % n;
  const units = n + 2 * BOARD.clueRatio, chrome = 12 + (n + 1) * BOARD.gap;
  const { box, cell } = useFitCell(units, units, chrome, chrome, BOARD.minCell, BOARD.maxCell);
  const tpl = Math.round(cell * BOARD.clueRatio) + "px repeat(" + n + ", " + cell + "px) " + Math.round(cell * BOARD.clueRatio) + "px";
  const fs = Math.round(cell * 0.46) + "px";
  const clue = (side: Side, i: number) => <ClueCell key={side + i} side={side} i={i} value={puzzle.clues[side][i]} status={status[side][i]} dim={dim} />;
  const corner = (k: string) => <div key={k} aria-hidden />;

  const items: React.ReactNode[] = [corner("c0")];
  for (let c = 0; c < n; c++) items.push(clue("top", c));
  items.push(corner("c1"));
  for (let r = 0; r < n; r++) {
    items.push(clue("left", r));
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      items.push(
        <Cell key={i} idx={i} n={n} value={cells[i]} notes={notes[i]} given={!!puzzle.givens[i]}
          selected={interactive && i === selected} peer={interactive && (r === sr || c === sc)}
          dup={dups.has(i)} wrong={wrongSet.has(i)} onSelect={handleSelect} />,
      );
    }
    items.push(clue("right", r));
  }
  items.push(corner("c2"));
  for (let c = 0; c < n; c++) items.push(clue("bottom", c));
  items.push(corner("c3"));

  return (
    <div ref={box} className={"ar-boardwrap " + className}>
      <div ref={root} role="grid" aria-label={n + " by " + n + " tower grid"} className="ar-board"
        style={{ gridTemplateColumns: tpl, gridTemplateRows: tpl, gap: BOARD.gap, ["--ar-fs" as string]: fs }}>
        {items}
      </div>
    </div>
  );
}
