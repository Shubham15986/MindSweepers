import type { BoardFilter, GameId, LeaderboardEntry, Range } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

// Read initial auth state from localStorage to survive page reloads
let myUserId: string | null = localStorage.getItem("mw_uid");
let myUsername: string | null = localStorage.getItem("mw_uname");

// The backend expects difficulty, we'll map levels or just pass "hard" for now
// if the game doesn't strictly use easy/medium/hard in its internal level names.
function mapLevelToDifficulty(level: string) {
  const l = level.toLowerCase();
  if (l.includes("easy") || l === "1") return "easy";
  if (l.includes("hard") || l === "3" || l === "expert") return "hard";
  return "medium";
}

export async function login({ email, password }: { email: string; password?: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  const data = await res.json();
  setAuth(data.userId, data.username);
  return data;
}

export async function register(payload: { email: string; phoneNumber: string; name: string; username: string; password?: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  const data = await res.json();
  setAuth(data.userId, data.username);
  return data;
}

export async function submitScore({ game, score, level }: { game: GameId; score: number; level: string }) {
  // If not logged in, we can't save to the backend. We'll skip or throw.
  if (!myUserId) {
    console.warn("User not logged in, score not saved to DB.");
    return { ok: true, entry: { id: "temp", name: "You (Guest)", score, level, isYou: true, game } };
  }

  const difficulty = mapLevelToDifficulty(level);

  const res = await fetch(`${API_BASE}/scores/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: myUserId, gameId: game, difficulty, score })
  });

  if (!res.ok) throw new Error("Failed to submit score");
  const data = await res.json();
  
  return { ok: true, entry: { id: myUserId, name: myUsername || "You", score: data.pointsAwarded, level, isYou: true, game } };
}

export async function getLeaderboard({ game, range }: { game: BoardFilter; range: Range }): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) return [];
    
    // The backend returns an array of { userId, name, username, score }
    const data = await res.json();
    
    return data.map((d: any) => ({
      id: d.userId,
      name: d.username || d.name,
      score: d.score,
      level: "Hard", // We don't track highest difficulty in the simple API yet
      isYou: d.userId === myUserId,
      game: "overall"
    }));
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    return [];
  }
}

export async function getMyRank({ game }: { game: BoardFilter }): Promise<{ rank: number | null; score: number | null; level: string | null }> {
  if (!myUserId) return { rank: null, score: null, level: null };
  const rows = await getLeaderboard({ game, range: "all" });
  const i = rows.findIndex((r) => r.isYou);
  return i < 0 ? { rank: null, score: null, level: null } : { rank: i + 1, score: rows[i].score, level: rows[i].level };
}

// Temporary auth helper for testing
export function setAuth(userId: string, username: string) {
  myUserId = userId;
  myUsername = username;
  localStorage.setItem("mw_uid", userId);
  localStorage.setItem("mw_uname", username);
}
