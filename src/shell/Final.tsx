import { useState } from "react";
import { BRAND } from "../shared/theme";
import { btnPrimary } from "./ui";

export default function Final() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  return (
    <section className="bg-abyss">
      <div className="max-w-[1200px] mx-auto px-6 py-32 md:py-40 text-center">
        <div className="mx-auto w-24 h-32 grid place-items-end ll-wobble" aria-hidden>
          <svg viewBox="0 0 64 88" className="w-full h-full ll-spin" style={{ animationDuration: "1.2s" }}>
            <defs>
              <linearGradient id="top-g" x1="0" x2="1"><stop offset="0" stopColor="#2B3E45" /><stop offset=".5" stopColor="#9FB2B6" /><stop offset="1" stopColor="#2B3E45" /></linearGradient>
            </defs>
            <rect x="30" y="2" width="4" height="18" rx="2" fill="#9FB2B6" />
            <path d="M6 30c0-6 12-12 26-12s26 6 26 12c0 9-14 26-26 54C20 56 6 39 6 30Z" fill="url(#top-g)" />
            <path d="M7 33c6 4 15 6 25 6s19-2 25-6" stroke="#E8A24A" strokeOpacity=".7" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="mx-auto mt-2 h-2 w-20 rounded-full bg-fog/5" />
        <h2 className="font-display text-fog text-5xl md:text-7xl font-light mt-12">The top is still spinning.</h2>
        <p className="text-mist mt-4 max-w-md mx-auto">New dreams are being built. Get word when Kick and Limbo open.</p>
        {joined ? (
          <p className="mt-10 font-display italic text-2xl text-fog ll-fade">You're in. We'll find you in the dream.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setJoined(true); }} className="mt-10 mx-auto max-w-md flex flex-col sm:flex-row gap-3">
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dreamshare.io"
              className="flex-1 h-12 px-5 rounded-full bg-night border border-fog/12 text-fog placeholder:text-mist/50 outline-none focus:border-amber transition-colors" />
            <button className={btnPrimary}>Join the Dream</button>
          </form>
        )}
      </div>
      <footer className="border-t border-fog/8">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-mist/70">
          <span className="font-semibold tracking-[0.3em] text-mist">{BRAND.name}</span>
          <span className="font-display italic text-base text-mist">You never really wake up.</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </section>
  );
}
