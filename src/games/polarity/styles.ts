// Scoped to .polarity-root. Dreamwall palette via CSS variables. Only transform and opacity animate.
import { baseCss } from "../common/theme";

export const POL_CSS = baseCss(".polarity-root") + `
.polarity-root { position: relative; height: 100%; min-height: 100%; display: flex; flex-direction: column; overflow: hidden; -webkit-tap-highlight-color: transparent; }
.polarity-root .tabular { font-variant-numeric: tabular-nums; }

/* Board: sized in px by useFitCell; scrolls sideways rather than shrinking below the minimum */
.polarity-root .pl-box { width: 100%; min-width: 0; overflow: auto; overscroll-behavior: contain; display: grid; }
.polarity-root .pl-grid { display: grid; margin: auto; padding: var(--pad); gap: var(--gap); border-radius: 10px; background: var(--frame); }
.polarity-root .pl-dom { position: relative; display: flex; border-radius: 4px; background: var(--surface); overflow: hidden; }
.polarity-root .pl-dom.is-v { flex-direction: column; }
.polarity-root .pl-fill { position: absolute; inset: 0; background: var(--muted); opacity: 0; transition: opacity 200ms; pointer-events: none; }
.polarity-root .pl-fill::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--fg) 7%, transparent) 6px 7px); }
.polarity-root .pl-dom.is-blank .pl-fill { opacity: 1; }
.polarity-root .pl-dom.is-wrong { box-shadow: inset 0 0 0 2px var(--bad); }
.polarity-root .pl-half { position: relative; flex: 1; min-width: 0; min-height: 0; display: grid; place-items: center; cursor: pointer; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
.polarity-root .pl-half + .pl-half { border-left: 1px dashed var(--line); }
.polarity-root .pl-dom.is-v .pl-half + .pl-half { border-left: 0; border-top: 1px dashed var(--line); }
.polarity-root .pl-half:focus-visible { outline-offset: -3px; }
.polarity-root .pl-half.is-cursor { box-shadow: inset 0 0 0 3px var(--accent); }
.polarity-root .pl-half.is-clash { box-shadow: inset 0 0 0 3px var(--bad); }
.polarity-root .pl-ring { width: 56%; aspect-ratio: 1; border-radius: 999px; animation: pl-pop 200ms cubic-bezier(.2,.8,.2,1) both; }
.polarity-root .pl-ring.is-plus { background: var(--plus); }
.polarity-root .pl-ring.is-minus { background: var(--minus); }
.polarity-root .pl-q { color: var(--dim); font-weight: 600; font-size: calc(var(--u) * .34); animation: pl-fade 200ms both; }
.polarity-root .pl-badge { position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; border-radius: 999px; background: var(--fg); color: var(--bg); font-size: 9px; font-weight: 800; display: grid; place-items: center; line-height: 1; }
.polarity-root .pl-badge.is-x { left: 2px; right: auto; background: var(--bad); color: #fff; }
.polarity-root .pl-gap { border-radius: 4px; background: var(--frame); }
.polarity-root .pl-clue { position: relative; width: 100%; height: 100%; display: grid; place-items: center; align-content: center; color: var(--fg); font-weight: 600; font-size: calc(var(--u) * .38); font-variant-numeric: tabular-nums; line-height: 1; border-radius: 4px; background: var(--bg); transition: opacity 200ms; }
.polarity-root button.pl-clue { cursor: pointer; }
.polarity-root .pl-clue-sign { width: 7px; height: 7px; border-radius: 999px; margin-bottom: 3px; }
.polarity-root .pl-clue-sign.is-plus { background: var(--plus); }
.polarity-root .pl-clue-sign.is-minus { background: var(--minus); }
.polarity-root .pl-clue.is-hidden { background: transparent; }
.polarity-root .pl-clue.is-hidden::before { content: ""; position: absolute; inset: 26%; border-radius: 3px; border: 1px dashed color-mix(in srgb, var(--bg) 30%, transparent); }
.polarity-root .pl-clue.is-ok { color: var(--accent-ink); }
.polarity-root .pl-clue.is-bad { color: var(--bad); }
.polarity-root .pl-clue.is-done { opacity: .35; }
.polarity-root .pl-clue-icon { position: absolute; bottom: 6%; right: 8%; }

/* Tools */
.polarity-root .pl-tool { min-height: 50px; min-width: 44px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: var(--fg); font-size: 11px; font-weight: 500; border: 1px solid var(--line); background: var(--surface); }
.polarity-root .pl-tool span { color: var(--dim); }
.polarity-root .pl-tool:disabled { opacity: .35; }
.polarity-root .pl-tool[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.polarity-root .pl-tool[aria-pressed="true"] span { color: var(--bg); }

.polarity-root .pl-fade { animation: pl-fade 260ms ease-out both; }
.polarity-root .pl-fade-slow { animation: pl-fade 700ms ease-out both; }
.polarity-root .pl-rise { animation: pl-rise 380ms cubic-bezier(.2,.8,.2,1) both; }
.polarity-root .pl-pulse { animation: pl-pulse 1.6s ease-in-out infinite; }
@keyframes pl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pl-pop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
@keyframes pl-rise { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes pl-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes pl-throb { 0%,100% { transform: none; } 50% { transform: scale(1.18); } }
.polarity-root .pl-demo-caption { font-size: 24px; font-weight: 300; line-height: 1.15; text-align: center; min-height: 58px; display: grid; place-items: center; }
.polarity-root .pl-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--line); }
.polarity-root .pl-dot.is-on { background: var(--accent); }

@media (prefers-reduced-motion: reduce) {
  .polarity-root .pl-ring, .polarity-root .pl-rise { animation-name: pl-fade; }
}
`;
export const POL_DEMO_CSS = `
.polarity-root .pl-demo-clues .pl-clue:not(.is-hidden) { animation: pl-throb 1s ease-in-out infinite; color: var(--accent-ink); }
.polarity-root .pl-demo-board .pl-badge { animation: pl-throb .8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .polarity-root .pl-demo-clues .pl-clue, .polarity-root .pl-demo-board .pl-badge { animation-name: pl-pulse; } }
`;
