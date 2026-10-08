const fs = require('fs');
let code = fs.readFileSync('src/games/dreamwall/generator.ts', 'utf8');

// optimize getComponents
code = code.replace(
  `function getComponents(g: number[], nb: number[][], val: number): number[][] {
  const comps: number[][] = [];
  const seen = new Set<number>();
  for (let i = 0; i < g.length; i++) {
    if (g[i] === val && !seen.has(i)) {
      const comp = [i];
      seen.add(i);
      let head = 0;
      while (head < comp.length) {
        const x = comp[head++];
        for (const y of nb[x]) {
          if (g[y] === val && !seen.has(y)) {
            seen.add(y);
            comp.push(y);
          }
        }
      }
      comps.push(comp);
    }
  }
  return comps;
}`,
  `const seenBuf = new Uint8Array(100);
const compBuf = new Int32Array(100);

function getComponents(g: number[], nb: number[][], val: number): number[][] {
  const comps: number[][] = [];
  seenBuf.fill(0);
  for (let i = 0; i < g.length; i++) {
    if (g[i] === val && seenBuf[i] === 0) {
      const comp: number[] = [];
      compBuf[0] = i;
      seenBuf[i] = 1;
      let head = 0;
      let tail = 1;
      while (head < tail) {
        const x = compBuf[head++];
        comp.push(x);
        for (const y of nb[x]) {
          if (g[y] === val && seenBuf[y] === 0) {
            seenBuf[y] = 1;
            compBuf[tail++] = y;
          }
        }
      }
      comps.push(comp);
    }
  }
  return comps;
}`
);

// add sea pruning to propagate
code = code.replace(
  `        if (cl.length === 1) {
          const need = clues[cl[0]];
          if (comp.length > need) return false;
          if (comp.length + unk.size < need) return false;
          if (comp.length === need) {
            for (const u of unk) {
              g[u] = 2;
              changed = true;
            }
          }
        }
      }
    }`,
  `        if (cl.length === 1) {
          const need = clues[cl[0]];
          if (comp.length > need) return false;
          if (comp.length + unk.size < need) return false;
          if (comp.length === need) {
            for (const u of unk) {
              g[u] = 2;
              changed = true;
            }
          }
        }
      }
      
      const seaComps = getComponents(g, nb, 2);
      if (seaComps.length > 1) {
        const canBeSea = g.map(v => v === 2 || v === 0 ? 2 : 1);
        const potSeaComps = getComponents(canBeSea, nb, 2);
        let compsWithSea = 0;
        for (const pot of potSeaComps) {
          if (pot.some(i => g[i] === 2)) compsWithSea++;
        }
        if (compsWithSea > 1) return false;
      }
    }`
);

fs.writeFileSync('src/games/dreamwall/generator.ts', code);
