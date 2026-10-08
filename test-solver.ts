import { generatePuzzle } from './src/games/dreamwall/generator';

console.time('generate-8x8');
let attempts = 0;
while (attempts < 1) {
  try {
    const p = generatePuzzle(8, Math.random().toString());
    console.log("Success!", p.size);
    break;
  } catch (e) {
    attempts++;
  }
}
console.timeEnd('generate-8x8');
