const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(solved && !hasScored\) \{\n\s*if \(onGameOver\) onGameOver\(\{ score: \(levelIdx \+ 1\) \* 50, level: "Polarity L" \+ \(levelIdx \+ 1\) \}\);\n\s*setHasScored\(true\);\n\s*\}\n\s*\}, \[solved, hasScored, levelIdx, onGameOver\]\);/g,
  `// Auto submit removed. Score is sent when CHECK is clicked.`
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
