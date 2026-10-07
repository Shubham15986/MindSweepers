const fs = require('fs');
let content = fs.readFileSync('src/shell/GamesSection.tsx', 'utf8');

content = content.replace(
  /<p className=\{eyebrow \+ " mt-4"\}>Dream complete<\/p>\n\s*<p className="font-display text-fog text-6xl font-light mt-2 tabular-nums">\{result.score.toLocaleString\(\)\}<\/p>\n\s*<p className="text-mist mt-1">Level · <span className="text-fog">\{result.level\}<\/span><\/p>\n\s*\{result.score > 0 \? \(\n\s*<button onClick=\{submit\} disabled=\{submitting\} className=\{btnPrimary \+ " w-full mt-8 disabled:opacity-70"\}>\{submitting \? "Submitting…" : "Submit to leaderboard"\}<\/button>\n\s*\) : \(\n\s*<p className="mt-8 text-sm text-coral\/80 font-medium tracking-wide">Score is 0. Cannot submit.<\/p>\n\s*\)\}\n\s*<button onClick=\{\(\) => setResult\(null\)\} className="mt-3 h-10 text-sm text-mist hover:text-fog transition-colors">Keep playing<\/button>/,
  `<p className={eyebrow + " mt-4"}>{result.score === 0 ? "Dream Revealed" : "Dream complete"}</p>
                {result.score > 0 ? (
                  <>
                    <p className="font-display text-fog text-6xl font-light mt-2 tabular-nums">{result.score.toLocaleString()}</p>
                    <p className="text-mist mt-1">Level · <span className="text-fog">{result.level}</span></p>
                    <button onClick={submit} disabled={submitting} className={btnPrimary + " w-full mt-8 disabled:opacity-70"}>{submitting ? "Submitting…" : "Submit to leaderboard"}</button>
                    <button onClick={() => setResult(null)} className="mt-3 h-10 text-sm text-mist hover:text-fog transition-colors">Keep playing</button>
                  </>
                ) : (
                  <>
                    <p className="text-mist mt-4 leading-relaxed">The solution has been revealed.<br/>Your progress will not be ranked.</p>
                    <button onClick={() => setResult(null)} className={btnGhost + " w-full mt-6 bg-fog/5"}>View Board</button>
                  </>
                )}`
);

fs.writeFileSync('src/shell/GamesSection.tsx', content);
