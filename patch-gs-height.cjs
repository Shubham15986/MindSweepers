const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /<div className="relative w-full mx-auto max-w-\[1120px\] h-\[85dvh\] md:h-\[720px\] rounded-2xl border border-fog\/12 overflow-hidden bg-night \[transform:translateZ\(0\)\]">/,
  '<div className="relative w-full mx-auto max-w-[1120px] flex-1 min-h-[75dvh] rounded-2xl border border-fog/12 overflow-hidden bg-night [transform:translateZ(0)] flex flex-col">'
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
