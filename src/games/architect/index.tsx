import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, CheckCheck, Flag, LogOut, Timer as TimerIcon, Eye, ChevronRight, RefreshCw } from "lucide-react";
import type { GameProps } from "../../shared/types";
import { LEVELS, LEVEL_ORDER, MAX_HINTS, TUTORIAL_KEY, type LevelKey } from "./config";
import { useArchitect, type Mode } from "./useArchitect";
import Board from "./Board";
import NumberPad from "./NumberPad";
import DemoOverlay from "./DemoOverlay";
import HowToPlay from "./HowToPlay";
import { ARCH_CSS } from "./styles";
import GameNav from "../common/GameNav";
import { useDreamTheme } from "../common/theme";

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

// Ticks on its own so the board never re-renders once a second.
function Timer({ startedAt, running, frozen }: { startedAt: number; running: boolean; frozen: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  return <span className="tabular text-(--fg) text-sm font-semibold" aria-label="Elapsed time">{fmt(running ? now - startedAt : frozen)}</span>;
}

function Confirm({ title, body, yes, onYes, onNo }: { title: string; body: string; yes: string; onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="g-overlay ar-fade" role="alertdialog" aria-modal="true" aria-label={title} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onNo(); } }}>
      <div className="g-card w-full max-w-xs p-6 text-center ar-rise">
        <h3 className="text-(--fg) text-3xl font-light">{title}</h3>
        <p className="text-sm text-(--dim) mt-2">{body}</p>
        <div className="mt-6 flex gap-3">
          <button ref={ref} type="button" className="g-btn-ghost flex-1" onClick={onNo}>Cancel</button>
          <button type="button" className="g-btn-primary flex-1 !px-4" onClick={onYes}>{yes}</button>
        </div>
      </div>
    </div>
  );
}

function readSeen() { try { return localStorage.getItem(TUTORIAL_KEY) === "1"; } catch { return true; } }
function writeSeen() { try { localStorage.setItem(TUTORIAL_KEY, "1"); } catch { /* private mode */ } }

