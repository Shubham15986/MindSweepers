const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

// Update handleGameOver to auto-submit
content = content.replace(
  /const handleGameOver = \(r: GameResult\) => \{ clearTimeout\(timer\.current\); timer\.current = window\.setTimeout\(\(\) => setResult\(r\), 1400\); \};/,
  `const handleGameOver = async (r: GameResult) => {
    if (r.score > 0 && playing) {
      await submitScore({ game: playing, score: r.score, level: r.level });
      onSubmitted(playing);
    }
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setResult(r), 1400);
  };`
);

// Remove the submit function and submitting state
content = content.replace(/const \[submitting, setSubmitting\] = useState\(false\);\n/, '');
content = content.replace(/const submit = async \(\) => \{[\s\S]*?\}\n/, '');

// Remove the submit button from the overlay, make "Keep playing" the primary button
content = content.replace(
  /<button onClick=\{submit\} disabled=\{submitting\} className=\{btnPrimary \+ " w-full mt-8 disabled:opacity-70"\}>\{submitting \? "Submitting…" : "Submit to leaderboard"\}<\/button>\n\s*<button onClick=\{\(\) => setResult\(null\)\} className="mt-3 h-10 text-sm text-mist hover:text-fog transition-colors">Keep playing<\/button>/,
  '<button onClick={() => setResult(null)} className={btnPrimary + " w-full mt-8 bg-amber text-night hover:bg-amber/90"}>Keep playing</button>'
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
