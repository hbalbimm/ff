// Assembles src/pages/*.html into dist/, replacing
// <!-- @include components/name.html --> with that component's markup,
// and copies styles. No dependencies. Usage: node scripts/build-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const dist = join(root, 'dist');
const INCLUDE = /<!--\s*@include\s+([\w./-]+)\s*-->/g;

function expand(html, depth = 0) {
  if (depth > 5) throw new Error('Includes nested too deeply');
  return html.replace(INCLUDE, (_, file) => {
    if (file.includes('..')) throw new Error(`Bad include path: ${file}`);
    return expand(readFileSync(join(srcDir, file), 'utf8'), depth + 1);
  });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(srcDir, 'styles'), join(dist, 'styles'), { recursive: true });
cpSync(join(srcDir, 'scripts'), join(dist, 'scripts'), { recursive: true });

for (const page of readdirSync(join(srcDir, 'pages')).filter((f) => f.endsWith('.html'))) {
  const html = expand(readFileSync(join(srcDir, 'pages', page), 'utf8'));
  const left = html.match(INCLUDE);
  if (left) throw new Error(`Unresolved include in ${page}: ${left[0]}`);
  writeFileSync(join(dist, page), html);
  console.log(`Built dist/${page}`);
}
