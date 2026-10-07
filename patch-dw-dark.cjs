const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Replace dark state with constant
content = content.replace(
  /const \[dark, setDark\] = useState\(\(\) => load\("nk-dark", false\)\);/,
  'const dark = false;'
);

// Remove the effect that saves it
content = content.replace(
  /useEffect\(\(\) => localStorage\.setItem\("nk-dark", JSON\.stringify\(dark\)\), \[dark\]\);\n/,
  ''
);

// Remove the toggle button from settings modal
content = content.replace(
  /<button onClick=\{\(\) => setDark\(!dark\)\} className="w-full flex items-center justify-between py-4 border-b border-\[var\(--line\)\]">[\s\S]*?<\/button>\n/,
  ''
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
