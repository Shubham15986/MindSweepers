import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Undo2, Redo2, RotateCcw, Settings, Lightbulb, Info, BarChart3, Lock,
  Square, Circle, Eraser, X, Moon, Sun, Play, LayoutGrid, Pause, ChevronRight, Check,
} from "lucide-react";
import type { GameProps } from "../../shared/types";
import "./dreamwall.css";



function useDreamwallWorker() {
  const [generating, setGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./generator.worker.ts', import.meta.url), { type: 'module' });
    return () => workerRef.current?.terminate();
  }, []);

  const generate = (n: number, seed: string, onDone: (puzzle: any) => void) => {
    setGenerating(true);
    if (!workerRef.current) return;
    workerRef.current.onmessage = (e) => {
      if (e.data.type === "done") {
        // The worker prechecks the puzzle to ensure exactly 1 solution exists.
        setGenerating(false);
        onDone(e.data.puzzle);
      } else if (e.data.type === "error") {
        // If generation failed, retry with a mutated seed to guarantee a valid solvable grid
        workerRef.current?.postMessage({ n, seed: seed + Math.random().toString(36).substring(7) });
      }
    };
    workerRef.current.postMessage({ n, seed });
  };

  return { generating, generate };
}

type Cell = 0 | 1 | 2; // empty, sea, island
type Tier = { key: string; name: string; size: number; blurb: string; dream: string; points: number };
const TIERS: Tier[] = [
  { key: "4", name: "Easy", size: 4, dream: "Stage 1", blurb: "A small grid to warm up.", points: 20 },
  { key: "6", name: "Medium", size: 6, dream: "Stage 2", blurb: "More complex island shapes.", points: 30 },
  { key: "8", name: "Hard", size: 8, dream: "Stage 3", blurb: "A sprawling puzzle to test your logic.", points: 50 },
];
type Level = { id: string; tier: Tier; index: number; n: number; seed: string };
const randomSeed = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

const LEVELS: Level[] = TIERS.map((tier, index) => ({
  id: "L" + (index + 1),
  tier,
  index,
  n: tier.size,
  seed: Math.random().toString(36).slice(2),
}));

function neighbors(i: number, n: number) {
  const x = i % n, y = Math.floor(i / n), o: number[] = [];
  if (x > 0) o.push(i - 1); if (x < n - 1) o.push(i + 1);
  if (y > 0) o.push(i - n); if (y < n - 1) o.push(i + n);
  return o;
}

function analyze(cells: Cell[], lv: { n: number, clues: (number | null)[] }) {
  const n = lv.n, err = new Set<number>(), good = new Set<number>();
  // 2x2 pools
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
    const q = [y * n + x, y * n + x + 1, (y + 1) * n + x, (y + 1) * n + x + 1];
    if (q.every((i) => cells[i] === 1)) q.forEach((i) => err.add(i));
  }
  const pools = err.size;
  // visual feedback: islands (grouping both 0s and 2s)
  const seen = new Set<number>();
  cells.forEach((_, s) => {
    if (cells[s] === 1 || seen.has(s)) return;
    const comp: number[] = [], st = [s]; seen.add(s);
    let hasExplicitDot = false;
    
    while (st.length) { 
      const c = st.pop()!; comp.push(c);
      if (cells[c] === 2) hasExplicitDot = true;
      for (const m of neighbors(c, n)) 
        if (cells[m] !== 1 && !seen.has(m)) { seen.add(m); st.push(m); } 
    }
    const clues = comp.filter((i) => lv.clues[i]);
    const isClosed = comp.every(i => neighbors(i, n).every(m => comp.includes(m) || cells[m] === 1));
    const hasSeaBoundary = comp.some(i => neighbors(i, n).some(m => cells[m] === 1));
    
    if (isClosed && hasSeaBoundary) {
      if (clues.length !== 1) {
        comp.forEach(i => err.add(i));
      } else {
        const target = lv.clues[clues[0]]!;
        if (comp.length !== target) {
          comp.forEach(i => err.add(i));
        } else {
          comp.forEach(i => good.add(i));
        }
      }
    } else if (hasExplicitDot) {
      const dotComp = comp.filter(i => cells[i] === 2 || lv.clues[i]);
      if (clues.length > 1) {
        dotComp.forEach(i => err.add(i));
      } else if (clues.length === 1 && dotComp.length > lv.clues[clues[0]]!) {
        dotComp.forEach(i => err.add(i));
      }
    }
  });
  // solved check: empties count as island
  let solved = pools === 0;
  if (solved) {
    const sea = cells.map((c, i) => (c === 1 ? i : -1)).filter((i) => i >= 0);
    const vis = new Set<number>(sea.slice(0, 1)), st = sea.slice(0, 1);
    while (st.length) { const c = st.pop()!; for (const m of neighbors(c, n)) if (cells[m] === 1 && !vis.has(m)) { vis.add(m); st.push(m); } }
    if (vis.size !== sea.length || !sea.length) solved = false;
    const s2 = new Set<number>();
    for (let s = 0; s < cells.length && solved; s++) {
      if (cells[s] === 1 || s2.has(s)) continue;
      const comp: number[] = [], q = [s]; s2.add(s);
      while (q.length) { const c = q.pop()!; comp.push(c); for (const m of neighbors(c, n)) if (cells[m] !== 1 && !s2.has(m)) { s2.add(m); q.push(m); } }
      const cl = comp.filter((i) => lv.clues[i]);
      if (cl.length !== 1 || lv.clues[cl[0]] !== comp.length) solved = false;
    }
  }
  return { err, good, pools, solved };
}

