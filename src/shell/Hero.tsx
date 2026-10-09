import heroImg from "../assets/hero-street.jpg";
import { BRAND } from "../shared/theme";
import { btnPrimary } from "./ui";
import { useEffect, useState } from "react";


export function Countdown({ target }: { target: number }) {
  const [left, setLeft] = useState(Math.max(0, target - Date.now()));
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => {
      const now = Date.now();
      if (now >= target) {
        setLeft(0);
        clearInterval(t);
      } else {
        setLeft(target - now);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [target, left]);

  if (left <= 0) return null;

  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  
  return (
    <div className="flex flex-col items-center justify-center bg-night/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-amber/30 shadow-[0_0_50px_-12px_rgba(232,162,74,0.3)] mt-6">
      <div className="text-amber text-[11px] font-bold uppercase tracking-[0.3em] mb-4">Game ends in</div>
      <div className="font-mono text-6xl sm:text-7xl text-fog font-black tracking-tight flex items-center gap-1 sm:gap-2">
        <span className="w-20 sm:w-28 text-center">{h.toString().padStart(2, '0')}</span><span className="text-amber/50 pb-2 sm:pb-3">:</span>
        <span className="w-20 sm:w-28 text-center">{m.toString().padStart(2, '0')}</span><span className="text-amber/50 pb-2 sm:pb-3">:</span>
        <span className="w-20 sm:w-28 text-center">{s.toString().padStart(2, '0')}</span>
      </div>
      <div className="flex justify-between w-full max-w-[260px] sm:max-w-[360px] mt-3 text-mist/70 text-[11px] sm:text-xs uppercase font-bold tracking-widest">
        <span className="w-16 sm:w-20 text-center">Hours</span>
        <span className="w-16 sm:w-20 text-center">Mins</span>
        <span className="w-16 sm:w-20 text-center">Secs</span>
      </div>
    </div>
  );
}

export default function Hero({ user, onRequireAuth, locked, targetTime }: { user: any; onRequireAuth: () => void; locked?: boolean; targetTime?: number }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-night flex flex-col items-center justify-center" aria-label="Intro">
      <div className="absolute inset-0">
        <img src={heroImg} alt="A classical puzzle setting" className="w-full h-full object-cover object-center" fetchPriority="high" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,26,31,.55)_0%,rgba(14,26,31,.1)_35%,rgba(14,26,31,.25)_65%,rgba(14,26,31,.85)_100%)]" />

      <div className="relative z-10 text-center px-4 mt-40">
        <h1 className="font-display font-bold text-fog italic text-[48px] sm:text-[64px] md:text-[96px] leading-[0.95] tracking-tight">
          Mind<span className="text-amber">Sweepers</span>
        </h1>
        <p className="mt-6 text-mist text-lg md:text-xl font-medium tracking-wide">
          {BRAND.tagline}
        </p>
        
        <div className="mt-10 flex flex-col items-center gap-4">
          {locked && targetTime ? (
            <Countdown target={targetTime} />
          ) : user ? (
            <a href="#/lobby" className={btnPrimary + " text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"}>Play Game</a>
          ) : (
            <button onClick={onRequireAuth} className={btnPrimary + " text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"}>Play Game</button>
          )}
          {!locked && (
            <a href="#/leaderboard" className="h-10 px-6 mt-2 rounded-full bg-night/40 border border-fog/10 text-fog text-[11px] font-semibold uppercase tracking-[0.1em] flex items-center justify-center hover:bg-night/60 hover:text-amber transition-colors backdrop-blur-sm shadow-sm">
              View Leaderboard
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
