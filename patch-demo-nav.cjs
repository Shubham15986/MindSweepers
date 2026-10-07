const fs = require('fs');
let content = fs.readFileSync('src/games/common/GameNav.tsx', 'utf8');

content = content.replace(
  /<span className="g-spinner" aria-hidden \/> Inception <span className="hidden sm:inline g-mono text-\[10px\] tracking-widest opacity-60">DEMO<\/span>/,
  '<span className="g-spinner" aria-hidden /> <span className="font-bold tracking-widest">DEMO</span>'
);

fs.writeFileSync('src/games/common/GameNav.tsx', content);
