const fs = require('fs');

let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Replace hint() function with reveal()
content = content.replace(
  /const hint = \(\) => {[\s\S]*?};/,
  `const reveal = () => {
    setCells(level.solution);
    setStats((s) => ({ ...s, hints: s.hints + 1 }));
    onSolve(time, 0);
  };`
);

// Replace the Hint button icon and label in the toolbar
content = content.replace(
  /\[Lightbulb, "Hint", hint, false\]/,
  `[Lightbulb, "Reveal", reveal, false]`
);

// Replace hints stats text
content = content.replace(
  /"Undos · Errors · Hints", stats\.undos \+ " · " \+ stats\.errors \+ " · " \+ stats\.hints/,
  `"Undos · Errors · Reveals", stats.undos + " · " + stats.errors + " · " + stats.hints`
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
