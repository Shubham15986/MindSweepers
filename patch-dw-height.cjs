const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(/min-h-dvh/g, 'flex-1 min-h-0');

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
