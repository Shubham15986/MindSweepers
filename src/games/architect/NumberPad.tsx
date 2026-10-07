import { Eraser, Lightbulb, Pencil, Redo2, Undo2 } from "lucide-react";

type Props = {
  n: number;
  pencil: boolean;
  hintsLeft: number;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  onNumber: (v: number) => void;
  onErase: () => void;
  onPencil: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReveal: () => void;
};

export default function NumberPad({ n, pencil, hintsLeft, canUndo, canRedo, disabled, onNumber, onErase, onPencil, onUndo, onRedo, onReveal }: Props) {
  return (
    <div className="w-full max-w-[420px] mx-auto" aria-label="Number pad">
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(" + n + ", minmax(0, 1fr))" }}>
        {Array.from({ length: n }, (_, k) => (
          <button key={k} type="button" disabled={disabled} onClick={() => onNumber(k + 1)} className={"ar-pad-num" + (pencil ? " is-pencil" : "")}
            aria-label={(pencil ? "Note " : "Place ") + (k + 1)}>{k + 1}</button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 mt-2">
        <button type="button" className="ar-tool" onClick={onErase} disabled={disabled}><Eraser size={18} strokeWidth={1.6} /><span>Erase</span></button>
        <button type="button" className="ar-tool" onClick={onPencil} disabled={disabled} aria-pressed={pencil}><Pencil size={18} strokeWidth={1.6} /><span>Pencil</span></button>
        <button type="button" className="ar-tool" onClick={onUndo} disabled={disabled || !canUndo}><Undo2 size={18} strokeWidth={1.6} /><span>Undo</span></button>
        <button type="button" className="ar-tool" onClick={onRedo} disabled={disabled || !canRedo}><Redo2 size={18} strokeWidth={1.6} /><span>Redo</span></button>
        <button type="button" className="ar-tool" onClick={onReveal} disabled={disabled}><Lightbulb size={18} strokeWidth={1.6} /><span className="tabular">View Ans</span></button>
      </div>
    </div>
  );
}
