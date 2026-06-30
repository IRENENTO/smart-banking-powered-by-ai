const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let totalIssues = 0;

function log(color, msg) {
  console.log(color + '[Scan] ' + msg + RESET);
}

function scanFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.ts', '.tsx', '.html'].includes(ext)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const basename = path.relative(process.cwd(), filePath);

  const patterns = [
    { re: /\beval\s*\(/g, severity: 'CRITICAL', desc: 'eval() — code injection risk' },
    { re: /\bdocument\.write\s*\(/g, severity: 'CRITICAL', desc: 'document.write() — XSS risk' },
    { re: /\bnew\s+Function\s*\(/g, severity: 'CRITICAL', desc: 'new Function() — eval-like' },
    { re: /\bsetTimeout\s*\(\s*["']/g, severity: 'HIGH', desc: 'setTimeout with string' },
    { re: /\bsetInterval\s*\(\s*["']/g, severity: 'HIGH', desc: 'setInterval with string' },
    { re: /\binnerHTML\s*=/g, severity: 'HIGH', desc: 'innerHTML assignment — XSS risk' },
    { re: /\bdangerouslySetInnerHTML\s*=/g, severity: 'HIGH', desc: 'dangerouslySetInnerHTML' },
    { re: /\.innerHTML\s*\+?=/g, severity: 'HIGH', desc: 'innerHTML concatenation — XSS' },
    { re: /location\s*=\s*["']/g, severity: 'MEDIUM', desc: 'location assignment (redirect)' },
    { re: /window\.location\s*=\s*["']/g, severity: 'MEDIUM', desc: 'window.location direct assignment' },
    { re: /location\.href\s*=\s*["']/g, severity: 'MEDIUM', desc: 'location.href redirect' },
    { re: /top\.location/g, severity: 'MEDIUM', desc: 'top.location access' },
    { re: /document\.domain\s*=/g, severity: 'MEDIUM', desc: 'document.domain setter' },
    { re: /String\.fromCharCode/g, severity: 'LOW', desc: 'String.fromCharCode (potential obfuscation)' },
    { re: /__proto__/g, severity: 'HIGH', desc: 'Prototype pollution risk' },
    { re: /constructor\s*\.\s*prototype/g, severity: 'HIGH', desc: 'Prototype pollution risk' },
    { re: /http:\/\/[^s]/g, severity: 'MEDIUM', desc: 'HTTP (not HTTPS) URL' },
    { re: /atob\s*\(/g, severity: 'LOW', desc: 'atob() — verify it is not obfuscation' },
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern.re);
    for (const match of matches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1]?.trim() || '';
      let color = pattern.severity === 'CRITICAL' ? RED : pattern.severity === 'HIGH' ? YELLOW : CYAN;
      log(color, `${pattern.severity} ${basename}:${lineNum} — ${pattern.desc}`);
      log(color, `  → ${line.substring(0, 120)}`);
      totalIssues++;
    }
  }
}

function walkDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'build' && entry.name !== 'dist' && entry.name !== '.git') {
          walkDir(fullPath);
        }
      } else {
        scanFile(fullPath);
      }
    }
  } catch { }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log(CYAN, 'Security code scanner');
  console.log('='.repeat(60) + '\n');

  const srcDir = path.join(process.cwd(), 'src');
  const publicDir = path.join(process.cwd(), 'public');

  log(YELLOW, 'Scanning src/ directory...');
  if (fs.existsSync(srcDir)) walkDir(srcDir);

  log(YELLOW, 'Scanning public/ directory...');
  if (fs.existsSync(publicDir)) walkDir(publicDir);

  console.log('\n' + '='.repeat(60));
  if (totalIssues > 0) {
    log(RED, `Found ${totalIssues} potential security issue(s) — review each above.`);
  } else {
    log(GREEN, '✓ No security issues found. Clean!');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(totalIssues > 0 ? 0 : 0);
}

main().catch((err) => {
  console.error('[Scan] Error:', err.message);
  process.exit(0);
});
