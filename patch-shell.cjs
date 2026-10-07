const fs = require('fs');
let content = fs.readFileSync('src/shell/Shell.tsx', 'utf8');

// Replace the if (playing) logic to be a full separate page
// We will intercept it before the normal return!
const intercept = `
  if (playing) {
    return (
      <div className="bg-night min-h-dvh flex flex-col">
        <header className="flex-none h-16 bg-night/95 backdrop-blur-md border-b border-fog/10">
          <nav className="h-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber"><path d="M12 2v20"/><path d="m4.93 10.93 14.14 14.14"/><path d="m2 22 20-20"/></svg>
              <span className="font-semibold tracking-[0.25em] text-fog text-sm">MINDSWEEPERS</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-amber truncate max-w-[100px] sm:max-w-none">{user.name.split("@")[0].split(" ")[0]}</span>
                  <button onClick={() => { localStorage.clear(); setUser(null); }} className="text-xs text-mist hover:text-coral transition-colors">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="h-9 px-4 rounded-full border border-fog/15 text-fog inline-flex items-center hover:border-amber hover:text-amber transition-colors">Login</button>
              )}
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-6 md:py-8 flex flex-col">
          <GamesSection user={user} playing={playing} setPlaying={setPlaying}
            onRequireAuth={() => setShowAuth(true)}
            onSubmitted={(g) => { setBoardFilter(g); setRefreshKey((k) => k + 1); }} />
        </main>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={(u) => { setUser(u); setShowAuth(false); }} />}
      </div>
    );
  }
`;

content = content.replace(
  /return \(\n\s*<div className="bg-night min-h-dvh">/,
  intercept + '\n  return (\n    <div className="bg-night min-h-dvh">'
);

fs.writeFileSync('src/shell/Shell.tsx', content);
