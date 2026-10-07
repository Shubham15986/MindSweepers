const fs = require('fs');

let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Replace RAW with dynamic logic
content = content.replace(/const RAW: Record<string, string\[\]> = {[\s\S]*?};\n/, '');

// Add useDreamwallWorker
const workerHook = `
function useDreamwallWorker() {
  const [generating, setGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./generator.worker.ts', import.meta.url), { type: 'module' });
    return () => workerRef.current?.terminate();
  }, []);

  const generate = (n: number, seed: string, onDone: (puzzle: any) => void) => {
    setGenerating(true);
    if (!workerRef.current) return;
    workerRef.current.onmessage = (e) => {
      if (e.data.type === "done") {
        setGenerating(false);
        onDone(e.data.puzzle);
      }
    };
    workerRef.current.postMessage({ n, seed });
  };

  return { generating, generate };
}
`;

content = content.replace(/type Cell = 0 \| 1 \| 2;/, workerHook + '\ntype Cell = 0 | 1 | 2;');

// Update Level type and LEVELS array
content = content.replace(/type Level = { id: string; tier: Tier; index: number; clues: \(number \| null\)\[\]; solution: Cell\[\]; n: number };\nconst LEVELS: Level\[\] = TIERS\.flatMap\(\(tier\) =>\n  \[RAW\[tier\.key\]\]\.map\(\(rows\) => {\n    const flat = rows\.join\(""\)\.split\(""\);\n    const index = TIERS\.indexOf\(tier\);\n    return {\n      id: "L" \+ \(index \+ 1\), tier, index, n: tier\.size,\n      clues: flat\.map\(\(c\) => \(c === "#" \|\| c === "\." \? null : parseInt\(c, 36\)\)\),\n      solution: flat\.map\(\(c\) => \(c === "#" \? 1 : 2\)\) as Cell\[\],\n    };\n  }\),\n\);/, 
`type Level = { id: string; tier: Tier; index: number; n: number; seed: string };
const randomSeed = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

const LEVELS: Level[] = TIERS.map((tier, index) => ({
  id: "L" + (index + 1),
  tier,
  index,
  n: tier.size,
  seed: today() + "-" + tier.size,
}));`);

// Update Dreamwall component state
content = content.replace(/const \[level, setLevel\] = useState<Level>\(LEVELS\[0\]\);/,
  `const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [puzzleData, setPuzzleData] = useState<{ clues: (number | null)[], solution: Cell[] } | null>(null);
  const { generating, generate } = useDreamwallWorker();`);

// Update open function
content = content.replace(/const open = \(lv: Level\) => { setLevel\(lv\); setLastId\(lv\.id\); setScreen\("game"\); };/,
  `const open = (lv: Level) => { 
    setLevel(lv); 
    setLastId(lv.id); 
    setScreen("game"); 
    setPuzzleData(null);
    generate(lv.n, lv.seed, (data) => setPuzzleData(data));
  };`);

// Update Game rendering to show loading
content = content.replace(/<Game\n\s*level={level}\n\s*onSolve=/,
  `{generating || !puzzleData ? (
        <div className="h-full min-h-dvh flex flex-col items-center justify-center text-[var(--dim)] gap-4 font-mono text-sm">
          <Spinner />
          <p>Generating {level.n}x{level.n} dreamscape...</p>
          {level.n >= 8 && <p className="text-[10px] opacity-60">(Complex layers may take up to 30s to stabilize)</p>}
        </div>
      ) : <Game
          level={{ ...level, clues: puzzleData.clues, solution: puzzleData.solution }}
          onSolve=`);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
