import { generatePuzzle } from './generator';
import * as fs from 'fs';

const bank: Record<number, any[]> = { 4: [], 6: [], 8: [] };

function generateN(size: number, count: number) {
  for (let i = 0; i < count; i++) {
    let puzzle = null;
    let attemptSeed = Math.random().toString(36);
    let attempts = 0;
    while (!puzzle) {
      try {
        puzzle = generatePuzzle(size, attemptSeed);
      } catch (e) {
        attempts++;
        attemptSeed = Math.random().toString(36);
      }
    }
    bank[size].push(puzzle);
    console.log(`Generated ${size}x${size} puzzle ${i+1}/${count} after ${attempts} retries`);
  }
}

// Ensure generator uses the original code, NOT the bank!
// I will check out generator.ts to the dynamic version

generateN(4, 50);
generateN(6, 50);
generateN(8, 5);

fs.writeFileSync('/Users/shubham/Downloads/MindSweepers/src/games/dreamwall/bank.ts', 'export const BANK: Record<number, any[]> = ' + JSON.stringify(bank, null, 2) + ';');
