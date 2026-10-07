const fs = require('fs');
let content = fs.readFileSync('src/shell/Final.tsx', 'utf8');

content = content.replace(
  /<div className="max-w-\[1200px\] mx-auto px-6 py-32 md:py-40 text-center">[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync('src/shell/Final.tsx', content);
