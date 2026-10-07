const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

// Restore the clue toggle logic
content = content.replace(
  /<g key=\{key\} onClick=\{\(\) => \{[\s\S]*?\}\}>/,
  '<g key={key} onClick={() => toggleClue(key)} className="totem-clue-badge" style={{ cursor: "pointer" }}>'
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
