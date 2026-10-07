// Puzzle generator. Written as a generator function that yields between
// expensive solver calls, so it can run to completion inside a Web Worker or
// be stepped in small time slices on the main thread.
import { mulberry32, hashSeed, shuffle } from "./rng";
import { computeClues, countSolutions, SIDES, type Clues } from "./solver";

export type GenSpec = {
  n: number;
  /** remove clues while the solution stays unique */
  removeClues: boolean;
  /** locked pre-filled cells: [min, max] */
  givens: [number, number];
  /** never go below this many visible clues (keeps the solver fast and the puzzle fair) */
  minClues: number;
  /** stop removing clues after this long and keep the rest */
  budgetMs: number;
};

export type Puzzle = {
  n: number;
  seed: string;
  solution: number[];
  clues: Clues;
  /** solution value for locked cells, 0 elsewhere */
  givens: number[];
};

/** Random Latin square: cyclic square, then shuffled rows, columns and symbols. */
function latinSquare(n: number, rnd: () => number): number[] {
  const rows = shuffle([...Array(n).keys()], rnd);
  const cols = shuffle([...Array(n).keys()], rnd);
  const syms = shuffle([...Array(n).keys()].map((v) => v + 1), rnd);
  const g = new Array(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) g[r * n + c] = syms[(rows[r] + cols[c]) % n];
  return g;
}

export function* generateSteps(spec: GenSpec, seed: string): Generator<void, Puzzle> {
  const rnd = mulberry32(hashSeed(seed));
  const { n } = spec;
  const started = Date.now();

  for (let attempt = 0; ; attempt++) {
    const solution = latinSquare(n, rnd);
    const clues = computeClues(solution, n);

    // Locked givens (Easy): pick distinct random cells.
    const givens = new Array(n * n).fill(0);
    const [gMin, gMax] = spec.givens;
    const k = gMax ? gMin + Math.floor(rnd() * (gMax - gMin + 1)) : 0;
    shuffle([...Array(n * n).keys()], rnd).slice(0, k).forEach((i) => (givens[i] = solution[i]));

    // A full clue set isn't always unique; if not, try another square.
    const unique = countSolutions(n, clues, givens, 2) === 1;
    yield;
    if (!unique) continue;

    if (spec.removeClues) {
      // Remove clues one at a time in random order; keep a removal only if the
      // puzzle still has exactly one solution. Out of time: keep what's left.
      const order = shuffle([...Array(4 * n).keys()], rnd);
      let shown = 4 * n;
      for (const f of order) {
        if (shown <= spec.minClues || Date.now() - started > spec.budgetMs) break;
        const side = SIDES[Math.floor(f / n)], i = f % n;
        const keep = clues[side][i];
        clues[side][i] = 0;
        if (countSolutions(n, clues, givens, 2) !== 1) clues[side][i] = keep;
        else shown--;
        yield;
      }
    }
    return { n, seed, solution, clues, givens };
  }
}

export function generateSync(spec: GenSpec, seed: string): Puzzle {
  const it = generateSteps(spec, seed);
  for (;;) { const r = it.next(); if (r.done) return r.value; }
}
