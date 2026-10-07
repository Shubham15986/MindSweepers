const fs = require('fs');
let content = fs.readFileSync('src/shell/Leaderboard.tsx', 'utf8');

content = content.replace(
  /grid-cols-\[40px_1fr_auto_64px\]/g,
  'grid-cols-[40px_1fr_auto]'
);

content = content.replace(
  /<span className="text-right">Level<\/span>/g,
  ''
);

content = content.replace(
  /<span className="text-right text-xs text-mist">\{r\.level\}<\/span>/g,
  ''
);

fs.writeFileSync('src/shell/Leaderboard.tsx', content);
