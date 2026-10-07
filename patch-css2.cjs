const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace(
  /html \{ scroll-behavior: smooth; \}/,
  'html { scroll-behavior: smooth; overflow-x: clip; width: 100%; }'
);
content = content.replace(
  /body \{ font-family: var\(--font-sans\); background: #0e1a1f; color: #9fb2b6; -webkit-font-smoothing: antialiased; \}/,
  'body { font-family: var(--font-sans); background: #0e1a1f; color: #9fb2b6; -webkit-font-smoothing: antialiased; overflow-x: clip; width: 100%; position: relative; }'
);

fs.writeFileSync('src/index.css', content);
