# Forward Financing website

Repo: https://github.com/hbalbimm/ff · Preview (after Pages is on): https://hbalbimm.github.io/ff/

Design tokens, component library and responsive page templates for the
Forward Financing website rebuild (BIMM).

Three places stay in sync:

| Where | What it holds | Who edits |
| --- | --- | --- |
| [**Forward Financing Design System**](https://claude.ai/artifact/U9dkYhAVpkrDd7KnGPHi9n) (Claude) | Browsable tokens, type, components, brand guidelines | Design team |
| [**FF Website Design**](https://claude.ai/artifact/YRUxwqPA4RgErqn43wEvqU) (Claude Design canvas) | Responsive artboards: homepage concepts, templates, components | Design team |
| **This repo** | `design-system/tokens.json` (source of truth) + the HTML/CSS the site is built from | Design + dev, via pull requests |

## Quick start

```bash
npm run dev        # builds tokens + pages, serves dist/ at localhost:3000
npm run build      # tokens.json -> tokens.css, then assembles pages into dist/
npm run check      # CI check: fails if tokens.css is stale
```

Node 20+, no dependencies.

## Layout

```
design-system/tokens.json   single source of truth for colour, type, spacing, radius, layout
src/styles/tokens.css       GENERATED from tokens.json. Never edit by hand
src/styles/main.css         base + component styles, tokens only (no raw values)
src/components/*.html       one file per component (header, hero, pillars, steps, ...)
src/pages/*.html            page templates; pull components in with <!-- @include components/x.html -->
scripts/                    zero-dependency build scripts
docs/design-sync.md         how the design system, canvas and repo stay in sync
```

## Rules

- **Mobile first.** Base CSS is the phone layout; add `@media (min-width: 768px)` and `1024px`.
- **Tokens only.** If you need a new colour, size or space, add a token first.
- **Token names are the contract.** Change values freely; rename only with a repo-wide find-and-replace.
- **Accessible by default.** Real buttons and links, labels on inputs, 4.5:1 text contrast, 44px touch targets.
- Copy in `[brackets]` is placeholder pending copywriting and legal review.

## Status

Tokens are **wireframe placeholders** until the Brand Evolution fonts, colours
and logos are loaded. See `docs/design-sync.md`.
