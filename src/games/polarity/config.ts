// All POLARITY tuning lives here. Components read these values only.
import type { GenSpec } from "./generator";

export type LevelKey = "Easy" | "Medium" | "Hard";

export type LevelConfig = {
  key: LevelKey;
  flavor: string;
  difficulty: LevelKey;
  cols: number;
  rows: number;
  stripClues: boolean;
  clueKeepRatio: number;
  targetUniqueSolution: boolean;
  minCellSizePx: number;
  /** solver may use one level of lookahead */
  lookahead: boolean;
  baseScore: number;
  /** seconds before the time penalty starts */
  graceSec: number;
};

export const LEVELS: Record<LevelKey, LevelConfig> = {
  Easy: {
    key: "Easy", flavor: "Dream", difficulty: "Easy", cols: 4, rows: 3, stripClues: false, clueKeepRatio: 1,
    targetUniqueSolution: true, minCellSizePx: 44, lookahead: false, baseScore: 1000, graceSec: 60,
  },
  Medium: {
    key: "Medium", flavor: "Deeper", difficulty: "Medium", cols: 4, rows: 5, stripClues: false, clueKeepRatio: 1,
    targetUniqueSolution: true, minCellSizePx: 44, lookahead: false, baseScore: 2500, graceSec: 150,
  },
  Hard: {
    key: "Hard", flavor: "Limbo's edge", difficulty: "Hard", cols: 6, rows: 5, stripClues: true, clueKeepRatio: 0.6,
    targetUniqueSolution: true, minCellSizePx: 36, lookahead: true, baseScore: 5000, graceSec: 300,
  },
};
export const LEVEL_ORDER: LevelKey[] = ["Easy", "Medium", "Hard"];

export const GEN = { magnetRatio: 0.65, budgetMs: 3000 };
export const specFor = (lv: LevelConfig): GenSpec => ({
  cols: lv.cols, rows: lv.rows, stripClues: lv.stripClues, clueKeepRatio: lv.clueKeepRatio,
  lookahead: lv.lookahead, magnetRatio: GEN.magnetRatio, budgetMs: GEN.budgetMs,
});

export const SCORING = { timePenaltyPerSec: 1, timePenaltyCap: 0.6, hintPenalty: 300, minScore: 100 };
export const MAX_HINTS = 3;

export const BOARD = {
  /** clue ring thickness relative to a cell */
  clueRatio: 0.75,
  /** largest cell on wide screens */
  maxCellPx: 58,
  gap: 3,
  pad: 6,
  longPressMs: 480,
};

export const DEMO = {
  sceneMs: 3600,
  cols: 4,
  rows: 3,
  // A A B C / D E B C / D E F F
  doms: [[0, 1], [2, 6], [3, 7], [4, 8], [5, 9], [10, 11]] as [number, number][],
  solution: [1, 0, 1, 2, 0, 2],
  /** domino shown wrong first in scene 3, then flipped */
  flip: 5,
};

export const TUTORIAL_KEY = "polarity.tutorialSeen";

export function scoreFor(level: LevelConfig, seconds: number, hints: number) {
  const time = Math.min(Math.max(0, seconds - level.graceSec) * SCORING.timePenaltyPerSec, level.baseScore * SCORING.timePenaltyCap);
  return Math.max(SCORING.minScore, Math.round(level.baseScore - time - hints * SCORING.hintPenalty));
}

export const today = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
