import { memo } from "react";
import { Check, X } from "lucide-react";
import type { Side } from "./solver";

export type ClueStatus = "none" | "ok" | "bad";

// Status is shown by color and by a check / cross icon, never color alone.
function ClueCellImpl({ side, i, value, status, dim }: { side: Side; i: number; value: number; status: ClueStatus; dim: boolean }) {
  const where = side === "top" || side === "bottom" ? "Column " + (i + 1) + ", " + side : "Row " + (i + 1) + ", " + side;
  const label = where + " clue " + (value || "hidden") + (status === "ok" ? ", satisfied" : status === "bad" ? ", not satisfied" : "");
  return (
    <div role="note" aria-label={label}
      className={"ar-clue" + (!value ? " is-hidden" : "") + (status === "ok" ? " is-ok" : status === "bad" ? " is-bad" : "") + (dim && status === "ok" ? " is-dim" : "")}>
      {value || ""}
      {status === "ok" && <Check size={10} strokeWidth={3} className="ar-clue-icon" aria-hidden />}
      {status === "bad" && <X size={10} strokeWidth={3} className="ar-clue-icon" aria-hidden />}
    </div>
  );
}

export default memo(ClueCellImpl);
