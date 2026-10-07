import { useCallback, useEffect, useRef, useState } from "react";
import GenWorker from "./generator.worker?worker&inline";
import { generateSteps, type Puzzle } from "./generator";
import { LEVELS, MAX_HINTS, scoreFor, specFor, today, type LevelKey } from "./config";
import { randomSeed } from "./rng";

export type Mode = "daily" | "free";
export type Phase = "start" | "loading" | "play" | "solved" | "revealed";
export type Tool = "magnet" | "blank" | "q" | "erase" | null;
export type Action = "auto" | "magnet" | "blank" | "q" | "erase" | "long";

/** Player state per domino: -1 undecided, 0 blank, 1 + on a, 2 + on b, 3 "cannot be blank". */
export const UNDECIDED = -1, QMARK = 3;

export type PolState = {
  phase: Phase;
  mode: Mode;
  level: LevelKey;
  puzzle: Puzzle | null;
  states: number[];
  past: number[][];
  future: number[][];
  cursor: number;
  tool: Tool;
  hints: number;
  message: string | null;
  wrong: number[]; // dominoes flagged by Check, cleared on the next edit
  done: string[]; // clue keys marked done by the player
  startedAt: number;
  timeMs: number;
  score: number | null;
};

const initial: PolState = {
  phase: "start", mode: "daily", level: "Easy", puzzle: null, states: [], past: [], future: [], cursor: 0, tool: null,
  hints: 0, message: null, wrong: [], done: [], startedAt: 0, timeMs: 0, score: null,
};

/** Next domino state for an action on cell x (states are relative to the tapped square). */
export function nextState(t: number, action: Action, plusHere: number): number {
  const other = 3 - plusHere;
  switch (action) {
    case "magnet": return t === plusHere ? other : t === other ? UNDECIDED : plusHere;
    case "blank": return t === 0 ? UNDECIDED : 0;
    case "q": return UNDECIDED;
    case "erase": return UNDECIDED;
    case "long": return t === 0 ? UNDECIDED : 0;
    default: // + here, + there, blank, empty
      return t === plusHere ? other : t === other ? 0 : t === 0 ? UNDECIDED : plusHere;
  }
}

/** Generate in an inline Blob worker; fall back to ~8ms slices on the main thread. */
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
    const spec = specFor(LEVELS[level]);
    const sliced = () => {
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
    };
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
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { generate, stop };
}

const correct = (p: Puzzle, states: number[], d: number) => states[d] === p.solution[d];
const where = (p: Puzzle, x: number) => "row " + (Math.floor(x / p.cols) + 1) + ", column " + ((x % p.cols) + 1);

