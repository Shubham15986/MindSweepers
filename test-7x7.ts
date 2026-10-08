import { generatePuzzle } from './src/games/dreamwall/generator';
for (let i = 0; i < 5; i++) {
  console.time('7x7-'+i);
  try { generatePuzzle(7, Math.random().toString()); } catch(e){}
  console.timeEnd('7x7-'+i);
}
