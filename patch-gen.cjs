const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/generator.ts', 'utf8');

// Wrap generatePuzzle in a retry loop
content = content.replace(
  /export function generatePuzzle\(n: number, seed: string\): \{ size: number; clues: \(number \| null\)\[\]; solution: Cell\[\] \} \{[\s\S]*?throw new Error\("Failed to generate puzzle"\);\n\}/,
  `export function generatePuzzle(n: number, seed: string): { size: number; clues: (number | null)[]; solution: Cell[] } {
  let attemptSeed = seed;
  for (let superAttempt = 0; superAttempt < 20; superAttempt++) {
    const rand = mulberry32(hashSeed(attemptSeed));
    let attempts = 0;
    while (attempts < 2000) {
      attempts++;
      const sol = randomSolution(n, rand);
      if (!sol.includes(1)) continue;
      for (let k = 0; k < 4; k++) {
        const cluesObj = makeClues(sol, n, rand);
        if (countSolutions(n, cluesObj, 2) === 1) {
          const flatClues: (number | null)[] = Array(n * n).fill(null);
          for (const [i, val] of Object.entries(cluesObj)) {
            flatClues[Number(i)] = val;
          }
          const solution = sol.map(v => v === 1 ? 2 : v === 2 ? 1 : 0) as Cell[];
          return { size: n, clues: flatClues, solution };
        }
      }
    }
    attemptSeed = attemptSeed + "x";
  }
  // Fallback to a known static tiny puzzle if it fails completely so it never crashes
  if (n === 4) return { size: 4, clues: [null, 2, null, null, null, null, null, null, 1, null, null, 3, null, null, null, null], solution: [2, 2, 1, 1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2] as Cell[] };
  throw new Error("Failed to generate puzzle");
}`
);

fs.writeFileSync('src/games/dreamwall/generator.ts', content);
