import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import type { BoardFilter, GameId, User } from "../shared/types";
import { BRAND } from "../shared/theme";
import Hero from "./Hero";
import GamesSection from "./GamesSection";
import SpinningTop from "./SpinningTop";
import AuthModal from "./AuthModal";
import { eyebrow } from "./ui";

const Leaderboard = lazy(() => import("./Leaderboard"));
const Final = lazy(() => import("./Final"));

// Mounts children only once they approach the viewport.
function WhenNear({ children, minH }: { children: React.ReactNode; minH: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "600px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={show ? undefined : { minHeight: minH }}>{show && <Suspense fallback={<div style={{ minHeight: minH }} />}>{children}</Suspense>}</div>;
}

export default function Shell() {
  const [user, setUser] = useState<User | null>(() => {
    const uid = localStorage.getItem("mw_uid");
    const uname = localStorage.getItem("mw_uname");
    return uid && uname ? { id: uid, name: uname } : null;
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [playing, setPlayingState] = useState<GameId | null>(null);
  const setPlaying = (g: GameId | null) => { window.location.hash = g ? "#/game/" + g : "#/"; };
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#/game/")) setPlayingState(h.replace("#/game/", "") as GameId);
      else setPlayingState(null);
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  const [refreshKey, setRefreshKey] = useState(0);
  const [boardFilter, setBoardFilter] = useState<BoardFilter>("dreamwall");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  if (playing) {
    return (
      <div className="bg-night min-h-dvh flex flex-col">
        <header className="flex-none h-16 bg-night/95 backdrop-blur-md border-b border-fog/10">
          <nav className="h-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber"><path d="M12 2v20"/><path d="m4.93 10.93 14.14 14.14"/><path d="m2 22 20-20"/></svg>
              <span className="font-semibold tracking-[0.25em] text-fog text-sm">MINDSWEEPERS</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-amber truncate max-w-[100px] sm:max-w-none">{user.name.split("@")[0].split(" ")[0]}</span>
                  <button onClick={() => { localStorage.clear(); setUser(null); }} className="text-xs text-mist hover:text-coral transition-colors">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="h-9 px-4 rounded-full border border-fog/15 text-fog inline-flex items-center hover:border-amber hover:text-amber transition-colors">Login</button>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-6 md:py-8 flex flex-col">
          <GamesSection user={user} playing={playing} setPlaying={setPlaying}
            onRequireAuth={() => setShowAuth(true)}
            onSubmitted={(g) => { setBoardFilter(g); setRefreshKey((k) => k + 1); }} />
        </main>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={(u) => { setUser(u); setShowAuth(false); }} />}
      </div>
    );
  }

  return (
    <div className="bg-night min-h-dvh">
      <header className={"fixed top-0 inset-x-0 z-40 transition-all duration-300 " + (scrolled ? "bg-night/95 backdrop-blur-md border-b border-fog/10" : "bg-gradient-to-b from-night/90 to-transparent")}>
        <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 text-fog">
            <SpinningTop size={18} className="text-amber" />
            <span className="text-sm font-semibold tracking-[0.3em]">{BRAND.name}</span>
          </a>
          <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
            <a href="#games" className="hidden sm:inline hover:text-fog transition-colors">Games</a>
            <a href="#leaderboard" className="hidden sm:inline hover:text-fog transition-colors">Leaderboard</a>
            {user ? (
              <div className="flex items-center gap-2 relative">
                <button onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full border border-fog/15 text-fog grid place-items-center hover:border-amber hover:text-amber transition-colors" aria-label="Profile">
                  <UserIcon size={16} />
                </button>
                <button onClick={() => { localStorage.clear(); setUser(null); }} className="w-8 h-8 rounded-full border border-fog/15 text-fog grid place-items-center hover:border-coral hover:text-coral transition-colors" aria-label="Logout" title="Logout">
                  <LogOut size={16} />
                </button>
                {showProfile && (
                  <div className="absolute top-full right-0 mt-2 p-3 rounded-xl bg-night border border-fog/10 shadow-xl flex flex-col min-w-[140px] z-50">
                    <p className="text-fog font-medium text-sm capitalize">{user.name}</p>
                    <p className="text-mist text-xs normal-case mt-0.5">Player</p>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="h-9 px-4 rounded-full border border-fog/15 text-fog inline-flex items-center hover:border-amber hover:text-amber transition-colors">Login</button>
            )}
          </div>
        </nav>
      </header>

      <div id="top" />
      <Hero user={user} onRequireAuth={() => setShowAuth(true)} />

      <section id="games" className="relative scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-16 pb-24 md:pt-24">
          <p className={eyebrow}>The games</p>
          <h2 className="font-display text-fog text-5xl md:text-6xl font-light mt-3">Choose Your Game</h2>
          <div className="mt-10 flex flex-col gap-16">
            <GamesSection user={user} playing={playing} setPlaying={setPlaying}
              onRequireAuth={() => setShowAuth(true)}
              onSubmitted={(g) => { setBoardFilter(g); setRefreshKey((k) => k + 1); }} />
            <div id="leaderboard" className="scroll-mt-20 max-w-2xl mx-auto w-full">
              <div className="flex items-end justify-between mb-4">
                <h2 className="font-display text-fog text-3xl md:text-4xl font-light">Hall of Fame</h2>
                <span className={eyebrow}>Higher is better</span>
              </div>
              <WhenNear minH={640}><Leaderboard refreshKey={refreshKey} initialFilter={boardFilter} /></WhenNear>
            </div>
          </div>
        </div>
      </section>

      <WhenNear minH={600}><Final /></WhenNear>

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onAuthSuccess={(u) => { setUser(u); setShowAuth(false); }} 
        />
      )}
    </div>
  );
}
