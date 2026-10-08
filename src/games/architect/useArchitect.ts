import { useCallback, useEffect, useRef, useState } from "react";
import GenWorker from "./generator.worker?worker&inline";
import { generateSteps, type Puzzle } from "./generator";
import { SIDES, type Side } from "./solver";
import { LEVELS, MAX_HINTS, scoreFor, today, type LevelKey } from "./config";
import { randomSeed } from "./rng";

export type Mode = "daily" | "free";
export type Phase = "start" | "loading" | "play" | "solved" | "revealed";
type Snapshot = { cells: number[]; notes: number[] };

export type ArchState = {
  phase: Phase;
  mode: Mode;
  level: LevelKey;
  puzzle: Puzzle | null;
  cells: number[];
  notes: number[]; // bitmask of pencil candidates per cell
  past: Snapshot[];
  future: Snapshot[];
  selected: number;
  pencil: boolean;
  dim: boolean;
  hints: number;
  message: string | null;
  wrong: number[]; // from Check, cleared on the next edit
  startedAt: number;
  timeMs: number;
  score: number | null;
};

const initial: ArchState = {
  phase: "start", mode: "free", level: "Easy", puzzle: null, cells: [], notes: [], past: [], future: [],
  selected: 0, pencil: false, dim: false, hints: 0, message: null, wrong: [], startedAt: 0, timeMs: 0, score: null,
};

/** Board index of the k-th cell a clue looks at, counted from the clue inward. */
export function lineIndex(n: number, side: Side, i: number, k: number) {
  if (side === "top") return k * n + i;
  if (side === "bottom") return (n - 1 - k) * n + i;
  if (side === "left") return i * n + k;
  return i * n + (n - 1 - k);
}

