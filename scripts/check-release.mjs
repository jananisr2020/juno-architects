import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const failures = [];
const checks = [];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(root))) {
  console.error('Release check failed: dist/ does not exist. Run npm run build first.');
  process.exit(1);
}

const htmlPath = path.join(root, 'index.html');
if (!(await exists(htmlPath))) {
  failures.push('dist/index.html is missing');
} else {
  const html = await readFile(htmlPath, 'utf8');
  for (const [label, pattern] of [
    ['document title', /<title>[^<]+<\/title>/i],
    ['viewport meta', /<meta[^>]+name=["']viewport["']/i],
    ['application entry or asset reference', /(?:type=["']module["']|\/assets\/)/i],
  ]) {
    if (pattern.test(html)) checks.push(label);
    else failures.push(`index.html is missing ${label}`);
  }
  if (/src\/(?:main|App)\.tsx|vite\.svg/i.test(html)) {
    failures.push('index.html appears to contain development-template references');
  }
}

const assetsPath = path.join(root, 'assets');
if (!(await exists(assetsPath))) {
  failures.push('dist/assets/ is missing; verify the Vite build output');
} else {
  const assets = await readdir(assetsPath);
  if (!assets.some((name) => /\.js$/i.test(name))) failures.push('no JavaScript bundle found in dist/assets/');
  else checks.push('JavaScript bundle');
  if (!assets.some((name) => /\.css$/i.test(name))) failures.push('no CSS bundle found in dist/assets/');
  else checks.push('CSS bundle');
}

if (failures.length) {
  console.error('Juno Architects release readiness: FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Juno Architects static release readiness: PASSED');
for (const check of checks) console.log(`- ${check}`);
console.log('Note: this validates build artifacts only; it does not prove a live Netlify deployment, API availability, database readiness, or architectural/code compliance.');
