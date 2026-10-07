import { generatePuzzle } from "./src/games/dreamwall/generator";

console.time("Generate 4x4");
console.log(generatePuzzle(4, "daily-4-123"));
console.timeEnd("Generate 4x4");

console.time("Generate 6x6");
console.log(generatePuzzle(6, "daily-6-123"));
console.timeEnd("Generate 6x6");

console.time("Generate 8x8");
console.log(generatePuzzle(8, "daily-8-123"));
console.timeEnd("Generate 8x8");
