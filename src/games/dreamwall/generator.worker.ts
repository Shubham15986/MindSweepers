import { generatePuzzle } from "./generator";

self.onmessage = (e: MessageEvent<{ n: number; seed: string }>) => {
  try {
    const puzzle = generatePuzzle(e.data.n, e.data.seed);
    self.postMessage({ type: "done", puzzle });
  } catch (err: any) {
    self.postMessage({ type: "error", error: err.message });
  }
};
