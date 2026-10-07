const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /function Game\(\{ level, saved, onBack, onMenu, onRules, onSettings, onSave, onSolve, onNext \}: \{/,
  'function Game({ level, saved, onBack, onMenu, onRules, onSettings, onSave, onSolve, onNext, onReplay }: {'
);

content = content.replace(
  /generate\(nl\.n, nl\.seed\)\.then\(setPuzzleData\)/,
  'generate(nl.n, nl.seed, setPuzzleData)'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
