const fs = require('fs');
let data = fs.readFileSync('src/components/Diplomacy.tsx', 'utf8');

data = data.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/Diplomacy.tsx', data);
console.log('Fixed Escaping');
