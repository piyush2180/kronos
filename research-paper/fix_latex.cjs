const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\Piyush\\OneDrive\\Desktop\\chess\\research-paper\\algorithms';

fs.readdirSync(dir).filter(f => f.endsWith('.tex')).forEach(file => {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/\\begin\{algorithm2e\}\[H\]/g, '\\begin{algorithm2e}[tp]');
  fs.writeFileSync(fp, content, 'utf8');
  console.log('Fixed:', file);
});

// Also fix the pgfplots legend pos issue
const strengthFile = 'c:\\Users\\Piyush\\OneDrive\\Desktop\\chess\\research-paper\\figures\\strength_vs_depth.tex';
let svd = fs.readFileSync(strengthFile, 'utf8');
svd = svd.replace('legend pos=southeast', 'legend pos=south east');
fs.writeFileSync(strengthFile, svd, 'utf8');
console.log('Fixed: strength_vs_depth.tex');

console.log('All fixes applied.');
