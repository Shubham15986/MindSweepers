#!/usr/bin/env python3
"""
Magnets puzzle generator + solver.

Every puzzle is verified to have EXACTLY ONE solution (after clues are stripped).

Usage:
  python generate_magnets.py --per-level 5   --out puzzles.json            # fresh file
  python generate_magnets.py --per-level 100 --out puzzles.json --append   # top up existing file to 100/level

Dimensions are rows x cols.
Level 1: 3x4   Level 2: 5x4   Level 3: 5x6

Solution cell chars:  '+'  '-'  'x' (neutral / blank domino)
Clue arrays (null = stripped):
  top[c]    = number of '+' in column c
  left[r]   = number of '+' in row r
  bottom[c] = number of '-' in column c
  right[r]  = number of '-' in row r
"""
import argparse, json, os, random

LEVELS = [
    {"id": 1, "name": "Level 1", "rows": 3, "cols": 4},
    {"id": 2, "name": "Level 2", "rows": 5, "cols": 4},
    {"id": 3, "name": "Level 3", "rows": 5, "cols": 6},
]

# ----------------------------------------------------------------- solver
def solve(R, C, doms, clues, limit=2):
    """Return (number_of_solutions_up_to_limit, first_solution_grid)."""
    top, left, bottom, right = clues["top"], clues["left"], clues["bottom"], clues["right"]
    grid = [[None] * C for _ in range(R)]
    pr, nr, pc, nc = [0] * R, [0] * R, [0] * C, [0] * C
    rr, rc = [C] * R, [R] * C          # undecided cells left in each row / column
    found = {"n": 0, "sol": None}

    def line_ok(cur, rem, target):
        return target is None or (cur <= target <= cur + rem)

    def lines_ok(rows, cols):
        for r in rows:
            if not line_ok(pr[r], rr[r], left[r]) or not line_ok(nr[r], rr[r], right[r]):
                return False
        for c in cols:
            if not line_ok(pc[c], rc[c], top[c]) or not line_ok(nc[c], rc[c], bottom[c]):
                return False
        return True

    def clash(r, c):
        v = grid[r][c]
        if v == 0:
            return False
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = r + dr, c + dc
            if 0 <= a < R and 0 <= b < C and grid[a][b] == v:
                return True
        return False

    def put(r, c, v, sign):
        if v == 1:
            pr[r] += sign; pc[c] += sign
        elif v == -1:
            nr[r] += sign; nc[c] += sign
        rr[r] -= sign; rc[c] -= sign

    def rec(i):
        if found["n"] >= limit:
            return
        if i == len(doms):
            found["n"] += 1
            if found["sol"] is None:
                found["sol"] = [row[:] for row in grid]
            return
        r1, c1, r2, c2 = doms[i]
        for v1, v2 in ((0, 0), (1, -1), (-1, 1)):
            grid[r1][c1], grid[r2][c2] = v1, v2
            put(r1, c1, v1, 1); put(r2, c2, v2, 1)
            if not clash(r1, c1) and not clash(r2, c2) and lines_ok({r1, r2}, {c1, c2}):
                rec(i + 1)
            put(r1, c1, v1, -1); put(r2, c2, v2, -1)
            grid[r1][c1] = grid[r2][c2] = None

    rec(0)
    return found["n"], found["sol"]


# -------------------------------------------------------------- generator
def random_tiling(R, C, rng):
    grid = [[False] * C for _ in range(R)]
    doms = []

    def rec():
        for r in range(R):
            for c in range(C):
                if not grid[r][c]:
                    opts = []
                    if c + 1 < C and not grid[r][c + 1]:
                        opts.append((r, c, r, c + 1))
                    if r + 1 < R:
                        opts.append((r, c, r + 1, c))
                    rng.shuffle(opts)
                    for o in opts:
                        grid[o[0]][o[1]] = grid[o[2]][o[3]] = True
                        doms.append(o)
                        if rec():
                            return True
                        doms.pop()
                        grid[o[0]][o[1]] = grid[o[2]][o[3]] = False
                    return False
        return True

    rec()
    return list(doms)


def random_solution(R, C, doms, rng):
    grid = [[None] * C for _ in range(R)]

    def clash(r, c):
        v = grid[r][c]
        if v == 0:
            return False
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = r + dr, c + dc
            if 0 <= a < R and 0 <= b < C and grid[a][b] == v:
                return True
        return False

    def rec(i):
        if i == len(doms):
            return True
        r1, c1, r2, c2 = doms[i]
        opts = [(0, 0), (1, -1), (-1, 1)]
        rng.shuffle(opts)
        for v1, v2 in opts:
            grid[r1][c1], grid[r2][c2] = v1, v2
            if not clash(r1, c1) and not clash(r2, c2) and rec(i + 1):
                return True
            grid[r1][c1] = grid[r2][c2] = None
        return False

    return grid if rec(0) else None


def full_clues(R, C, g):
    return {
        "top":    [sum(g[r][c] == 1 for r in range(R)) for c in range(C)],
        "left":   [sum(g[r][c] == 1 for c in range(C)) for r in range(R)],
        "bottom": [sum(g[r][c] == -1 for r in range(R)) for c in range(C)],
        "right":  [sum(g[r][c] == -1 for c in range(C)) for r in range(R)],
    }


def strip_clues(R, C, doms, clues, rng):
    keys = [(s, i) for s, n in (("top", C), ("left", R), ("bottom", C), ("right", R)) for i in range(n)]
    rng.shuffle(keys)
    for s, i in keys:
        old = clues[s][i]
        clues[s][i] = None
        if solve(R, C, doms, clues)[0] != 1:
            clues[s][i] = old
    return clues


