export type User = { id: string; name: string };
export type GameResult = { score: number; level: string; meta?: unknown };
export type GameProps = { user: User | null; onGameOver: (r: GameResult) => void; onExit: () => void };
export type GameId = "dreamwall" | "polarity" | "architect";
export type BoardFilter = GameId | "overall";
export type Range = "today" | "week" | "all";
export type LeaderboardEntry = { id: string; name: string; score: number; level: string; isYou?: boolean };
