import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, Lock, Play } from "lucide-react";
import type { GameId, GameProps, GameResult, User } from "../shared/types";
import { submitScore } from "../shared/api";
import SpinningTop from "./SpinningTop";
import { btnGhost, btnPrimary, card, eyebrow } from "./ui";

const GAMES: Record<GameId, React.LazyExoticComponent<(p: GameProps) => React.ReactElement>> = {
  dreamwall: lazy(() => import("../games/dreamwall")),
  polarity: lazy(() => import("../games/polarity/Polarity")),
  architect: lazy(() => import("../games/architect")),
};

const TABS: { id: GameId; label: string; locked: boolean; title: string; desc: string; tag: string }[] = [
  { id: "dreamwall", label: "Dreamwall", locked: false, title: "Dreamwall", tag: "Easy → Hard",
    desc: "A logic puzzle built in three dream layers. Shade the sea, leave the islands, and never let the water pool. Includes a guided Inception demo." },
  { id: "polarity", label: "Polarity", locked: false, title: "Polarity", tag: "Medium", desc: "Place magnets and blanks. Match the pole counts. Like poles must never touch." },
  { id: "architect", label: "Architect", locked: false, title: "Architect", tag: "Medium", desc: "Logic puzzle: place the towers, read the clues, build the city before it folds" },
];

function DreamwallPreview() {
  const g = "2.##.##3.#.#.##.";
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2B3E45_0%,#0E1A1F_75%)] grid place-items-center">
      <div className="grid grid-cols-4 gap-[3px] p-[3px] bg-night rounded-md w-[42%] rotate-[-4deg]">
        {g.split("").map((c, i) => (
          <span key={i} className={"aspect-square rounded-[2px] grid place-items-center font-display text-xl text-night " + (c === "#" ? "bg-night" : "bg-fog")}>
            {/\d/.test(c) ? c : c === "." && i % 3 === 0 ? <span className="w-1.5 h-1.5 rounded-full bg-night" /> : null}
          </span>
        ))}
      </div>
      <span className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">4×4 · 6×6 · 8×8</span>
    </div>
  );
}

function PolarityPreview() {
  const cells = ["city", "void", "blank", "brass", "blank", "city", "void", "blank", "void", "city", "blank", "brass"];
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#0a111a] grid place-items-center border border-[#d4af37]/20">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative grid grid-cols-4 gap-1 p-1 bg-[#1a1f24] rounded border border-[#d4af37] w-[44%] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
        {cells.map((v, i) => (
          <div key={i} className="aspect-square relative overflow-hidden border border-[#d4af37]/30 bg-[#0e141a]">
            {v === "city" && <div className="absolute inset-0 bg-[#00ffff]/20 border-b-2 border-[#00ffff]" />}
            {v === "void" && <div className="absolute inset-0 bg-black/60 border-t-2 border-[#ff003c]" />}
            {v === "brass" && <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-[#8a6b1c] opacity-80" />}
          </div>
        ))}
      </div>
      <span className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d4af37]/70">The Architecture</span>
    </div>
  );
}

