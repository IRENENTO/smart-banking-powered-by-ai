const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(color, msg) {
  console.log(color + '[Verify] ' + msg + RESET);
}

function main() {
  const buildDir = path.join(process.cwd(), 'build');
  let errors = 0;

  console.log('\n' + '='.repeat(60));
  log(YELLOW, 'Verifying production build...');
  console.log('='.repeat(60) + '\n');

  // 1. Check build exists
  if (!fs.existsSync(buildDir)) {
    log(RED, '✗ Build directory not found — build may have failed');
    process.exit(1);
  }
  log(GREEN, '✓ Build directory exists');

  // 2. Check for index.html
  if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    log(RED, '✗ index.html missing from build');
    errors++;
  } else {
    log(GREEN, '✓ index.html present');
  }

  // 3. Check for source maps in production (leak source code)
  const sourceMaps = [];
  function findSourceMaps(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) findSourceMaps(fp);
      else if (entry.name.endsWith('.map')) sourceMaps.push(fp);
    }
  }
  findSourceMaps(buildDir);
  if (sourceMaps.length > 0) {
    log(YELLOW, `⚠ ${sourceMaps.length} source map(s) found — source code visible in browser dev tools`);
    log(YELLOW, '  To disable, set GENERATE_SOURCEMAP=false in build environment');
  } else {
    log(GREEN, '✓ No source maps (source code not exposed)');
  }

  // 4. Check for .env files in build
  if (fs.existsSync(path.join(buildDir, '.env'))) {
    log(RED, '✗ .env file leaked into build!');
    errors++;
  }

  // 5. Check for hardcoded secrets in HTML
  const htmlContent = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf-8');
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{20,}/, /AIza[0-9A-Za-z\-_]{35}/,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
    /ghp_[a-zA-Z0-9]{36}/, /gho_[a-zA-Z0-9]{36}/,
    /xox[bpsa]-[a-zA-Z0-9\-]{10,}/,
  ];
  for (const pattern of secretPatterns) {
    if (pattern.test(htmlContent)) {
      log(RED, '✗ Potential secret found in index.html!');
      errors++;
    }
  }
  log(GREEN, '✓ No secrets leaked in index.html');

  // 6. Check file sizes (warn if > 1MB)
  const largeFiles = [];
  function checkSizes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) checkSizes(fp);
      else if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
        const size = fs.statSync(fp).size / (1024 * 1024);
        if (size > 1) largeFiles.push(`${entry.name} (${size.toFixed(1)}MB)`);
      }
    }
  }
  checkSizes(buildDir);
  if (largeFiles.length > 0) {
    log(YELLOW, `⚠ Large files that may slow loading:\n    ${largeFiles.join('\n    ')}`);
  }

  // 7. Check for netlify.toml presence
  if (fs.existsSync(path.join(process.cwd(), 'netlify.toml'))) {
    log(GREEN, '✓ netlify.toml present (security headers will be applied)');
  } else {
    log(RED, '✗ netlify.toml missing — no security headers on Netlify');
    errors++;
  }

  console.log('\n' + '='.repeat(60));
  if (errors > 0) {
    log(RED, `✗ ${errors} error(s) found — fix before deploying`);
    process.exit(1);
  } else {
    log(GREEN, '✓ Build verification passed — safe to deploy!');
  }
  console.log('='.repeat(60) + '\n');
}

main();
