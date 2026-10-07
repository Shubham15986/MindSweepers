const fs = require('fs');
const log = fs.readFileSync('/Users/shubham/.gemini/antigravity/brain/b08cf91c-c7dd-42f4-bb0c-a1193371783b/.system_generated/tasks/task-550.log', 'utf8');
const lines = log.split('\n');
lines.forEach(l => {
  if (l.startsWith('8x8:')) {
    console.log(l.substring(4));
  }
});
