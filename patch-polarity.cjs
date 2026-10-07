const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

// Replace newGame in the button with a check logic
content = content.replace(
  /<button className=\{`totem-save-btn \$\{solved \? "solved-glow" : ""\}`\} onClick=\{newGame\}>/,
  `<button className={\`totem-save-btn \${solved ? "solved-glow" : ""}\`} onClick={() => { if (solved && onGameOver && !hasScored) { setHasScored(true); onGameOver({ score: (levelIdx + 1) * 50, level: "Polarity L" + (levelIdx + 1) }); } }}>`
);

// Replace SAVE PROGRESS text with CHECK
content = content.replace(
  /<span className="totem-save-text">\{solved \? "STABILIZED! NEXT DREAM" : "SAVE PROGRESS"\}<\/span>/,
  '<span className="totem-save-text">{solved ? "STABILIZED!" : "CHECK"}</span>'
);

// Remove the automatic useEffect onGameOver so it only happens when they click CHECK?
// Actually, it's better to leave it automatic, but since they asked for "make it check and if it is correct then...", let's remove the auto-submit useEffect so they HAVE to click CHECK.
content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(solved && !hasScored\) \{\n\s*setHasScored\(true\);\n\s*if \(onGameOver\) onGameOver\(\{ score: \(levelIdx \+ 1\) \* 50, level: "Polarity L" \+ \(levelIdx \+ 1\) \}\);\n\s*\}\n\s*\}, \[solved, hasScored, levelIdx, onGameOver\]\);/g,
  `// Auto-submit removed so user must click CHECK`
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
