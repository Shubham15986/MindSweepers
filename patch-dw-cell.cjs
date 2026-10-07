const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /const cellPx = "min\(" \+ \(n === 4 \? 76 : n === 6 \? 60 : 50\) \+ "px, calc\(\(100vw - 24px - " \+ \(\(n-1\)\*2\) \+ "px\)\/" \+ n \+ "\)\)";/,
  'const cellPx = "min(" + Math.floor(400 / n) + "px, calc((100vw - 32px - " + ((n-1)*2) + "px)/" + n + "))";'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
