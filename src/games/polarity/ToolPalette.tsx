import { CheckCheck, Flag, Play } from "lucide-react";
import type { Tool } from "./usePolarity";

type Props = {
  tool: Tool;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  onTool: (t: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onCheck: () => void;
  onReveal: () => void;
  onNewPuzzle: () => void;
};

export default function ToolPalette({ disabled, onCheck, onReveal, onNewPuzzle }: Props) {
  return (
    <div className="w-full max-w-[440px] mx-auto" role="toolbar" aria-label="Tools">
      <div className="grid grid-cols-3 gap-1.5">
        <button type="button" className="pl-tool" disabled={disabled} onClick={onCheck}><CheckCheck size={18} strokeWidth={1.6} /><span>Check</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onReveal}><Flag size={18} strokeWidth={1.6} /><span>View Ans</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onNewPuzzle}><Play size={18} strokeWidth={1.6} /><span>New Puzzle</span></button>
      </div>
      <p className="text-center text-[11px] text-(--dim) mt-2">
        Tap cycles + here, + there, blank, empty.
      </p>
    </div>
  );
}