type Progress = Record<string, { status: "progress" | "solved"; cells?: Cell[]; best?: number; score?: number }>;
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const fmt = (s: number) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
const isUnlocked = (lv: Level, p: Progress) => true;

function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className={"grid grid-cols-2 gap-[2px] shrink-0 " + (small ? "w-5 h-5" : "w-6 h-6 md:w-8 md:h-8")}>
        <span className="bg-current rounded-[1px]" /><span className="rounded-[1px] border border-current" />
        <span className="rounded-[1px] border border-current grid place-items-center"><span className="w-1 h-1 rounded-full bg-current" /></span><span className="bg-mint rounded-[1px]" />
      </div>
      <span className={"font-semibold tracking-[0.2em] md:tracking-[0.42em] " + (small ? "text-xs md:text-sm" : "text-lg md:text-2xl")}>DREAMWALL</span>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink/40 backdrop-blur-sm fade" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rise w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] text-[var(--fg)] p-6 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 grid place-items-center rounded-full hover:bg-[var(--muted)]"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Rules() {
  const items = [
    ["Every number is an island", "A numbered cell belongs to an island with exactly that many white cells."],
    ["One number per island", "Islands never touch each other horizontally or vertically."],
    ["One continuous sea", "All dark cells must connect into a single wall."],
    ["No pools", "The sea can never form a 2×2 block."],
  ];
  return (
    <ol className="space-y-4">
      {items.map(([t, d], i) => (
        <li key={t} className="flex gap-4">
          <span className="font-mono text-xs mt-1 text-[var(--dim)]">0{i + 1}</span>
          <div><p className="font-medium">{t}</p><p className="text-sm text-[var(--dim)] leading-relaxed">{d}</p></div>
        </li>
      ))}
      <li className="text-sm text-[var(--dim)] pt-2 border-t border-[var(--line)]">Tip: drag across cells to paint several at once.</li>
    </ol>
  );
}

function HeroGrid() {
  const g = ["2.#1#", "##.##", "#3.#2", "#.###", "##.#1"];
  const show = [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1];
  return (
    <div className="grid grid-cols-5 gap-[3px] p-[3px] bg-ink/90 rounded-md w-full aspect-square">
      {g.join("").split("").map((c, i) => {
        const shown = show[i];
        const sea = c === "#" && shown;
        return (
          <div key={i} className={"grid place-items-center rounded-[2px] " + (sea ? "bg-ink" : "bg-paper")}>
            {/[0-9]/.test(c) && <span className="font-semibold text-ink text-2xl sm:text-3xl">{c}</span>}
            {c === "." && shown ? <span className="w-2 h-2 rounded-full bg-ink" /> : null}
            {i === 24 && <span className="absolute" />}
          </div>
        );
      })}
    </div>
  );
}

