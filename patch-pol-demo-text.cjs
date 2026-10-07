const fs = require('fs');
let content = fs.readFileSync('src/games/polarity/Polarity.tsx', 'utf8');

content = content.replace(/CYAN SKYLINE/g, 'CYAN');
content = content.replace(/VOID NIGHT/g, 'VOID');
content = content.replace(/INERT TOTEM/g, 'INERT');

// The tutorial text mentions charges and magnets
content = content.replace(/The board is paved in dominoes\. Some must be given polarity \(charges\)/, 'The board is paved in dominoes. Some must be given colors');
content = content.replace(/A charged domino always contains exactly one Cyan \(Positive\) half, and one Void \(Negative\) half\./, 'A colored domino always contains exactly one Cyan half, and one Void half.');

fs.writeFileSync('src/games/polarity/Polarity.tsx', content);
