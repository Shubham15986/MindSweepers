const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

// Replace the manual button score trigger with auto-score inside useEffect
content = content.replace(
  /useEffect\(\(\) => \{\n\s*setHasScored\(false\);\n\s*\}, \[levelIdx\]\);/,
  `useEffect(() => {
    setHasScored(false);
  }, [levelIdx]);

  useEffect(() => {
    if (solved && onGameOver && !hasScored) {
      setHasScored(true);
      const scores = [20, 30, 50];
      const earned = scores[levelIdx] || 50;
      onGameOver({ score: earned, level: "Polarity L" + (levelIdx + 1) });
    }
  }, [solved, hasScored, levelIdx, onGameOver]);`
);

// Restore the newGame button logic from Magnets.jsx
content = content.replace(
  /<button className=\{\`totem-save-btn \$\{solved \? "solved-glow" : ""\}\`\} onClick=\{\(\) => \{ if \(solved && onGameOver && !hasScored\) \{ setHasScored\(true\); onGameOver\(\{ score: \(levelIdx \+ 1\) \* 50, level: "Polarity L" \+ \(levelIdx \+ 1\) \}\); \} \}\}>/,
  `<button className={\`totem-save-btn \${solved ? "solved-glow" : ""}\`} onClick={() => {
              if (solved) {
                newGame();
              } else {
                setCheckState("wrong");
                setTimeout(() => setCheckState("idle"), 1500);
              }
            }}>`
);

content = content.replace(
  /<span className="totem-save-text">\{solved \? "STABILIZED!" : checkState === "wrong" \? "INCORRECT" : "CHECK"\}<\/span>/,
  `<span className="totem-save-text">{solved ? "STABILIZED! NEXT DREAM" : checkState === "wrong" ? "INCORRECT" : "CHECK"}</span>`
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
