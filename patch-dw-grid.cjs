const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

content = content.replace(
  /style=\{\{ display: "grid", gridTemplateColumns: "repeat\(" \+ n \+ "," \+ cellPx \+ "\)", gap: "2px", touchAction: "none" \}\}/,
  'style={{ display: "grid", gridTemplateColumns: "repeat(" + n + ", minmax(0, 1fr))", gap: "2px", touchAction: "none", width: "100%", maxWidth: "440px", aspectRatio: "1" }}'
);

// We also need to remove the cellPx variable to avoid unused var warning if we want, or just leave it.
// Actually, let's remove it.
content = content.replace(
  /const cellPx = "min\(" \+ Math\.floor\(400 \/ n\) \+ "px, calc\(\(100vw - 32px - " \+ \(\(n-1\)\*2\) \+ "px\)\/" \+ n \+ "\)\)";\n/,
  ''
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
