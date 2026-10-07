const fs = require('fs');
let content = fs.readFileSync('src/games/dreamwall/Dreamwall.tsx', 'utf8');

// Insert import at the top
content = content.replace(
  /import \{ useDreamwallWorker \} from "\.\/worker";/,
  'import { useDreamwallWorker } from "./worker";\nimport { Cell, Level, Tier, TIERS, LEVELS, neighbors, analyze } from "./logic";'
);

// Remove the definitions
content = content.replace(/type Cell = 0 \| 1 \| 2;\s*/, '');
content = content.replace(/interface Tier \{[\s\S]*?\}\s*/, '');
content = content.replace(/interface Level \{[\s\S]*?\}\s*/, '');
content = content.replace(/const TIERS: Tier\[\] = \[[\s\S]*?\];\s*/, '');
content = content.replace(/const LEVELS: Level\[\] = \[[\s\S]*?\];\s*/, '');
content = content.replace(/function neighbors\(i: number, n: number\) \{[\s\S]*?\}\s*/, '');
content = content.replace(/function analyze\(cells: Cell\[\], lv: \{ n: number, clues: \(number \| null\)\[\] \}\) \{[\s\S]*?return \{ err, good, pools, solved \};\n\}\s*/, '');

fs.writeFileSync('src/games/dreamwall/Dreamwall.tsx', content);
