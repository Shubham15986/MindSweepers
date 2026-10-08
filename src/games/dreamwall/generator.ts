// Nurikabe engine: rule validation, unique-solution solver, puzzle generator.
// Ported from Python to TypeScript.

export type Cell = 0 | 1 | 2; // 0=unknown, 1=white(island), 2=black(wall)

function neighborsTable(n: number): number[][] {
  const t: number[][] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const nb: number[] = [];
      for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) {
          nb.push(rr * n + cc);
        }
      }
      t.push(nb);
    }
  }
  return t;
}

function squaresTable(n: number): [number, number, number, number][] {
  const t: [number, number, number, number][] = [];
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      t.push([
        r * n + c,
        r * n + c + 1,
        (r + 1) * n + c,
        (r + 1) * n + c + 1,
      ]);
    }
  }
  return t;
}

function getComponents(g: number[], nb: number[][], value: number): number[][] {
  const seen = new Set<number>();
  const comps: number[][] = [];
  for (let i = 0; i < g.length; i++) {
    if (g[i] === value && !seen.has(i)) {
      const comp = [i];
      const dq = [i];
      seen.add(i);
      let head = 0;
      while (head < dq.length) {
        const x = dq[head++];
        for (const y of nb[x]) {
          if (g[y] === value && !seen.has(y)) {
            seen.add(y);
            comp.push(y);
            dq.push(y);
          }
        }
      }
      comps.push(comp);
    }
  }
  return comps;
}

export function isValidSolution(g: number[], clues: Record<number, number>, n: number): boolean {
  const nb = neighborsTable(n);
  const sq = squaresTable(n);
  if (g.includes(0)) return false;
  if (sq.some((s) => s.every((i) => g[i] === 2))) return false;
  for (const ci of Object.keys(clues)) {
    if (g[Number(ci)] !== 1) return false;
  }
  const blacks = getComponents(g, nb, 2);
  if (blacks.length > 1) return false;
  const whites = getComponents(g, nb, 1);
  for (const comp of whites) {
    const cl = comp.filter((i) => i in clues);
    if (cl.length !== 1 || clues[cl[0]] !== comp.length) return false;
  }
  return true;
}

class Solver {
  n: number;
  clues: Record<number, number>;
  nb: number[][];
  sq: [number, number, number, number][];
  solutions: number[][];
  iters: number = 0;

  constructor(n: number, clues: Record<number, number>) {
    this.n = n;
    this.clues = clues;
    this.nb = neighborsTable(n);
    this.sq = squaresTable(n);
    this.solutions = [];
  }

  propagate(g: number[]): boolean {
    const n = this.n;
    const nb = this.nb;
    const clues = this.clues;
    let changed = true;
    while (changed) {
      changed = false;
      // 2x2 black rule
      for (const s of this.sq) {
        const vals = s.map((i) => g[i]);
        let b = 0;
        let zeroIdx = -1;
        for (let j = 0; j < 4; j++) {
          if (vals[j] === 2) b++;
          if (vals[j] === 0) zeroIdx = j;
        }
        if (b === 4) return false;
        if (b === 3 && zeroIdx !== -1) {
          g[s[zeroIdx]] = 1;
          changed = true;
        }
      }
      // island logic
      const comps = getComponents(g, nb, 1);
      const cid: Record<number, number> = {};
      comps.forEach((comp, k) => comp.forEach((i) => (cid[i] = k)));

      for (const comp of comps) {
        const cl = comp.filter((i) => i in clues);
        if (cl.length > 1) return false;

        const unk = new Set<number>();
        for (const x of comp) {
          for (const y of nb[x]) {
            if (g[y] === 0) unk.add(y);
          }
        }

        if (cl.length === 1) {
          const need = clues[cl[0]];
          if (comp.length > need) return false;
          if (comp.length === need) {
            for (const y of unk) {
              g[y] = 2;
              changed = true;
            }
          } else if (unk.size === 0) {
            return false;
          }
        } else if (unk.size === 0) {
          return false;
        }
      }

      // cell touching two different islands must be black
      for (let i = 0; i < n * n; i++) {
        if (g[i] === 0) {
          const ids = new Set<number>();
          for (const y of nb[i]) {
            if (g[y] === 1) ids.add(cid[y]);
          }
          if (ids.size > 1) {
            g[i] = 2;
            changed = true;
          }
        }
      }

      // reachability
      const reach = new Set<number>();
      for (const [ci, kStr] of Object.entries(clues)) {
        const k = Number(kStr);
        const dist: Record<number, number> = { [Number(ci)]: 1 };
        const dq = [Number(ci)];
        let head = 0;
        while (head < dq.length) {
          const x = dq[head++];
          if (dist[x] >= k) continue;
          for (const y of nb[x]) {
            if (g[y] !== 2 && !(y in dist)) {
              dist[y] = dist[x] + 1;
              dq.push(y);
            }
          }
        }
        for (const r of Object.keys(dist)) reach.add(Number(r));
      }
      for (let i = 0; i < n * n; i++) {
        if (g[i] === 0 && !reach.has(i)) {
          g[i] = 2;
          changed = true;
        }
      }
    }

    // connectivity check
    const blacks = [];
    for (let i = 0; i < n * n; i++) {
      if (g[i] === 2) blacks.push(i);
    }
    if (blacks.length > 0) {
      const seen = new Set<number>([blacks[0]]);
      const dq = [blacks[0]];
      let head = 0;
      while (head < dq.length) {
        const x = dq[head++];
        for (const y of nb[x]) {
          if (g[y] !== 1 && !seen.has(y)) {
            seen.add(y);
            dq.push(y);
          }
        }
      }
      if (blacks.some((b) => !seen.has(b))) return false;
    }
    return true;
  }