export default function Dreamwall({ onGameOver }: GameProps) {
  const dark = false;
  const [progress, setProgress] = useState<Progress>(() => load("nk-progress", {}));
  const [screen, setScreen] = useState<"menu" | "levels" | "game">("menu");
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [puzzleData, setPuzzleData] = useState<{ clues: (number | null)[], solution: Cell[] } | null>(null);
  const { generating, generate } = useDreamwallWorker();
  const [modal, setModal] = useState<null | "rules" | "settings" | "stats">(null);
  const [demo, setDemo] = useState(false);
  const [lastId, setLastId] = useState<string>(() => load("nk-last", LEVELS[0].id));

    useEffect(() => localStorage.setItem("nk-progress", JSON.stringify(progress)), [progress]);
  useEffect(() => localStorage.setItem("nk-last", JSON.stringify(lastId)), [lastId]);

  const open = (lv: Level) => { 
    setLevel(lv); 
    setLastId(lv.id); 
    setScreen("game"); 
    setPuzzleData(null);
    generate(lv.n, lv.seed, (data) => setPuzzleData(data));
  };
  const vars = dark
    ? { "--bg": "#17181c", "--surface": "#202227", "--fg": "#ece8de", "--dim": "#8d8a83", "--line": "#33353c", "--muted": "#2a2c32" }
    : { "--bg": "#f2eee4", "--surface": "#fbf9f4", "--fg": "#13151b", "--dim": "#77746c", "--line": "#dcd6c8", "--muted": "#e9e4d8" };

  const solvedLevels = LEVELS.filter((l) => progress[l.id]?.status === "solved");
  
  return (
    <div style={vars as React.CSSProperties} className="dreamwall-root min-h-max md:min-h-full flex-1 flex flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      {screen === "menu" && (
        <main className="relative mx-auto max-w-5xl w-full flex-1 min-h-0 px-4 md:px-6 py-6 md:py-8 flex flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Logo small />
            <div className="flex items-center gap-0.5 md:gap-1">
              <button onClick={() => setDemo(true)} className="group mr-1 h-8 md:h-10 pl-2 pr-3 md:pl-3 md:pr-4 rounded-full bg-amber text-night flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-medium hover:bg-amber/90 transition shadow-md">
                <Spinner /> <span className="font-bold tracking-widest uppercase">Demo</span>
              </button>
            </div>
          </header>
          <div className="flex-1 grid md:grid-cols-2 gap-8 md:gap-16 items-center py-8 md:py-10">
            <div className="relative order-1 md:order-2 mx-auto w-[95%] max-w-[320px] md:max-w-[460px]">
              <div className="absolute -inset-4 md:-inset-6 border border-[var(--line)] rounded-xl rotate-3" />
              <div className="relative -rotate-2 shadow-[0_30px_60px_-20px_rgba(19,21,27,.45)] rounded-md"><HeroGrid /></div>
              <span className="absolute -bottom-7 md:-bottom-9 right-0 font-mono text-[9px] md:text-[10px] tracking-widest text-[var(--dim)]">FIG. 01 — 5×5, IN PROGRESS</span>
            </div>
            <div className="order-2 md:order-1 rise text-center md:text-left">
              <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-[var(--dim)] mb-4 break-words">A NURIKABE PUZZLE · A PUZZLE WITHIN A GRID</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[0.95] tracking-tight mb-4 md:mb-5">Islands<br />in a <span className="font-semibold">dark sea.</span></h1>
              <p className="text-[var(--dim)] max-w-sm mx-auto md:mx-0 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">Shade the sea, leave the islands. One number per island, one unbroken wall of water, never a pool.</p>
              <div className="space-y-3 max-w-sm mx-auto md:mx-0">
                <button onClick={() => open(LEVELS.find((l) => l.id === lastId) ?? LEVELS[0])} className="group w-full h-14 md:h-16 px-6 rounded-2xl bg-[var(--fg)] text-[var(--bg)] flex items-center justify-between hover:scale-[1.01] active:scale-[.99] transition">
                  <span className="flex items-center gap-3 font-medium text-sm md:text-base"><Play size={18} fill="currentColor" />Continue Journey</span>
                  <span className="font-mono text-[10px] md:text-xs opacity-60">{(LEVELS.find((l) => l.id === lastId) ?? LEVELS[0]).tier.dream}</span>
                </button>
                <button onClick={() => setScreen("levels")} className="w-full h-12 md:h-14 px-6 rounded-2xl border border-[var(--line)] flex items-center justify-between hover:bg-[var(--muted)] transition">
                  <span className="flex items-center gap-3 font-medium text-sm md:text-base"><LayoutGrid size={18} strokeWidth={1.6} />Level Select</span>
                  <span className="font-mono text-[10px] md:text-xs text-[var(--dim)]">{solvedLevels.reduce((t, l) => t + l.tier.points, 0)} pts</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {screen === "levels" && (
        <main className="mx-auto max-w-5xl px-5 py-6 rise">
          <header className="flex items-center gap-3 mb-8">
            <button onClick={() => setScreen("menu")} aria-label="Back" className="w-11 h-11 grid place-items-center rounded-full hover:bg-[var(--muted)]"><ArrowLeft size={20} strokeWidth={1.6} /></button>
            <div><h1 className="text-2xl font-semibold">Puzzle Levels</h1><p className="text-sm text-[var(--dim)]">Complete each level to unlock the next.</p></div>
          </header>
          <div className="grid md:grid-cols-3 gap-5">
            {LEVELS.map((l) => {
              const p = progress[l.id], unlocked = isUnlocked(l, progress);
              return (
                <button key={l.id} disabled={!unlocked} onClick={() => open(l)} className={"group relative rounded-3xl border p-5 text-left transition " + (unlocked ? "border-[var(--line)] bg-[var(--surface)] hover:-translate-y-1 hover:shadow-xl" : "border-dashed border-[var(--line)] opacity-50 cursor-not-allowed")}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--dim)]">LAYER {l.index + 1} · {l.tier.name.toUpperCase()}</span>
                    {!unlocked ? <Lock size={15} /> : p?.status === "solved" ? <span className="w-5 h-5 rounded-full bg-mint grid place-items-center"><Check size={12} strokeWidth={3} className="text-ink" /></span>
                      : p ? <span className="w-5 h-5 rounded-full border-2 border-mint" style={{ background: "linear-gradient(90deg,#2fd3a6 50%,transparent 50%)" }} />
                      : <span className="w-5 h-5 rounded-full border-2 border-[var(--line)]" />}
                  </div>
                  <div className="grid gap-[2px] mb-5 aspect-square bg-ink p-[2px] rounded-lg" style={{ gridTemplateColumns: "repeat(" + l.n + ",1fr)", transform: "scale(" + (1 - l.index * 0.08) + ")" }}>
                    {Array.from({ length: l.n * l.n }).map((_, i) => {
                      return <span key={i} className={"grid place-items-center text-sm font-semibold rounded-[2px] bg-paper text-ink"}></span>;
                    })}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{l.tier.dream}</h2>
                  <p className="text-sm text-[var(--dim)] mb-4">{l.tier.blurb}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                    <span className="font-mono text-xs">{l.n}×{l.n}</span>
                    <span className="font-mono text-xs"><span className="text-mint font-bold">+{l.tier.points}</span> pts</span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      )}

      {screen === "game" && (
        generating || !puzzleData ? (
          <div className="h-full flex-1 min-h-0 flex flex-col items-center justify-center text-[var(--dim)] gap-4 font-mono text-sm">
            <Spinner />
            <p>Generating {level.n}x{level.n} puzzle...</p>
            {level.n >= 8 && <p className="text-[10px] opacity-60">(Complex layers may take up to 30s to stabilize)</p>}
          </div>
        ) : (
          <Game key={level.id} level={{ ...level, clues: puzzleData.clues, solution: puzzleData.solution }} saved={progress[level.id]}
            onBack={() => setScreen("levels")} onMenu={() => setScreen("menu")}
            onRules={() => setModal("rules")} onSettings={() => setModal("settings")}
            onSave={(cells) => setProgress((p) => (p[level.id]?.status === "solved" ? p : { ...p, [level.id]: { status: "progress", cells } }))}
            onSolve={(time, score) => { onGameOver({ score, level: level.tier.dream }); setProgress((p) => ({ ...p, [level.id]: { status: "solved", best: Math.min(time, p[level.id]?.best ?? 1e9), score: Math.max(score, p[level.id]?.score ?? 0) } })); }}
            onNext={() => { if (level.index === LEVELS.length - 1) setScreen("menu"); else open(LEVELS[level.index + 1]); }}
            onReplay={() => { const nl = { ...level, seed: Math.random().toString(36).slice(2) }; setLevel(nl); setProgress(p => { const np = {...p}; delete np[level.id]; return np; }); generate(nl.n, nl.seed, setPuzzleData); }}
          />
        )
      )}

      {demo && <Demo onClose={() => setDemo(false)} onPlay={() => { setDemo(false); open(LEVELS[0]); }} />}
      {modal === "rules" && <Modal title="How to play" onClose={() => setModal(null)}><Rules /></Modal>}
      {modal === "settings" && (
        <Modal title="Settings" onClose={() => setModal(null)}>
                    <button onClick={() => { if (confirm("Erase all progress?")) { setProgress({}); setModal(null); } }} className="w-full text-left py-4 text-coral">Reset all progress</button>
        </Modal>
      )}
      {modal === "stats" && (
        <Modal title="Statistics" onClose={() => setModal(null)}>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Solved", solvedLevels.length],
              ["Score", solvedLevels.reduce((t, l) => t + l.tier.points, 0) + "/100"],
              ["Largest", solvedLevels.length ? Math.max(...solvedLevels.map((l) => l.n)) + "×" + Math.max(...solvedLevels.map((l) => l.n)) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-[var(--muted)] p-4"><p className="text-2xl font-semibold">{v}</p><p className="font-mono text-[10px] tracking-widest uppercase text-[var(--dim)] mt-1">{k}</p></div>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {TIERS.map((t) => { const s = LEVELS.filter((l) => l.tier === t && progress[l.id]?.status === "solved").length; return (
              <div key={t.key} className="flex items-center gap-3 text-sm"><span className="w-24 text-xs">{t.dream}</span><div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden"><div className="h-full bg-mint" style={{ width: s * 100 + "%" }} /></div><span className="font-mono text-xs w-8 text-right">{s ? "+" + t.points : "—"}</span></div>
            ); })}
          </div>
        </Modal>
      )}
    </div>
  );
}

