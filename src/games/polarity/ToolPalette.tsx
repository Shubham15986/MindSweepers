import { CheckCheck, CircleHelp, Eraser, Lightbulb, Magnet, Redo2, Square, Undo2, Flag } from "lucide-react";
import type { Tool } from "./usePolarity";

type Props = {
  tool: Tool;
  hintsLeft: number;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  onTool: (t: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onCheck: () => void;
  onReveal: () => void;
};

const TOOLS: { id: Exclude<Tool, null>; label: string; Icon: typeof Magnet }[] = [
  { id: "magnet", label: "Magnet", Icon: Magnet },
  { id: "blank", label: "Blank", Icon: Square },
  { id: "q", label: "Not blank", Icon: CircleHelp },
  { id: "erase", label: "Erase", Icon: Eraser },
];

export default function ToolPalette({ tool, hintsLeft, canUndo, canRedo, disabled, onTool, onUndo, onRedo, onHint, onCheck, onReveal }: Props) {
  return (
    <div className="w-full max-w-[440px] mx-auto" role="toolbar" aria-label="Tools">
      <div className="grid grid-cols-4 gap-1.5">
        {TOOLS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className="pl-tool" aria-pressed={tool === id} disabled={disabled} onClick={() => onTool(id)}>
            <Icon size={18} strokeWidth={1.6} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 mt-1.5">
        <button type="button" className="pl-tool" disabled={disabled || !canUndo} onClick={onUndo}><Undo2 size={18} strokeWidth={1.6} /><span>Undo</span></button>
        <button type="button" className="pl-tool" disabled={disabled || !canRedo} onClick={onRedo}><Redo2 size={18} strokeWidth={1.6} /><span>Redo</span></button>
        <button type="button" className="pl-tool" disabled={disabled || hintsLeft <= 0} onClick={onHint}><Lightbulb size={18} strokeWidth={1.6} /><span className="tabular">Hint {hintsLeft}</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onCheck}><CheckCheck size={18} strokeWidth={1.6} /><span>Check</span></button>
        <button type="button" className="pl-tool" disabled={disabled} onClick={onReveal}><Flag size={18} strokeWidth={1.6} /><span>View Ans</span></button>
      </div>
      <p className="text-center text-[11px] text-(--dim) mt-2">
        {tool ? "Tap a tool again to return to quick cycle." : "No tool: tap cycles + here, + there, blank, ?, empty."}
      </p>
    </div>
  );
}
