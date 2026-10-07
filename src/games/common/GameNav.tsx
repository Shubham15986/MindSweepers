import { Info, Moon, Sun } from "lucide-react";

type Props = {
  name: string;
  /** 2x2 logo glyph cells, Dreamwall style */
  glyph: React.ReactNode;
  dark: boolean;
  onToggleDark: () => void;
  onDemo: () => void;
  onHelp: () => void;
  /** level, timer, hints while playing */
  children?: React.ReactNode;
};

// The Dreamwall top bar: logo left, Inception demo pill and round icon buttons right.
export default function GameNav({ name, glyph, dark, onToggleDark, onDemo, onHelp, children }: Props) {
  return (
    <header className="relative z-10 shrink-0 flex flex-wrap items-center justify-between gap-x-3 px-4 md:px-6 py-2.5 border-b border-(--line)">
      <div className="flex items-center gap-3 min-h-10">
        <div className="grid grid-cols-2 gap-[2px] w-5 h-5" aria-hidden>{glyph}</div>
        <span className="text-sm font-semibold tracking-[0.42em]">{name}</span>
      </div>
      {children && <div className="order-3 w-full md:order-none md:w-auto flex items-center gap-3 md:gap-4 pt-2 md:pt-0">{children}</div>}
      <div className="flex items-center gap-1">
        <button type="button" onClick={onDemo} className="g-demo mr-1">
          <span className="g-spinner" aria-hidden /> <span className="font-bold tracking-widest">DEMO</span>
        </button>
        <button type="button" onClick={onHelp} aria-label="How to play" className="g-icon"><Info size={19} strokeWidth={1.6} /></button>
        
      </div>
    </header>
  );
}
