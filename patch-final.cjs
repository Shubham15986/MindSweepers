const fs = require('fs');
let content = fs.readFileSync('src/shell/Final.tsx', 'utf8');

content = content.replace(
  /<form[\s\S]*?<\/form>/,
  ''
);

content = content.replace(
  /\{joined \? \([\s\S]*?\) : \(/,
  ''
);

// We need to also remove the trailing )} that matched the ternary
content = content.replace(
  /\n\s*\)\}\n\s*<\/div>/,
  '\n      </div>'
);

fs.writeFileSync('src/shell/Final.tsx', content);