type Tool = 1 | 2 | 0;
function Game({ level, saved, onBack, onMenu, onRules, onSettings, onSave, onSolve, onNext, onReplay }: {
  level: Level & { clues: (number | null)[]; solution: Cell[] }; saved?: Progress[string]; onBack: () => void; onMenu: () => void; onRules: () => void; onSettings: () => void;
  onSave: (c: Cell[]) => void; onSolve: (t: number, s: number) => void; onNext: () => void; onReplay: () => void;
}) {
  const n = level.n;
  const init = saved?.status === "progress" && saved.cells ? saved.cells : (Array(n * n).fill(0) as Cell[]);
  const [cells, setCells] = useState<Cell[]>(init);
  const [past, setPast] = useState<Cell[][]>([]);
  const [future, setFuture] = useState<Cell[][]>([]);
  const [tool, setTool] = useState<Tool>(1);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ undos: 0, errors: 0, hints: 0 });
  const [won, setWon] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hintCell, setHintCell] = useState<number | null>(null);
  const drag = useRef<{ value: Cell; snapshot: Cell[] } | null>(null);

  const a = useMemo(() => analyze(cells, level), [cells, level]);
  const filled = cells.filter((c, i) => c && !level.clues[i]).length;
  const total = level.clues.filter((c) => !c).length;

  useEffect(() => { if (won || paused) return; const t = setInterval(() => setTime((s) => s + 1), 1000); return () => clearInterval(t); }, [won, paused]);
  useEffect(() => { if (!won) onSave(cells); }, [cells]); // eslint-disable-line
  const prevPools = useRef(a.pools);
  useEffect(() => { if (a.pools > prevPools.current) setStats((s) => ({ ...s, errors: s.errors + 1 })); prevPools.current = a.pools; }, [a.pools]);
  useEffect(() => {
    if (a.solved && !won) {
      setWon(true);
      onSolve(time, level.tier.points);
    }
  }, [a.solved]); // eslint-disable-line

  const commit = useCallback((next: Cell[], snapshot: Cell[]) => {
    if (next.every((c, i) => c === snapshot[i])) return;
    setPast((p) => [...p.slice(-99), snapshot]); setFuture([]);
  }, []);

  const paint = (i: number, start: boolean) => {
    if (level.clues[i] || won) return;
    if (start) {
      const value: Cell = tool === 0 ? 0 : cells[i] === tool ? 0 : tool;
      drag.current = { value, snapshot: cells };
    }
    const d = drag.current; if (!d) return;
    setCells((c) => { if (c[i] === d.value) return c; const nx = [...c]; nx[i] = d.value; return nx; });
  };
  const end = () => { if (drag.current) { commit(cells, drag.current.snapshot); drag.current = null; } };
  useEffect(() => { window.addEventListener("pointerup", end); return () => window.removeEventListener("pointerup", end); });

  const undo = () => { if (!past.length) return; setFuture((f) => [cells, ...f]); setCells(past[past.length - 1]); setPast((p) => p.slice(0, -1)); setStats((s) => ({ ...s, undos: s.undos + 1 })); };
  const redo = () => { if (!future.length) return; setPast((p) => [...p, cells]); setCells(future[0]); setFuture((f) => f.slice(1)); };
  const reset = () => { setPast((p) => [...p, cells]); setFuture([]); setCells(Array(n * n).fill(0) as Cell[]); };
  const reveal = () => {
    setCells(level.solution);
    setStats((s) => ({ ...s, hints: s.hints + 1 }));
    setRevealed(true);
    setWon(true);
    onSolve(time, 0);
  };

    const tools = [
    { v: 1 as Tool, label: "Sea", icon: <Square size={18} fill="currentColor" /> },
    { v: 2 as Tool, label: "Island", icon: <Circle size={9} fill="currentColor" /> },
    { v: 0 as Tool, label: "Erase", icon: <Eraser size={18} strokeWidth={1.6} /> },
  ];

  return (
    <main className="mx-auto max-w-2xl w-full flex-1 min-h-0 flex flex-col px-0 md:px-4 py-4 select-none">
      <nav className="flex items-center justify-between">
        <button onClick={onBack} aria-label="Back" className="w-11 h-11 grid place-items-center rounded-full hover:bg-[var(--muted)]"><ArrowLeft size={20} strokeWidth={1.6} /></button>
        <div className="text-center">
          <p className="font-medium leading-tight">{level.tier.dream} · {level.tier.name}</p>
          <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--dim)]">{n}×{n} GRID</p>
        </div>
        <div className="flex">
          <button onClick={onRules} aria-label="Rules" className="w-11 h-11 grid place-items-center rounded-full hover:bg-[var(--muted)]"><Info size={19} strokeWidth={1.6} /></button>
          <button onClick={() => setPaused(true)} aria-label="Pause" className="w-11 h-11 grid place-items-center rounded-full hover:bg-[var(--muted)]"><Pause size={19} strokeWidth={1.6} /></button>
        </div>
      </nav>

      <div className="flex items-end justify-between mt-5 mb-3 px-1">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[var(--dim)]">COVERAGE</p>
          <div className="flex items-center gap-2"><span className="text-2xl font-semibold tabular-nums">{Math.round((filled / total) * 100)}%</span>
            <span className="w-16 h-1 rounded-full bg-[var(--muted)] overflow-hidden"><span className="block h-full bg-mint transition-all" style={{ width: (filled / total) * 100 + "%" }} /></span></div>
        </div>
      </div>

      <div className="flex-1 grid place-items-center py-2">
        <div className={"relative rounded-lg p-[3px] bg-ink shadow-[0_24px_50px_-24px_rgba(19,21,27,.6)] transition " + (won ? "blur-[2px] scale-[.98]" : "")}
          style={{ display: "grid", gridTemplateColumns: "repeat(" + n + ", minmax(0, 1fr))", gap: "2px", touchAction: "none", width: "100%", maxWidth: Math.min(540, Math.max(260, n * 68)) + "px", aspectRatio: "1" }}
          onPointerLeave={() => {}}>
          {cells.map((c, i) => {
            const clue = level.clues[i];
            const isErr = a.err.has(i), isGood = a.good.has(i) && !isErr;
            return (
              <button key={i} aria-label={"cell " + i}
                onPointerDown={(e) => { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); paint(i, true); }}
                onPointerEnter={(e) => { if (e.buttons) paint(i, false); }}
                className={"relative aspect-square rounded-[3px] overflow-hidden grid place-items-center transition-colors duration-150 " + (c === 1 ? "bg-[#2a2d36]" : "bg-paper") + (hintCell === i ? " ring-2 ring-mint ring-inset" : "")}>
                {c === 1 && <span key={"s" + i + won} className={"absolute inset-0 bg-ink ink-drop " + (won ? "sea-win" : "")} style={won ? { animationDelay: ((i % n) + Math.floor(i / n)) * 60 + "ms" } : undefined} />}
                {isGood && <span className="absolute inset-0 bg-mint/25 shadow-[inset_0_0_0_2px_#2fd3a6]" />}
                {isErr && <span className="absolute inset-0 err" />}
                {clue ? <span className={"relative font-semibold text-ink tabular-nums " + (n === 10 ? "text-lg" : "text-2xl")}>{clue}</span> : null}
                {c === 2 && !clue && <span className="relative w-2 h-2 rounded-full bg-ink dot-pop" />}
              </button>
            );
          })}
        </div>
      </div>

      
      <div className="grid grid-cols-4 mt-3 mb-2">
        {([[Undo2, "Undo", undo, !past.length], [Redo2, "Redo", redo, !future.length], [RotateCcw, "Reset", reset, false], [Lightbulb, "View Ans", reveal, false]] as const).map(([I, l, fn, dis]) => (
          <button key={l} onClick={fn} disabled={dis || won} className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-[var(--muted)] disabled:opacity-30 transition">
            <I size={19} strokeWidth={1.6} /><span className="text-[11px] text-[var(--dim)]">{l}</span>
          </button>
        ))}
      </div>

      {paused && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[var(--bg)]/80 backdrop-blur-md fade">
          <div className="rise text-center space-y-3 w-64">
            <p className="font-mono text-xs tracking-[0.3em] text-[var(--dim)] mb-4">PAUSED</p>
            <button onClick={() => setPaused(false)} className="w-full h-14 rounded-2xl bg-[var(--fg)] text-[var(--bg)] font-medium">Resume</button>
            <button onClick={() => { setPaused(false); onSettings(); }} className="w-full h-12 rounded-2xl border border-[var(--line)]">Settings</button>
            <button onClick={onMenu} className="w-full h-12 rounded-2xl text-[var(--dim)]">Main menu</button>
          </div>
        </div>
      )}

      {won && (
        <div className="mt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={onReplay} className="w-full h-14 rounded-2xl bg-amber text-night font-bold text-lg flex items-center justify-center gap-2">
            New Grid <ChevronRight size={20} strokeWidth={2.5} />
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onNext} className="h-12 rounded-2xl border border-[var(--line)] font-medium">
              {level.index === LEVELS.length - 1 ? "Finish" : "Next Level"}
            </button>
            <button onClick={onMenu} className="h-12 rounded-2xl border border-[var(--line)] font-medium">Menu</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Spinner() {
  return <span className="relative w-4 h-4 inline-block"><span className="absolute inset-0 rounded-full border border-current" /><span className="absolute left-1/2 top-0 -ml-px w-0.5 h-2 bg-current origin-bottom totem" /></span>;
}

// Demo puzzle: unique solution. Clue 4 at 0, 2 at 6, 1 at 15.
const DEMO_CLUES: (number | null)[] = [4, null, null, null, null, null, 2, null, null, null, null, null, null, null, null, 1];
const DEMO_STEPS: { title: string; text: string; sea: number[]; island: number[]; focus: number[] }[] = [
  { title: "Start Puzzle", text: "A 4×4 grid. Three numbers: three islands. Everything else will become one connected sea. Let's plant the idea, one layer at a time.", sea: [], island: [], focus: [0, 6, 15] },
  { title: "The 1 is already complete", text: "An island of size 1 is just its own cell. Every neighbour must be sea, so we wall it in.", sea: [11, 14], island: [], focus: [15] },
  { title: "Keep the islands apart", text: "Cells touching the 2 sit right on the 4's path. If they were land, the two islands would merge. Seal them with sea.", sea: [2, 5], island: [], focus: [6] },
  { title: "Connect the sea", text: "The wall around the 1 can't be cut off. The only way out is up the right edge, so these cells become sea.", sea: [3, 7], island: [], focus: [11] },
  { title: "Only one way out", text: "The 2 needs one more cell. Up, left and right are all sea now. Only the cell below is left, so it's island.", sea: [], island: [10], focus: [6, 10] },
  { title: "Close the island", text: "The 2 is complete. Wall it in. The new sea also joins the bottom of the wall to the right edge.", sea: [9, 13], island: [], focus: [10] },
  { title: "Gravity pulls it down", text: "The 4 needs three more cells. The left column is the only open path, so the island runs straight down.", sea: [], island: [4, 8, 12], focus: [0, 4, 8, 12] },
  { title: "The kick", text: "One cell is left. The 4 is full, so it's sea. One connected wall, no 2×2 pools, every island the right size. Wake up!", sea: [1], island: [], focus: [1] },
];

function Demo({ onClose, onPlay }: { onClose: () => void; onPlay: () => void }) {
  const [step, setStep] = useState(0);
  const last = DEMO_STEPS.length - 1;
  const cells = useMemo(() => {
    const c = Array(16).fill(0) as Cell[];
    DEMO_STEPS.slice(0, step + 1).forEach((s) => { s.sea.forEach((i) => (c[i] = 1)); s.island.forEach((i) => (c[i] = 2)); });
    return c;
  }, [step]);
  const cur = DEMO_STEPS[step];
  const fresh = new Set([...cur.sea, ...cur.island]);
  const done = step === last;
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-md grid place-items-center p-4 fade">
      <div className="rise relative w-full h-[90dvh] md:h-auto md:max-w-3xl rounded-3xl bg-[var(--surface)] text-[var(--fg)] overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative bg-ink p-4 sm:p-10 flex-1 grid place-items-center overflow-hidden min-h-0">
          {/* nested dream frames */}
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="absolute border border-white/10 rounded-2xl dream-ring" style={{ inset: k * 18 + "px", animationDelay: k * 0.6 + "s" }} />
          ))}
          <div className={"relative grid grid-cols-4 gap-[3px] p-[3px] rounded-lg w-full max-w-[240px] sm:max-w-[280px] transition-all duration-700 " + (done ? "bg-mint shadow-[0_0_60px_-5px_#2fd3a6]" : "bg-white/15")} style={{ transform: "perspective(800px) rotateX(" + (done ? 0 : 8) + "deg) rotateZ(" + (done ? 0 : -1.5) + "deg)" }}>
            {cells.map((c, i) => {
              const clue = DEMO_CLUES[i], focus = cur.focus.includes(i);
              return (
                <div key={i} className={"relative aspect-square rounded-[3px] grid place-items-center overflow-hidden " + (c === 1 ? "bg-[#2a2d36]" : "bg-paper")}>
                  {c === 1 && <span key={step + "-" + fresh.has(i)} className={"absolute inset-0 bg-ink " + (fresh.has(i) ? "ink-drop" : "") + (done ? " sea-win" : "")} style={done ? { animationDelay: (i % 4 + Math.floor(i / 4)) * 90 + "ms" } : fresh.has(i) ? { animationDelay: [...fresh].indexOf(i) * 120 + "ms" } : undefined} />}
                  {focus && !done && <span key={"f" + step} className="absolute inset-0 focus-ring" />}
                  {clue ? <span className="relative text-3xl font-semibold text-ink">{clue}</span> : null}
                  {c === 2 && !clue && <span key={"d" + step} className="relative w-2.5 h-2.5 rounded-full bg-ink dot-pop" style={{ animationDelay: (fresh.has(i) ? [...fresh].indexOf(i) * 120 : 0) + "ms" }} />}
                </div>
              );
            })}
          </div>
          <span className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] tracking-[0.3em] text-white/40">LAYER {step} / {last}</span>
        </div>
        <div className="p-7 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono font-bold text-[10px] tracking-[0.3em] text-[var(--dim)]">GUIDED DEMO</span>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full hover:bg-[var(--muted)]"><X size={17} /></button>
          </div>
          <div key={step} className="rise flex-1">
            <p className="font-mono text-xs text-mint mb-2">Step {String(step + 1).padStart(2, "0")}</p>
            <h3 className="text-2xl font-semibold tracking-tight mb-3">{cur.title}</h3>
            <p className="text-[var(--dim)] leading-relaxed">{cur.text}</p>
            {(cur.sea.length > 0 || cur.island.length > 0) && (
              <div className="flex gap-4 mt-5 text-xs">
                {cur.sea.length > 0 && <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-sm bg-ink border border-[var(--line)]" />+{cur.sea.length} sea</span>}
                {cur.island.length > 0 && <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-sm bg-paper border border-[var(--line)] grid place-items-center"><span className="w-1 h-1 rounded-full bg-ink" /></span>+{cur.island.length} island</span>}
              </div>
            )}
          </div>
          <div className="flex gap-1.5 my-6">
            {DEMO_STEPS.map((_, i) => <button key={i} onClick={() => setStep(i)} aria-label={"Step " + (i + 1)} className={"h-1.5 rounded-full transition-all " + (i === step ? "w-8 bg-[var(--fg)]" : i < step ? "w-3 bg-mint" : "w-3 bg-[var(--line)]")} />)}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="h-12 w-12 grid place-items-center rounded-2xl border border-[var(--line)] disabled:opacity-30"><ArrowLeft size={18} /></button>
            {done
              ? <button onClick={onPlay} className="flex-1 h-12 rounded-2xl bg-mint text-ink font-semibold flex items-center justify-center gap-2">Start Puzzle <ChevronRight size={18} /></button>
              : <button onClick={() => setStep((s) => s + 1)} className="flex-1 h-12 rounded-2xl bg-[var(--fg)] text-[var(--bg)] font-medium flex items-center justify-center gap-2">Next <ChevronRight size={18} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}
