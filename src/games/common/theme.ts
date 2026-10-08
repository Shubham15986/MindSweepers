// Dreamwall's palette (paper, ink, mint, coral), shared by every game as CSS variables.
import { useCallback, useState } from "react";

export const PALETTE = {
  light: {
    "--bg": "#f2eee4", "--surface": "#fbf9f4", "--fg": "#13151b", "--dim": "#77746c", "--line": "#dcd6c8", "--muted": "#e9e4d8",
    "--accent": "#2fd3a6", "--accent-ink": "#13876b", "--bad": "#d4503f", "--overlay": "rgba(242,238,228,.94)", "--frame": "#1e40af",
  },
  dark: {
    "--bg": "transparent", "--surface": "#16262c", "--fg": "#d9e2e3", "--dim": "#9fb2b6", "--line": "rgba(217,226,227,0.15)", "--muted": "#2b3e45",
    "--accent": "#e8a24a", "--accent-ink": "#e8a24a", "--bad": "#ef6a5b", "--overlay": "rgba(14,26,31,.94)", "--frame": "#16262c",
  },
};
const POLES = { "--plus": "#2fd3a6", "--minus": "#ef6a5b" };

// Same key as Dreamwall so the choice carries across games. Only a theme flag is stored.
const KEY = "nk-dark";
function readDark() { try { return JSON.parse(localStorage.getItem(KEY) ?? "false") === true; } catch { return false; } }

export function useDreamTheme() {
  const dark = true;
  const toggle = () => {};
  const vars = { ...PALETTE.dark, ...POLES } as React.CSSProperties;
  return { dark, toggle, vars };
}

/** Shared base CSS for a game root class: fonts, buttons, overlays. */
export const baseCss = (root: string) => `@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap");
${root} { font-family: "Outfit", ui-sans-serif, system-ui, sans-serif; background: var(--bg); color: var(--fg); transition: background-color 300ms, color 300ms; }
${root} .g-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
${root} .g-eyebrow { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--dim); }
${root} :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
${root} .g-btn-primary { min-height: 52px; padding: 0 26px; border-radius: 16px; background: var(--fg); color: var(--bg); font-size: 15px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: transform 150ms; }
${root} .g-btn-primary:hover { transform: scale(1.01); }
${root} .g-btn-primary:active { transform: scale(.99); }
${root} .g-btn-primary:disabled { opacity: .5; transform: none; }
${root} .g-btn-ghost { min-height: 48px; padding: 0 20px; border-radius: 16px; border: 1px solid var(--line); color: var(--fg); font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background-color 150ms; }
${root} .g-btn-ghost:hover { background: var(--muted); }
${root} .g-btn-ghost:disabled { opacity: .4; }
${root} .g-icon { width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; transition: background-color 150ms; }
${root} .g-icon:hover { background: var(--muted); }
${root} .g-demo { height: 38px; padding: 0 14px 0 11px; border-radius: 999px; background: #E8A24A; color: #080A0F; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; transition: transform 150ms, filter 150ms; box-shadow: 0 2px 8px rgba(232, 162, 74, 0.4); }
${root} .g-demo:hover { filter: brightness(1.1); transform: translateY(-1px); }
${root} .g-seg { display: inline-flex; padding: 4px; border-radius: 999px; background: var(--muted); }
${root} .g-seg button { min-height: 38px; padding: 0 16px; border-radius: 999px; font-size: 14px; font-weight: 500; color: var(--dim); }
${root} .g-seg button[aria-checked="true"] { background: var(--surface); color: var(--fg); box-shadow: 0 1px 2px rgba(19,21,27,.12); }
${root} .g-card { border-radius: 24px; background: var(--surface); border: 1px solid var(--line); }
${root} .g-select { appearance: none; height: 30px; padding: 0 26px 0 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2377746c' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 10px center; color: var(--fg); font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
${root} .g-overlay { position: absolute; inset: 0; z-index: 30; display: grid; place-items: center; padding: 16px; background: var(--overlay); overflow-y: auto; }
${root} .g-spinner { position: relative; width: 16px; height: 16px; display: inline-block; }
${root} .g-spinner::before { content: ""; position: absolute; inset: 0; border-radius: 999px; border: 1px solid currentColor; }
${root} .g-spinner::after { content: ""; position: absolute; left: 50%; top: 0; margin-left: -1px; width: 2px; height: 8px; background: currentColor; transform-origin: bottom; animation: g-totem 2.4s cubic-bezier(.6,0,.4,1) infinite; }
@keyframes g-totem { 0%,100% { transform: rotate(0); } 50% { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { ${root} .g-spinner::after { animation: none; } ${root} .g-btn-primary:hover, ${root} .g-btn-primary:active { transform: none; } }
`;
