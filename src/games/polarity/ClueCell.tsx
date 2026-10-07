import { memo } from "react";
import { Check, X } from "lucide-react";

export type ClueStatus = "none" | "ok" | "bad";

type Props = {
  id: string;
  /** "Row 2, left clue" style prefix */
  where: string;
  sign: "+" | "−";
  value: number;
  status: ClueStatus;
  done: boolean;
  onToggle: (id: string) => void;
};

// Status is shown by color plus a check / cross icon, never color alone.
function ClueCellImpl({ id, where, sign, value, status, done, onToggle }: Props) {
  if (value < 0) return <div className="pl-clue is-hidden" role="note" aria-label={where + ", hidden"} />;
  const label = where + ", " + value + " " + (sign === "+" ? "positive" : "negative") + (value === 1 ? " pole" : " poles")
    + (status === "ok" ? ", satisfied" : status === "bad" ? ", exceeded or impossible" : "") + (done ? ", marked done" : "");
  return (
    <button type="button" aria-label={label} aria-pressed={done} onClick={() => onToggle(id)}
      className={"pl-clue" + (status === "ok" ? " is-ok" : status === "bad" ? " is-bad" : "") + (done ? " is-done" : "")}>
      <span className={"pl-clue-sign " + (sign === "+" ? "is-plus" : "is-minus")} aria-hidden />
      {value}
      {status === "ok" && <Check size={9} strokeWidth={3} className="pl-clue-icon" aria-hidden />}
      {status === "bad" && <X size={9} strokeWidth={3} className="pl-clue-icon" aria-hidden />}
    </button>
  );
}

export default memo(ClueCellImpl);
