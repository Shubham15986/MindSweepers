const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /<span className=\{eyebrow\}>Now dreaming · \{TABS\.find\(\(x\) => x\.id === playing\)!\.label\}<\/span>/,
  '<span className="text-lg md:text-xl font-display text-amber tracking-[0.2em] uppercase font-semibold">{TABS.find((x) => x.id === playing)!.label}</span>'
);

// We need to fix the height of the GamesSection container when in full-page mode.
// We changed GamesSection to just be relative w-full h-[85dvh].
// Let's make it fill the remaining height!
content = content.replace(
  /<div className="relative w-full mx-auto max-w-\[1120px\] h-\[85dvh\] md:h-\[720px\] rounded-2xl border border-fog\/12 overflow-auto bg-night \[transform:translateZ\(0\)\]">/,
  '<div className="relative w-full mx-auto max-w-[1120px] flex-1 min-h-[75dvh] rounded-2xl border border-fog/12 overflow-hidden bg-night [transform:translateZ(0)] flex flex-col">'
);
content = content.replace(
  /<div className="absolute inset-0 overflow-auto overscroll-contain">/,
  '<div className="absolute inset-0 overflow-auto overscroll-contain flex flex-col">'
);

// Also remove `flex flex-col h-full` if it was added?
// The parent of the header and the container is `<div className="ll-fade">`
content = content.replace(
  /<div className="ll-fade">/,
  '<div className="ll-fade flex flex-col h-full flex-1">'
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
