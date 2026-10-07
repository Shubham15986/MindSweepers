const fs = require('fs');
let content = fs.readFileSync('src/games/common/theme.ts', 'utf8');

content = content.replace(
  /export function useDreamTheme\(\) \{[\s\S]*?return \{ dark, toggle, vars \};\n\}/,
  `export function useDreamTheme() {
  const dark = false;
  const toggle = () => {};
  const vars = { ...PALETTE.light, ...POLES } as React.CSSProperties;
  return { dark, toggle, vars };
}`
);

fs.writeFileSync('src/games/common/theme.ts', content);
