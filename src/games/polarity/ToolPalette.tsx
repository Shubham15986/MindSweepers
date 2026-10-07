import { CheckCheck, Eraser, Flag, Redo2, Undo2 } from "lucide-react";
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
};

export default function ToolPalette({ tool, canUndo, canRedo, disabled, onTool, onUndo, onRedo, onCheck, onReveal }: Props) {
  return (
    <div className="w-full max-w-[440px] mx-auto" role="toolbar" aria-label="Tools">
      <div className="grid grid-cols-5 gap-1.5">
        <button type="button" className="pl-tool" aria-pressed={tool === "erase"} disabled={disabled} onClick={() => onTool("erase")}><Eraser size={18} strokeWidth={1.6} /><span>Erase</span></button>
        <button type="button" className="pl-tool" disabled={disabled || !canUndo} onClick={onUndo}><Undo2 size={18} strokeWidth={1.6} /><span>Undo</span></button>
        <button type="button" className="pl-tool" disabled={disabled || !canRedo} onClick={onRedo}><Redo2 size={18} strokeWidth={1.6} /><span>Redo</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onCheck}><CheckCheck size={18} strokeWidth={1.6} /><span>Check</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onReveal}><Flag size={18} strokeWidth={1.6} /><span>View Ans</span></button>
      </div>
      <p className="text-center text-[11px] text-(--dim) mt-2">
        {tool === "erase" ? "Tap erase again to return to quick cycle." : "Tap cycles + here, + there, blank, ?, empty."}
      </p>
    </div>
  );
}
