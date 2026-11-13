# Changes from upstream

This is the Asciiverse terminal edition of Rogue Zombies, Ondřej Žára's
game for the 2024 Seven Day Roguelike Challenge, from
github.com/ondras/roguezombies (the `upstream` remote; this branch,
`asciiverse`, starts from its master at `a6639f3`, 2026-07-29, with the
full history). It is MIT licensed, and here with the author's permission
as well (`PERMISSION.md`).

**The game's own files are unchanged.** The game runs from its bundled
`index.js` (its TypeScript bundled by esbuild, as its `npm run build`
makes it). Everything new is in `asciiverse/`, plus this file and
`PERMISSION.md`; README.md gets a note at the top on playing it with av.

## How it works

Rogue Zombies has an engine of its own, not rot.js. Of its renderers it
uses the DOM one: every thing on the map is a `<div>` placed by the CSS
properties `--x` and `--y`, stacked by `z-index`.

- `asciiverse/rotty/`: rotty, our runtime for Ondřej's games (as in
  Goldfish, The Great Train Robbery and the others): the browser as far as
  they use it, including today's parts (`web.js`: custom elements,
  `style.setProperty`, dialogs, tables, `element.animate`,
  `AbortController`), keys as browser events with their `code`, event
  listeners removed by an `AbortSignal`, and the web fonts taken as loaded.
- `asciiverse/game.js`: the page's layout, after its CSS: the renderer's
  `<div>`s read back into cells (the topmost character and background of
  each), the status under the map (the items in a flowing row, then
  health, money, score and rounds on the left and the commands on the
  right), two lines of log, and the dialogs in a brown frame with their
  `--==` headings, lists and tables. The map is 96 by 32: at 100x40 it
  shows whole; smaller, it follows you.
- `asciiverse/build.py`, `asciiverse/Makefile`: the page's module, run as
  one script and compiled with QuickJS-ng into one native binary of about
  2 MB that needs nothing to run.

## Ours

- **Keys:** as in the browser. Ctrl+C or Ctrl+Q quits.
- **`--seed N`:** the game's random numbers seeded with N, so the map and
  the zombies come the same each time (the preview uses seed 7).
- **Session log:** `rogue-zombies.log` in the state folder
  (`$XDG_STATE_HOME/rogue-zombies`, `~/.local/state/rogue-zombies`,
  Application Support on macOS, `%LOCALAPPDATA%` on Windows).
  `ROGUE_ZOMBIES_LOG=debug` (or `ROTTY_LOG=debug`) records every key and a
  snapshot each second.
- No sound: the sound effects (`sfx/`) are not played. The page's font is
  not loaded, and the status numbers do not pulse when they change.

## Imported

- `asciiverse/quickjs/`: QuickJS-ng 0.17.0 as in our Candy Box 2 (one
  change in `quickjs-libc.c`: a signal interrupting `poll()` no longer ends
  the event loop), MIT.

## Packaging

- `.github/workflows/release.yml`: static Linux (musl, x86-64 and ARM64),
  macOS (x86-64 and ARM64) and Windows (x86-64, MinGW) archives plus
  SHA256SUMS, on tags `*-av.*`.
- `asciiverse/package.sh`: the archive (the program, LICENSE.md,
  CREDITS.md, PERMISSION.md, PATCHES.md, the licences of rotty and
  QuickJS-ng).
- `asciiverse/record-preview.sh`: the 100x30 catalog preview, with hub's
  castrec.py.
