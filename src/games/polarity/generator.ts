// POLARITY generator: tiling -> magnets -> clues -> uniqueness -> clue stripping.
import { buildModel, computeClues, deduce, countSolutions, pole, ALL, type Clues, type Layout } from "./solver";
import { hashSeed, mulberry32, shuffle } from "./rng";

export type GenSpec = {
  cols: number;
  rows: number;
  stripClues: boolean;
  /** never strip below this fraction of clues */
  clueKeepRatio: number;
  /** Hard may need one level of lookahead; Easy and Medium pure propagation */
  lookahead: boolean;
  magnetRatio: number;
  budgetMs: number;
};

export type Puzzle = Layout & {
  seed: string;
  /** domino -> 0 blank, 1 + on a, 2 + on b */
  solution: number[];
  clues: Clues;
  /** leftover square index or -1 */
  empty: number;
};

/** Random domino tiling by randomized backtracking (restart if it gets stuck). */
function tile(rows: number, cols: number, rnd: () => number): { dom: number[]; doms: [number, number][]; empty: number } {
  const n = rows * cols;
  for (;;) {
    const dom = new Array(n).fill(-2);
    let empty = -1;
    if (n % 2) {
      // On an odd grid the "even" colour has one extra square; removing one keeps it tileable.
      const even: number[] = [];
      for (let x = 0; x < n; x++) if ((Math.floor(x / cols) + (x % cols)) % 2 === 0) even.push(x);
      empty = even[Math.floor(rnd() * even.length)];
      dom[empty] = -1;
    }
    const doms: [number, number][] = [];
    let steps = 0;
    const fill = (): boolean => {
      if (++steps > 5000) return false;
      const x = dom.indexOf(-2);
      if (x < 0) return true;
      const opts: number[] = [];
      if (x % cols + 1 < cols && dom[x + 1] === -2) opts.push(x + 1);
      if (x + cols < n && dom[x + cols] === -2) opts.push(x + cols);
      for (const y of shuffle(opts, rnd)) {
        dom[x] = dom[y] = doms.length;
        doms.push([x, y]);
        if (fill()) return true;
        doms.pop();
        dom[x] = dom[y] = -2;
      }
      return false;
    };
    if (fill()) return { dom, doms, empty };
  }
}

/** Pick magnets with random orientation; fall back to blank if both orientations repel a neighbour. */
function magnets(L: Layout, ratio: number, rnd: () => number): number[] {
  const st = new Array(L.doms.length).fill(0);
  const cellPole = new Array(L.rows * L.cols).fill(0);
  const clash = (x: number, p: number) => {
    const r = Math.floor(x / L.cols), c = x % L.cols;
    const nb = [c > 0 ? x - 1 : -1, c + 1 < L.cols ? x + 1 : -1, r > 0 ? x - L.cols : -1, r + 1 < L.rows ? x + L.cols : -1];
    return nb.some((y) => y >= 0 && cellPole[y] === p);
  };
  for (const d of shuffle(L.doms.map((_, i) => i), rnd)) {
    if (rnd() >= ratio) continue;
    for (const s of rnd() < 0.5 ? [1, 2] : [2, 1]) {
      const [a, b] = L.doms[d];
      if (clash(a, pole(L.doms[d], s, a)) || clash(b, pole(L.doms[d], s, b))) continue;
      st[d] = s;
      cellPole[a] = pole(L.doms[d], s, a);
      cellPole[b] = pole(L.doms[d], s, b);
      break;
    }
  }
  return st;
}

/** Yields between attempts so it can be time-sliced on the main thread. */
export function* generateSteps(spec: GenSpec, seed: string): Generator<void, Puzzle> {
  const rnd = mulberry32(hashSeed(seed));
  const t0 = Date.now();
  for (;;) {
    yield;
    // Past the budget, accept anything unique (lookahead or a full count).
    const relaxed = Date.now() - t0 > spec.budgetMs;
    const { dom, doms, empty } = tile(spec.rows, spec.cols, rnd);
    const L: Layout = { rows: spec.rows, cols: spec.cols, dom, doms };
    const solution = magnets(L, spec.magnetRatio, rnd);
    const clues = computeClues(L, solution);
    const m = buildModel(L);
    const fresh = () => new Uint8Array(doms.length).fill(ALL);
    const res = deduce(m, clues, fresh(), spec.lookahead || relaxed);
    if (res !== "solved" && !(relaxed && countSolutions(m, clues, fresh()) === 1)) continue;

    if (spec.stripClues) {
      // Hide clues one at a time; keep a removal only if the puzzle is still logically solvable (hence unique).
      const total = clues.plus.length * 2;
      const minKeep = Math.ceil(total * spec.clueKeepRatio);
      let kept = total;
      const slots = shuffle(Array.from({ length: total }, (_, i) => i), rnd);
      for (const slot of slots) {
        if (kept <= minKeep || Date.now() - t0 > spec.budgetMs * 1.5) break; // relax: keep more clues
        const arr = slot % 2 ? clues.minus : clues.plus, li = slot >> 1;
        const prev = arr[li];
        arr[li] = -1;
        if (deduce(m, clues, fresh(), true) === "solved") kept--;
        else arr[li] = prev;
        yield;
      }
    }
    return { ...L, seed, solution, clues, empty };
  }
}

export function generateSync(spec: GenSpec, seed: string): Puzzle {
  const it = generateSteps(spec, seed);
  for (;;) { const r = it.next(); if (r.done) return r.value; }
}
