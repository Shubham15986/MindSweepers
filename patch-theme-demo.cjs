const fs = require('fs');
let content = fs.readFileSync('src/games/common/theme.ts', 'utf8');

content = content.replace(
  /\$\{root\} \.g-demo \{ height: 38px; padding: 0 14px 0 11px; border-radius: 999px; border: 1px solid var\(--fg\); display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; transition: background-color 150ms, color 150ms; \}/,
  '${root} .g-demo { height: 38px; padding: 0 14px 0 11px; border-radius: 999px; background: #E8A24A; color: #080A0F; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; transition: transform 150ms, filter 150ms; box-shadow: 0 2px 8px rgba(232, 162, 74, 0.4); }'
);
content = content.replace(
  /\$\{root\} \.g-demo:hover \{ background: var\(--fg\); color: var\(--bg\); \}/,
  '${root} .g-demo:hover { filter: brightness(1.1); transform: translateY(-1px); }'
);

fs.writeFileSync('src/games/common/theme.ts', content);
