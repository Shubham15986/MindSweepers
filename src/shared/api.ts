// Backend placeholders. Every function returns mock data and keeps state in
// memory only (no localStorage). Swap the bodies for real fetch calls later.
import { mockLeaderboard } from "../shell/mockLeaderboard";
import type { BoardFilter, GameId, LeaderboardEntry, Range } from "./types";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const submissions: (LeaderboardEntry & { game: GameId })[] = [];

// Only Dreamwall is live; Architect and Polarity have no scores yet.
function base(game: BoardFilter, range: Range): LeaderboardEntry[] {
  if (game === "architect" || game === "polarity") return [];
  const take = range === "today" ? 6 : range === "week" ? 8 : 10;
  const factor = range === "today" ? 0.62 : range === "week" ? 0.84 : 1;
  return mockLeaderboard.slice(0, take).map((e) => ({ ...e, score: Math.round(e.score * factor) }));
}

export async function submitScore({ game, score, level }: { game: GameId; score: number; level: string }) {
  await delay();
  const entry = { id: "you-" + submissions.length, name: "You", score, level, isYou: true, game };
  submissions.push(entry);
  return { ok: true as const, entry };
}

export async function getLeaderboard({ game, range }: { game: BoardFilter; range: Range }): Promise<LeaderboardEntry[]> {
  await delay();
  const mine = submissions.filter((s) => game === "overall" || s.game === game);
  const best = mine.sort((a, b) => b.score - a.score)[0];
  const rows = [...base(game, range), ...(best ? [best] : [])];
  return rows.sort((a, b) => b.score - a.score);
}

export async function getMyRank({ game }: { game: BoardFilter }): Promise<{ rank: number | null; score: number | null; level: string | null }> {
  const rows = await getLeaderboard({ game, range: "all" });
  const i = rows.findIndex((r) => r.isYou);
  return i < 0 ? { rank: null, score: null, level: null } : { rank: i + 1, score: rows[i].score, level: rows[i].level };
}
