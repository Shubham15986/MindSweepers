// Skyscrapers solver: counts solutions (stopping at `limit`) for a clue set.

/** Clues per side, read outward-in. 0 means "no clue shown". */
export type Clues = { top: number[]; right: number[]; bottom: number[]; left: number[] };
export type Side = keyof Clues;
export const SIDES: Side[] = ["top", "right", "bottom", "left"];

/** How many towers are seen looking along `line` from its first element. */
export function visible(line: ArrayLike<number>): number {
  let max = 0, seen = 0;
  for (let i = 0; i < line.length; i++) if (line[i] > max) { max = line[i]; seen++; }
  return seen;
}

/** The heights a clue looks at, ordered from the clue inward. */
export function lineFor(grid: ArrayLike<number>, n: number, side: Side, i: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < n; k++) {
    if (side === "top") out.push(grid[k * n + i]);
    else if (side === "bottom") out.push(grid[(n - 1 - k) * n + i]);
    else if (side === "left") out.push(grid[i * n + k]);
    else out.push(grid[i * n + (n - 1 - k)]);
  }
  return out;
}

export function computeClues(grid: ArrayLike<number>, n: number): Clues {
  const c: Clues = { top: [], right: [], bottom: [], left: [] };
  for (const s of SIDES) for (let i = 0; i < n; i++) c[s].push(visible(lineFor(grid, n, s, i)));
  return c;
}

const permCache: Record<number, number[][]> = {};
/** All permutations of 1..n (720 for n = 6), cached. */
function permutations(n: number): number[][] {
  if (permCache[n]) return permCache[n];
  const out: number[][] = [];
  const cur: number[] = [], used = new Array(n + 1).fill(false);
  (function rec() {
    if (cur.length === n) { out.push(cur.slice()); return; }
    for (let v = 1; v <= n; v++) if (!used[v]) { used[v] = true; cur.push(v); rec(); cur.pop(); used[v] = false; }
  })();
  return (permCache[n] = out);
}

/**
 * Counts solutions, stopping at `limit` (2 is enough to prove uniqueness).
 *
 * 1. Candidates: each row keeps the permutations of 1..n that match its
 *    left/right clues (a missing clue is a wildcard) and its locked givens;
 *    each column likewise keeps those matching its top/bottom clues.
 * 2. Propagation: every cell gets a bitmask of heights still possible. Row and
 *    column candidates that use an impossible height are dropped, the masks are
 *    rebuilt from what's left, and this repeats until nothing changes.
 * 3. Backtracking over rows: rows are stacked top to bottom with per-column
 *    used-height masks, so no column repeats; partial columns are pruned with
 *    the top clue (count too high, tallest already seen but count short, or not
 *    enough rows left). Bottom clues are verified on a complete grid.
 */
export function countSolutions(n: number, clues: Clues, givens: ArrayLike<number> | null, limit = 2): number {
  const all = permutations(n);
  const rows: number[][][] = [], cols: number[][][] = [];
  for (let i = 0; i < n; i++) {
    rows.push(all.filter((p) => {
      if (clues.left[i] && visible(p) !== clues.left[i]) return false;
      if (clues.right[i] && visible(p.slice().reverse()) !== clues.right[i]) return false;
      if (givens) for (let c = 0; c < n; c++) { const g = givens[i * n + c]; if (g && p[c] !== g) return false; }
      return true;
    }));
    cols.push(all.filter((p) => {
      if (clues.top[i] && visible(p) !== clues.top[i]) return false;
      if (clues.bottom[i] && visible(p.slice().reverse()) !== clues.bottom[i]) return false;
      if (givens) for (let r = 0; r < n; r++) { const g = givens[r * n + i]; if (g && p[r] !== g) return false; }
      return true;
    }));
  }

  // Propagate cell domains between row and column candidates.
  const dom = new Int32Array(n * n).fill(-1);
  for (let changed = true; changed; ) {
    changed = false;
    const rowDom = new Int32Array(n * n), colDom = new Int32Array(n * n);
    for (let i = 0; i < n; i++) {
      const rk = rows[i].filter((p) => p.every((v, c) => dom[i * n + c] & (1 << v)));
      const ck = cols[i].filter((p) => p.every((v, r) => dom[r * n + i] & (1 << v)));
      if (!rk.length || !ck.length) return 0;
      if (rk.length !== rows[i].length || ck.length !== cols[i].length) changed = true;
      rows[i] = rk; cols[i] = ck;
      for (const p of rk) for (let c = 0; c < n; c++) rowDom[i * n + c] |= 1 << p[c];
      for (const p of ck) for (let r = 0; r < n; r++) colDom[r * n + i] |= 1 << p[r];
    }
    for (let k = 0; k < n * n; k++) {
      const d = rowDom[k] & colDom[k];
      if (!d) return 0;
      if (d !== dom[k]) { dom[k] = d; changed = true; }
    }
  }

  const mask = new Int32Array(n), cmax = new Int32Array(n), cvis = new Int32Array(n);
  const grid = new Int32Array(n * n);
  let count = 0;

  function place(r: number): void {
    if (r === n) {
      for (let c = 0; c < n; c++) if (clues.bottom[c] && visible(lineFor(grid, n, "bottom", c)) !== clues.bottom[c]) return;
      count++;
      return;
    }
    const left = n - 1 - r; // rows still to place after this one
    const pm = new Int32Array(n), px = new Int32Array(n), pv = new Int32Array(n);
    outer: for (const p of rows[r]) {
      for (let c = 0; c < n; c++) {
        const v = p[c];
        if (mask[c] & (1 << v)) continue outer;
        const t = clues.top[c];
        if (t) {
          const vis = cvis[c] + (v > cmax[c] ? 1 : 0);
          const mx = v > cmax[c] ? v : cmax[c];
          if (vis > t || (mx === n && vis !== t) || vis + left < t) continue outer;
        }
      }
      pm.set(mask); px.set(cmax); pv.set(cvis);
      for (let c = 0; c < n; c++) {
        const v = p[c];
        mask[c] |= 1 << v;
        if (v > cmax[c]) { cmax[c] = v; cvis[c]++; }
        grid[r * n + c] = v;
      }
      place(r + 1);
      mask.set(pm); cmax.set(px); cvis.set(pv);
      if (count >= limit) return;
    }
  }
  place(0);
  return count;
}
