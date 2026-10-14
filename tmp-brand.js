const fs = require('fs');
let s = fs.readFileSync('lib/config/brand.ts', 'utf8');
s = s.replace(/lauraludef11@icloud\.com/g, 'zodaraparfums@gmail.com');
fs.writeFileSync('lib/config/brand.ts', s);
