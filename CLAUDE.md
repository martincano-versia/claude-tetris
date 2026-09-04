# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript Tetris implementation with modern Tetris Guideline mechanics, competitive features, and polished visuals. No build process, no dependencies, no frameworks—just open `index.html` or serve locally and play. Implements 7-bag randomization, SRS (Super Rotation System), T-Spin detection, hold piece, lock delay, combos, DAS/ARR input, three game modes, persistent high scores, synthesized audio (Web Audio API), touch controls, gamepad support, and colorblind mode.

## Running & Testing

No build step required:

```bash
# Direct: open index.html
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# Recommended: local server (ensures localStorage works as in production)
python3 -m http.server 8000
# or: npx serve .
# Then: http://localhost:8000
```

No tests exist; changes should be verified by playing the game and checking:
- **Core mechanics**: piece spawning, rotation, locking, line clearing, scoring.
- **Game modes**: Marathon (endless), Sprint (40 lines timer), Ultra (2-minute timer).
- **Advanced features**: hold piece, next queue (5 visible), wall kicks, T-Spin detection, combos/back-to-back, lock delay resets.
- **Visual effects**: animations (shake, megaShake, zoomPunch), particle systems, flash, chromatic aberration, glitch, danger label, combo text.
- **Audio**: move, rotate, hold, drops (soft/hard), clears (single/multi/Tetris/T-Spin), level-up, danger, game-over sounds.
- **Input**: keyboard (with DAS/ARR), touch (swipe/tap), gamepad (D-pad/stick + buttons).
- **Persistence**: high scores and settings (`localStorage`) persist after reload.

## Code Architecture

Three files, no module system:

- **index.html** — Structure: main canvas (`#board` 300×600px), hold/next canvases, side panel (score/lines/level/combo display), overlays (start mode selection, game-over, options), touch-control buttons, ambient parallax shapes.
- **style.css** — Retro arcade dark aesthetic. CSS variables for theming (`--c1/--c2/--c3`). Animations: `shake`, `megaShake`, `zoomPunch`, `glitchText`, `irisIn`, `comboPopMega`, dot-dash patterns for ghost piece, flash/chroma overlays. Responsive canvas via `devicePixelRatio` scaling.
- **game.js** — ~1500+ lines: board state, piece rotation (SRS + wall kicks), collision, line clearing, scoring, input handling (keyboard DAS/ARR, touch gestures, gamepad), audio synthesis, particle systems, rendering loop, persistence layer.

### Game State & Loop

**Global state:**
- `board` — 20×10 matrix: `0` = empty, `1-7` = piece color index.
- `current` — `{type, shape, x, y, rotation}` for the active falling piece.
- `holdPiece` — stored piece; can be swapped once per spawn.
- `nextQueue` — array of next 5 piece types (from 7-bag).
- `gameMode` — `'marathon' | 'sprint' | 'ultra'`; determines goal and time limits.
- `score`, `lines`, `level`, `combo` — displayed stats.
- `gameOver`, `paused` — state flags.

**Main loop** (`loop` function using `requestAnimationFrame`):
1. Accumulate delta time into `dropAccum`.
2. Process input (keyboard repeat state, touch queue, gamepad).
3. If drop time elapsed: attempt piece drop or lock if collision.
4. If piece locked: merge onto board, clear lines, check for game-over or mode completion.
5. Render board, ghost piece (projected landing position), HUD, particles, overlays.
6. Continue or end based on game state.

### Key Subsystems

**Piece & Rotation (SRS):**
- `ROTATION_SHAPES[1-7]` — 4 rotation states (matrices) per piece type.
- `attemptRotate(deltaRotation)` — tries rotation, then up to 5 wall-kick offsets (`JLSTZ_KICKS`, `I_KICKS`) to resolve collisions.
- `collide(shape, x, y, rotation)` — detects collision with board bounds, floor, or locked blocks.

**Line Clearing & Scoring:**
- `clearLines()` — scans bottom-to-top; removes complete rows, accumulates points.
- Line clear bonus: `LINE_SCORES[lineCount] × level` (e.g., Tetris = 800 × level).
- **Back-to-back**: consecutive Tetrises/T-Spins get 1.5× multiplier.
- **Combos**: each successive clear adds `50 × comboCount × level` bonus.
- **T-Spin detection** (`detectTSpin`): checks if T-piece locked via rotation; counts corner occupancy to distinguish full T-Spin from Mini.
- **Perfect Clear**: all blocks cleared = large bonus + particle celebration.

**7-Bag Randomization:**
- `refillBag()` — shuffles pieces `[1-7]` once and adds to queue. Guarantees each piece appears once per ~7 spawns (no long droughts).
- `nextQueue` maintains 5 visible pieces; queue refills when below threshold.

**Lock Delay & Reset Counter:**
- `lockDelay` — milliseconds before piece locks when resting on surface (default 500 ms).
- `lockResets` — count of successful moves/rotations that restart the delay (max 15 to prevent infinite stalling).
- `onSuccessfulMove()` — resets timer and increments counter if under limit.

**Input Handling (DAS/ARR):**
- `dasState` — tracks left/right held key, applies initial delay (DAS = 150 ms) then repeat (ARR = 35 ms).
- Touch: swipe left/right (move), hold (soft drop), quick flick down (hard drop), tap (rotate).
- Gamepad: D-pad/analog stick (move), buttons for rotate/hold/drop.

