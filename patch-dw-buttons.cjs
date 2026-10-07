const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Remove the tools selector
content = content.replace(
  /<div className="mt-4 p-1\.5 rounded-2xl bg-\[var\(--muted\)\] grid grid-cols-3 gap-1">\s*\{tools\.map\(\(t\) => \([\s\S]*?<\/button>\s*\)\)\}\s*<\/div>/,
  ''
);

// Make the action buttons a little brighter
content = content.replace(
  /<span className="w-10 h-10 rounded-full bg-\[var\(--muted\)\] group-hover:bg-\[var\(--line\)\] grid place-items-center transition">/g,
  '<span className="w-10 h-10 rounded-full bg-[var(--line)] text-[var(--fg)] group-hover:bg-[var(--fg)] group-hover:text-[var(--bg)] grid place-items-center transition">'
);
content = content.replace(
  /<span className="text-\[10px\] font-medium tracking-wide text-\[var\(--dim\)\]">\{l\}<\/span>/g,
  '<span className="text-[10px] font-semibold tracking-wide text-[var(--fg)]/80">{l}</span>'
);

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
