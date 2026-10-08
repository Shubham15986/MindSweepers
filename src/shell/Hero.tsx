import heroImg from "../assets/hero-street.jpg";
import { BRAND } from "../shared/theme";
import { btnPrimary } from "./ui";

export default function Hero({ user, onRequireAuth }: { user: any; onRequireAuth: () => void }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-night flex flex-col items-center justify-center" aria-label="Intro">
      <div className="absolute inset-0">
        <img src={heroImg} alt="A classical puzzle setting" className="w-full h-full object-cover object-center" fetchPriority="high" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,26,31,.55)_0%,rgba(14,26,31,.1)_35%,rgba(14,26,31,.25)_65%,rgba(14,26,31,.85)_100%)]" />

      <div className="relative z-10 text-center px-4 mt-16">
        <h1 className="font-display font-light text-fog italic text-[48px] sm:text-[64px] md:text-[96px] leading-[0.95] tracking-tight">
          Mind<span className="text-amber">Sweepers</span>
        </h1>
        <p className="mt-6 text-mist text-lg md:text-xl font-medium tracking-wide">
          {BRAND.tagline}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          {user ? (
            <a href="#games" className={btnPrimary + " text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"}>Play Game</a>
          ) : (
            <button onClick={onRequireAuth} className={btnPrimary + " text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"}>Play Game</button>
          )}
          <a href="#leaderboard" className="h-10 px-6 rounded-full bg-night/40 border border-fog/10 text-fog text-[11px] font-semibold uppercase tracking-[0.1em] flex items-center justify-center hover:bg-night/60 hover:text-amber transition-colors backdrop-blur-sm shadow-sm">
            View Leaderboard
          </a>
        </div>
      </div>
    </section>
  );
}
