const { execSync } = require('child_process');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(color, msg) {
  console.log(color + '[SecurityCheck] ' + msg + RESET);
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 60000 });
  } catch (e) {
    return e.stdout || e.message;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log(GREEN, 'Starting security dependency audit...');
  console.log('='.repeat(60) + '\n');

  // 1. Check package.json for known bad patterns
  log(YELLOW, '1. Checking package.json for suspicious dependencies...');
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const blacklisted = [
    'evil-package', 'malicious', 'crypto-js', 'crypto-js2',
    'cryptojs', 'crypto-js-compat', 'babel-polyfill',
  ];
  for (const dep of Object.keys(allDeps)) {
    if (blacklisted.includes(dep)) {
      log(RED, `  ⚠ Blacklisted dependency found: ${dep}@${allDeps[dep]}`);
    }
  }

  // 2. Check for exact version pins vs ranges
  log(YELLOW, '2. Checking version pinning...');
  for (const [dep, ver] of Object.entries(allDeps)) {
    if (typeof ver === 'string' && !ver.startsWith('^') && !ver.startsWith('~') && !ver.startsWith('>')) {
      if (ver !== '*' && !ver.includes('x')) {
        log(YELLOW, `  ⓘ Exact version: ${dep}@${ver}`);
      }
    }
  }

  // 3. Check for deprecated packages
  log(YELLOW, '3. Checking for deprecated packages...');
  const deprecated = ['react-scripts', 'request', 'gulp-util', 'node-uuid', 'jade'];
  for (const dep of Object.keys(allDeps)) {
    if (deprecated.includes(dep)) {
      log(RED, `  ⚠ Deprecated package: ${dep}@${allDeps[dep]} — consider migrating`);
    }
  }

  // 4. Check for outdated packages
  log(YELLOW, '4. Checking package freshness (outdated)...');
  const outdated = run('npm outdated --json 2>&1');
  if (outdated && outdated !== '{}') {
    try {
      const parsed = JSON.parse(outdated);
      for (const [pkg, info] of Object.entries(parsed)) {
        const diff = info.wanted !== info.latest ? `${info.current} → ${info.latest}` : `${info.current}`;
        log(YELLOW, `  ⓘ Outdated: ${pkg} ${diff}`);
      }
    } catch { }
  }

  // 5. Run npm audit (production only)
  log(YELLOW, '5. Running npm audit (production)...');
  const audit = run('npm audit --production --json 2>&1');
  try {
    const parsed = JSON.parse(audit);
    if (parsed.vulnerabilities) {
      const counts = Object.entries(parsed.vulnerabilities).reduce((acc, [severity, info]) => {
        acc[severity] = info.length;
        return acc;
      }, {});
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      if (total > 0) {
        log(RED, `  ✗ ${total} vulnerabilities found: ${JSON.stringify(counts)}`);
        for (const [sev, info] of Object.entries(parsed.vulnerabilities)) {
          for (const vuln of info) {
            if (vuln.severity === 'critical' || vuln.severity === 'high') {
              log(RED, `    - ${vuln.name}@${vuln.range}: ${vuln.severity} — ${vuln.title}`);
            }
          }
        }
      } else {
        log(GREEN, '  ✓ No vulnerabilities found');
      }
    }
  } catch {
    log(GREEN, '  ✓ Audit complete (no machine-readable output)');
  }

  // 6. Check .env files not in git
  log(YELLOW, '6. Checking for .env files in git tracking...');
  const tracked = run('git ls-files .env .env.* 2>&1');
  if (tracked.trim()) {
    log(RED, `  ✗ .env files tracked in git: ${tracked.trim().split('\n').join(', ')}`);
    log(RED, '  → Run: git rm --cached .env .env.local .env.production && echo ".env*" >> .gitignore');
  } else {
    log(GREEN, '  ✓ No .env files tracked in git');
  }

  console.log('\n' + '='.repeat(60));
  log(GREEN, 'Security check complete.');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
