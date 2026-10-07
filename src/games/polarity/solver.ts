// POLARITY solver: constraint propagation over each domino's three states.
//
// Domino d covers cells a < b. Its domain is a 3-bit mask:
//   BLANK (state 0)  neutral on both ends
//   PA    (state 1)  + on a, - on b
//   PB    (state 2)  + on b, - on a
// Lines are rows 0..rows-1 followed by columns rows..rows+cols-1.

export const BLANK = 1, PA = 2, PB = 4, ALL = 7;
export type DState = 0 | 1 | 2;

export type Layout = {
  rows: number;
  cols: number;
  /** cell -> domino index, -1 for the unused leftover square */
  dom: number[];
  /** domino -> [a, b] cell indices, a < b */
  doms: [number, number][];
};

/** Pole counts per line; -1 means the clue is hidden. */
export type Clues = { plus: number[]; minus: number[] };

/** Pole at cell x for domino [a, b] in state s: +1, -1 or 0. */
export function pole(d: [number, number], s: number, x: number): number {
  if (s === 0) return 0;
  return (s === 1) === (x === d[0]) ? 1 : -1;
}

type LineEntry = { d: number; plus: number[]; minus: number[] };
export type Model = {
  L: Layout;
  lines: LineEntry[][];
  /** directed adjacency arcs across domino borders: [d, x, e, y] */
  arcs: number[][];
};

/** Precompute per-line contributions and cross-domino adjacencies. */
export function buildModel(L: Layout): Model {
  const { rows, cols, dom, doms } = L;
  const lines: LineEntry[][] = Array.from({ length: rows + cols }, () => []);
  doms.forEach((cells, d) => {
    const map = new Map<number, LineEntry>();
    for (const x of cells) {
      for (const li of [Math.floor(x / cols), rows + (x % cols)]) {
        let e = map.get(li);
        if (!e) { e = { d, plus: [0, 0, 0], minus: [0, 0, 0] }; map.set(li, e); lines[li].push(e); }
        for (let s = 1; s <= 2; s++) {
          if (pole(cells, s, x) > 0) e.plus[s]++; else e.minus[s]++;
        }
      }
    }
  });
  const arcs: number[][] = [];
  for (let x = 0; x < rows * cols; x++) {
    const r = Math.floor(x / cols), c = x % cols;
    for (const y of [c + 1 < cols ? x + 1 : -1, r + 1 < rows ? x + cols : -1]) {
      if (y < 0 || dom[x] < 0 || dom[y] < 0 || dom[x] === dom[y]) continue;
      arcs.push([dom[x], x, dom[y], y], [dom[y], y, dom[x], x]);
    }
  }
  return { L, lines, arcs };
}

const BIT = [BLANK, PA, PB];

/**
 * Propagate to a fixpoint. Mutates dom. Returns false on contradiction.
 * 1. Line bounds: each domino adds [lo, hi] poles of a kind to a line;
 *    states that push the total outside the clue are removed.
 * 2. Adjacency: a magnet state is removed if every remaining state of a
 *    neighbouring domino would put a like pole against it.
 */
export function propagate(m: Model, clues: Clues, dom: Uint8Array): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let li = 0; li < m.lines.length; li++) {
      const line = m.lines[li];
      for (let k = 0; k < 2; k++) {
        const clue = k === 0 ? clues.plus[li] : clues.minus[li];
        if (clue < 0) continue;
        let min = 0, max = 0;
        const lo: number[] = [], hi: number[] = [];
        for (let i = 0; i < line.length; i++) {
          const v = k === 0 ? line[i].plus : line[i].minus, D = dom[line[i].d];
          let l = 9, h = -1;
          for (let s = 0; s < 3; s++) if (D & BIT[s]) { if (v[s] < l) l = v[s]; if (v[s] > h) h = v[s]; }
          lo.push(l); hi.push(h); min += l; max += h;
        }
        if (min > clue || max < clue) return false;
        if (min === max) continue;
        for (let i = 0; i < line.length; i++) {
          const v = k === 0 ? line[i].plus : line[i].minus, d = line[i].d;
          for (let s = 0; s < 3; s++) {
            if (!(dom[d] & BIT[s])) continue;
            if (min - lo[i] + v[s] > clue || max - hi[i] + v[s] < clue) {
              dom[d] &= ~BIT[s];
              changed = true;
              if (!dom[d]) return false;
            }
          }
        }
      }
    }
    const doms = m.L.doms;
    for (const [d, x, e, y] of m.arcs) {
      for (let s = 1; s <= 2; s++) {
        if (!(dom[d] & BIT[s])) continue;
        const p = pole(doms[d], s, x);
        let ok = false;
        for (let t = 0; t < 3 && !ok; t++) if (dom[e] & BIT[t] && pole(doms[e], t, y) !== p) ok = true;
        if (!ok) { dom[d] &= ~BIT[s]; changed = true; if (!dom[d]) return false; }
      }
    }
  }
  return true;
}

const single = (D: number) => D === BLANK || D === PA || D === PB;
export const stateOf = (D: number): DState => (D === BLANK ? 0 : D === PA ? 1 : 2);

/**
 * Logical solve. Propagation only, or with one level of lookahead
 * (try each state, propagate, drop states that fail). Mutates dom.
 */
export function deduce(m: Model, clues: Clues, dom: Uint8Array, lookahead: boolean): "solved" | "stuck" | "contra" {
  if (!propagate(m, clues, dom)) return "contra";
  if (lookahead) {
    let progress = true;
    while (progress) {
      progress = false;
      for (let d = 0; d < dom.length && !progress; d++) {
        if (single(dom[d])) continue;
        for (let s = 0; s < 3; s++) {
          if (!(dom[d] & BIT[s])) continue;
          const t = dom.slice();
          t[d] = BIT[s];
          if (!propagate(m, clues, t)) {
            dom[d] &= ~BIT[s];
            if (!propagate(m, clues, dom)) return "contra";
            progress = true;
            break;
          }
        }
      }
    }
  }
  return dom.every(single) ? "solved" : "stuck";
}

/** Count solutions (up to limit) by branching on the smallest open domain. */
export function countSolutions(m: Model, clues: Clues, dom: Uint8Array, limit = 2): number {
  if (!propagate(m, clues, dom)) return 0;
  let best = -1, bc = 9;
  for (let d = 0; d < dom.length; d++) {
    if (single(dom[d])) continue;
    const c = (dom[d] & 1) + ((dom[d] >> 1) & 1) + ((dom[d] >> 2) & 1);
    if (c < bc) { bc = c; best = d; }
  }
  if (best < 0) return 1;
  let n = 0;
  for (let s = 0; s < 3 && n < limit; s++) {
    if (!(dom[best] & BIT[s])) continue;
    const t = dom.slice();
    t[best] = BIT[s];
    n += countSolutions(m, clues, t, limit - n);
  }
  return n;
}

/** Clues implied by a full assignment of domino states. */
export function computeClues(L: Layout, states: number[]): Clues {
  const plus = new Array(L.rows + L.cols).fill(0), minus = plus.slice();
  L.doms.forEach((d, i) => {
    for (const x of d) {
      const p = pole(d, states[i], x);
      if (!p) continue;
      const arr = p > 0 ? plus : minus;
      arr[Math.floor(x / L.cols)]++;
      arr[L.rows + (x % L.cols)]++;
    }
  });
  return { plus, minus };
}
