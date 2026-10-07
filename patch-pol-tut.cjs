const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.css', 'utf8');

content = content.replace(
  /\.totem-tut-half\.cyan-img-bg \{[\s\S]*?\}/,
  `.totem-tut-half.cyan-img-bg {
  background: #2fd3a6;
  color: #080A0F;
}`
);
content = content.replace(
  /\.totem-tut-half\.dark-img-bg \{[\s\S]*?\}/,
  `.totem-tut-half.dark-img-bg {
  background: #ef6a5b;
  color: #080A0F;
}`
);
content = content.replace(
  /\.totem-tut-half\.metal-img-bg \{[\s\S]*?\}/,
  `.totem-tut-half.metal-img-bg {
  background: #8899bb;
  color: #080A0F;
}`
);

fs.writeFileSync('src/games/polarity/Polarity.css', content);
