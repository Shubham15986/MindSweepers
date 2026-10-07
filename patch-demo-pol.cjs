const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

content = content.replace(
  /<button className="totem-nav-link" onClick=\{\(\) => \{ setTutStep\(0\); setShowInitialGuide\(true\); \}\}>DEMO<\/button>/,
  '<button className="totem-nav-link" style={{ fontWeight: "bold" }} onClick={() => { setTutStep(0); setShowInitialGuide(true); }}>DEMO</button>'
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
