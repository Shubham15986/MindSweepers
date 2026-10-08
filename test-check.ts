import { generatePuzzle, isValidSolution } from './src/games/dreamwall/generator';
const p = generatePuzzle(8, Math.random().toString());
console.log('size:', p.size);
console.log('valid:', isValidSolution(p.solution.map(v => v===1?2:v===2?1:0), Object.fromEntries(p.clues.map((v, i) => [i, v]).filter(([i,v]) => v !== null)), 8));
