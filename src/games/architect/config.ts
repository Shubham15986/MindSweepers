// All ARCHITECT tuning lives here. Components read these values only.
import type { GenSpec } from "./generator";

export type LevelKey = "Easy" | "Medium" | "Hard";

export type LevelConfig = {
  key: LevelKey;
  flavor: string;
  n: number;
  gen: GenSpec;
  baseScore: number;
  /** seconds before the time penalty starts */
  graceSec: number;
};

export const LEVELS: Record<LevelKey, LevelConfig> = {
  Easy: {
    key: "Easy", flavor: "Dream", n: 4, baseScore: 1000, graceSec: 60,
    gen: { n: 4, removeClues: false, givens: [2, 3], minClues: 16, budgetMs: 3000 },
  },
  Medium: {
    key: "Medium", flavor: "Deeper", n: 5, baseScore: 2500, graceSec: 120,
    gen: { n: 5, removeClues: false, givens: [0, 0], minClues: 20, budgetMs: 3000 },
  },
  Hard: {
    key: "Hard", flavor: "Limbo's edge", n: 6, baseScore: 5000, graceSec: 240,
    // Clues are removed while the solution stays unique, down to minClues.
    gen: { n: 6, removeClues: true, givens: [0, 0], minClues: 10, budgetMs: 3000 },
  },
};
export const LEVEL_ORDER: LevelKey[] = ["Easy", "Medium", "Hard"];

export const SCORING = {
  timePenaltyPerSec: 1,
  timePenaltyCap: 0.6, // fraction of baseScore
  hintPenalty: 300,
  minScore: 100,
};
export const MAX_HINTS = 3;

export const BOARD = {
  /** clue ring thickness relative to a playable cell */
  clueRatio: 0.72,
  /** smallest playable cell (tap target) and largest on wide screens */
  minCell: 40,
  maxCell: 72,
  gap: 4,
  /** tallest tower bar as a fraction of cell height */
  towerMax: 0.82,
};

export const DEMO = {
  sceneMs: 3800,
  // Worked example square; row 0 is 2 1 4 3 (left clue 2, right clue 2).
  grid: [2, 1, 4, 3, 3, 4, 1, 2, 4, 3, 2, 1, 1, 2, 3, 4],
};

export const TUTORIAL_KEY = "architect.tutorialSeen";

export function scoreFor(level: LevelConfig, seconds: number, hints: number) {
  if (level.key === "Easy") return 20;
  if (level.key === "Medium") return 30;
  if (level.key === "Hard") return 50;
  return 0;
}

export const today = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
