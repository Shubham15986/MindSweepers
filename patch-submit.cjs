const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /<button onClick=\{submit\} disabled=\{submitting\} className=\{btnPrimary \+ " w-full mt-8 disabled:opacity-70"\}>\{submitting \? "Submitting…" : "Submit to leaderboard"\}<\/button>/,
  `{result.score > 0 ? (
                  <button onClick={submit} disabled={submitting} className={btnPrimary + " w-full mt-8 disabled:opacity-70"}>{submitting ? "Submitting…" : "Submit to leaderboard"}</button>
                ) : (
                  <p className="mt-8 text-sm text-coral/80 font-medium tracking-wide">Score is 0. Cannot submit.</p>
                )}`
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
