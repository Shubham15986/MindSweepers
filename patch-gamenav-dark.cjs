const fs = require('fs');
let content = fs.readFileSync('src/games/common/GameNav.tsx', 'utf8');

// We remove the toggle button entirely.
// But first, let's see GameNav.tsx
content = content.replace(
  /<button type="button" onClick=\{onToggleDark\} aria-label=\{dark \? "Switch to light mode" : "Switch to dark mode"\} aria-pressed=\{dark\} className="g-icon">\s*\{dark \? <Sun size=\{19\} strokeWidth=\{1\.6\} \/> : <Moon size=\{19\} strokeWidth=\{1\.6\} \/>\}\s*<\/button>/,
  ''
);

fs.writeFileSync('src/games/common/GameNav.tsx', content);
