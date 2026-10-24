import { readFile } from 'node:fs/promises';

const checks = [
  ['src/App.tsx', 'aria-label="Main navigation"', 'main navigation has an accessible name'],
  ['src/App.tsx', 'htmlFor="budget"', 'budget input has an associated label'],
  ['src/App.tsx', 'role="alert"', 'input errors are announced'],
  ['src/components/PlanWorkspace.tsx', "aria-pressed={view === '3d'}", '3D view toggle exposes its state'],
  ['src/components/PlanWorkspace.tsx', 'Dimensioned concept floor plan', '2D plan has an accessible description'],
  ['src/components/MassingView.tsx', 'Isometric massing concept', '3D massing has an accessible description'],
  ['src/styles.css', ':focus-visible', 'keyboard focus indicators are styled'],
  ['src/styles.css', '@media(max-width:680px)', 'mobile layout fallback is present'],
];

let failed = false;
for (const [path, needle, label] of checks) {
  const source = await readFile(path, 'utf8');
  const pass = source.includes(needle);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) failed = true;
}
if (failed) process.exit(1);
