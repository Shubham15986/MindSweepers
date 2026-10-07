const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /desc: string;/,
  'desc: React.ReactNode;'
);

content = content.replace(
  /"A logic puzzle built in three dream layers\. Shade the sea, leave the islands, and never let the water pool\. Includes a guided <b>DEMO<\/b>\."/,
  '<>A logic puzzle built in three dream layers. Shade the sea, leave the islands, and never let the water pool. Includes a guided <b>DEMO</b>.</>'
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
