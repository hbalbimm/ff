// Turns design-system/tokens.json (the Claude Design System format) into
// src/styles/tokens.css. tokens.json is the single source of truth: edit it
// here or in the Design System artifact, never edit tokens.css by hand.
// Usage: node scripts/build-tokens.mjs [--check]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'design-system', 'tokens.json');
const out = join(root, 'src', 'styles', 'tokens.css');
const tokens = JSON.parse(readFileSync(src, 'utf8'));

const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const errors = [];
const seen = new Set();
const v = (name) => `--${name.replace(/\./g, '-')}`;
const ref = (value) =>
  typeof value === 'string' && /^\{[^}]+\}$/.test(value) ? `var(${v(value.slice(1, -1))})` : value;

function check(name) {
  if (!NAME.test(name)) errors.push(`Bad token name "${name}"`);
  if (seen.has(name)) errors.push(`Duplicate token name "${name}"`);
  seen.add(name);
}

const themes = tokens.color?.themes ?? [{ id: 'light' }];
const primary = themes[0].id;
const byTheme = Object.fromEntries(themes.map((t) => [t.id, []]));

for (const t of tokens.color?.tokens ?? []) {
  check(t.name);
  const value = typeof t.value === 'string' ? { [primary]: t.value } : t.value;
  for (const th of themes) {
    const val = value[th.id] ?? (th.id === primary ? undefined : null);
    if (val === undefined) errors.push(`Color "${t.name}" has no ${primary} value`);
    if (val) byTheme[th.id].push(`  ${v(t.name)}: ${ref(val)};`);
  }
}

const rootLines = [...byTheme[primary]];
for (const [family, body] of Object.entries(tokens)) {
  if (['name', 'version', 'meta', 'color', 'type'].includes(family)) continue;
  if (!body || !Array.isArray(body.tokens)) continue;
  rootLines.push('', `  /* ${family} */`);
  for (const t of body.tokens) {
    check(t.name);
    rootLines.push(`  ${v(t.name)}: ${ref(t.value)};`);
  }
}

const type = tokens.type ?? {};
rootLines.push('', '  /* type */');
for (const [k, stack] of Object.entries(type.families ?? {})) rootLines.push(`  --font-${k}: ${stack};`);
const typeRules = [];
for (const g of type.groups ?? []) {
  for (const s of g.styles ?? []) {
    check(s.name);
    rootLines.push(`  ${v(s.name)}-size: ${s.fontSize};`, `  ${v(s.name)}-line: ${s.lineHeight};`, `  ${v(s.name)}-weight: ${s.fontWeight};`);
    typeRules.push(
      `.t-${s.name} { font-family: var(--font-${g.family}); font-size: var(${v(s.name)}-size); line-height: var(${v(s.name)}-line); font-weight: var(${v(s.name)}-weight); }`
    );
  }
}
const faces = (type.fonts ?? []).map(
  (f) => `@font-face { font-family: "${f.family}"; src: url("../../design-system/${f.file}"); font-weight: ${f.weight ?? 400}; font-style: ${f.style ?? 'normal'}; font-display: swap; }`
);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const css = [
  `/* ${tokens.name} — generated from design-system/tokens.json. Do not edit by hand. */`,
  ...faces,
  ':root {',
  ...rootLines,
  '}',
  ...themes.slice(1).map((th) => `[data-theme="${th.id}"] {\n${byTheme[th.id].join('\n')}\n}`),
  '',
  ...typeRules,
  ''
].join('\n');

if (process.argv.includes('--check')) {
  const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (current !== css) {
    console.error('tokens.css is out of date. Run `npm run tokens` and commit the result.');
    process.exit(1);
  }
  console.log('tokens.css is in sync with tokens.json');
} else {
  writeFileSync(out, css);
  console.log(`Wrote ${out}`);
}
