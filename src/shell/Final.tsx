import { useState } from "react";
import { BRAND } from "../shared/theme";
import { btnPrimary } from "./ui";

export default function Final() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  return (
    <section className="bg-abyss">
      <div className="max-w-[1200px] mx-auto px-6 py-32 md:py-40 text-center">
        <div className="mx-auto w-28 h-36" aria-hidden>
          <svg viewBox="0 0 64 92" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="top-g" x1="0" x2="1"><stop offset="0" stopColor="#1d2c31" /><stop offset=".38" stopColor="#9FB2B6" /><stop offset=".5" stopColor="#d9e2e3" /><stop offset="1" stopColor="#1d2c31" /></linearGradient>
              <clipPath id="top-c"><path d="M6 30c0-6 12-12 26-12s26 6 26 12c0 9-14 26-26 54C20 56 6 39 6 30Z" /></clipPath>
            </defs>
            <ellipse cx="32" cy="88" rx="14" ry="2.6" fill="#000" className="st-shadow" />
            <g className="st-precess" style={{ transformOrigin: "50% 91.3%" }}>
              <rect x="30" y="2" width="4" height="18" rx="2" fill="#9FB2B6" />
              <path d="M6 30c0-6 12-12 26-12s26 6 26 12c0 9-14 26-26 54C20 56 6 39 6 30Z" fill="url(#top-g)" />
              <g clipPath="url(#top-c)">
                <g className="st-bands" style={{ animationName: "st-bands-lg", animationDuration: ".18s" }}>
                  {[-40, -20, 0, 20, 40, 60].map((x) => <rect key={x} x={x} y="16" width="5" height="72" fill="#0e1a1f" opacity=".28" />)}
                </g>
              </g>
              <path d="M7 33c6 4 15 6 25 6s19-2 25-6" stroke="#E8A24A" strokeOpacity=".8" strokeWidth="1.5" fill="none" />
            </g>
          </svg>
        </div>
        <h2 className="font-display text-fog text-5xl md:text-7xl font-light mt-12">The top is still spinning.</h2>
        <p className="text-mist mt-4 max-w-md mx-auto">New dreams are being built. Get word when the next MindSweepers round opens.</p>
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
