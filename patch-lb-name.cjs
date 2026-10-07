const fs = require('fs');
let content = fs.readFileSync('src/shell/Leaderboard.tsx', 'utf8');

content = content.replace(
  /\{initials\(r\.name\) \|\| "\?"\}/g,
  '{initials(r.name.split("@")[0].split(" ")[0]) || "?"}'
);

content = content.replace(
  />\{r\.name\}<\/span>/g,
  '>{r.name.split("@")[0].split(" ")[0]}</span>'
);

fs.writeFileSync('src/shell/Leaderboard.tsx', content);
