// Bundled by Vite as an inline Blob worker (imported with ?worker&inline).
import { generateSync, type GenSpec } from "./generator";

self.onmessage = (e: MessageEvent<{ id: number; spec: GenSpec; seed: string }>) => {
  const { id, spec, seed } = e.data;
  (self as unknown as Worker).postMessage({ id, puzzle: generateSync(spec, seed) });
};
