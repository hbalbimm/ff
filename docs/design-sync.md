# Keeping the design system, canvas and website in sync

`design-system/tokens.json` is the source of truth. It uses the same shape as the
Claude **Design System** artifact, so it can move between them without conversion.

## The loop

1. **Design** in the FF Website Design canvas. Artboards use the installed FF Design System,
   so a token change shows up in the canvas Theme menu.
2. **Change a token** (colour, type, spacing):
   - In the repo: edit `design-system/tokens.json`, run `npm run tokens`, open a PR.
   - Then sync the artifact: in Claude, ask
     *"Re-sync the FF Design System from GitHub hbalbimm/ff"*. Claude reads the repo,
     merges the new values and keeps usage notes and anything added on the page.
   - Or use Claude Code in a checkout: run `/design-sync` to republish the artifact
     straight from this codebase. (That makes the artifact read-only on the page, so edits
     only ever come from code. Use this once the brand values are locked.)
3. **Change a component**: update `src/components/<name>.html` + its CSS in `main.css`, open a PR.
   Update the matching artboard on the canvas, or ask Claude to rebuild it from the repo.
4. **Merge to main.** CI checks that `tokens.css` matches `tokens.json`, builds the pages
   and deploys a preview to GitHub Pages.

## Checking for drift

`npm run tokens:compare -- <file>` compares this repo's `tokens.json` with any other copy
(downloaded from the Design System's Files panel, or the canvas's `ds/ff/tokens.json`) and
lists every token whose value differs.

The repo's `tokens.css` uses the same variable names as the Design System's generated
`tokens.css` (`--accent`, `--space-4`, `--radius-m`, `--text-body`, ...), and canvas artboards
use those variables instead of raw values. So one token value change carries through all three.

**Rule for the team:** change colours and type in the **Design System** (or here, via PR), not
by recolouring artboards or using the canvas Theme menu on its own. The canvas holds a *copy*
of the tokens; editing that copy changes only the canvas and creates drift.

## Recommended setup

- Branch protection on `main`: 1 approval + CI passing.
- `CODEOWNERS`: design leads own `design-system/`, devs own `scripts/`.
- Turn on GitHub Pages (Settings → Pages → Source: GitHub Actions) for preview links.

## Brand values to load (pending)

When the Brand Evolution files arrive, replace in `tokens.json`:
- `color.tokens`: exact brand palette (keep the names, add new ones as needed)
- `type.fonts` / `type.families`: brand font files (put them in `design-system/fonts/`)
- Display and text scales if the brand defines them
- Logo files in `design-system/assets/logos/`

Then run `npm run tokens`, open a PR and re-sync the artifact.
