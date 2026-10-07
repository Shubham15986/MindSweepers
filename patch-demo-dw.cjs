const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /<Spinner \/> Inception <span className="hidden sm:inline font-mono text-\[10px\] tracking-widest opacity-60">DEMO<\/span>/,
  '<Spinner /> <span className="font-bold tracking-widest uppercase">Demo</span>'
);

content = content.replace(
  /<span className="font-mono text-\[10px\] tracking-\[0.3em\] text-\[var\(--dim\)\]">INCEPTION · GUIDED DEMO<\/span>/,
  '<span className="font-mono font-bold text-[10px] tracking-[0.3em] text-[var(--dim)]">GUIDED DEMO</span>'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
