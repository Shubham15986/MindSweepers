import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Flag, LogOut, Timer as TimerIcon } from "lucide-react";
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

  const ranked = s.mode === "daily";
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

  const submit = () => {
    if (!ranked || s.phase !== "solved" || s.score == null || !s.puzzle || submitted) return;
    setSubmitted(true);
    onGameOver({
      score: s.score, level: s.level,
      meta: { seed: s.puzzle.seed, mode: s.mode, timeMs: s.timeMs, hintsUsed: s.hints, boardState: s.states.join("") },
    });
  };

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
    <div className="polarity-root" style={theme.vars} onKeyDown={onKey}>
      <style>{POL_CSS}</style>

      {/* Top bar */}
      <GameNav name="POLARITY" dark={theme.dark} onToggleDark={theme.toggle} onDemo={() => setDemo(true)} onHelp={() => setHelp("help")}
        glyph={<><span className="rounded-full bg-(--plus)" /><span className="rounded-[1px] border border-current" /><span className="rounded-[1px] bg-current" /><span className="rounded-full bg-(--minus)" /></>}>
        {s.phase !== "start" && (
          <>
            <select className="g-select" aria-label="Level" value={s.level} onChange={(e) => changeLevel(e.target.value as LevelKey)}>
              {LEVEL_ORDER.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="flex items-center gap-1.5 text-(--dim)"><TimerIcon size={14} aria-hidden />
              <Timer startedAt={s.startedAt} running={playing} frozen={s.phase === "loading" ? 0 : s.timeMs} /></span>
          </>
        )}
      </GameNav>

      {/* Start */}
      {s.phase === "start" && (
        <div className="relative z-10 flex-1 overflow-y-auto grid place-items-center px-6 py-8">
          <div className="text-center max-w-md w-full pl-rise">
            <p className="g-eyebrow">Logic puzzle · Magnets</p>
            <h1 className="font-light text-6xl md:text-7xl tracking-tight leading-[0.95] mt-3">POLA<span className="font-semibold">RITY</span></h1>
            <p className="text-(--dim) text-2xl mt-2">Two poles. No contact.</p>
            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="g-seg" role="radiogroup" aria-label="Level">
                {LEVEL_ORDER.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={s.level === l} onClick={() => g.setLevel(l)}>
                    {l} <span className="tabular text-(--dim) ml-1">{LEVELS[l].cols}×{LEVELS[l].rows}</span>
                  </button>
                ))}
              </div>
              <p className="text-(--dim) text-lg -mt-1">{lv.flavor}</p>
              <div className="g-seg" role="radiogroup" aria-label="Mode">
                {(["daily", "free"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={s.mode === m} onClick={() => g.setMode(m)}>{m === "daily" ? "Daily" : "Free play"}</button>
                ))}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-(--dim) h-4">
                {ranked ? "Ranked · one puzzle per level each day" : "Free play: scores are not ranked"}
              </p>
            </div>
            <button type="button" className="g-btn-primary mt-8 min-w-[200px]" onClick={() => begin()}>Begin</button>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" className="g-btn-ghost inline-flex items-center gap-2" onClick={() => setHelp("help")}><BookOpen size={15} />How to play</button>
              <button type="button" className="g-btn-ghost" onClick={() => setDemo(true)}>Demo</button>
            </div>
            {(solvedCount > 0 || best[s.level] != null) && (
              <p className="mt-6 text-xs text-(--dim) tabular">
                This session: {solvedCount} solved{best[s.level] != null && <> · best {s.level} {fmt(best[s.level]!)}</>}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {s.phase === "loading" && (
        <div className="relative z-10 flex-1 grid place-items-center">
          <p className="text-(--dim) text-2xl pl-pulse" role="status">The dream is forming...</p>
        </div>
      )}

      {/* Play / solved / revealed */}
      {s.puzzle && (playing || s.phase === "solved" || s.phase === "revealed") && (
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          <div className="min-h-full md:h-full flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6 px-3 md:px-6 py-3 md:py-4">
            <div className="flex flex-col items-center min-w-0 md:flex-1 md:min-h-0">
              <div className="text-center mb-2 shrink-0">
                <span className="text-xl font-semibold tracking-tight">{s.level}</span>
                <span className="g-mono text-[10px] tracking-[0.25em] uppercase text-(--dim) ml-2">{lv.flavor}</span>
                {!ranked && <p className="g-mono text-[10px] tracking-[0.18em] uppercase text-(--dim)">Free play: scores are not ranked</p>}
              </div>
              <Board layout={s.puzzle} states={s.states} wrong={s.wrong} done={s.done} cursor={s.cursor} interactive={playing}
                minCell={lv.minCellSizePx} onAct={onAct} onToggleDone={g.toggleDone} className="md:flex-1 md:min-h-0" />
            </div>

            <div className="md:w-[290px] shrink-0 flex flex-col justify-center gap-3 pb-2">
              <p className="text-center md:text-left text-sm text-(--fg) min-h-10" aria-live="polite">
                {s.phase === "revealed" ? "The solution, revealed. No score this time." : s.message ?? "Decide every domino: magnet or blank."}
              </p>
              <ToolPalette tool={s.tool} canUndo={s.past.length > 0} canRedo={s.future.length > 0} disabled={!playing}
                onTool={g.setTool} onUndo={g.undo} onRedo={g.redo} onCheck={g.check} onReveal={() => setConfirm({ kind: "giveup" })} onNewPuzzle={() => begin(s.level, "free")} />
              <div className="flex gap-2 max-w-[440px] w-full mx-auto">
                {s.phase === "revealed" && (
                  <>
                    <button type="button" className="g-btn-ghost flex-1" onClick={g.toStart}>Back</button>
                    <button type="button" className="g-btn-primary flex-1" onClick={() => begin(s.level, "free")}>New puzzle</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solved */}
      {s.phase === "solved" && (
        <div className="g-overlay pl-fade-slow" role="dialog" aria-modal="true" aria-label="Solved">
          <div className="relative text-center w-full max-w-sm pl-rise">
            <p className="g-eyebrow">{s.level} · {lv.flavor}</p>
            <h2 className="text-(--fg) font-light text-7xl mt-2">Solved.</h2>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="g-card py-3"><p className="g-eyebrow !text-[10px]">Time</p><p className="text-(--fg) mt-1 tabular">{fmt(s.timeMs)}</p></div>
              <div className="g-card py-3"><p className="g-eyebrow !text-[10px]">Score</p><p className="text-(--accent-ink) mt-1 tabular font-semibold">{s.score?.toLocaleString()}</p></div>
            </div>
            {!ranked && <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-(--dim)">Free play: scores are not ranked</p>}
            <div className="mt-7 flex flex-col gap-3">
              {ranked && <button type="button" className="g-btn-primary" onClick={submit} disabled={submitted}>{submitted ? "Submitted" : "Submit to leaderboard"}</button>}
              <div className="flex gap-3">
                {!ranked && <button type="button" className="g-btn-primary flex-1 !px-3" onClick={() => begin(s.level, "free")}>Next puzzle</button>}
                {nextLevel && <button type="button" className="g-btn-ghost flex-1 !px-3" onClick={() => begin(nextLevel, s.mode)}>Harder level</button>}
              </div>
              <button type="button" className="g-btn-ghost inline-flex items-center justify-center gap-2" onClick={exit}><LogOut size={15} />Exit</button>
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
