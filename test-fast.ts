import { generatePuzzle } from './src/games/dreamwall/generator';
for (let i = 0; i < 5; i++) {
  console.time('8x8-fast-'+i);
  try { generatePuzzle(8, Math.random().toString()); } catch(e){}
  console.timeEnd('8x8-fast-'+i);
}
