import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, CheckCheck, Flag, LogOut, Timer as TimerIcon } from "lucide-react";
import type { GameProps } from "../../shared/types";
import { LEVELS, LEVEL_ORDER, MAX_HINTS, TUTORIAL_KEY, type LevelKey } from "./config";
import { useArchitect, type Mode } from "./useArchitect";
import Board from "./Board";
import NumberPad from "./NumberPad";
import DemoOverlay from "./DemoOverlay";
import HowToPlay from "./HowToPlay";
import { ARCH_CSS } from "./styles";

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
  return <span className="tabular text-fog text-sm font-semibold" aria-label="Elapsed time">{fmt(running ? now - startedAt : frozen)}</span>;
}

function Confirm({ title, body, yes, onYes, onNo }: { title: string; body: string; yes: string; onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="ar-overlay ar-fade" role="alertdialog" aria-modal="true" aria-label={title} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onNo(); } }}>
      <div className="ar-card w-full max-w-xs p-6 text-center ar-rise">
        <h3 className="font-display text-fog text-3xl font-light">{title}</h3>
        <p className="text-sm text-mist mt-2">{body}</p>
        <div className="mt-6 flex gap-3">
          <button ref={ref} type="button" className="ar-btn-ghost flex-1" onClick={onNo}>Cancel</button>
          <button type="button" className="ar-btn-primary flex-1 !px-4" onClick={onYes}>{yes}</button>
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
  const [help, setHelp] = useState<null | "help" | "tutorial">(null);
  const [confirm, setConfirm] = useState<null | { kind: "level"; level: LevelKey } | { kind: "giveup" }>(null);
  const [submitted, setSubmitted] = useState(false);
  // Session-only memory: never persisted.
  const [best, setBest] = useState<Partial<Record<LevelKey, number>>>({});
  const [solvedCount, setSolvedCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const ranked = s.mode === "daily";
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

  const submit = () => {
    if (!ranked || s.phase !== "solved" || s.score == null || !s.puzzle || submitted) return;
    setSubmitted(true);
    onGameOver({
      score: s.score, level: s.level,
      meta: { seed: s.puzzle.seed, mode: s.mode, timeMs: s.timeMs, hintsUsed: s.hints, boardState: s.cells.join("") },
    });
  };

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
    const d = Number(k);
    if (d >= 1 && d <= n) { e.preventDefault(); g.input(d); return; }
    if (k === "Backspace" || k === "Delete" || k === "0") { e.preventDefault(); g.erase(); return; }
    if (k === "n" || k === "N") { e.preventDefault(); g.togglePencil(); return; }
    if ((k === "z" || k === "Z") && e.shiftKey) { g.redo(); return; }
    if (k === "z" || k === "Z") { g.undo(); return; }
  };

  const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(s.level) + 1] as LevelKey | undefined;
  const levelSelect = (
    <select className="ar-select" aria-label="Level" value={s.level} onChange={(e) => changeLevel(e.target.value as LevelKey)}>
      {LEVEL_ORDER.map((l) => <option key={l} value={l}>{l}</option>)}
    </select>
  );

  return (
    <div ref={rootRef} className="architect-root" onKeyDown={onKey}>
      <style>{ARCH_CSS}</style>
      <div className="ar-glowfog" aria-hidden />
      <div className="ar-city" aria-hidden />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-4 md:px-6 h-14 border-b border-fog/8 shrink-0">
        <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
          <span className="text-xs font-semibold tracking-[0.3em] text-fog hidden sm:inline">ARCHITECT</span>
          {s.phase !== "start" && (
            <>
              {levelSelect}
              <span className="flex items-center gap-1.5 text-mist"><TimerIcon size={14} aria-hidden />
                <Timer startedAt={s.startedAt} running={playing} frozen={s.phase === "loading" ? 0 : s.timeMs} /></span>
              <span className="text-xs text-mist tabular whitespace-nowrap" aria-label={MAX_HINTS - s.hints + " hints left"}>Hints <span className="text-fog font-semibold">{MAX_HINTS - s.hints}</span>/{MAX_HINTS}</span>
            </>
          )}
        </div>
        <button type="button" className="ar-btn-demo shrink-0" onClick={() => setDemo(true)}>Demo</button>
      </header>

      {/* Start */}
      {s.phase === "start" && (
        <div className="relative z-10 flex-1 overflow-y-auto grid place-items-center px-6 py-8">
          <div className="text-center max-w-md w-full ar-rise">
            <p className="ar-eyebrow">Logic puzzle · Towers</p>
            <h1 className="font-display text-fog font-light text-6xl md:text-7xl tracking-[0.1em] mt-3">ARCHITECT</h1>
            <p className="font-display italic text-mist text-2xl mt-2">Build the city before it folds.</p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="ar-seg" role="radiogroup" aria-label="Level">
                {LEVEL_ORDER.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={s.level === l} onClick={() => g.setLevel(l)}>
                    {l} <span className="tabular text-mist/70 ml-1">{LEVELS[l].n}×{LEVELS[l].n}</span>
                  </button>
                ))}
              </div>
              <p className="font-display italic text-mist text-lg -mt-1">{LEVELS[s.level].flavor}</p>
              <div className="ar-seg" role="radiogroup" aria-label="Mode">
                {(["daily", "free"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={s.mode === m} onClick={() => g.setMode(m)}>{m === "daily" ? "Daily" : "Free play"}</button>
                ))}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/80 h-4">
                {ranked ? "Ranked · one city per level each day" : "Free play: scores are not ranked"}
              </p>
            </div>

            <button type="button" className="ar-btn-primary mt-8 min-w-[200px]" onClick={() => begin()}>Begin</button>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" className="ar-btn-ghost inline-flex items-center gap-2" onClick={() => setHelp("help")}><BookOpen size={15} />How to play</button>
            </div>
            {(solvedCount > 0 || best[s.level] != null) && (
              <p className="mt-6 text-xs text-mist tabular">
                This session: {solvedCount} solved{best[s.level] != null && <> · best {s.level} {fmt(best[s.level]!)}</>}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {s.phase === "loading" && (
        <div className="relative z-10 flex-1 grid place-items-center">
          <p className="font-display italic text-mist text-2xl ar-pulse" role="status">The dream is forming...</p>
        </div>
      )}

      {/* Play / solved / revealed */}
      {s.puzzle && (s.phase === "play" || s.phase === "solved" || s.phase === "revealed") && (
        <div className="relative z-10 flex-1 min-h-0 flex flex-col md:flex-row md:items-stretch gap-4 md:gap-8 px-4 md:px-8 py-4 overflow-y-auto md:overflow-hidden">
          <div className="md:flex-1 md:min-h-0 flex flex-col items-center">
            <div className="text-center mb-3 shrink-0">
              <p className="font-display text-fog text-2xl font-light leading-none">{s.level}</p>
              <p className="font-display italic text-mist text-base">{LEVELS[s.level].flavor}{!ranked && <span className="not-italic font-sans text-[10px] font-semibold uppercase tracking-[0.18em] ml-2 text-mist/80">· Free play: scores are not ranked</span>}</p>
            </div>
            <Board puzzle={s.puzzle} cells={s.cells} notes={s.notes} selected={s.selected} wrong={s.wrong} dim={s.dim} interactive={playing} onSelect={g.select} />
          </div>

          <div className="md:w-[300px] md:self-center shrink-0 flex flex-col gap-3 pb-2">
            <p className="text-center md:text-left text-sm text-fog/90 min-h-10" aria-live="polite">
              {s.phase === "revealed" ? "The solution, revealed. No score this time." : s.message ?? (s.pencil ? "Pencil on: numbers become notes." : "Tap a cell, then a height.")}
            </p>
            <NumberPad n={n} pencil={s.pencil} hintsLeft={MAX_HINTS - s.hints} canUndo={s.past.length > 0} canRedo={s.future.length > 0} disabled={!playing}
              onNumber={g.input} onErase={g.erase} onPencil={g.togglePencil} onUndo={g.undo} onRedo={g.redo} onHint={g.hint} />
            <div className="flex flex-wrap items-center justify-between gap-2 max-w-[420px] w-full mx-auto">
              <button type="button" className="ar-btn-ghost !px-4 inline-flex items-center gap-2" onClick={g.check} disabled={!playing}><CheckCheck size={15} />Check</button>
              <label className="flex items-center gap-2 text-xs text-mist cursor-pointer min-h-11">
                <input type="checkbox" checked={s.dim} onChange={g.toggleDim} className="accent-[#E8A24A] w-4 h-4" />Dim satisfied clues
              </label>
              {s.phase === "revealed" ? (
                <div className="flex gap-2 w-full mt-1">
                  <button type="button" className="ar-btn-ghost flex-1" onClick={g.toStart}>Back</button>
                  <button type="button" className="ar-btn-primary flex-1" onClick={() => begin(s.level, "free")}>New puzzle</button>
                </div>
              ) : (
                <button type="button" className="ar-btn-ghost !px-4 inline-flex items-center gap-2 !text-[#C46A58]" onClick={() => setConfirm({ kind: "giveup" })} disabled={!playing}><Flag size={15} />Give up</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Solved */}
      {s.phase === "solved" && (
        <div className="ar-overlay ar-fade-slow" role="dialog" aria-modal="true" aria-label="Solved">
          <div className="ar-fog" aria-hidden><i /></div>
          <div className="relative text-center w-full max-w-sm ar-rise">
            <p className="ar-eyebrow">{s.level} · {LEVELS[s.level].flavor}</p>
            <h2 className="font-display text-fog font-light text-7xl mt-2">Solved.</h2>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="ar-card py-3"><p className="ar-eyebrow !text-[10px]">Time</p><p className="text-fog mt-1 tabular">{fmt(s.timeMs)}</p></div>
              <div className="ar-card py-3"><p className="ar-eyebrow !text-[10px]">Hints</p><p className="text-fog mt-1 tabular">{s.hints}</p></div>
              <div className="ar-card py-3"><p className="ar-eyebrow !text-[10px]">Score</p><p className="text-amber mt-1 tabular font-semibold">{s.score?.toLocaleString()}</p></div>
            </div>
            {!ranked && <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist/80">Free play: scores are not ranked</p>}
            <div className="mt-7 flex flex-col gap-3">
              {ranked && (
                <button type="button" className="ar-btn-primary" onClick={submit} disabled={submitted}>{submitted ? "Submitted" : "Submit to leaderboard"}</button>
              )}
              <div className="flex gap-3">
                {!ranked && <button type="button" className="ar-btn-primary flex-1 !px-3" onClick={() => begin(s.level, "free")}>Next puzzle</button>}
                {nextLevel && <button type="button" className="ar-btn-ghost flex-1 !px-3" onClick={() => begin(nextLevel, s.mode)}>Harder level</button>}
              </div>
              <button type="button" className="ar-btn-ghost inline-flex items-center justify-center gap-2" onClick={exit}><LogOut size={15} />Exit</button>
            </div>
          </div>
        </div>
      )}

      {confirm?.kind === "level" && (
        <Confirm title="Change level?" body="This city will fold and its progress will be lost." yes="Change"
          onNo={() => setConfirm(null)} onYes={() => { const l = confirm.level; setConfirm(null); begin(l); }} />
      )}
      {confirm?.kind === "giveup" && (
        <Confirm title="Give up?" body="The solution will be revealed. No score is recorded." yes="Reveal"
          onNo={() => setConfirm(null)} onYes={() => { setConfirm(null); g.reveal(); }} />
      )}
      {help && <HowToPlay firstRun={help === "tutorial"} onClose={() => setHelp(null)} />}
      {demo && (
        <DemoOverlay onClose={() => setDemo(false)} onStart={() => { setDemo(false); if (s.phase !== "play" && s.phase !== "loading") begin(); }} />
      )}
    </div>
  );
}