  search(g: number[], limit: number) {
    if (this.iters++ > 5000) return; // Time-bounded fast abort!
    if (this.solutions.length >= limit) return;
    if (!this.propagate(g)) return;
    if (!g.includes(0)) {
      if (isValidSolution(g, this.clues, this.n)) {
        this.solutions.push([...g]);
      }
      return;
    }
    let pick = -1;
    const comps = getComponents(g, this.nb, 1);
    outer: for (const comp of comps) {
      for (const x of comp) {
        for (const y of this.nb[x]) {
          if (g[y] === 0) {
            pick = y;
            break outer;
          }
        }
      }
    }
    if (pick === -1) pick = g.indexOf(0);
    for (const val of [1, 2]) {
      const h = [...g];
      h[pick] = val;
      this.search(h, limit);
      if (this.solutions.length >= limit) return;
    }
  }

  solve(limit = 2): number[][] {
    const g = Array(this.n * this.n).fill(0);
    for (const i of Object.keys(this.clues)) {
      g[Number(i)] = 1;
    }
    this.solutions = [];
    this.search(g, limit);
    return this.solutions;
  }
}

export function countSolutions(n: number, clues: Record<number, number>, limit = 2): number {
  return new Solver(n, clues).solve(limit).length;
}

// PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomSolution(n: number, rand: () => number): number[] {
  const nb = neighborsTable(n);
  const g = Array(n * n).fill(1);
  const first = Math.floor(rand() * (n * n));
  g[first] = 2;
  const frontier = new Set(nb[first]);
  const target = Math.floor(n * n * (0.40 + rand() * 0.25));
  const sq = squaresTable(n);
  let blacks = 1;
  let tries = 0;
  while (blacks < target && frontier.size > 0 && tries < 500) {
    tries++;
    const arr = Array.from(frontier);
    const c = arr[Math.floor(rand() * arr.length)];
    g[c] = 2;
    if (sq.some((s) => s.includes(c) && s.every((i) => g[i] === 2))) {
      g[c] = 1;
      frontier.delete(c);
      continue;
    }
    blacks++;
    frontier.delete(c);
    for (const y of nb[c]) {
      if (g[y] === 1) frontier.add(y);
    }
  }
  return g;
}

function makeClues(g: number[], n: number, rand: () => number): Record<number, number> {
  const nb = neighborsTable(n);
  const clues: Record<number, number> = {};
  const comps = getComponents(g, nb, 1);
  for (const comp of comps) {
    const cell = comp[Math.floor(rand() * comp.length)];
    clues[cell] = comp.length;
  }
  return clues;
}

export function generatePuzzle(n: number, seed: string): { size: number; clues: (number | null)[]; solution: Cell[] } {
  let attemptSeed = seed;
  for (let superAttempt = 0; superAttempt < 20; superAttempt++) {
    const rand = mulberry32(hashSeed(attemptSeed));
    let attempts = 0;
    while (attempts < 2000) {
      attempts++;
      const sol = randomSolution(n, rand);
      if (!sol.includes(1)) continue;
      for (let k = 0; k < 4; k++) {
        const cluesObj = makeClues(sol, n, rand);
        if (countSolutions(n, cluesObj, 2) === 1) {
          const flatClues: (number | null)[] = Array(n * n).fill(null);
          for (const [i, val] of Object.entries(cluesObj)) {
            flatClues[Number(i)] = val;
          }
          const solution = sol.map(v => v === 1 ? 2 : v === 2 ? 1 : 0) as Cell[];
          return { size: n, clues: flatClues, solution };
        }
      }
    }
    attemptSeed = attemptSeed + "x";
  }
  throw new Error("Failed to generate puzzle");
}