**Audio (Web Audio API):**
- `audioContext` — single instance, generated on first input due to browser autoplay restrictions.
- Oscillator-based tones for move, rotate, hold, soft drop, hard drop, clear (single/multi/Tetris/T-Spin), level-up, danger, game-over.
- No external audio files; all synthesis on-the-fly.

**Visual Effects:**
- **Particles**: circles, diamonds, stars, sparks emitted on clear/Tetris/T-Spin/combo/perfect clear.
- **Shockwave**: expanding ring on Tetris/T-Spin/Perfect Clear.
- **Flash & chroma overlay**: white flash + RGB aberration on major events.
- **Shake**: camera jitter on piece lock or clear.
- **Ghost piece**: semi-transparent outline showing hard-drop landing.
- **Danger label**: appears when board height exceeds safety threshold (y > threshold).
- **Combo text**: floating damage-number style text on multi-line clears.
- **3D perspective**: board rotates slightly based on mouse position (parallax + rotation).
- **Glitch effect**: distorted RGB-split text on game-over screen.

**Persistence:**
- `STORAGE_KEY` — `'tetris-settings-v1'`: volume, colorblind mode, theme choice.
- `HIGHSCORE_KEY` — `'tetris-highscores-v1'`: best scores per game mode.
- Saved on score update or option change; loaded on startup.

## Important Constants

| Constant | Purpose | Default |
|----------|---------|---------|
| `COLS`, `ROWS` | Board size | `10`, `20` |
| `BLOCK` | Pixel size per grid cell | `30` |
| `NEXT_COUNT` | Visible pieces in preview queue | `5` |
| `LOCK_DELAY` | ms before piece locks when resting | `500` |
| `MAX_LOCK_RESETS` | max times lock delay can restart | `15` |
| `DAS` | initial horizontal repeat delay (ms) | `150` |
| `ARR` | horizontal repeat interval (ms) | `35` |
| `SOFT_ARR` | soft-drop repeat interval (ms) | `25` |
| `ULTRA_DURATION` | Ultra mode time limit (ms) | `120000` |
| `LINE_SCORES` | points per line count | `[0,100,300,500,800]` |
| `COLORS[1-7]` | hex colors for each piece | (see `game.js`) |

**Canvas dimensions in `index.html`:**
- `#board`: `width="300" height="600"` (COLS × BLOCK = 10×30, ROWS × BLOCK = 20×30).
- `#hold-canvas`: `width="100" height="100"`.
- `#next-canvas`: `width="100" height="320"` (for 5 pieces stacked).

If you change board dimensions, update all three.

## Game Modes

| Mode | Goal | Duration |
|------|------|----------|
| **Marathon** | Classic endless play; level up every 10 lines. | Unlimited |
| **Sprint** | Finish 40 lines as fast as possible. | Timed; stops on completion. |
| **Ultra** | Maximize score in 2 minutes. | Fixed 120 seconds. |

Each mode tracks a separate high score in `localStorage`.

## Common Customizations

**Adjust fall speed by level:**
- Edit formula in `clearLines()` or `finishClearingLines()`: `Math.max(MIN, 1000 - (level - 1) × FACTOR)`.

**Change piece colors:**
- Edit `COLORS` array in `game.js` (indices 1-7 for I, O, T, S, Z, J, L).
- Theme swatches in `index.html` use CSS variables (`--c1`, `--c2`, `--c3`) that swap via `setTheme()`.

**Modify wall-kick behavior:**
- Edit `JLSTZ_KICKS` or `I_KICKS` objects; keys are `'from-to'` rotation transitions, values are `[[dx,dy], ...]` offsets tried in order.

**Add/remove themes:**
- Each theme defines three CSS variables in `style.css`; add new theme object to `THEMES` in `game.js` and swatch in options overlay (`index.html`).

**Adjust scoring:**
- `LINE_SCORES` for base line points.
- Back-to-back multiplier (×1.5) in `finishClearingLines()`.
- Combo formula: `50 × combo × level`.
- T-Spin/Perfect Clear bonuses in respective handlers.

## Controls

| Input | Action |
|-------|--------|
| **←** / **→** | Move left/right (with DAS/ARR) |
| **↑** or **X** | Rotate clockwise |
| **Z** / **Ctrl** | Rotate counter-clockwise |
| **↓** | Soft drop (accelerate fall) |
| **Space** | Hard drop (instant fall) |
| **C** / **Shift** | Hold piece (swap with held) |
| **P** / **Esc** | Pause/resume |

**Touch & Gamepad** also fully supported; see `handleTouchInput()` and `handleGamepadInput()` in `game.js`.

## Key Functions

- `loop(timestamp)` — main animation frame callback; orchestrates update and render.
- `attemptRotate(deltaRotation)` — handles rotation with wall-kick logic.
- `clearLines()` — detects and removes complete rows; updates score and level.
- `detectTSpin()` — checks if last rotation resulted in a T-Spin.
- `refillBag()` — generates new 7-bag randomization.
- `playSound(type, freq, duration)` — Web Audio synthesis wrapper.
- `spawn()` — moves next piece to current, generates new next, checks game-over.
- `render()` — draws board, pieces, ghost, overlays, particles.
- `saveSettings()` / `loadSettings()` — `localStorage` persistence.
