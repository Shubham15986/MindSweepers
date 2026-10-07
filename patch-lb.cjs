const fs = require('fs');
let content = fs.readFileSync('src/shell/Leaderboard.tsx', 'utf8');

content = content.replace(
  /<div className="flex gap-2 overflow-x-auto \[scrollbar-width:none\]">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync('src/shell/Leaderboard.tsx', content);
