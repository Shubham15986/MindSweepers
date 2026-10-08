import { generatePuzzle } from './src/games/dreamwall/generator';
for (let i = 0; i < 5; i++) {
  console.time('6x6-'+i);
  try { generatePuzzle(6, Math.random().toString()); } catch(e){}
  console.timeEnd('6x6-'+i);
}
