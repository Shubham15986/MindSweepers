const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /className="dreamwall-root min-h-full bg-\[var\(--bg\)\] text-\[var\(--fg\)\] transition-colors duration-300"/,
  'className="dreamwall-root min-h-full flex-1 flex flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300"'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
