const fs = require('fs');
let content = fs.readFileSync('src/shell/Leaderboard.tsx', 'utf8');

content = content.replace(
  /<div className="sticky bottom-0 grid grid-cols-\[40px_1fr_auto\] gap-3 items-center h-14 px-4 md:px-5 bg-card border-t border-amber\/40">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync('src/shell/Leaderboard.tsx', content);