/** Generate in an inline Blob worker; fall back to time-sliced steps on the main thread. */
function useGenerator() {
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const job = useRef(0);

  const stop = useCallback(() => {
    job.current++;
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
  }, []);

  const generate = useCallback((level: LevelKey, seed: string, done: (p: Puzzle) => void) => {
    stop();
    const id = job.current;
    const spec = LEVELS[level].gen;
    try {
      const w = new GenWorker();
      worker.current = w;
      w.onmessage = (e: MessageEvent<{ id: number; puzzle: Puzzle }>) => {
        if (id !== job.current) return;
        w.terminate();
        worker.current = null;
        done(e.data.puzzle);
      };
      w.onerror = () => { w.terminate(); worker.current = null; if (id === job.current) sliced(); };
      w.postMessage({ id, spec, seed });
    } catch {
      sliced();
    }
    // ~8ms of work per frame so low-end phones never freeze.
    function sliced() {
      const it = generateSteps(spec, seed);
      const step = () => {
        if (id !== job.current) return;
        const until = performance.now() + 8;
        while (performance.now() < until) {
          const r = it.next();
          if (r.done) return done(r.value);
        }
        timer.current = window.setTimeout(step, 0);
      };
      step();
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { generate, stop };
}

export function useArchitect(seedProp?: string) {
  const [s, setState] = useState<ArchState>(initial);
  const ref = useRef(s);
  const set = useCallback((patch: Partial<ArchState>) => { ref.current = { ...ref.current, ...patch }; setState(ref.current); }, []);
  const { generate, stop } = useGenerator();

  const start = useCallback((level = ref.current.level, mode = ref.current.mode) => {
    const seed = mode === "daily" ? (seedProp ?? today()) + ":" + level : randomSeed() + ":" + level;
    set({ ...initial, mode, level, dim: ref.current.dim, phase: "loading" });
    generate(level, seed, (puzzle) => {
      const n = puzzle.n;
      const firstFree = puzzle.givens.findIndex((g) => !g);
      set({ phase: "play", puzzle, cells: puzzle.givens.slice(), notes: new Array(n * n).fill(0), selected: Math.max(0, firstFree), startedAt: Date.now() });
    });
  }, [generate, seedProp, set]);

  /** Apply a board change with undo history; finish if the board is complete and correct. */
  const commit = useCallback((cells: number[], notes: number[], extra: Partial<ArchState> = {}) => {
    const st = ref.current;
    if (!st.puzzle) return;
    const past = [...st.past, { cells: st.cells, notes: st.notes }];
    const patch: Partial<ArchState> = { ...extra, cells, notes, past, future: [], wrong: [] };
    // Only a full board is checked.
    if (cells.every((v) => v) && cells.every((v, i) => v === st.puzzle!.solution[i])) {
      const timeMs = Date.now() - st.startedAt;
      const hints = extra.hints ?? st.hints;
      Object.assign(patch, { phase: "solved", timeMs, score: scoreFor(LEVELS[st.level], Math.floor(timeMs / 1000), hints) });
    }
    set(patch);
  }, [set]);

  const isLocked = (i: number) => !!ref.current.puzzle?.givens[i];

  const input = useCallback((v: number) => {
    const st = ref.current;
    if (st.phase !== "play" || !st.puzzle) return;
    const i = st.selected, n = st.puzzle.n;
    if (isLocked(i)) return set({ message: "That tower is locked." });
    const cells = st.cells.slice(), notes = st.notes.slice();
    if (st.pencil) {
      if (cells[i]) return;
      notes[i] ^= 1 << v;
      return commit(cells, notes, { message: null });
    }
    cells[i] = cells[i] === v ? 0 : v;
    notes[i] = 0;
    // Placing a height removes it from pencil notes in the same row and column.
    if (cells[i]) {
      const r = Math.floor(i / n), c = i % n;
      for (let k = 0; k < n; k++) { notes[r * n + k] &= ~(1 << v); notes[k * n + c] &= ~(1 << v); }
    }
    commit(cells, notes, { message: null });
  }, [commit, set]);

  const changeHeight = useCallback((delta: number) => {
    const st = ref.current;
    if (st.phase !== "play" || !st.puzzle) return;
    const i = st.selected, n = st.puzzle.n;
    if (isLocked(i)) return set({ message: "That tower is locked." });
    
    let val = st.cells[i] + delta;
    if (val < 0) val = n; // loop around
    if (val > n) val = 0; // loop around
    
    const cells = st.cells.slice(), notes = st.notes.slice();
    cells[i] = val;
    notes[i] = 0;
    if (cells[i]) {
      const r = Math.floor(i / n), c = i % n;
      for (let k = 0; k < n; k++) { notes[r * n + k] &= ~(1 << val); notes[k * n + c] &= ~(1 << val); }
    }
    commit(cells, notes, { message: null });
  }, [commit, set]);

  const erase = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || isLocked(st.selected)) return;
    if (!st.cells[st.selected] && !st.notes[st.selected]) return;
    const cells = st.cells.slice(), notes = st.notes.slice();
    cells[st.selected] = 0; notes[st.selected] = 0;
    commit(cells, notes, { message: null });
  }, [commit]);

  const undo = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || !st.past.length) return;
    const prev = st.past[st.past.length - 1];
    set({ cells: prev.cells, notes: prev.notes, past: st.past.slice(0, -1), future: [{ cells: st.cells, notes: st.notes }, ...st.future], wrong: [], message: null });
  }, [set]);

  const redo = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || !st.future.length) return;
    const [next, ...rest] = st.future;
    set({ cells: next.cells, notes: next.notes, past: [...st.past, { cells: st.cells, notes: st.notes }], future: rest, wrong: [], message: null });
  }, [set]);

  const select = useCallback((i: number) => set({ selected: i }), [set]);
  const move = useCallback((dr: number, dc: number) => {
    const st = ref.current;
    if (!st.puzzle) return;
    const n = st.puzzle.n;
    const r = (Math.floor(st.selected / n) + dr + n) % n, c = ((st.selected % n) + dc + n) % n;
    set({ selected: r * n + c });
  }, [set]);

  const togglePencil = useCallback(() => set({ pencil: !ref.current.pencil }), [set]);
  const toggleDim = useCallback(() => set({ dim: !ref.current.dim }), [set]);

  /** Check: mark placed towers that differ from the stored solution. */
  const check = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || !st.puzzle) return;
    const wrong = st.cells.map((v, i) => (v && v !== st.puzzle!.solution[i] ? i : -1)).filter((i) => i >= 0);
    const placed = st.cells.filter(Boolean).length;
    set({ wrong, message: !placed ? "Place a few towers first." : wrong.length ? wrong.length + (wrong.length === 1 ? " tower is" : " towers are") + " out of place." : "Every tower so far is correct." });
  }, [set]);

  /**
   * Hint: prefer an explainable deduction from a clue, otherwise reveal a cell
   * (the selected one if it's wrong or empty). Max MAX_HINTS per puzzle.
   */
  const hint = useCallback(() => {
    const st = ref.current;
    const p = st.puzzle;
    if (st.phase !== "play" || !p) return;
    if (st.hints >= MAX_HINTS) return set({ message: "No hints left in this puzzle." });
    const n = p.n, sol = p.solution;
    const open = (i: number) => !p.givens[i] && st.cells[i] !== sol[i];
    let target = -1, message = "";

    for (const side of SIDES) {
      for (let i = 0; i < n && target < 0; i++) {
        const clue = p.clues[side][i];
        if (clue === 1 && open(lineIndex(n, side, i, 0))) {
          target = lineIndex(n, side, i, 0);
          message = "A clue of 1 means the tallest tower (" + n + ") sits right next to it.";
        } else if (clue === n) {
          for (let k = 0; k < n; k++) if (open(lineIndex(n, side, i, k))) { target = lineIndex(n, side, i, k); break; }
          if (target >= 0) message = "A clue of " + n + " means the line climbs 1 to " + n + " in order from that side.";
        }
      }
      if (target >= 0) break;
    }
    if (target < 0) {
      target = open(st.selected) ? st.selected : sol.findIndex((_, i) => open(i));
      if (target < 0) return;
      message = "Row " + (Math.floor(target / n) + 1) + ", column " + ((target % n) + 1) + " holds a tower of height " + sol[target] + ".";
    }
    const cells = st.cells.slice(), notes = st.notes.slice();
    cells[target] = sol[target]; notes[target] = 0;
    commit(cells, notes, { hints: st.hints + 1, message, selected: target });
  }, [commit, set]);

  /** Give up: reveal the solution. No score is recorded. */
  const reveal = useCallback(() => {
    const st = ref.current;
    if (!st.puzzle) return;
    set({ phase: "revealed", cells: st.puzzle.solution.slice(), notes: st.notes.map(() => 0), score: null, wrong: [], message: null, timeMs: Date.now() - st.startedAt });
  }, [set]);

  const toStart = useCallback(() => { stop(); set({ ...initial, mode: ref.current.mode, level: ref.current.level, dim: ref.current.dim }); }, [set, stop]);
  const setMode = useCallback((mode: Mode) => set({ mode }), [set]);
  const setLevel = useCallback((level: LevelKey) => set({ level }), [set]);

  return { s, start, input, changeHeight, erase, undo, redo, select, move, togglePencil, toggleDim, check, reveal, toStart, setMode, setLevel, stop };
}
