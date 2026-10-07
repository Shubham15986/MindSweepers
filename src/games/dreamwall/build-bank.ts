import { generatePuzzle } from './generator';
import * as fs from 'fs';

const bank: Record<number, any[]> = { 4: [], 6: [], 8: [] };

function generateN(size: number, count: number) {
  for (let i = 0; i < count; i++) {
    let puzzle = null;
    let attemptSeed = Math.random().toString(36);
    while (!puzzle) {
      try {
        puzzle = generatePuzzle(size, attemptSeed);
      } catch (e) {
        attemptSeed = Math.random().toString(36);
      }
    }
    bank[size].push(puzzle);
    console.log(`Generated ${size}x${size} puzzle ${i+1}/${count}`);
  }
}

generateN(4, 5);
generateN(6, 5);

// I already have an 8x8 puzzle, I'll add it directly
bank[8].push({"size":8,"clues":[1,null,2,null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,null,4,null,null,null,null,null,null,null,null,null,null,null,null,null,5,null,1,null,null,null,null,9,null,null,null,null,null,null,null,null,null,1,null,1,null,null,null,null,null,null,null,null],"solution":[2,1,2,2,1,1,1,1,1,1,1,1,1,2,2,2,2,1,2,2,1,1,2,1,1,1,1,2,2,1,1,1,1,2,1,1,2,1,2,1,2,2,2,2,1,1,1,1,2,2,1,2,1,2,1,2,2,1,1,1,1,1,1,1]});

fs.writeFileSync('/Users/shubham/Downloads/MindSweepers/src/games/dreamwall/bank.ts', 'export const BANK: Record<number, any[]> = ' + JSON.stringify(bank, null, 2) + ';');
