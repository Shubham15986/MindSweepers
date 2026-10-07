const fs = require('fs');

let content = fs.readFileSync('src/games/architect/useArchitect.ts', 'utf8');

// Replace hint() function with reveal()
content = content.replace(
  /const hint = useCallback\(\(\) => {[\s\S]*?}, \[\]\);/g,
  `const reveal = useCallback(() => {
    set({ phase: "solved", timeMs: st.timeMs, score: 0 });
    // Also fill the cells with the solution
    commit(st.puzzle.solution, st.notes, { hints: st.hints + 1 });
  }, []);`
);

// Replace the returned hint with reveal
content = content.replace(
  /check, hint, reveal, toStart/,
  `check, reveal, toStart`
);

fs.writeFileSync('src/games/architect/useArchitect.ts', content);

let np = fs.readFileSync('src/games/architect/NumberPad.tsx', 'utf8');
np = np.replace(/onHint: \(\) => void;/, 'onReveal: () => void;');
np = np.replace(/onHint }: Props\)/, 'onReveal }: Props)');
np = np.replace(/onClick=\{onHint\} disabled=\{disabled \|\| hintsLeft <= 0\}/, 'onClick={onReveal} disabled={disabled}');
np = np.replace(/<span className="tabular">Hint \{hintsLeft\}<\/span>/, '<span className="tabular">Reveal</span>');
fs.writeFileSync('src/games/architect/NumberPad.tsx', np);

let idx = fs.readFileSync('src/games/architect/index.tsx', 'utf8');
idx = idx.replace(/Hints <span className="text-\(--fg\) font-semibold">\{MAX_HINTS - s\.hints\}<\/span>\/\{MAX_HINTS\}/, 'Reveals <span className="text-(--fg) font-semibold">{s.hints}</span>');
idx = idx.replace(/<p className="g-eyebrow !text-\[10px\]">Hints<\/p>/, '<p className="g-eyebrow !text-[10px]">Reveals</p>');
idx = idx.replace(/onHint=\{g\.hint\} \/>/, 'onReveal={g.reveal} />');
fs.writeFileSync('src/games/architect/index.tsx', idx);