export function usePolarity(seedProp?: string) {
  const [s, setState] = useState<PolState>(initial);
  const ref = useRef(s);
  const set = useCallback((patch: Partial<PolState>) => { ref.current = { ...ref.current, ...patch }; setState(ref.current); }, []);
  const { generate, stop } = useGenerator();

  const start = useCallback((level = ref.current.level, mode = ref.current.mode) => {
    const seed = mode === "daily" ? (seedProp ?? today()) + ":" + level : randomSeed() + ":" + level;
    set({ ...initial, mode, level, tool: ref.current.tool, phase: "loading" });
    generate(level, seed, (puzzle) => {
      set({ phase: "play", puzzle, states: new Array(puzzle.doms.length).fill(UNDECIDED), cursor: puzzle.empty === 0 ? 1 : 0, startedAt: Date.now() });
    });
  }, [generate, seedProp, set]);

  /** Apply a change with undo history; solved when every domino matches the (unique) solution. */
  const commit = useCallback((states: number[], extra: Partial<PolState> = {}) => {
    const st = ref.current;
    const p = st.puzzle;
    if (!p) return;
    const patch: Partial<PolState> = { message: null, ...extra, states, past: [...st.past, st.states], future: [], wrong: [] };
    if (states.every((v, d) => v === p.solution[d])) {
      const timeMs = Date.now() - st.startedAt;
      Object.assign(patch, { phase: "solved", timeMs, score: scoreFor(LEVELS[st.level], Math.floor(timeMs / 1000), extra.hints ?? st.hints) });
    }
    set(patch);
  }, [set]);

  /** Act on the domino under cell x. */
  const act = useCallback((x: number, action: Action) => {
    const st = ref.current;
    const p = st.puzzle;
    if (st.phase !== "play" || !p) return;
    const d = p.dom[x];
    if (d < 0) return;
    const states = st.states.slice();
    states[d] = nextState(states[d], action, x === p.doms[d][0] ? 1 : 2);
    if (states[d] === st.states[d]) return set({ cursor: x });
    commit(states, { cursor: x });
  }, [commit, set]);

  const undo = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || !st.past.length) return;
    set({ states: st.past[st.past.length - 1], past: st.past.slice(0, -1), future: [st.states, ...st.future], wrong: [], message: null });
  }, [set]);

  const redo = useCallback(() => {
    const st = ref.current;
    if (st.phase !== "play" || !st.future.length) return;
    const [next, ...rest] = st.future;
    set({ states: next, past: [...st.past, st.states], future: rest, wrong: [], message: null });
  }, [set]);

  const move = useCallback((dr: number, dc: number) => {
    const p = ref.current.puzzle;
    if (!p) return;
    let x = ref.current.cursor;
    // Step once, and once more if we land on the unused square.
    for (let i = 0; i < 2; i++) {
      const r = (Math.floor(x / p.cols) + dr + p.rows) % p.rows, c = ((x % p.cols) + dc + p.cols) % p.cols;
      x = r * p.cols + c;
      if (p.dom[x] >= 0) break;
    }
    set({ cursor: x });
  }, [set]);

  const setTool = useCallback((tool: Tool) => set({ tool: ref.current.tool === tool ? null : tool }), [set]);
  const toggleDone = useCallback((key: string) => {
    const done = ref.current.done;
    set({ done: done.includes(key) ? done.filter((k) => k !== key) : [...done, key] });
  }, [set]);

  /** Check: flag decided dominoes that differ from the stored solution ("?" is wrong if it should be blank). */
  const check = useCallback(() => {
    const st = ref.current;
    const p = st.puzzle;
    if (st.phase !== "play" || !p) return;
    const wrong: number[] = [];
    st.states.forEach((v, d) => {
      if (v === UNDECIDED) return;
      if (v === QMARK ? p.solution[d] === 0 : v !== p.solution[d]) wrong.push(d);
    });
    const any = st.states.some((v) => v !== UNDECIDED);
    set({ wrong, message: !any ? "Decide a few dominoes first." : wrong.length ? wrong.length + (wrong.length === 1 ? " domino is" : " dominoes are") + " wrong." : "Everything so far is correct." });
  }, [set]);

  /**
   * Hint: explain a "zero line" deduction if one applies, otherwise reveal one
   * domino (the one under the cursor if it isn't right yet). Max MAX_HINTS.
   */
  const hint = useCallback(() => {
    const st = ref.current;
    const p = st.puzzle;
    if (st.phase !== "play" || !p) return;
    if (st.hints >= MAX_HINTS) return set({ message: "No hints left in this dream." });
    let target = -1, message = "";
    // A line whose + and - clues are both 0 forces every domino touching it to be blank.
    for (let li = 0; li < p.rows + p.cols && target < 0; li++) {
      if (p.clues.plus[li] !== 0 || p.clues.minus[li] !== 0) continue;
      const cells = li < p.rows ? Array.from({ length: p.cols }, (_, c) => li * p.cols + c) : Array.from({ length: p.rows }, (_, r) => r * p.cols + li - p.rows);
      const x = cells.find((x) => p.dom[x] >= 0 && !correct(p, st.states, p.dom[x]));
      if (x !== undefined) {
        target = p.dom[x];
        message = "Clue 0 on this " + (li < p.rows ? "row" : "column") + " means this domino must be blank.";
      }
    }
    if (target < 0) {
      const cd = p.dom[st.cursor];
      target = cd >= 0 && !correct(p, st.states, cd) ? cd : p.solution.findIndex((_, d) => !correct(p, st.states, d));
      if (target < 0) return;
      const sol = p.solution[target], [a, b] = p.doms[target];
      message = sol === 0 ? "The domino at " + where(p, a) + " is blank." : "The domino at " + where(p, a) + " is a magnet: + at " + where(p, sol === 1 ? a : b) + ".";
    }
    const states = st.states.slice();
    states[target] = p.solution[target];
    commit(states, { hints: st.hints + 1, message, cursor: p.doms[target][0] });
  }, [commit, set]);

  /** Give up: show the solution, no score. */
  const reveal = useCallback(() => {
    const st = ref.current;
    if (!st.puzzle) return;
    set({ phase: "revealed", states: st.puzzle.solution.slice(), score: null, wrong: [], message: null, timeMs: Date.now() - st.startedAt });
  }, [set]);

  const toStart = useCallback(() => { stop(); set({ ...initial, mode: ref.current.mode, level: ref.current.level }); }, [set, stop]);
  const setMode = useCallback((mode: Mode) => set({ mode }), [set]);
  const setLevel = useCallback((level: LevelKey) => set({ level }), [set]);

  return { s, start, act, undo, redo, move, setTool, toggleDone, check, hint, reveal, toStart, setMode, setLevel, stop };
}
