// Compares design-system/tokens.json with another copy (e.g. one downloaded
// from the Design System artifact's Files panel, or the canvas's ds/ff copy).
// Ignores formatting and editor-only fields; reports real value differences.
// Usage: node scripts/compare-tokens.mjs path/to/other-tokens.json
import { readFileSync } from 'node:fs';

const [, , other] = process.argv;
if (!other) { console.error('Usage: node scripts/compare-tokens.mjs <other tokens.json>'); process.exit(2); }

function flatten(t) {
  const out = {};
  const primary = t.color?.themes?.[0]?.id ?? 'light';
  for (const [family, body] of Object.entries(t)) {
    if (!body || !Array.isArray(body.tokens)) continue;
    for (const tok of body.tokens) {
      const val = typeof tok.value === 'object' && tok.value !== null ? tok.value[primary] : tok.value;
      out[`${family}.${tok.name}`] = String(val).toLowerCase();
    }
  }
  for (const g of t.type?.groups ?? []) for (const s of g.styles ?? [])
    out[`type.${s.name}`] = `${Number(s.fontWeight)} ${s.fontSize}/${s.lineHeight} ${s.family || g.family}`;
  for (const [k, v] of Object.entries(t.type?.families ?? {})) out[`font.${k}`] = v;
  return out;
}

const a = flatten(JSON.parse(readFileSync(new URL('../design-system/tokens.json', import.meta.url), 'utf8')));
const b = flatten(JSON.parse(readFileSync(other, 'utf8')));
const diffs = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]);
if (!diffs.length) { console.log('In sync: same tokens and values.'); process.exit(0); }
for (const k of diffs) console.log(`${k}\n  repo:  ${a[k] ?? '(missing)'}\n  other: ${b[k] ?? '(missing)'}`);
process.exit(1);
