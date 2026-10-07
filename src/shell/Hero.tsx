import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import heroImg from "../assets/hero-street.jpg";
import { BRAND } from "../shared/theme";
import { btnPrimary } from "./ui";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const map = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

// [start, end) of scroll progress where each text group is shown.
const PHASES: { at: [number, number]; lines: string[]; lead?: boolean }[] = [
  { at: [0, 0.25], lines: ["Is This Real?"], lead: true },
  { at: [0.25, 0.55], lines: ["What if the world", "could bend?"] },
  { at: [0.55, 0.8], lines: ["Build your", "own layers."] },
  { at: [0.8, 1.01], lines: ["Step inside."] },
];

export default function Hero() {
  const stage = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const vignette = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const groups = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = matchMedia("(min-width: 768px)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      const scale = p < 0.25 ? 1 : p < 0.55 ? 1 + 0.1 * map(p, 0.25, 0.55) : 1.1 + 0.08 * map(p, 0.55, 0.8);
      const parallax = desktop.matches ? -r.top * 0.4 * 0.15 : 0; // image drifts at ~0.6x of the stage
      if (img.current) img.current.style.transform = reduce ? "none" : "translate3d(0," + parallax.toFixed(1) + "px,0) scale(" + scale.toFixed(4) + ")";
      const closeIn = map(p, 0.55, 0.8);
      if (vignette.current) vignette.current.style.opacity = String(closeIn * 0.7);
      if (glow.current) glow.current.style.opacity = String(closeIn * 0.1);
      if (fade.current) fade.current.style.opacity = String(map(p, 0.86, 1));
      if (bar.current) bar.current.style.transform = "scaleY(" + p.toFixed(4) + ")";
      if (cue.current) cue.current.style.opacity = String(1 - map(p, 0, 0.1));
      PHASES.forEach((ph, i) => {
        const g = groups.current[i];
        if (g) g.dataset.on = p >= ph.at[0] && p < ph.at[1] ? "1" : "0";
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={stage} className="relative h-[300vh]" aria-label="Intro">
      <div className="sticky top-0 h-dvh overflow-hidden bg-night">
        <div ref={img} className="absolute -inset-[4%] will-change-transform origin-[50%_58%]">
          <img src={heroImg} alt="A fog-bound Parisian street at night, its buildings leaning inward toward a vanishing point" className="w-full h-full object-cover object-[50%_60%]" fetchPriority="high" />
        </div>
        {/* static legibility wash */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,26,31,.55)_0%,rgba(14,26,31,.1)_35%,rgba(14,26,31,.25)_65%,rgba(14,26,31,.85)_100%)]" />
        <div ref={vignette} className="absolute inset-0 opacity-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_25%,rgba(18,40,46,.75)_70%,#0b1a1f_100%)]" />
        <div ref={glow} className="hidden md:block absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_50%_62%,#E8A24A_0%,transparent_45%)]" />

        <div className="relative h-full max-w-[1200px] mx-auto px-6 md:px-12 flex items-center">
          {PHASES.map((ph, i) => (
            <div key={i} ref={(el) => { groups.current[i] = el; }} data-on={i === 0 ? "1" : "0"} className="hero-group absolute inset-x-6 md:inset-x-12 text-center md:text-left">
              {ph.lead && (
                <p className="hero-line font-semibold text-fog uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(44px,12.5vw,190px)] -ml-[0.04em]">
                  Mind<span className="font-light text-amber">Sweepers</span>
                </p>
              )}
              <h1 className={"font-display text-fog font-light leading-[0.95] tracking-tight " + (ph.lead ? "mt-3 text-[32px] md:text-[56px] italic" : "italic text-[48px] md:text-[96px]")}>
                {ph.lines.map((l, k) => (
                  <span key={k} className="hero-line block" style={{ transitionDelay: k * 120 + "ms" }}>{l}</span>
                ))}
              </h1>
              {ph.lead && (
                <div className="hero-line mt-6 md:mt-8" style={{ transitionDelay: "120ms" }}>
                  <p className="text-mist text-lg md:text-xl">{BRAND.tagline}</p>
                  <a href="#games" className={btnPrimary + " mt-8"}>Enter the Dream</a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={cue} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mist">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown size={14} strokeWidth={1.5} />
        </div>
        <div className="absolute right-0 top-0 h-full w-[2px] bg-fog/5">
          <div ref={bar} className="h-full w-full bg-amber origin-top" style={{ transform: "scaleY(0)" }} />
        </div>
        <div ref={fade} className="absolute inset-0 bg-night opacity-0 pointer-events-none" />
      </div>
    </section>
  );
}
