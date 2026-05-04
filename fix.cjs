const fs = require('fs');
let data = fs.readFileSync('src/components/League.tsx', 'utf8');

const lines = data.split(/\r?\n/);

// We want to insert '                                       </div>' before line 489
// Arrays are 0-indexed, so line 489 is lines[488].
lines.splice(488, 0, '                                       </div>');

fs.writeFileSync('src/components/League.tsx', lines.join('\n'));
console.log('Fixed using array splice!');
