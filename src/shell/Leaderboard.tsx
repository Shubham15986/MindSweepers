import { useEffect, useState } from "react";
import type { BoardFilter, LeaderboardEntry, Range } from "../shared/types";
import { getLeaderboard, getMyRank } from "../shared/api";
import { theme } from "../shared/theme";
import SpinningTop from "./SpinningTop";
import { card } from "./ui";

const FILTERS: { id: BoardFilter; label: string }[] = [
  { id: "dreamwall", label: "Dreamwall" }, { id: "polarity", label: "Polarity" }, { id: "architect", label: "Architect" }, { id: "overall", label: "Overall" },
];
const RANGES: { id: Range; label: string }[] = [{ id: "today", label: "Today" }, { id: "week", label: "Week" }, { id: "all", label: "All-time" }];
const initials = (n: string) => n.replace(/[^A-Za-z]/g, " ").trim().split(/\s+|(?=[A-Z])/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export default function Leaderboard({ refreshKey, initialFilter = "dreamwall" }: { refreshKey: number; initialFilter?: BoardFilter }) {
  const [filter, setFilter] = useState<BoardFilter>(initialFilter);
  const [range, setRange] = useState<Range>("all");
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [me, setMe] = useState<{ rank: number | null; score: number | null; level: string | null }>({ rank: null, score: null, level: null });

  useEffect(() => { setFilter(initialFilter); }, [initialFilter, refreshKey]);
  useEffect(() => {
    let live = true;
    setRows(null);
    Promise.all([getLeaderboard({ game: filter, range }), getMyRank({ game: filter })]).then(([r, m]) => { if (live) { setRows(r); setMe(m); } });
    return () => { live = false; };
  }, [filter, range, refreshKey]);

  return (
    <div className={card + " overflow-hidden"}>
      <div className="p-4 md:p-5 border-b border-fog/12 space-y-3">
        
        <div className="inline-flex p-1 rounded-full bg-night/70 border border-fog/12">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)} className={"h-8 px-4 rounded-full text-xs font-medium transition-colors " + (range === r.id ? "bg-slate text-fog" : "text-mist hover:text-fog")}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr_auto_64px] gap-3 px-4 md:px-5 h-10 items-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist/70 border-b border-fog/8">
        <span>Rank</span><span>Dreamer</span><span className="text-right">Score</span><span className="text-right">Level</span>
      </div>

      <div className="relative max-h-[560px] overflow-y-auto">
        {rows === null ? (
          <div className="h-[280px] grid place-items-center"><SpinningTop size={24} className="text-mist" /></div>
        ) : rows.length === 0 ? (
          <div className="h-[280px] grid place-items-center text-center px-6">
            <div><SpinningTop size={28} className="mx-auto text-mist" still /><p className="font-display italic text-fog text-2xl mt-3">No dreamers yet. Be the first.</p></div>
          </div>
        ) : (
          <ol>
            {rows.map((r, i) => {
              const podium = i < 3 ? theme.podium[i] : null;
              return (
                <li key={r.id} className={"ll-stagger grid grid-cols-[40px_1fr_auto_64px] gap-3 items-center h-14 px-4 md:px-5 border-b border-fog/6 " + (r.isYou ? "bg-amber/8" : "")} style={{ animationDelay: i * 50 + "ms" }}>
                  <span className="flex items-center gap-1 text-sm font-semibold tabular-nums" style={{ color: podium ?? undefined }}>
                    {podium ? <SpinningTop size={13} still /> : null}{i + 1}
                  </span>
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold bg-slate text-fog"
                      style={podium ? { boxShadow: "0 0 0 1.5px " + podium + ", 0 0 16px -2px " + podium } : undefined}>{initials(r.name.split("@")[0].split(" ")[0]) || "?"}</span>
                    <span className={"truncate text-sm " + (r.isYou ? "text-amber font-semibold" : "text-fog")}>{r.name.split("@")[0].split(" ")[0]}</span>
                  </span>
                  <span className="text-right text-sm font-medium text-fog tabular-nums">{r.score.toLocaleString()}</span>
                  <span className="text-right text-xs text-mist">{r.level}</span>
                </li>
              );
            })}
          </ol>
        )}
        <div className="sticky bottom-0 grid grid-cols-[40px_1fr_auto_64px] gap-3 items-center h-14 px-4 md:px-5 bg-card border-t border-amber/40">
          <span className="text-sm font-semibold text-amber tabular-nums">{me.rank ?? "–"}</span>
          <span className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold bg-amber text-night">YOU</span>
            <span className="truncate text-sm text-fog">Your rank{me.rank ? "" : " · play to enter"}</span>
          </span>
          <span className="text-right text-sm font-medium text-fog tabular-nums">{me.score?.toLocaleString() ?? "—"}</span>
          <span className="text-right text-xs text-mist">{me.level ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