function ArchitectPreview() {
  const h = [2, 1, 4, 3, 3, 4, 1, 2, 4, 3, 2, 1, 1, 2, 3, 4];
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2B3E45_0%,#0E1A1F_75%)] grid place-items-center">
      <div className="grid grid-cols-4 gap-[3px] p-[3px] bg-night rounded-md w-[40%]">
        {h.map((v, i) => (
          <div key={i} className="relative aspect-square rounded-[3px] bg-[#16262C] overflow-hidden">
            <span className="absolute inset-x-[18%] bottom-0 bg-fog/10 border-t-2 border-amber" style={{ height: v * 20 + "%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LockedPreview() {
  return (
    <div className="aspect-[16/10] rounded-xl bg-night/70 border border-dashed border-fog/12 grid place-items-center text-center">
      <div>
        <SpinningTop size={28} className="mx-auto text-mist" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-mist">Coming soon</p>
      </div>
    </div>
  );
}

export default function GamesSection({ user, playing, setPlaying, onRequireAuth, onSubmitted }: {
  user: User | null; playing: GameId | null; setPlaying: (g: GameId | null) => void; onRequireAuth: () => void; onSubmitted: (g: GameId) => void;
}) {
  const [tab, setTab] = useState<GameId>("dreamwall");
  const [result, setResult] = useState<GameResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const t = TABS.find((x) => x.id === tab)!;
  const Game = playing ? GAMES[playing] : null;

  // Let the game's own victory beat land before the shell overlay appears.
  const handleGameOver = (r: GameResult) => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setResult(r), 1400); };
  const exit = () => { setResult(null); setPlaying(null); };
  const submit = async () => {
    if (!result || !playing) return;
    setSubmitting(true);
    await submitScore({ game: playing, score: result.score, level: result.level });
    setSubmitting(false); setResult(null); onSubmitted(playing);
    document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (Game) {
    return (
      <div className="ll-fade">
        <div className="flex items-center justify-between mb-4">
          <button onClick={exit} className={btnGhost}><ArrowLeft size={16} /> Back</button>
          <span className={eyebrow}>Now dreaming · {TABS.find((x) => x.id === playing)!.label}</span>
        </div>
        {/* translateZ creates a containing block so the game's fixed overlays stay inside the stage */}
        <div className="relative w-full mx-auto max-w-[1120px] h-[85dvh] md:h-[720px] rounded-2xl border border-fog/12 overflow-hidden bg-night [transform:translateZ(0)]">
          <div className="absolute inset-0 overflow-auto overscroll-contain">
            <Suspense fallback={<div className="h-full grid place-items-center"><SpinningTop size={28} className="text-amber" /></div>}>
              <Game user={user} onGameOver={handleGameOver} onExit={exit} />
            </Suspense>
          </div>
          {result && (
            <div className="absolute inset-0 z-[60] grid place-items-center bg-abyss/80 p-6 ll-fade">
              <div className={card + " w-full max-w-sm p-8 text-center"}>
                <SpinningTop size={28} className="mx-auto text-amber" />
                <p className={eyebrow + " mt-4"}>Dream complete</p>
                <p className="font-display text-fog text-6xl font-light mt-2 tabular-nums">{result.score.toLocaleString()}</p>
                <p className="text-mist mt-1">Level · <span className="text-fog">{result.level}</span></p>
                <button onClick={submit} disabled={submitting} className={btnPrimary + " w-full mt-8 disabled:opacity-70"}>{submitting ? "Submitting…" : "Submit to leaderboard"}</button>
                <button onClick={() => setResult(null)} className="mt-3 h-10 text-sm text-mist hover:text-fog transition-colors">Keep playing</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div role="tablist" className="flex gap-8 border-b border-fog/12 overflow-x-auto [scrollbar-width:none]">
        {TABS.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}
            className={"relative shrink-0 h-12 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] transition-colors " + (tab === x.id ? "text-fog" : "text-mist hover:text-fog")}>
            {x.label}{x.locked && <Lock size={12} strokeWidth={2} className="opacity-60" />}
            <span className={"absolute left-0 right-0 -bottom-px h-[2px] bg-amber origin-left transition-transform duration-200 " + (tab === x.id ? "scale-x-100" : "scale-x-0")} />
          </button>
        ))}
      </div>
      <div key={tab} role="tabpanel" className={card + " ll-tab mt-6 p-4 md:p-6 grid md:grid-cols-[1.15fr_1fr] gap-6 items-center"}>
        {t.locked ? <LockedPreview /> : t.id === "polarity" ? <PolarityPreview /> : t.id === "architect" ? <ArchitectPreview /> : <DreamwallPreview />}
        <div className="px-2 pb-2 md:p-0">
          <div className="flex items-center gap-3">
            <span className="h-7 px-3 rounded-full bg-slate text-fog text-[11px] font-semibold uppercase tracking-[0.12em] inline-flex items-center">{t.tag}</span>
            {t.locked && <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">Locked</span>}
          </div>
          <h3 className="font-display text-fog text-4xl md:text-5xl font-light mt-4">{t.title}</h3>
          <p className="text-mist mt-3 leading-relaxed">{t.desc}</p>
          {t.locked
            ? <div className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full border border-fog/12 text-mist text-sm font-semibold uppercase tracking-[0.08em]"><SpinningTop size={16} className="" /> Coming soon</div>
            : <button onClick={() => { if (!user) onRequireAuth(); else setPlaying(t.id); }} className={btnPrimary + " mt-6"}><Play size={15} fill="currentColor" /> Play</button>}
        </div>
      </div>
    </div>
  );
}
