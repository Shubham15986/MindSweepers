import { generatePuzzle } from './generator';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

if (isMainThread) {
  const bank: Record<number, any[]> = { 4: [], 6: [], 8: [] };
  const targets = { 4: 50, 6: 50, 8: 10 };
  let activeWorkers = 0;

  function runWorker(size: number) {
    return new Promise((resolve) => {
      const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { size } });
      worker.on('message', (puzzle) => {
        bank[size].push(puzzle);
        console.log(`Generated ${size}x${size} puzzle ${bank[size].length}/${targets[size as keyof typeof targets]}`);
        if (bank[size].length >= targets[size as keyof typeof targets]) {
          worker.terminate();
          resolve(null);
        }
      });
    });
  }

  async function main() {
    console.log("Starting massive generation...");
    // 4 workers for 8x8 to speed it up
    const p8_1 = runWorker(8);
    const p8_2 = runWorker(8);
    const p8_3 = runWorker(8);
    const p8_4 = runWorker(8);
    const p4 = runWorker(4);
    const p6 = runWorker(6);
    
    await Promise.all([p4, p6, Promise.race([p8_1, p8_2, p8_3, p8_4])]);
    // wait until 8x8 reaches target
    while (bank[8].length < targets[8]) {
      await new Promise(r => setTimeout(r, 1000));
    }
    
    fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'bank.ts'), 'export const BANK: Record<number, any[]> = ' + JSON.stringify(bank, null, 2) + ';');
    console.log("Done! Bank written.");
    process.exit(0);
  }
  main();
} else {
  // worker
  const size = workerData.size;
  // We need to bypass the TypeScript hook issues in worker threads if running via tsx. 
  // It's easier to just write a simple loop.
  // Actually, tsx handles worker threads natively if we use tsx!
  while (true) {
    try {
      const puzzle = generatePuzzle(size, Math.random().toString(36));
      parentPort!.postMessage(puzzle);
    } catch (e) {}
  }
}
