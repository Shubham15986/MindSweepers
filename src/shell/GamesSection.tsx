import { lazy, Suspense } from "react";
import { ArrowLeft, Lock, Play } from "lucide-react";
import type { GameId, GameProps, GameResult, User } from "../shared/types";
import { submitScore } from "../shared/api";
import SpinningTop from "./SpinningTop";
import { btnGhost, btnPrimary, card } from "./ui";

const GAMES: Record<GameId, React.LazyExoticComponent<(p: GameProps) => React.ReactElement>> = {
  dreamwall: lazy(() => import("../games/dreamwall")),
  polarity: lazy(() => import("../games/polarity")),
  architect: lazy(() => import("../games/architect")),
};

const TABS: { id: GameId; label: string; locked: boolean; title: string; desc: React.ReactNode; tag: string }[] = [
  { id: "dreamwall", label: "Dreamwall", locked: false, title: "Dreamwall", tag: "Easy → Hard",
    desc: <>A logic puzzle built in three layers. Shade the sea, leave the islands, and never let the water pool. Includes a guided <b>DEMO</b>.</> },
  { id: "polarity", label: "Polarity", locked: false, title: "Polarity", tag: "Medium", 
    desc: <>Place magnets and blanks. Match the pole counts. Like poles must never touch. Includes a guided <b>DEMO</b>.</> },
  { id: "architect", label: "Architect", locked: false, title: "Architect", tag: "Medium", 
    desc: <>Logic puzzle: place the towers, read the clues, build the city before it folds. Includes a guided <b>DEMO</b>.</> },
];

function DreamwallPreview() {
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-night grid place-items-center border border-fog/10">
      <img src="/assets/cover-dreamwall.jpg" alt="Dreamwall" className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
    </div>
  );
}

function PolarityPreview() {
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-night grid place-items-center border border-fog/10">
      <img src="/assets/cover-polarity.jpg" alt="Polarity" className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
    </div>
  );
}

function ArchitectPreview() {
  return (
    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-night grid place-items-center border border-fog/10">
      <img src="/assets/cover-architect.jpg" alt="Architect" className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
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
  const Game = playing ? GAMES[playing] : null;

  // Let the game's own victory beat land before the shell overlay appears.
  const handleGameOver = async (r: GameResult) => {
    if (r.score > 0 && playing) {
      await submitScore({ game: playing, score: r.score, level: r.level });
      onSubmitted(playing);
    }
  };
  const exit = () => setPlaying(null);


  if (Game) {
    return (
      <div className="ll-fade flex flex-col h-full flex-1">
        <div className="flex items-center justify-between mb-4 px-6 pt-4">
          <button onClick={exit} className={btnGhost}><ArrowLeft size={16} /> All Games</button>
          <span className="text-lg md:text-xl font-display text-amber tracking-[0.2em] uppercase font-semibold">{TABS.find((x) => x.id === playing)!.label}</span>
        </div>
        {/* The game is now fully inline, edge-to-edge */}
        <div className="w-full flex-1 flex flex-col min-h-[75dvh]">
          <Suspense fallback={<div className="flex-1 grid place-items-center"><SpinningTop size={28} className="text-amber" /></div>}>
            <Game user={user} onGameOver={handleGameOver} onExit={exit} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
      {TABS.map((t) => (
        <div key={t.id} className={card + " flex flex-col p-4 md:p-6"}>
          <div className="w-full mb-6 relative">
            {t.locked ? <LockedPreview /> : t.id === "polarity" ? <PolarityPreview /> : t.id === "architect" ? <ArchitectPreview /> : <DreamwallPreview />}
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3">
              <span className="h-7 px-3 rounded-full bg-slate text-fog text-[11px] font-semibold uppercase tracking-[0.12em] inline-flex items-center">{t.tag}</span>
              {t.locked && <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">Locked</span>}
            </div>
            <h3 className="font-display text-fog text-3xl font-medium mt-4 tracking-wide">{t.title}</h3>
            <p className="text-mist mt-3 text-sm leading-relaxed flex-1">{t.desc}</p>
            {t.locked
              ? <div className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-fog/12 text-mist text-sm font-semibold uppercase tracking-[0.08em] w-full"><SpinningTop size={16} /> Coming soon</div>
              : <button onClick={() => { if (!user) onRequireAuth(); else setPlaying(t.id); }} className={btnPrimary + " mt-6 w-full"}><Play size={15} fill="currentColor" /> Play</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
