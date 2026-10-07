const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /import "\.\/dreamwall\.css";/,
  'import "./dreamwall.css";\nimport { Cell, Level, Tier, TIERS, LEVELS, neighbors, analyze } from "./logic";'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
