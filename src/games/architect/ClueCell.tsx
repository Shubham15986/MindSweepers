import { memo } from "react";
import { Check, X, Eye } from "lucide-react";
import type { Side } from "./solver";

export type ClueStatus = "none" | "ok" | "bad";

type Props = {
  side: Side;
  i: number;
  value: number;
  status: ClueStatus;
  dim: boolean;
  eyeActive?: boolean;
  onToggleEye?: () => void;
};

// Status is shown by color and by a check / cross icon, never color alone.
function ClueCellImpl({ side, i, value, status, dim, eyeActive, onToggleEye }: Props) {
  const where = side === "top" || side === "bottom" ? "Column " + (i + 1) + ", " + side : "Row " + (i + 1) + ", " + side;
  const label = where + " clue " + (value || "hidden") + (status === "ok" ? ", satisfied" : status === "bad" ? ", not satisfied" : "");
  return (
    <div role="note" aria-label={label} onClick={onToggleEye}
      className={"ar-clue" + (!value ? " is-hidden" : "") + (status === "ok" ? " is-ok" : status === "bad" ? " is-bad" : "") + (dim && status === "ok" ? " is-dim" : "") + (eyeActive ? " bg-(--accent)/20" : "")}
      style={{ cursor: onToggleEye ? "pointer" : "default" }}
    >
      {value || ""}
      {status === "ok" && <Check size={10} strokeWidth={3} className="ar-clue-icon" aria-hidden />}
      {status === "bad" && <X size={10} strokeWidth={3} className="ar-clue-icon" aria-hidden />}
      {onToggleEye && <Eye size={16} strokeWidth={2.5} className={"absolute text-(--dim) transition-transform hover:scale-110 " + (side === "top" ? "bottom-full mb-1" : side === "bottom" ? "top-full mt-1" : side === "left" ? "right-full mr-1" : "left-full ml-1")} />}
    </div>
  );
}

export default memo(ClueCellImpl);
