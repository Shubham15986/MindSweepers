const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

// Add checkState state
content = content.replace(
  /const \[hasScored, setHasScored\] = useState\(false\);/,
  `const [hasScored, setHasScored] = useState(false);\n  const [checkState, setCheckState] = useState<"idle" | "wrong">("idle");`
);

// Update onClick
content = content.replace(
  /onClick=\{.*?\}\}/,
  `onClick={() => {
              if (solved && onGameOver && !hasScored) {
                setHasScored(true);
                onGameOver({ score: (levelIdx + 1) * 50, level: "Polarity L" + (levelIdx + 1) });
              } else if (!solved) {
                setCheckState("wrong");
                setTimeout(() => setCheckState("idle"), 1500);
              }
            }}`
);

// Update text
content = content.replace(
  /<span className="totem-save-text">\{solved \? "STABILIZED!" : "CHECK"\}<\/span>/,
  '<span className="totem-save-text">{solved ? "STABILIZED!" : checkState === "wrong" ? "INCORRECT" : "CHECK"}</span>'
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
