const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');
content = content.replace(
  /<button className="totem-nav-link" style=\{\{ fontWeight: "bold" \}\} onClick=\{\(\) => \{ setTutStep\(0\); setShowInitialGuide\(true\); \}\}>DEMO<\/button>/,
  '<button className="totem-demo-btn" onClick={() => { setTutStep(0); setShowInitialGuide(true); }}>DEMO</button>'
);
fs.writeFileSync('src/games/polarity/Polarity.tsx', content);

let css = fs.readFileSync('src/games/polarity/Polarity.css', 'utf8');
css += `
.totem-demo-btn {
  background: #E8A24A;
  color: #080A0F;
  border: none;
  border-radius: 999px;
  padding: 4px 14px;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(232, 162, 74, 0.5);
  transition: all 0.2s;
}
.totem-demo-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(232, 162, 74, 0.8);
}
`;
fs.writeFileSync('src/games/polarity/Polarity.css', css);
