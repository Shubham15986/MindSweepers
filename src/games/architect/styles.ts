// Scoped to .architect-root. Dreamwall palette via CSS variables. Only transform and opacity animate.
import { baseCss } from "../common/theme";

export const ARCH_CSS = baseCss(".architect-root") + `
.architect-root { position: relative; height: 100%; min-height: 100%; display: flex; flex-direction: column; overflow: hidden; -webkit-tap-highlight-color: transparent; }
.architect-root .tabular { font-variant-numeric: tabular-nums; }

/* Board: sized in px by useFitCell; scrolls rather than shrinking below the minimum */
.architect-root .ar-boardwrap { width: 100%; min-width: 0; overflow: auto; overscroll-behavior: contain; display: grid; scrollbar-width: none; -ms-overflow-style: none; padding: 32px; }
.architect-root .ar-boardwrap::-webkit-scrollbar { display: none; }
.architect-root .ar-board { display: grid; margin: auto; padding: 6px; border-radius: 10px; background: var(--frame); transform-style: preserve-3d; }
.architect-root .ar-cell { position: relative; min-width: 0; min-height: 0; border-radius: 3px; background: var(--surface); display: grid; place-items: center; cursor: pointer; transform-style: preserve-3d; }
.architect-root .ar-cell.is-given { background: var(--muted); cursor: default; }
.architect-root .ar-cell.is-peer { background: color-mix(in srgb, var(--accent) 9%, var(--surface)); }
.architect-root .ar-cell.is-given.is-peer { background: var(--muted); }
.architect-root .ar-cell.is-sel { box-shadow: inset 0 0 0 3px var(--accent); }
.architect-root .ar-cell.is-dup, .architect-root .ar-cell.is-wrong { /* red glow on floor */ box-shadow: inset 0 0 20px color-mix(in srgb, var(--bad) 30%, transparent); }
.architect-root .ar-board-scene { perspective: 1400px; width: 100%; min-width: 0; overflow: visible; display: flex; justify-content: center; align-items: center; }
.architect-root .ar-board-container { transform-style: preserve-3d; transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
.architect-root .ar-tower-3d { position: absolute; inset: 12%; transform-style: preserve-3d; transition: opacity 0.3s; pointer-events: none; }
.architect-root .ar-face { position: absolute; background: color-mix(in srgb, var(--accent) 90%, black); border: 1px solid color-mix(in srgb, var(--bg) 20%, transparent); transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1), height 0.4s, width 0.4s; }
.architect-root .ar-cell.is-dup .ar-face, .architect-root .ar-cell.is-wrong .ar-face { background: color-mix(in srgb, var(--bad) 80%, black); }
.architect-root .ar-face.top { inset: 0; background: color-mix(in srgb, var(--accent) 70%, white); display: grid; place-items: center; }
.architect-root .ar-cell.is-dup .ar-face.top, .architect-root .ar-cell.is-wrong .ar-face.top { background: color-mix(in srgb, var(--bad) 70%, white); }
.architect-root .ar-face.front { bottom: 0; left: 0; width: 100%; transform-origin: bottom; }
.architect-root .ar-face.right { bottom: 0; right: 0; height: 100%; transform-origin: right; }
.architect-root .ar-face.back { top: 0; left: 0; width: 100%; transform-origin: top; }
.architect-root .ar-face.left { bottom: 0; left: 0; height: 100%; transform-origin: left; }
.architect-root .ar-num-3d { color: #ffffff; font-weight: 800; font-size: calc(var(--ar-fs) * 1.15); line-height: 1; transition: transform 0.6s ease; text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.5); display: inline-block; z-index: 10; }
.architect-root .ar-notes { position: absolute; inset: 8%; display: grid; grid-template-columns: repeat(3, 1fr); font-family: "JetBrains Mono", monospace; font-size: calc(var(--ar-fs) * .36); color: var(--dim); line-height: 1; text-align: center; align-items: center; }
.architect-root .ar-mark { position: absolute; top: 3px; right: 3px; color: var(--bad); }
.architect-root .ar-clue { position: relative; width: 100%; height: 100%; display: grid; place-items: center; border-radius: 3px; background: var(--bg); color: var(--fg); font-size: calc(var(--ar-fs) * .78); font-weight: 600; font-variant-numeric: tabular-nums; transition: opacity 200ms; }
.architect-root .ar-clue.is-hidden { background: transparent; }
.architect-root .ar-clue.is-hidden::before { content: ""; position: absolute; inset: 26%; border-radius: 3px; border: 1px dashed color-mix(in srgb, var(--bg) 30%, transparent); }
.architect-root .ar-clue.is-ok { color: var(--accent-ink); }
.architect-root .ar-clue.is-bad { color: var(--bad); }
.architect-root .ar-clue.is-dim { opacity: .3; }
.architect-root .ar-clue-icon { position: absolute; bottom: 8%; right: 10%; }

/* Pad */
.architect-root .ar-pad-num { min-height: 50px; min-width: 44px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); color: var(--fg); font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; transition: transform 120ms; }
.architect-root .ar-pad-num:active { transform: scale(.96); }
.architect-root .ar-pad-num.is-pencil { color: var(--dim); font-size: 15px; }
.architect-root .ar-tool { min-height: 48px; min-width: 44px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--fg); font-size: 11px; font-weight: 500; }
.architect-root .ar-tool span { color: var(--dim); }
.architect-root .ar-tool:disabled { opacity: .3; }
.architect-root .ar-tool[aria-pressed="true"] { background: var(--fg); color: var(--bg); }
.architect-root .ar-tool[aria-pressed="true"] span { color: var(--bg); }

.architect-root .ar-fade { animation: ar-fade 260ms ease-out both; }
.architect-root .ar-fade-slow { animation: ar-fade 700ms ease-out both; }
.architect-root .ar-rise { animation: ar-rise 380ms cubic-bezier(.2,.8,.2,1) both; }
.architect-root .ar-pulse { animation: ar-pulse 1.6s ease-in-out infinite; }
@keyframes ar-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ar-rise { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes ar-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }

/* Demo */
.architect-root .ar-demo-caption { font-size: 24px; font-weight: 300; line-height: 1.15; text-align: center; min-height: 58px; display: grid; place-items: center; }
.architect-root .ar-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--line); }
.architect-root .ar-dot.is-on { background: var(--accent); }
.architect-root .ar-demo-in { animation: ar-fade 400ms ease-out both; }
.architect-root .ar-demo-pop { animation: ar-rise 380ms ease-out both; }
.architect-root .ar-demo-ring { position: absolute; inset: 0; border-radius: 3px; box-shadow: inset 0 0 0 3px var(--accent); opacity: 0; animation: ar-fade 400ms ease-out forwards; }
.architect-root .ar-demo-dim { animation: ar-dim 600ms ease-out forwards; }
@keyframes ar-dim { to { opacity: .28; } }

@media (prefers-reduced-motion: reduce) {
  .architect-root .ar-tower, .architect-root .ar-cap { transition: opacity 200ms; }
  .architect-root .ar-rise, .architect-root .ar-demo-pop { animation-name: ar-fade; }
  .architect-root .ar-pad-num:active { transform: none; }
}
`;
