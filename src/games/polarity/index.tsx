import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Flag, LogOut, ChevronRight } from "lucide-react";
import type { GameProps } from "../../shared/types";
import { LEVELS, LEVEL_ORDER, MAX_HINTS, TUTORIAL_KEY, type LevelKey } from "./config";
import { usePolarity, type Action, type Mode } from "./usePolarity";
import Board from "./Board";
import ToolPalette from "./ToolPalette";
import DemoOverlay from "./DemoOverlay";
import HowToPlay from "./HowToPlay";
import { POL_CSS } from "./styles";
import GameNav from "../common/GameNav";
import { useDreamTheme } from "../common/theme";

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

function Confirm({ title, body, yes, onYes, onNo }: { title: string; body: string; yes: string; onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="g-overlay pl-fade" role="alertdialog" aria-modal="true" aria-label={title} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onNo(); } }}>
      <div className="g-card w-full max-w-xs p-6 text-center pl-rise">
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

export default function Polarity({ onGameOver, onExit, seed }: GameProps & { seed?: string }) {
  const g = usePolarity(seed);
  const theme = useDreamTheme();
  const { s } = g;
  const [demo, setDemo] = useState(false);
  const [help, setHelp] = useState<null | "help" | "tutorial">(null);
  const [confirm, setConfirm] = useState<null | { kind: "level"; level: LevelKey } | { kind: "giveup" }>(null);
  const [submitted, setSubmitted] = useState(false);
  // Session-only memory: never persisted.
  const [best, setBest] = useState<Partial<Record<LevelKey, number>>>({});
  const [solvedCount, setSolvedCount] = useState(0);

  const playing = s.phase === "play";
  const lv = LEVELS[s.level];

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
        meta: { seed: s.puzzle.seed, mode: s.mode, timeMs: s.timeMs, hintsUsed: s.hints, boardState: s.states.join("") },
      });
      setTimeout(() => begin(s.level, "free"), 1500);
    }
  }, [s.phase, submitted, s.score, s.puzzle, s.level, s.mode, s.timeMs, s.hints, s.states, onGameOver, begin]);

  const changeLevel = (level: LevelKey) => {
    if (level === s.level) return;
    if (playing) setConfirm({ kind: "level", level });
    else if (s.phase === "start") g.setLevel(level);
    else begin(level);
  };

  // A plain tap uses the selected tool, or the quick cycle when no tool is selected.
  const onAct = useCallback((x: number, a: Action | "tap") => {
    g.act(x, a !== "tap" ? a : s.tool ?? "auto");
  }, [g, s.tool]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!playing || demo || help || confirm || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement).tagName;
    const onCell = (e.target as HTMLElement).dataset.cell !== undefined;
    const k = e.key;
    const map: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (map[k] && (onCell || tag === "DIV")) { e.preventDefault(); g.move(...map[k]); return; }
    if (!onCell && tag !== "DIV") return; // leave buttons and selects alone
    if (k === "Enter") { e.preventDefault(); g.act(s.cursor, "magnet"); return; }
    if (k === " ") { e.preventDefault(); g.act(s.cursor, "blank"); return; }
    if (k === "Backspace" || k === "Delete") { e.preventDefault(); g.act(s.cursor, "erase"); return; }
    if ((k === "z" || k === "Z") && e.shiftKey) { g.redo(); return; }
    if (k === "z" || k === "Z") g.undo();
  };

  const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(s.level) + 1] as LevelKey | undefined;

  return (
    <div className="polarity-root flex flex-col flex-1 w-full" style={theme.vars} onKeyDown={onKey}>
      <style>{POL_CSS}</style>

      {/* Top bar */}
      <GameNav name="POLARITY" dark={theme.dark} onToggleDark={theme.toggle} onDemo={() => setDemo(true)} onHelp={() => setHelp("help")}
        glyph={<><span className="rounded-full bg-(--plus)" /><span className="rounded-[1px] border border-current" /><span className="rounded-[1px] bg-current" /><span className="rounded-full bg-(--minus)" /></>}>
        {s.phase !== "start" && (
          <>
            <select className="g-select" aria-label="Level" value={s.level} onChange={(e) => changeLevel(e.target.value as LevelKey)}>
              {LEVEL_ORDER.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </>
        )}
      </GameNav>

      {/* Start */}
      {s.phase === "start" && (
        <div className="relative z-10 flex-1 h-full min-h-0 flex flex-col items-center justify-center px-4 py-2 overflow-hidden select-none">
          <div className="text-center max-w-md w-full pl-rise flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff4b2b] to-[#00b4db] p-0.5 shadow-lg shadow-cyan-500/20 mb-2 animate-pulse">
              <div className="w-full h-full bg-[var(--surface)] rounded-[13px] flex items-center justify-center font-black text-xl text-[var(--fg)] tracking-tighter">
                <span className="text-[#ff4b2b]">+</span><span className="text-[#00b4db]">-</span>
              </div>
            </div>
            <p className="g-eyebrow tracking-widest text-[10px] uppercase text-(--dim)">Electromagnetic Logic Puzzle</p>
            <h1 className="font-extralight text-5xl md:text-6xl tracking-tight leading-none mt-1">POLA<span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#ff4b2b] via-[var(--fg)] to-[#00b4db]">RITY</span></h1>
            <p className="text-(--dim) text-base mt-1.5 font-light">Two OPPOSING poles. NO like contact.</p>
            
            <div className="mt-4 w-full max-w-sm mx-auto">
              <div className="flex items-center justify-center p-1.5 rounded-full bg-[var(--muted)] border border-[var(--line)] shadow-inner gap-1" role="radiogroup" aria-label="Level">
                {LEVEL_ORDER.map((l) => {
                  const isSelected = s.level === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => g.setLevel(l)}
                      className={`flex-1 py-1.5 px-3 rounded-full text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-[var(--surface)] text-[var(--fg)] shadow-md font-bold scale-[1.02]"
                          : "text-[var(--dim)] hover:text-[var(--fg)] font-medium"
                      }`}
                    >
                      <span className="text-xs font-semibold leading-tight">{l}</span>
                      <span className="text-[10px] opacity-70 leading-tight font-mono">{LEVELS[l].cols}×{LEVELS[l].rows}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-(--dim) text-xs font-medium text-center mt-2">{lv.flavor}</p>
            </div>
            
            <button type="button" className="g-btn-primary mt-5 min-w-[200px] h-11 text-sm font-semibold shadow-lg shadow-amber/10 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => begin()}>
              Begin Magnetic Challenge
            </button>

            <div className="mt-4 flex justify-center gap-2">
              <button type="button" className="g-btn-ghost inline-flex items-center gap-2 text-xs !min-h-[38px] !px-4" onClick={() => setHelp("help")}><BookOpen size={14} />How to Play</button>
              <button type="button" className="g-btn-ghost text-xs !min-h-[38px] !px-4" onClick={() => setDemo(true)}>Interactive Demo</button>
            </div>

            {solvedCount > 0 && (
              <p className="mt-3 text-[11px] text-(--dim) tabular font-medium bg-[var(--surface)] inline-block px-3 py-1 rounded-full border border-[var(--line)]">
                ⚡ Session Progress: {solvedCount} Solved
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {s.phase === "loading" && (
        <div className="relative z-10 flex-1 grid place-items-center">
          <div className="text-center space-y-3">
            <div className="inline-block w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-(--dim) text-xl font-light pl-pulse" role="status">Constructing Magnetic Field Grid...</p>
          </div>
        </div>
      )}

      {/* Play / solved / revealed */}
      {s.puzzle && (playing || s.phase === "solved" || s.phase === "revealed") && (
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          <div className="min-h-full md:h-full flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6 px-3 md:px-6 py-3 md:py-4">
            <div className="flex-1 min-h-0 h-full flex flex-col items-center w-full">
              <div className="text-center mb-2 shrink-0 flex items-center justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold tracking-wider uppercase">{s.level}</span>
                <span className="g-mono text-xs tracking-widest text-(--dim)">{lv.flavor}</span>
              </div>
              <Board layout={s.puzzle} states={s.states} wrong={s.wrong} done={s.done} cursor={s.cursor} interactive={playing}
                minCell={lv.minCellSizePx} onAct={onAct} onToggleDone={g.toggleDone} className="flex-1 min-h-0 w-full" />
            </div>

            <div className="md:w-[310px] shrink-0 flex flex-col justify-center gap-4 pb-2">
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center md:text-left shadow-sm">
                <p className="text-xs font-medium text-(--fg) leading-relaxed" aria-live="polite">
                  {s.phase === "revealed" ? "The solution, revealed. No score recorded." : s.message ?? "Place dominoes cleanly. Ensure numbers match row & column magnetic totals."}
                </p>
              </div>

              <ToolPalette tool={s.tool} canUndo={s.past.length > 0} canRedo={s.future.length > 0} disabled={!playing}
                onTool={g.setTool} onUndo={g.undo} onRedo={g.redo} onCheck={g.check} onReveal={() => setConfirm({ kind: "giveup" })} onNewPuzzle={() => begin(s.level, "free")} />
              
              <div className="flex gap-2 max-w-[440px] w-full mx-auto">
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
      )}

      {/* Solved */}
      {s.phase === "solved" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md animate-in fade-in duration-500 p-4" role="dialog" aria-modal="true" aria-label="Solved">
          <div className="relative text-center w-full max-w-sm bg-[var(--surface)] border border-[var(--line)] p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
            <p className="text-[var(--dim)] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">{s.level} · {lv.flavor}</p>
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
        <Confirm title="Change level?" body="This puzzle will fold and its progress will be lost." yes="Change"
          onNo={() => setConfirm(null)} onYes={() => { const l = confirm.level; setConfirm(null); begin(l); }} />
      )}
      {confirm?.kind === "giveup" && (
        <Confirm title="Give up?" body="The solution will be revealed. No score is recorded." yes="View Ans"
          onNo={() => setConfirm(null)} onYes={() => { setConfirm(null); g.reveal(); }} />
      )}
      {help && <HowToPlay firstRun={help === "tutorial"} onClose={() => setHelp(null)} />}
      {demo && <DemoOverlay onClose={() => setDemo(false)} onStart={() => { setDemo(false); if (!playing && s.phase !== "loading") begin(); }} />}
    </div>
  );
}
