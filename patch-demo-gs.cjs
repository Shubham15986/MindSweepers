const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /Includes a guided Inception demo\./,
  'Includes a guided <b>DEMO</b>.'
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
