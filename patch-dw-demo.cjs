const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /className="group mr-1 h-10 pl-3 pr-4 rounded-full border border-\[var\(--fg\)\] flex items-center gap-2 text-sm font-medium hover:bg-\[var\(--fg\)\] hover:text-\[var\(--bg\)\] transition"/,
  'className="group mr-1 h-10 pl-3 pr-4 rounded-full bg-amber text-night flex items-center gap-2 text-sm font-medium hover:bg-amber/90 transition shadow-md"'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
