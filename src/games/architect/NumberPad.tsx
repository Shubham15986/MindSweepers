import { Eraser, Eye, Redo2, Undo2 } from "lucide-react";

type Props = {
  n: number;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  onChangeHeight: (delta: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReveal: () => void;
};

export default function NumberPad({ canUndo, canRedo, disabled, onChangeHeight, onErase, onUndo, onRedo, onReveal }: Props) {
  return (
    <div className="w-full max-w-[420px] mx-auto" aria-label="Number pad">
      <div className="flex gap-2 justify-center">
        <button type="button" disabled={disabled} onClick={() => onChangeHeight(-1)} className="ar-pad-num w-16 text-3xl pb-1" aria-label="Decrease height">-</button>
        <button type="button" disabled={disabled} onClick={() => onChangeHeight(1)} className="ar-pad-num w-16 text-3xl pb-1" aria-label="Increase height">+</button>
        <button type="button" onClick={onReveal} disabled={disabled} className="ar-pad-num w-16 grid place-items-center" aria-label="View Ans" title="View Answer">
          <Eye size={22} strokeWidth={1.6} className="text-[var(--dim)]" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2 max-w-[300px] mx-auto">
        <button type="button" className="ar-tool" onClick={onErase} disabled={disabled}><Eraser size={18} strokeWidth={1.6} /><span>Erase</span></button>
        <button type="button" className="ar-tool" onClick={onUndo} disabled={disabled || !canUndo}><Undo2 size={18} strokeWidth={1.6} /><span>Undo</span></button>
        <button type="button" className="ar-tool" onClick={onRedo} disabled={disabled || !canRedo}><Redo2 size={18} strokeWidth={1.6} /><span>Redo</span></button>
      </div>
    </div>
  );
}
