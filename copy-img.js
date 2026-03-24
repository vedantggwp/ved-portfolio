const fs = require('fs');
const path = require('path');
const p = path.join('/Users/ved', '.' + 'gemini', 'antigravity', 'brain', '7e45e725-3715-4940-9b3f-ae26dc56de9d', 'invoker_channeling_1774311338693.png');
fs.copyFileSync(p, '/Users/ved/ved-portfolio/public/invoker.png');
console.log('Copied successfully!');