export default function Architect({ onGameOver, onExit, seed }: GameProps & { seed?: string }) {
  const g = useArchitect(seed);
  const { s } = g;
  const [demo, setDemo] = useState(false);
  const theme = useDreamTheme();
  const [help, setHelp] = useState<null | "help" | "tutorial">(null);
  const [confirm, setConfirm] = useState<null | { kind: "level"; level: LevelKey } | { kind: "giveup" }>(null);
  const [submitted, setSubmitted] = useState(false);
  // Session-only memory: never persisted.
  const [best, setBest] = useState<Partial<Record<LevelKey, number>>>({});
  const [solvedCount, setSolvedCount] = useState(0);
  const [is3D, setIs3D] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const n = s.puzzle?.n ?? LEVELS[s.level].n;
  const playing = s.phase === "play";

  useEffect(() => {
    if (s.phase !== "solved") return;
    setSubmitted(false);
    setSolvedCount((c) => c + 1);
    setBest((b) => ({ ...b, [s.level]: Math.min(b[s.level] ?? Infinity, s.timeMs) }));
  }, [s.phase, s.level, s.timeMs]);

  const begin = useCallback((level: LevelKey = s.level, mode: Mode = s.mode) => {
    if (level === "Easy" && !readSeen()) { writeSeen(); setHelp("tutorial"); }
    g.start(level, mode);
  }, [g, s.level, s.mode]);

  const exit = () => { g.stop(); onExit(); };

  useEffect(() => {
    if (s.phase === "solved" && !submitted && s.score != null && s.puzzle) {
      setSubmitted(true);
      onGameOver({
        score: s.score, level: s.level,
        meta: { seed: s.puzzle.seed, mode: s.mode, timeMs: s.timeMs, hintsUsed: s.hints, boardState: s.cells.join("") },
      });
    }
  }, [s.phase, submitted, s.score, s.puzzle, s.level, s.mode, s.timeMs, s.hints, s.cells, onGameOver]);

  const changeLevel = (level: LevelKey) => {
    if (level === s.level) return;
    if (playing) setConfirm({ kind: "level", level });
    else if (s.phase === "start") g.setLevel(level);
    else begin(level);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!playing || demo || help || confirm || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const map: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (map[k]) { e.preventDefault(); g.move(...map[k]); return; }
    
    if (k === "+" || k === "=") { e.preventDefault(); g.changeHeight(1); return; }
    if (k === "-" || k === "_") { e.preventDefault(); g.changeHeight(-1); return; }
    
    const d = Number(k);
    if (d >= 1 && d <= n) { e.preventDefault(); g.input(d); return; }
    if (k === "Backspace" || k === "Delete" || k === "0") { e.preventDefault(); g.erase(); return; }
    if ((k === "z" || k === "Z") && e.shiftKey) { g.redo(); return; }
    if (k === "z" || k === "Z") { g.undo(); return; }
  };

  const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(s.level) + 1] as LevelKey | undefined;
  const levelSelect = (
    <select className="g-select" aria-label="Level" value={s.level} onChange={(e) => changeLevel(e.target.value as LevelKey)}>
      {LEVEL_ORDER.map((l) => <option key={l} value={l}>{l}</option>)}
    </select>
  );

  return (
    <div ref={rootRef} className="architect-root flex flex-col flex-1 w-full" style={theme.vars} onKeyDown={onKey}>
      <style>{ARCH_CSS}</style>

      {/* Top bar */}
      <GameNav name="ARCHITECT" glyph={<span className="flex items-end gap-[2px] h-4" aria-hidden><i className="w-1 h-2 bg-(--fg)/40" /><i className="w-1 h-4 bg-(--fg)" /><i className="w-1 h-3 bg-(--accent)" /></span>}
        dark={theme.dark} onToggleDark={theme.toggle} onDemo={() => setDemo(true)} onHelp={() => setHelp("help")}>
        {s.phase !== "start" && (
          <div className="flex items-center gap-3">
            {levelSelect}
            <span className="text-xs text-(--dim) tabular whitespace-nowrap" aria-label={MAX_HINTS - s.hints + " hints left"}>Reveals <span className="text-(--fg) font-semibold">{s.hints}</span></span>
          </div>
        )}
      </GameNav>

      {/* Start */}
      {s.phase === "start" && (
        <div className="relative z-10 flex-1 overflow-y-auto grid place-items-center px-6 py-8">
          <div className="text-center max-w-md w-full ar-rise">
            <p className="g-eyebrow">Logic puzzle · Towers</p>
            <h1 className="text-(--fg) font-light text-6xl md:text-7xl tracking-tight mt-3">ARCHI<span className="font-semibold">TECT</span></h1>
            <p className="text-(--dim) text-2xl mt-2">Build the city before it folds.</p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="g-seg" role="radiogroup" aria-label="Level">
                {LEVEL_ORDER.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={s.level === l} onClick={() => g.setLevel(l)}>
                    {l} <span className="tabular text-(--dim) ml-1">{LEVELS[l].n}×{LEVELS[l].n}</span>
                  </button>
                ))}
              </div>
              <p className="text-(--dim) text-lg -mt-1">{LEVELS[s.level].flavor}</p>
            </div>

            <button type="button" className="g-btn-primary mt-8 min-w-[200px]" onClick={() => begin()}>Begin</button>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" className="g-btn-ghost inline-flex items-center gap-2" onClick={() => setHelp("help")}><BookOpen size={15} />How to play</button>
            </div>
            {solvedCount > 0 && (
              <p className="mt-6 text-xs text-(--dim) tabular">
                This session: {solvedCount} solved
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {s.phase === "loading" && (
        <div className="relative z-10 flex-1 grid place-items-center">
          <p className="text-(--dim) text-2xl ar-pulse" role="status">The puzzle is generating...</p>
        </div>
      )}

      {s.puzzle && (s.phase === "play" || s.phase === "solved" || s.phase === "revealed") && (
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto w-full">
          <div className="min-h-full flex flex-col items-center justify-start max-w-2xl mx-auto gap-6 px-4 md:px-8 py-4 md:py-8">
          <div className="flex-1 min-h-0 flex flex-col items-center w-full max-h-[60vh]">
            <div className="text-center mb-4 shrink-0">
              <p className="text-(--fg) text-2xl font-light leading-none">{s.level}</p>
              <p className="text-(--dim) text-base">{LEVELS[s.level].flavor}</p>
            </div>
            <Board puzzle={s.puzzle} cells={s.cells} notes={s.notes} selected={s.selected} wrong={s.wrong} dim={s.dim} interactive={playing} onSelect={g.select} onViewChange={setIs3D} className="flex-1 min-h-0 w-full" fitHeight={false} />
          </div>

          <div className="w-full shrink-0 flex flex-col justify-center gap-4 pb-4">
            <div className="p-3 md:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center shadow-sm">
              <p className="text-xs md:text-sm font-medium text-(--fg) leading-relaxed" aria-live="polite">
                {s.phase === "revealed" ? "The solution, revealed. No score recorded." : s.message ?? "Tap a cell, then use + and - to set its height."}
              </p>
            </div>
            
            <NumberPad n={n} canUndo={s.past.length > 0} canRedo={s.future.length > 0} disabled={!playing}
              onChangeHeight={g.changeHeight} onErase={g.erase} onUndo={g.undo} onRedo={g.redo} />

            <div className="w-full max-w-[440px] mx-auto space-y-2" role="toolbar" aria-label="Tools">
              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="ar-tool bg-[var(--surface)] border border-[var(--line)] !flex-col gap-1 font-semibold text-xs md:text-sm" disabled={!playing} onClick={g.check} title="Check solution">
                  <CheckCheck size={18} strokeWidth={1.8} className="text-(--fg)" />
                  <span>Check</span>
                </button>
                <button type="button" className="ar-tool bg-[var(--surface)] border border-[var(--line)] !flex-col gap-1 font-semibold text-xs md:text-sm" disabled={!playing} onClick={() => setConfirm({ kind: "giveup" })} title="Give up & view solution">
                  <Flag size={18} strokeWidth={1.8} className="text-(--fg)" />
                  <span>Solution</span>
                </button>
                <button type="button" className="ar-tool !bg-(--fg) !text-(--bg) !border-(--fg) !flex-col gap-1 font-semibold text-xs md:text-sm" onClick={() => begin(s.level, "free")} title="Generate new puzzle">
                  <RefreshCw size={18} strokeWidth={1.8} className="text-(--bg)" />
                  <span className="!text-(--bg)">New Puzzle</span>
                </button>
              </div>
              <div className="flex flex-col items-center gap-2 pt-2">
                <label className="flex items-center gap-2 text-[11px] text-(--dim) cursor-pointer">
                  <input type="checkbox" checked={s.dim} onChange={g.toggleDim} className="accent-[var(--fg)] w-3.5 h-3.5" />Dim satisfied clues
                </label>
                <p className="flex items-center justify-center gap-2 text-center text-sm font-bold text-[var(--fg)] bg-[var(--fg)]/5 py-2.5 px-4 rounded-xl mt-1 w-full max-w-[440px]">
                  <Eye size={18} className="text-[var(--accent-ink)]" />
                  <span>{is3D ? "Press the eye again to return to 2D view." : "Press an eye to view that row or column in 3D."}</span>
                </p>
              </div>
              
              <div className="flex gap-2 max-w-[440px] w-full mx-auto mt-2">
                {s.phase === "revealed" && (
                  <>
                    <button type="button" className="g-btn-ghost flex-1" onClick={g.toStart}>Back to Start</button>
                    <button type="button" className="g-btn-primary flex-1" onClick={() => begin(s.level, "free")}>New Puzzle</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Solved */}
      {s.phase === "solved" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md animate-in fade-in duration-500 p-4" role="dialog" aria-modal="true" aria-label="Solved">
          <div className="relative text-center w-full max-w-sm bg-[var(--surface)] border border-[var(--line)] p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
            <p className="text-[var(--dim)] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">{s.level} · {LEVELS[s.level].flavor}</p>
            <h2 className="text-[var(--fg)] font-light text-6xl mb-6">Solved.</h2>
            <div className="mb-8 flex justify-center">
              <div className="w-full bg-[var(--bg)] rounded-2xl py-4 border border-[var(--line)]">
                <p className="text-[10px] text-[var(--dim)] uppercase tracking-widest font-semibold">Score</p>
                <p className="text-amber mt-1 text-4xl tabular-nums font-semibold">{s.score?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => begin(s.level, "free")} className="w-full h-14 rounded-2xl bg-amber text-night font-bold text-lg flex items-center justify-center gap-2 hover:bg-amber/90 transition-colors">
                New Grid <ChevronRight size={20} strokeWidth={2.5} />
              </button>
              <div className="grid grid-cols-2 gap-2">
                {nextLevel ? (
                  <button type="button" onClick={() => begin(nextLevel, s.mode)} className="h-12 rounded-2xl border border-[var(--line)] font-medium text-[var(--fg)] hover:bg-[var(--line)] transition-colors">Next Level</button>
                ) : (
                  <button type="button" className="h-12 rounded-2xl border border-[var(--line)] font-medium text-[var(--fg)] opacity-50 cursor-not-allowed">Finish</button>
                )}
                <button type="button" onClick={exit} className="h-12 rounded-2xl border border-[var(--line)] font-medium text-[var(--fg)] hover:bg-[var(--line)] transition-colors">Menu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm?.kind === "level" && (
        <Confirm title="Change level?" body="This city will fold and its progress will be lost." yes="Change"
          onNo={() => setConfirm(null)} onYes={() => { const l = confirm.level; setConfirm(null); begin(l); }} />
      )}
      {confirm?.kind === "giveup" && (
        <Confirm title="Give up?" body="The solution will be revealed. No score is recorded." yes="View Ans"
          onNo={() => setConfirm(null)} onYes={() => { setConfirm(null); g.reveal(); }} />
      )}
      {help && <HowToPlay firstRun={help === "tutorial"} onClose={() => setHelp(null)} />}
      {demo && (
        <DemoOverlay onClose={() => setDemo(false)} onStart={() => { setDemo(false); if (s.phase !== "play" && s.phase !== "loading") begin(); }} />
      )}
    </div>
  );
}
