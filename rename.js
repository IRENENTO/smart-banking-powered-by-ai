const fs = require('fs');
const path = require('path');

const rootFiles = [
  'README.md',
  'SETUP_GUIDE.md',
  'UPGRADE_SUMMARY.md',
  'web/index.html',
  'web/package.json',
  'backend/package.json',
  'ai-banking-mobile/package.json',
  'ai-banking-mobile/app.json'
];

rootFiles.forEach(file => {
  let filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    let newContent = content
      .replace(/AI Smart Lend BankingX/g, 'AI Smart Banking')
      .replace(/AI Smart Lend Banking/g, 'AI Smart Banking')
      .replace(/AI Smart Lend/g, 'AI Smart Banking')
      .replace(/Smart Lend/g, 'Smart Banking');
      
    if (newContent !== content) {
      fs.writeFileSync(filepath, newContent, 'utf8');
      console.log('Updated:', filepath);
    }
  }
});

console.log('Root replacement complete.');
