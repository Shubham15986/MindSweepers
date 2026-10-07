const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

content = content.replace(
  /<text x=\{rx \+ S \/ 2\} y=\{ry \+ S \/ 2 \+ 7\} textAnchor="middle" fontSize="22" fontWeight="900" fill="#080A0F">\+<\/text>/g,
  ''
);
content = content.replace(
  /<text x=\{rx \+ S \/ 2\} y=\{ry \+ S \/ 2 \+ 7\} textAnchor="middle" fontSize="22" fontWeight="900" fill="#080A0F">-<\/text>/g,
  ''
);

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
