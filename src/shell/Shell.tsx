import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { User as UserIcon, LogOut, Menu, X } from "lucide-react";
import type { BoardFilter, GameId, User } from "../shared/types";
import { BRAND } from "../shared/theme";
import Hero from "./Hero";
import GamesSection from "./GamesSection";
import SpinningTop from "./SpinningTop";
import AuthModal from "./AuthModal";
import { eyebrow } from "./ui";

import { lazyWithRetry } from '../utils/lazyWithRetry';

const Leaderboard = lazyWithRetry(() => import("./Leaderboard"));
const Final = lazyWithRetry(() => import("./Final"));

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [playing, setPlayingState] = useState<GameId | null>(null);
  const [route, setRoute] = useState<"home" | "lobby" | "game" | "leaderboard">("home");
  const setPlaying = (g: GameId | null) => { window.location.hash = g ? "#/game/" + g : "#/"; };
  const handleLogout = () => {
    localStorage.clear();
    window.location.replace("/"); // Forces a full reload and clears the hash completely
  };
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#/game/")) {
        setRoute("game");
        setPlayingState(h.replace("#/game/", "") as GameId);
      } else if (h === "#/lobby" || h.startsWith("#/lobby")) {
        setRoute("lobby");
        setPlayingState(null);
      } else if (h === "#/leaderboard" || h.startsWith("#/leaderboard")) {
        setRoute("leaderboard");
        setPlayingState(null);
      } else {
        setRoute("home");
        setPlayingState(null);
      }
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  if (playing) {
    return (
      <div className="bg-night min-h-dvh flex flex-col">
        <header className="flex-none h-16 bg-night/95 backdrop-blur-md border-b border-fog/10">
          <nav className="h-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="#/" className="font-semibold tracking-[0.25em] text-fog text-sm hover:text-amber transition-colors">MINDSWEEPERS</a>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
              <a href="#/lobby" className="hidden sm:inline hover:text-fog transition-colors">Games</a>
              <a href="#/leaderboard" className="hidden sm:inline hover:text-fog transition-colors">Leaderboard</a>
              {user ? (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-amber truncate max-w-[100px] sm:max-w-none">{user.name.split("@")[0].split(" ")[0]}</span>
                  <button onClick={handleLogout} className="text-xs text-mist hover:text-coral transition-colors">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="hidden sm:inline-flex h-9 px-4 rounded-full border border-fog/15 text-fog items-center hover:border-amber hover:text-amber transition-colors">Login</button>
              )}
              <button onClick={() => setShowMobileMenu(true)} className="sm:hidden text-fog hover:text-amber transition-colors"><Menu size={24} /></button>
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full flex flex-col">
          <GamesSection user={user} playing={playing} setPlaying={setPlaying}
            onRequireAuth={() => setShowAuth(true)}
            onSubmitted={(g) => { setBoardFilter(g); setRefreshKey((k) => k + 1); }} />
        </main>
        
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-night/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 text-lg font-semibold uppercase tracking-[0.12em] text-mist">
            <button className="absolute top-5 right-6 text-fog" onClick={() => setShowMobileMenu(false)}><X size={28} /></button>
            <a href="#/lobby" onClick={() => { setShowMobileMenu(false); setPlaying(null); }} className="hover:text-amber transition-colors">Games</a>
            <a href="#/leaderboard" onClick={() => { setShowMobileMenu(false); setPlaying(null); }} className="hover:text-amber transition-colors">Leaderboard</a>
            {user ? (
              <div className="flex flex-col items-center gap-4 mt-8">
                <span className="text-amber capitalize text-sm tracking-widest">Player: {user.name.split("@")[0]}</span>
                <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="px-6 py-3 rounded-full border border-coral text-coral hover:bg-coral hover:text-night transition-colors">Logout</button>
              </div>
            ) : (
              <button onClick={() => { setShowAuth(true); setShowMobileMenu(false); }} className="mt-8 px-8 py-4 rounded-full bg-fog text-night hover:bg-amber transition-colors">Login</button>
            )}
          </div>
        )}

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
            <a href="#/lobby" className="hidden sm:inline hover:text-fog transition-colors">Games</a>
            <a href="#/leaderboard" className="hidden sm:inline hover:text-fog transition-colors">Leaderboard</a>
            {user ? (
              <div className="hidden sm:flex items-center gap-2 relative">
                <button onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full border border-fog/15 text-fog grid place-items-center hover:border-amber hover:text-amber transition-colors" aria-label="Profile">
                  <UserIcon size={16} />
                </button>
                <button onClick={handleLogout} className="w-8 h-8 rounded-full border border-fog/15 text-fog grid place-items-center hover:border-coral hover:text-coral transition-colors" aria-label="Logout" title="Logout">
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
              <button onClick={() => setShowAuth(true)} className="hidden sm:inline-flex h-9 px-4 rounded-full border border-fog/15 text-fog items-center hover:border-amber hover:text-amber transition-colors">Login</button>
            )}
            <button onClick={() => setShowMobileMenu(true)} className="sm:hidden text-fog hover:text-amber transition-colors"><Menu size={24} /></button>
          </div>
        </nav>
      </header>

      <div id="top" />
      {route === "home" ? (
        <Hero user={user} onRequireAuth={() => setShowAuth(true)} />
      ) : route === "leaderboard" ? (
        <section id="leaderboard" className="relative scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-16 pb-24 md:pt-24 flex justify-center">
            <div className="max-w-2xl w-full">
              <div className="flex items-end justify-between mb-4">
                <h2 className="font-display text-fog text-3xl md:text-4xl font-light">Hall of Fame</h2>
                <span className={eyebrow}>Higher is better</span>
              </div>
              <WhenNear minH={640}><Leaderboard refreshKey={refreshKey} initialFilter={boardFilter} /></WhenNear>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section id="games" className="relative scroll-mt-16">
            <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-16 pb-24 md:pt-24">
              <p className={eyebrow}>The games</p>
              <h2 className="font-display text-fog text-5xl md:text-6xl font-light mt-3">Choose Your Game</h2>
              <div className="mt-10">
                <GamesSection user={user} playing={playing} setPlaying={setPlaying}
                  onRequireAuth={() => setShowAuth(true)}
                  onSubmitted={(g) => { setBoardFilter(g); setRefreshKey((k) => k + 1); }} />
              </div>
            </div>
          </section>
          <WhenNear minH={600}><Final /></WhenNear>
        </>
      )}

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-night/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 text-lg font-semibold uppercase tracking-[0.12em] text-mist">
          <button className="absolute top-5 right-6 text-fog" onClick={() => setShowMobileMenu(false)}><X size={28} /></button>
          <a href="#/lobby" onClick={() => { setShowMobileMenu(false); setPlaying(null); }} className="hover:text-amber transition-colors">Games</a>
          <a href="#/leaderboard" onClick={() => { setShowMobileMenu(false); setPlaying(null); }} className="hover:text-amber transition-colors">Leaderboard</a>
          {user ? (
            <div className="flex flex-col items-center gap-4 mt-8">
              <span className="text-amber capitalize text-sm tracking-widest">Player: {user.name.split("@")[0]}</span>
              <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="px-6 py-3 rounded-full border border-coral text-coral hover:bg-coral hover:text-night transition-colors">Logout</button>
            </div>
          ) : (
            <button onClick={() => { setShowAuth(true); setShowMobileMenu(false); }} className="mt-8 px-8 py-4 rounded-full bg-fog text-night hover:bg-amber transition-colors">Login</button>
          )}
        </div>
      )}

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onAuthSuccess={(u) => { setUser(u); setShowAuth(false); }} 
        />
      )}
    </div>
  );
}
