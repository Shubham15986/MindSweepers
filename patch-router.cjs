const fs = require('fs');
let content = fs.readFileSync('src/shell/Shell.tsx', 'utf8');

// We need to add the hashchange useEffect
content = content.replace(
  /const \[playing, setPlaying\] = useState<GameId \| null>\(null\);/,
  `const [playing, setPlayingState] = useState<GameId | null>(null);
  const setPlaying = (g: GameId | null) => { window.location.hash = g ? "#/game/" + g : "#/"; };
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#/game/")) setPlayingState(h.replace("#/game/", "") as GameId);
      else setPlayingState(null);
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);`
);

fs.writeFileSync('src/shell/Shell.tsx', content);
