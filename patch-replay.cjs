const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Change LEVELS seed to random initially, so it's fresh per session
content = content.replace(
  /seed: today\(\) \+ "-" \+ tier.size/,
  'seed: Math.random().toString(36).slice(2)'
);

// Add onReplay to Game props
content = content.replace(
  /onSave: \(c: Cell\[\]\) => void; onSolve: \(t: number, s: number\) => void; onNext: \(\) => void;/g,
  'onSave: (c: Cell[]) => void; onSolve: (t: number, s: number) => void; onNext: () => void; onReplay: () => void;'
);

content = content.replace(
  /onNext: \(\) => void;\n\}\) \{/g,
  'onNext: () => void; onReplay: () => void;\n}) {'
);

// Use onReplay instead of the manual reset
content = content.replace(
  /<button onClick=\{.*?setCells\(Array\(n \* n\)\.fill\(0\).*?\} className="h-12 rounded-2xl border border-\[var\(--line\)\]">Replay<\/button>/,
  '<button onClick={onReplay} className="h-12 rounded-2xl border border-[var(--line)]">Replay / New Grid</button>'
);

// Pass onReplay from Dreamwall
content = content.replace(
  /onNext=\{\(\) => \{ if \(level\.index === LEVELS\.length - 1\) setScreen\("menu"\); else open\(LEVELS\[level\.index \+ 1\]\); \}\}/,
  `onNext={() => { if (level.index === LEVELS.length - 1) setScreen("menu"); else open(LEVELS[level.index + 1]); }}\n            onReplay={() => { const nl = { ...level, seed: Math.random().toString(36).slice(2) }; setLevel(nl); setProgress(p => { const np = {...p}; delete np[level.id]; return np; }); generate(nl.n, nl.seed).then(setPuzzleData); }}`
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