def grid_to_rows(g):
    return ["".join({1: "+", -1: "-", 0: "x"}[v] for v in row) for row in g]


def make_puzzle(R, C, rng):
    while True:
        doms = random_tiling(R, C, rng)
        g = random_solution(R, C, doms, rng)
        if g is None:
            continue
        nb = sum(all(g[r][c] == 0 for r, c in ((d[0], d[1]), (d[2], d[3]))) for d in doms)
        if not (0.15 <= nb / len(doms) <= 0.5):          # sensible mix of blanks and magnets
            continue
        clues = full_clues(R, C, g)
        if solve(R, C, doms, clues)[0] != 1:
            continue
        clues = strip_clues(R, C, doms, clues, rng)
        return {"rows": R, "cols": C, "dominoes": [list(d) for d in doms],
                "clues": clues, "solution": grid_to_rows(g)}


# ---------------------------------------------------- hand-supplied samples
def parse(rows):
    return [[{"+": 1, "-": -1, "x": 0}[ch] for ch in row] for row in rows]

N = None
SAMPLES_L3 = [
    {  # screenshot 1
        "dominoes": [(0,0,0,1),(0,2,1,2),(0,3,1,3),(0,4,0,5),(1,0,2,0),(1,1,2,1),(1,4,1,5),
                     (2,2,2,3),(2,4,2,5),(3,0,4,0),(3,1,4,1),(3,2,3,3),(3,4,4,4),(3,5,4,5),(4,2,4,3)],
        "clues": {"top": [N,N,N,0,2,N], "left": [N,3,1,N,2], "bottom": [2,N,N,1,2,N], "right": [2,1,N,N,3]},
        "solution": ["-+-xxx", "+x+x-+", "-xxx+-", "x+xx-+", "x-+-+-"],
    },
    {  # screenshot 2
        "dominoes": [(0,0,0,1),(0,2,0,3),(0,4,1,4),(0,5,1,5),(1,0,1,1),(1,2,2,2),(1,3,2,3),
                     (2,0,3,0),(2,1,3,1),(2,4,3,4),(2,5,3,5),(3,2,4,2),(3,3,4,3),(4,0,4,1),(4,4,4,5)],
        "clues": {"top": [N,N,1,2,N,N], "left": [N,1,2,2,3], "bottom": [2,N,N,N,0,3], "right": [N,N,N,N,N]},
        "solution": ["-+-+x-", "xxx-x+", "+-x+x-", "-+-xx+", "+-+x+-"],
    },
    {  # screenshot 3
        "dominoes": [(0,0,0,1),(0,2,0,3),(0,4,1,4),(0,5,1,5),(1,0,2,0),(1,1,2,1),(1,2,2,2),(1,3,2,3),
                     (2,4,2,5),(3,0,4,0),(3,1,3,2),(4,1,4,2),(3,3,3,4),(4,3,4,4),(3,5,4,5)],
        "clues": {"top": [N,N,2,N,1,2], "left": [2,N,N,3,N], "bottom": [N,N,N,2,1,2], "right": [3,N,1,1,N]},
        "solution": ["+-+-x-", "x+-xx+", "x-+xxx", "+xx+-+", "-xx-+-"],
    },
    {  # screenshot 4 (silhouette only - solution is computed by the solver)
        "dominoes": [(0,0,0,1),(0,2,0,3),(0,4,0,5),
                     (1,0,2,0),(1,1,1,2),(1,3,1,4),(2,1,2,2),(2,3,2,4),(1,5,2,5),
                     (3,0,4,0),(3,1,4,1),(3,2,3,3),(4,2,4,3),(3,4,4,4),(3,5,4,5)],
        "clues": {"top": [2,2,2,N,N,N], "left": [3,N,N,N,N], "bottom": [N,2,N,N,N,N], "right": [N,N,1,3,0]},
        "solution": None,
    },
]

def build_samples():
    out = []
    for s in SAMPLES_L3:
        doms = sorted(s["dominoes"])
        n, sol = solve(5, 6, doms, s["clues"])
        assert n == 1, "sample is not uniquely solvable"
        rows = grid_to_rows(sol)
        if s["solution"] is not None:
            assert rows == s["solution"], f"sample mismatch: {rows} vs {s['solution']}"
        out.append({"rows": 5, "cols": 6, "dominoes": [list(d) for d in doms],
                    "clues": s["clues"], "solution": rows})
    return out


# ------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-level", type=int, default=5)
    ap.add_argument("--out", default="puzzles.json")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--append", action="store_true", help="keep puzzles already in --out and top up")
    a = ap.parse_args()
    rng = random.Random(a.seed)

    data = {"levels": [dict(L, puzzles=[]) for L in LEVELS]}
    if a.append and os.path.exists(a.out):
        data = json.load(open(a.out))
    elif not a.append:
        data["levels"][2]["puzzles"] = build_samples()   # your 4 screenshot puzzles seed Level 3

    for L in data["levels"]:
        seen = {json.dumps([p["dominoes"], p["solution"]]) for p in L["puzzles"]}
        while len(L["puzzles"]) < a.per_level:
            p = make_puzzle(L["rows"], L["cols"], rng)
            key = json.dumps([p["dominoes"], p["solution"]])
            if key in seen:
                continue
            seen.add(key)
            L["puzzles"].append(p)
        for i, p in enumerate(L["puzzles"], 1):
            p["id"] = i
        print(f'{L["name"]} ({L["rows"]}x{L["cols"]}): {len(L["puzzles"])} puzzles')

    with open(a.out, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print("wrote", a.out)

if __name__ == "__main__":
    main()