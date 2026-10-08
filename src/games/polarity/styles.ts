// Scoped to .polarity-root. Dreamwall palette via CSS variables. Only transform and opacity animate.
import { baseCss } from "../common/theme";

export const POL_CSS = baseCss(".polarity-root") + `
.polarity-root { position: relative; height: 100%; min-height: 100%; display: flex; flex-direction: column; -webkit-tap-highlight-color: transparent; }
.polarity-root .tabular { font-variant-numeric: tabular-nums; }

/* Board Container & Grid */
.polarity-root .pl-box { width: 100%; min-width: 0; overflow: auto; overscroll-behavior-x: contain; display: grid; padding: 4px; }
.polarity-root .pl-grid { 
  display: grid; 
  margin: auto; 
  padding: var(--pad); 
  gap: var(--gap); 
  border-radius: 20px; 
  background: color-mix(in srgb, var(--surface) 40%, var(--frame)); 
  border: 1px solid color-mix(in srgb, var(--fg) 12%, transparent);
  box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.08); 
  backdrop-filter: blur(12px);
}

/* Domino Frame */
.polarity-root .pl-dom { 
  position: relative; 
  display: flex; 
  border-radius: 12px; 
  background: color-mix(in srgb, var(--surface) 85%, var(--bg)); 
  border: 1.5px solid color-mix(in srgb, var(--fg) 18%, transparent); 
  overflow: hidden; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1); 
  transition: transform 160ms cubic-bezier(.2,.8,.2,1), border-color 200ms, box-shadow 200ms;
}
.polarity-root .pl-dom:hover {
  border-color: color-mix(in srgb, var(--fg) 35%, transparent);
  box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
}
.polarity-root .pl-dom.is-v { flex-direction: column; }

/* Blank Domino Pattern */
.polarity-root .pl-fill { 
  position: absolute; 
  inset: 0; 
  background: color-mix(in srgb, var(--muted) 90%, var(--bg)); 
  opacity: 0; 
  transition: opacity 220ms ease; 
  pointer-events: none; 
}
.polarity-root .pl-fill::after { 
  content: ""; 
  position: absolute; 
  inset: 0; 
  background: repeating-linear-gradient(135deg, transparent 0 8px, color-mix(in srgb, var(--fg) 8%, transparent) 8px 10px); 
}
.polarity-root .pl-dom.is-blank .pl-fill { opacity: 1; }
.polarity-root .pl-dom.is-wrong { 
  border-color: var(--bad); 
  box-shadow: 0 0 12px color-mix(in srgb, var(--bad) 50%, transparent), inset 0 0 0 1px var(--bad); 
  animation: pl-shake 300ms ease-in-out;
}

/* Domino Halves */
.polarity-root .pl-half { 
  position: relative; 
  flex: 1; 
  min-width: 0; 
  min-height: 0; 
  display: grid; 
  place-items: center; 
  cursor: pointer; 
  touch-action: manipulation; 
  -webkit-user-select: none; 
  user-select: none;
  transition: background-color 150ms ease;
}
.polarity-root .pl-half:hover {
  background-color: color-mix(in srgb, var(--fg) 5%, transparent);
}
.polarity-root .pl-half + .pl-half { 
  border-left: 1.5px dashed color-mix(in srgb, var(--fg) 20%, transparent); 
}
.polarity-root .pl-dom.is-v .pl-half + .pl-half { 
  border-left: 0; 
  border-top: 1.5px dashed color-mix(in srgb, var(--fg) 20%, transparent); 
}
.polarity-root .pl-half:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.polarity-root .pl-half.is-cursor { 
  box-shadow: inset 0 0 0 2.5px var(--accent); 
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
}
.polarity-root .pl-half.is-clash { 
  box-shadow: inset 0 0 0 2.5px var(--bad); 
  background-color: color-mix(in srgb, var(--bad) 15%, transparent);
}

/* Magnetic Pole Rings */
.polarity-root .pl-ring { 
  width: 62%; 
  aspect-ratio: 1; 
  border-radius: 999px; 
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: calc(var(--u) * 0.32);
  line-height: 1;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  animation: pl-pop 240ms cubic-bezier(.2,.8,.2,1) both; 
  user-select: none;
}
.polarity-root .pl-ring.is-plus { 
  background: linear-gradient(135deg, #ff416c, #ff4b2b); 
  box-shadow: 0 0 16px 3px rgba(255, 75, 43, 0.65), inset 0 1px 2px rgba(255,255,255,0.4); 
}
.polarity-root .pl-ring.is-minus { 
  background: linear-gradient(135deg, #00b4db, #0083b0); 
  box-shadow: 0 0 16px 3px rgba(0, 180, 219, 0.65), inset 0 1px 2px rgba(255,255,255,0.4); 
}
.polarity-root .pl-q { 
  color: var(--dim); 
  font-weight: 700; 
  font-size: calc(var(--u) * .38); 
  animation: pl-fade 200ms both; 
  opacity: 0.6;
}

/* Clash & Status Badges */
.polarity-root .pl-badge { 
  position: absolute; 
  top: 3px; 
  right: 3px; 
  width: 16px; 
  height: 16px; 
  border-radius: 999px; 
  background: var(--bad); 
  color: #fff; 
  font-size: 10px; 
  font-weight: 900; 
  display: grid; 
  place-items: center; 
  line-height: 1; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  animation: pl-pop 180ms ease-out;
}
.polarity-root .pl-badge.is-x { left: 3px; right: auto; }

/* Grid Gap */
.polarity-root .pl-gap { border-radius: 8px; background: color-mix(in srgb, var(--frame) 80%, transparent); }

/* Clue Cells (Sci-Fi Counters) */
.polarity-root .pl-clue { 
  position: relative; 
  width: 100%; 
  height: 100%; 
  display: flex; 
  flex-direction: column;
  align-items: center; 
  justify-content: center; 
  color: var(--fg); 
  font-weight: 700; 
  font-size: calc(var(--u) * .42); 
  font-variant-numeric: tabular-nums; 
  line-height: 1; 
  border-radius: 8px; 
  background: color-mix(in srgb, var(--surface) 65%, var(--bg)); 
  border: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);
  transition: all 200ms ease; 
}
.polarity-root button.pl-clue { cursor: pointer; }
.polarity-root button.pl-clue:hover { 
  border-color: color-mix(in srgb, var(--fg) 25%, transparent);
  transform: scale(1.03);
}
.polarity-root .pl-clue-sign { 
  width: 6px; 
  height: 6px; 
  border-radius: 999px; 
  margin-bottom: 2px; 
  transition: transform 200ms;
}
.polarity-root .pl-clue-sign.is-plus { background: #ff4b2b; box-shadow: 0 0 6px #ff4b2b; }
.polarity-root .pl-clue-sign.is-minus { background: #00b4db; box-shadow: 0 0 6px #00b4db; }
.polarity-root .pl-clue.is-hidden { background: transparent; border-color: transparent; box-shadow: none; }
.polarity-root .pl-clue.is-hidden::before { 
  content: ""; 
  position: absolute; 
  inset: 28%; 
  border-radius: 4px; 
  border: 1px dashed color-mix(in srgb, var(--fg) 15%, transparent); 
}
.polarity-root .pl-clue.is-ok { 
  color: #10b981; 
  border-color: color-mix(in srgb, #10b981 40%, transparent);
  background: color-mix(in srgb, #10b981 12%, var(--surface));
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}
.polarity-root .pl-clue.is-bad { 
  color: #ef4444; 
  border-color: color-mix(in srgb, #ef4444 40%, transparent);
  background: color-mix(in srgb, #ef4444 12%, var(--surface));
  animation: pl-pulse 1.2s infinite;
}
.polarity-root .pl-clue.is-done { opacity: 0.35; filter: grayscale(0.5); }
.polarity-root .pl-clue-icon { position: absolute; bottom: 8%; right: 8%; }

/* Tools & Action Dock */
.polarity-root .pl-tool { 
  min-height: 52px; 
  min-width: 48px; 
  border-radius: 16px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: 4px; 
  color: var(--fg); 
  font-size: 11px; 
  font-weight: 600; 
  border: 1px solid color-mix(in srgb, var(--fg) 15%, transparent); 
  background: color-mix(in srgb, var(--surface) 80%, var(--bg)); 
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 180ms ease;
  cursor: pointer;
}
.polarity-root .pl-tool:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  background: color-mix(in srgb, var(--surface) 95%, var(--bg));
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}
.polarity-root .pl-tool:active:not(:disabled) {
  transform: translateY(0);
}
.polarity-root .pl-tool span { color: var(--dim); }
.polarity-root .pl-tool:disabled { opacity: 0.35; cursor: not-allowed; }
.polarity-root .pl-tool[aria-pressed="true"] { 
  background: var(--fg); 
  color: var(--bg); 
  border-color: var(--fg); 
  box-shadow: 0 4px 14px color-mix(in srgb, var(--fg) 30%, transparent);
}
.polarity-root .pl-tool[aria-pressed="true"] span { color: var(--bg); }

/* Keyframes & Motion */
.polarity-root .pl-fade { animation: pl-fade 260ms ease-out both; }
.polarity-root .pl-fade-slow { animation: pl-fade 700ms ease-out both; }
.polarity-root .pl-rise { animation: pl-rise 380ms cubic-bezier(.2,.8,.2,1) both; }
.polarity-root .pl-pulse { animation: pl-pulse 1.6s ease-in-out infinite; }
@keyframes pl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pl-pop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
@keyframes pl-rise { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes pl-pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes pl-throb { 0%,100% { transform: none; } 50% { transform: scale(1.18); } }
@keyframes pl-shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
.polarity-root .pl-demo-caption { font-size: 24px; font-weight: 300; line-height: 1.15; text-align: center; min-height: 58px; display: grid; place-items: center; }
.polarity-root .pl-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--line); }
.polarity-root .pl-dot.is-on { background: var(--accent); }

@media (prefers-reduced-motion: reduce) {
  .polarity-root .pl-ring, .polarity-root .pl-rise, .polarity-root .pl-dom.is-wrong { animation-name: pl-fade; }
}
`;
export const POL_DEMO_CSS = `
.polarity-root .pl-demo-clues .pl-clue:not(.is-hidden) { animation: pl-throb 1s ease-in-out infinite; color: var(--accent-ink); }
.polarity-root .pl-demo-board .pl-badge { animation: pl-throb .8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .polarity-root .pl-demo-clues .pl-clue, .polarity-root .pl-demo-board .pl-badge { animation-name: pl-pulse; } }
`;
