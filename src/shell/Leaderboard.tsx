import { useEffect, useState } from "react";
import type { BoardFilter, LeaderboardEntry, Range } from "../shared/types";
import { getLeaderboard, getMyRank } from "../shared/api";
import { theme } from "../shared/theme";
import { Loader2 } from "lucide-react";
import { card } from "./ui";

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: "dreamwall", label: "Dreamwall" }, { id: "polarity", label: "Polarity" }, { id: "architect", label: "Architect" }, { id: "overall", label: "Overall" },
];
const initials = (n: string) => n.replace(/[^A-Za-z]/g, " ").trim().split(/\s+|(?=[A-Z])/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export default function Leaderboard({ refreshKey, initialFilter = "dreamwall" }: { refreshKey: number; initialFilter?: BoardFilter }) {
  const [filter, setFilter] = useState<BoardFilter>(initialFilter);
  const range: Range = "all";
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [me, setMe] = useState<{ rank: number | null; score: number | null; level: string | null }>({ rank: null, score: null, level: null });

  useEffect(() => { setFilter(initialFilter); setPage(1); }, [initialFilter, refreshKey]);
  useEffect(() => {
    let live = true;
    setRows(null);
    getLeaderboard({ game: filter, range, page, pageSize }).then((result) => {
      if (live) setRows(result.entries);
    });
    getMyRank({ game: filter }).then((m) => { if (live) setMe(m); });
    return () => { live = false; };
  }, [filter, range, page, refreshKey]);
  const visibleRows = rows?.filter((row) => row.isYou) ?? null;

  return (
    <div className={card + " overflow-hidden"}>

      <div className="grid grid-cols-[40px_1fr_auto] gap-3 px-4 md:px-5 h-10 items-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist/70 border-b border-fog/8">
        <span>Rank</span><span>Dreamer</span><span className="text-right">Score</span>
      </div>

      <div className="relative max-h-[560px] overflow-y-auto">
        {rows === null ? (
          <div className="h-[280px] grid place-items-center"><Loader2 size={24} className="text-mist animate-spin" /></div>
        ) : visibleRows.length === 0 && me.score == null ? (
          <div className="h-[280px] grid place-items-center text-center px-6">
            <div><p className="font-display italic text-fog text-2xl mt-3">Your score will appear here.</p></div>
          </div>
        ) : (
          <ol>
            {visibleRows.map((r, i) => {
              const podium = i < 3 ? theme.podium[i] : null;
              return (
                <li key={r.id} className={"ll-stagger grid grid-cols-[40px_1fr_auto] gap-3 items-center h-14 px-4 md:px-5 border-b border-fog/6 " + (r.isYou ? "bg-amber/8" : "")} style={{ animationDelay: i * 50 + "ms" }}>
                  <span className="flex items-center gap-1 text-sm font-semibold tabular-nums" style={{ color: podium ?? undefined }}>
                    {r.rank ?? (page - 1) * pageSize + i + 1}
                  </span>
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold bg-slate text-fog"
                      style={podium ? { boxShadow: "0 0 0 1.5px " + podium + ", 0 0 16px -2px " + podium } : undefined}>{initials(r.name.split("@")[0].split(" ")[0]) || "?"}</span>
                    <span className={"truncate text-sm " + (r.isYou ? "text-amber font-semibold" : "text-fog")}>{r.name.split("@")[0].split(" ")[0]}</span>
                  </span>
                  <span className="text-right text-sm font-medium text-fog tabular-nums">{r.score.toLocaleString()}</span>
                  
                </li>
              );
            })}
          </ol>
        )}

        {rows && visibleRows.length === 0 && me.score != null && (
          <div className="sticky bottom-0 bg-night/95 backdrop-blur-md border-t border-fog/20 grid grid-cols-[40px_1fr_auto] gap-3 items-center h-14 px-4 md:px-5">
            <span className="text-sm font-semibold text-mist tabular-nums">-</span>
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold bg-amber/20 text-amber">YOU</span>
              <span className="truncate text-sm text-amber font-semibold">Your Score</span>
            </span>
            <span className="text-right text-sm font-bold text-amber tabular-nums">{me.score.toLocaleString()}</span>
          </div>
        )}
        
      </div>
    </div>
  );
}
