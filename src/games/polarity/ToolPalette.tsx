import { CheckCheck, Flag, RefreshCw } from "lucide-react";
import type { Tool } from "./usePolarity";

type Props = {
  tool: Tool;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled: boolean;
  onTool?: (t: Tool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCheck?: () => void;
  onReveal: () => void;
  onNewPuzzle: () => void;
};

export default function ToolPalette({ disabled, onCheck, onReveal, onNewPuzzle }: Props) {
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-2" role="toolbar" aria-label="Tools">
      <div className="grid grid-cols-3 gap-3">
        <button type="button" className="pl-tool !min-h-[48px] flex-col gap-1 font-semibold text-xs md:text-sm" disabled={disabled} onClick={onCheck} title="Check solution">
          <CheckCheck size={18} strokeWidth={1.8} />
          <span>Check</span>
        </button>
        <button type="button" className="pl-tool !min-h-[48px] flex-col gap-1 font-semibold text-xs md:text-sm" disabled={disabled} onClick={onReveal} title="Give up & view solution">
          <Flag size={18} strokeWidth={1.8} />
          <span>Solution</span>
        </button>
        <button type="button" className="pl-tool !min-h-[48px] flex-col gap-1 font-semibold text-xs md:text-sm !bg-[var(--fg)] !text-[var(--bg)] !border-[var(--fg)]" disabled={disabled} onClick={onNewPuzzle} title="Generate new puzzle">
          <RefreshCw size={18} strokeWidth={1.8} />
          <span>New Puzzle</span>
        </button>
      </div>
      <p className="flex items-center justify-center text-center text-sm font-bold text-[var(--fg)] bg-[var(--fg)]/5 py-2.5 px-4 rounded-xl mt-3 mx-auto w-full max-w-[440px]">
        <span>Tap domino to cycle: <span className="font-black text-[#ff4b2b]">+</span> pole, <span className="font-black text-[#00b4db]">−</span> pole, or blank.</span>
      </p>
    </div>
  );
}
