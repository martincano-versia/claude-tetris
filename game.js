'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const NEXT_COUNT = 5;
const LOCK_DELAY = 500;
const MAX_LOCK_RESETS = 15;
const DAS = 150;
const ARR = 35;
const SOFT_ARR = 25;
const SETTLE_DURATION = 220;
const ULTRA_DURATION = 120000;
const LINE_CLEAR_DURATION = 300;
const STORAGE_KEY = 'tetris-settings-v1';
const HIGHSCORE_KEY = 'tetris-highscores-v1';

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#7986cb', // J - indigo
  '#ffb74d', // L - orange
];

const ROTATION_SHAPES = {
  1: [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  2: [
    [[2,2],[2,2]],
    [[2,2],[2,2]],
    [[2,2],[2,2]],
    [[2,2],[2,2]],
  ],
  3: [
    [[0,3,0],[3,3,3],[0,0,0]],
    [[0,3,0],[0,3,3],[0,3,0]],
    [[0,0,0],[3,3,3],[0,3,0]],
    [[0,3,0],[3,3,0],[0,3,0]],
  ],
  4: [
    [[0,4,4],[4,4,0],[0,0,0]],
    [[0,4,0],[0,4,4],[0,0,4]],
    [[0,0,0],[0,4,4],[4,4,0]],
    [[4,0,0],[4,4,0],[0,4,0]],
  ],
  5: [
    [[5,5,0],[0,5,5],[0,0,0]],
    [[0,0,5],[0,5,5],[0,5,0]],
    [[0,0,0],[5,5,0],[0,5,5]],
    [[0,5,0],[5,5,0],[5,0,0]],
  ],
  6: [
    [[6,0,0],[6,6,6],[0,0,0]],
    [[0,6,6],[0,6,0],[0,6,0]],
    [[0,0,0],[6,6,6],[0,0,6]],
    [[0,6,0],[0,6,0],[6,6,0]],
  ],
  7: [
    [[0,0,7],[7,7,7],[0,0,0]],
    [[0,7,0],[0,7,0],[0,7,7]],
    [[0,0,0],[7,7,7],[7,0,0]],
    [[7,7,0],[0,7,0],[0,7,0]],
  ],
};

const JLSTZ_KICKS = {
  '0-1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1-0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '1-2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '2-1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '2-3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '3-2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3-0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '0-3': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
};

const I_KICKS = {
  '0-1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '1-0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '1-2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  '2-1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '2-3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  '3-2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  '3-0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
  '0-3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};

const LINE_SCORES = [0, 100, 300, 500, 800];
const LANDED_COLORS = ['#5b5b6e', '#666678'];
const COMBO_LABELS = { 1: 'SINGLE', 2: 'DOUBLE', 3: 'TRIPLE', 4: 'TETRIS!' };

// ---- Referencias DOM ----
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-canvas');
const holdCtx = holdCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const comboValueEl = document.getElementById('combo-value');
const modeTimerSection = document.getElementById('mode-timer-section');
const modeTimerLabel = document.getElementById('mode-timer-label');
const modeTimerEl = document.getElementById('mode-timer');

const boardWrap = document.getElementById('board-wrap');
const flashOverlay = document.getElementById('flash-overlay');
const chromaOverlay = document.getElementById('chroma-overlay');
const dangerLabel = document.getElementById('danger-label');
const comboText = document.getElementById('combo-text');
const comboMain = document.getElementById('combo-main');
const comboSub = document.getElementById('combo-sub');

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const overlayStats = document.getElementById('overlay-stats');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const pauseOptionsBtn = document.getElementById('pause-options-btn');
const optionsBtn = document.getElementById('options-btn');

const pauseOverlay = document.getElementById('pause-overlay');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseControlsToggle = document.getElementById('pause-controls-toggle');
const pauseControlsList = document.getElementById('pause-controls-list');
const pauseOptionsOpenBtn = document.getElementById('pause-options-open-btn');
const startLevelSelect = document.getElementById('start-level-select');

const startOverlay = document.getElementById('start-overlay');
const modeButtons = document.querySelectorAll('.mode-btn');
const startBtn = document.getElementById('start-btn');
const startOptionsBtn = document.getElementById('start-options-btn');
const highscoreLine = document.getElementById('highscore-line');

const optionsOverlay = document.getElementById('options-overlay');
const volumeRange = document.getElementById('volume-range');
const colorblindToggle = document.getElementById('colorblind-toggle');
const closeOptionsBtn = document.getElementById('close-options-btn');
const swatches = document.querySelectorAll('.swatch');

const tLeft = document.getElementById('t-left');
const tRight = document.getElementById('t-right');
const tRotate = document.getElementById('t-rotate');
const tDown = document.getElementById('t-down');
const tDrop = document.getElementById('t-drop');
const tHold = document.getElementById('t-hold');

// ---- Estado del juego ----
let board, current, hold, holdUsed, queue;
let score, lines, level, combo, backToBack;
let paused, gameOver, started, mode;
let lastTime, dropAccum, dropInterval, animId, clearingLines;
let lockTimer, lockResets, lastActionWasRotate;
let particles, dropTrails, shockwaves, settlingCells;
let ambientAccum, dangerSoundAccum;
let danger = 0, dangerTarget = 0;
let modeStartTime, modeElapsed;
let gameStartLevel = 1;
let stats;
let scoreAnim = null;
let selectedMode = 'marathon';

const MAX_START_LEVEL = 15;
const settings = { volume: 0.6, colorblind: false, theme: 'aurora', audioEnabled: true, startLevel: 1 };
const highscores = { marathon: 0, sprint: null, ultra: 0 };

// ---- Persistencia ----
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(settings, JSON.parse(raw));
  } catch (e) { /* almacenamiento no disponible */ }
  settings.startLevel = Math.min(MAX_START_LEVEL, Math.max(1, Math.round(settings.startLevel) || 1));
}

function saveSettings() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) { /* ignorar */ }
}

function loadHighscores() {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (raw) Object.assign(highscores, JSON.parse(raw));
  } catch (e) { /* ignorar */ }
}

function saveHighscores() {
  try { localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highscores)); } catch (e) { /* ignorar */ }
}

function applySettings() {
  document.body.setAttribute('data-theme', settings.theme);
  volumeRange.value = settings.volume;
  colorblindToggle.checked = settings.colorblind;
  swatches.forEach(s => s.classList.toggle('selected', s.dataset.theme === settings.theme));
  startLevelSelect.value = String(settings.startLevel);
}

function populateStartLevelSelect() {
  for (let lvl = 1; lvl <= MAX_START_LEVEL; lvl++) {
    const opt = document.createElement('option');
    opt.value = String(lvl);
    opt.textContent = lvl;
    startLevelSelect.appendChild(opt);
  }
}

// ---- Utilidades de color / dibujo ----
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixColor(hex, amt, towardsWhite) {
  const { r, g, b } = hexToRgb(hex);
  const t = towardsWhite ? 255 : 0;
  const nr = Math.round(r + (t - r) * amt);
  const ng = Math.round(g + (t - g) * amt);
  const nb = Math.round(b + (t - b) * amt);
  return `rgb(${nr},${ng},${nb})`;
}

const lighten = (hex, amt) => mixColor(hex, amt, true);
const darken = (hex, amt) => mixColor(hex, amt, false);

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawStar(context, cx, cy, outerR, innerR, points) {
  context.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath();
}

function squashScale(t, strength = 1) {
  const decay = Math.exp(-t * 7);
  const wob = Math.sin(t * Math.PI * 2.5 + Math.PI / 2) * decay * strength;
  return { sx: 1 + wob * 0.22, sy: 1 - wob * 0.22 };
}

// ---- Audio sintetizado (Web Audio API, sin assets externos) ----
let actx = null;
function ensureAudio() {
  if (!actx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    actx = new Ctx();
  }
  if (actx.state === 'suspended') actx.resume();
}

function playTone(freq, opts = {}) {
  if (!settings.audioEnabled || settings.volume <= 0 || !actx) return;
  const { duration = 0.08, type = 'square', gain = 0.15, sweep = null, delay = 0 } = opts;
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweep) osc.frequency.exponentialRampToValueAtTime(sweep, t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(Math.max(0.0001, gain * settings.volume), t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(actx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const SFX = {
  move: () => playTone(220, { duration: 0.04, type: 'square', gain: 0.05 }),
  rotate: () => playTone(340, { duration: 0.06, type: 'square', gain: 0.07 }),
  lock: () => playTone(200, { duration: 0.04, type: 'triangle', gain: 0.05 }),
  hold: () => playTone(520, { duration: 0.08, type: 'sine', gain: 0.08 }),
  hard: () => playTone(120, { duration: 0.09, type: 'square', gain: 0.12, sweep: 55 }),
  clear: () => [0, 1, 2].forEach(i => playTone(440 + i * 140, { duration: 0.09, type: 'square', gain: 0.09, delay: i * 0.05 })),
  tetris: () => [0, 1, 2, 3, 4].forEach(i => playTone(300 + i * 160, { duration: 0.14, type: 'sawtooth', gain: 0.1, delay: i * 0.06 })),
  tspin: () => [0, 1, 2].forEach(i => playTone(500 + i * 220, { duration: 0.1, type: 'triangle', gain: 0.09, delay: i * 0.05 })),
  levelup: () => [0, 1, 2, 3].forEach(i => playTone(260 + i * 120, { duration: 0.1, type: 'sine', gain: 0.1, delay: i * 0.05 })),
  gameover: () => [0, 1, 2, 3].forEach(i => playTone(300 - i * 60, { duration: 0.22, type: 'sawtooth', gain: 0.12, delay: i * 0.12 })),
  danger: () => playTone(880, { duration: 0.05, type: 'square', gain: 0.04 }),
};

function playSound(name) {
  if (SFX[name]) SFX[name]();
}

// ---- Tablero y piezas ----
function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function refillBag() {
  const bag = [1, 2, 3, 4, 5, 6, 7];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  queue.push(...bag);
}

function fillQueue() {
  while (queue.length < NEXT_COUNT + 1) refillBag();
}

function newPiece(type) {
  const shape = ROTATION_SHAPES[type][0];
  const width = shape[0].length;
  return { type, shape, rotation: 0, x: Math.floor(COLS / 2) - Math.floor(width / 2), y: 0 };
}

function takeFromQueue() {
  fillQueue();
  return newPiece(queue.shift());
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function getKicks(type, from, to) {
  if (type === 2) return [[0, 0]];
  const key = `${from}-${to}`;
  const table = type === 1 ? I_KICKS : JLSTZ_KICKS;
  return table[key] || [[0, 0]];
}

function onSuccessfulMove() {
  if (collide(current.shape, current.x, current.y + 1)) {
    if (lockResets < MAX_LOCK_RESETS) {
      lockTimer = 0;
      lockResets++;
    }
  }
}

function attemptRotate(dir) {
  const fromState = current.rotation;
  const toState = (fromState + dir + 4) % 4;
  const rotatedShape = ROTATION_SHAPES[current.type][toState];
  const kicks = getKicks(current.type, fromState, toState);
  for (const [kx, ky] of kicks) {
    const nx = current.x + kx, ny = current.y + ky;
    if (!collide(rotatedShape, nx, ny)) {
      current.shape = rotatedShape;
      current.x = nx;
      current.y = ny;
      current.rotation = toState;
      lastActionWasRotate = true;
      onSuccessfulMove();
      spawnRotateParticles();
      playSound('rotate');
      return true;
    }
  }
  return false;
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function detectTSpin(piece) {
  if (piece.type !== 3 || !lastActionWasRotate) return null;
  const px = piece.x + 1, py = piece.y + 1;
  const occ = (x, y) => {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y < 0) return false;
    return board[y][x] !== 0;
  };
  const tl = occ(px - 1, py - 1);
  const tr = occ(px + 1, py - 1);
  const bl = occ(px - 1, py + 1);
  const br = occ(px + 1, py + 1);
  const count = [tl, tr, bl, br].filter(Boolean).length;
  if (count < 3) return null;
  const frontPairs = { 0: [tl, tr], 1: [tr, br], 2: [br, bl], 3: [bl, tl] };
  const frontFilled = frontPairs[piece.rotation].every(Boolean);
  return frontFilled ? 'full' : 'mini';
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function moveHorizontal(dir) {
  if (!collide(current.shape, current.x + dir, current.y)) {
    current.x += dir;
    lastActionWasRotate = false;
    spawnMoveParticles(dir);
    onSuccessfulMove();
    playSound('move');
  }
}

function holdPiece() {
  if (holdUsed || clearingLines || paused || gameOver || !started) return;
  playSound('hold');
  if (hold === null) {
    hold = current.type;
    current = takeFromQueue();
  } else {
    const t = hold;
    hold = current.type;
    current = newPiece(t);
  }
  holdUsed = true;
  lockTimer = 0;
  lockResets = 0;
  lastActionWasRotate = false;
  if (collide(current.shape, current.x, current.y)) {
    endGame('topout');
    return;
  }
  drawHold();
  drawNextQueue();
}

// ---- Sistema de partículas ----
function spawnParticles(cx, cy, opts = {}) {
  const {
    count = 10,
    colors = ['#ffffff'],
    speed = 2.5,
    spread = Math.PI * 2,
    baseAngle = 0,
    life = 450,
    size = 3,
    gravity = 0.05,
    shape = 'circle',
    rotationSpeed = 0,
  } = opts;
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    const v = speed * (0.5 + Math.random() * 0.8);
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life,
      maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: size * (0.6 + Math.random() * 0.8),
      gravity,
      shape,
      rotation: Math.random() * Math.PI * 2,
      vr: rotationSpeed ? (Math.random() - 0.5) * rotationSpeed : 0,
    });
  }
}

function updateParticles(dt) {
  const step = dt / 16;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.vy += p.gravity * step;
    if (p.vr) p.rotation += p.vr * step;
  }
}

function drawParticles(context) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = p.color;
    context.translate(p.x, p.y);
    if (p.rotation) context.rotate(p.rotation);
    switch (p.shape) {
      case 'diamond':
        context.beginPath();
        context.moveTo(0, -p.size);
        context.lineTo(p.size, 0);
        context.lineTo(0, p.size);
        context.lineTo(-p.size, 0);
        context.closePath();
        context.fill();
        break;
      case 'star':
        drawStar(context, 0, 0, p.size, p.size * 0.45, 5);
        context.fill();
        break;
      case 'spark':
        context.fillRect(-p.size * 1.6, -p.size * 0.3, p.size * 3.2, p.size * 0.6);
        break;
      default:
        context.beginPath();
        context.arc(0, 0, p.size, 0, Math.PI * 2);
        context.fill();
    }
    context.restore();
  }
  context.globalAlpha = 1;
}

function pieceBounds(shape) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
  }
  return { minR, maxR, minC, maxC };
}

function pieceCenterPx(piece) {
  const { minR, maxR, minC, maxC } = pieceBounds(piece.shape);
  return {
    cx: (piece.x + (minC + maxC + 1) / 2) * BLOCK,
    cy: (piece.y + (minR + maxR + 1) / 2) * BLOCK,
  };
}

function pieceColors(piece) {
  return [COLORS[piece.type]];
}

function spawnMoveParticles(dir) {
  const { minC, maxC, minR, maxR } = pieceBounds(current.shape);
  const edgeC = dir > 0 ? current.x + maxC + 1 : current.x + minC;
  const cy = (current.y + (minR + maxR + 1) / 2) * BLOCK;
  spawnParticles(edgeC * BLOCK, cy, {
    count: 5,
    colors: pieceColors(current),
    speed: 1.6,
    spread: Math.PI * 0.6,
    baseAngle: dir > 0 ? 0 : Math.PI,
    life: 220,
    size: 2.5,
    gravity: 0.02,
  });
}

function spawnRotateParticles() {
  const { cx, cy } = pieceCenterPx(current);
  spawnParticles(cx, cy, {
    count: 14,
    colors: pieceColors(current),
    speed: 2.4,
    spread: Math.PI * 2,
    life: 320,
    size: 2.5,
    gravity: 0.01,
    rotationSpeed: 0.3,
  });
}

function spawnSoftDropParticles() {
  const { minC, maxC, maxR } = pieceBounds(current.shape);
  const cx = (current.x + (minC + maxC + 1) / 2) * BLOCK;
  const cy = (current.y + maxR + 1) * BLOCK;
  spawnParticles(cx, cy, {
    count: 3,
    colors: pieceColors(current),
    speed: 1,
    spread: Math.PI * 0.4,
    baseAngle: Math.PI / 2,
    life: 200,
    size: 2,
    gravity: 0.03,
  });
}

function spawnLandParticles(piece) {
  const colors = pieceColors(piece);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const px = (piece.x + c + 0.5) * BLOCK;
      const py = (piece.y + r + 0.5) * BLOCK;
      spawnParticles(px, py, {
        count: 4,
        colors,
        speed: 1.4,
        spread: Math.PI * 2,
        baseAngle: -Math.PI / 2,
        life: 350,
        size: 2.5,
        gravity: 0.06,
      });
    }
  }
}

function spawnLineClearParticles(row, shape = 'diamond') {
  for (let c = 0; c < COLS; c++) {
    const color = COLORS[board[row][c]] || '#ffffff';
    const px = (c + 0.5) * BLOCK;
    const py = (row + 0.5) * BLOCK;
    spawnParticles(px, py, {
      count: 7,
      colors: [color, '#ffffff'],
      speed: 3.8,
      spread: Math.PI * 2,
      life: 480,
      size: 3,
      gravity: 0.08,
      shape,
      rotationSpeed: 0.25,
    });
  }
}

function spawnGameOverParticles() {
  const palette = COLORS.filter(Boolean);
  spawnParticles((COLS * BLOCK) / 2, (ROWS * BLOCK) / 2, {
    count: 40, colors: palette, speed: 5.5, life: 950, size: 3.5, gravity: 0.06, shape: 'circle',
  });
  spawnParticles((COLS * BLOCK) / 2, (ROWS * BLOCK) / 2, {
    count: 30, colors: palette, speed: 4.5, life: 1000, size: 3, gravity: 0.05, shape: 'diamond', rotationSpeed: 0.3,
  });
}

function spawnPerfectClearParticles() {
  const palette = COLORS.filter(Boolean);
  spawnParticles((COLS * BLOCK) / 2, (ROWS * BLOCK) / 2, {
    count: 90, colors: palette, speed: 6.5, life: 1200, size: 4, gravity: 0.05, shape: 'star', rotationSpeed: 0.4,
  });
  spawnParticles((COLS * BLOCK) / 2, (ROWS * BLOCK) / 2, {
    count: 50, colors: ['#ffffff', ...palette], speed: 4.5, life: 950, size: 3, gravity: 0.08, shape: 'diamond',
  });
}

function spawnAmbientParticle() {
  spawnParticles(Math.random() * COLS * BLOCK, ROWS * BLOCK - 2, {
    count: 1,
    colors: ['rgba(122,162,247,0.6)'],
    speed: 0.8,
    spread: Math.PI * 0.3,
    baseAngle: -Math.PI / 2,
    life: 1200,
    size: 1.8,
    gravity: -0.01,
  });
}

// ---- Estelas, ondas de choque y "settle" ----
function spawnDropTrail(fromY, toY) {
  const steps = Math.min(6, Math.max(0, toY - fromY));
  for (let i = 1; i <= steps; i++) {
    const y = fromY + ((toY - fromY) * i) / steps;
    dropTrails.push({
      shape: current.shape, x: current.x, y,
      life: 220, maxLife: 220, alpha: 0.5 * (i / steps),
    });
  }
}

function updateDropTrails(dt) {
  for (let i = dropTrails.length - 1; i >= 0; i--) {
    dropTrails[i].life -= dt;
    if (dropTrails[i].life <= 0) dropTrails.splice(i, 1);
  }
}

function spawnShockwave(cx, cy, color, strength = 1) {
  shockwaves.push({ x: cx, y: cy, r: 0, maxR: COLS * BLOCK * 0.9 * strength, life: 550, maxLife: 550, color });
}

function updateShockwaves(dt) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.life -= dt;
    if (s.life <= 0) { shockwaves.splice(i, 1); continue; }
    const t = 1 - s.life / s.maxLife;
    s.r = s.maxR * (1 - Math.pow(1 - t, 3));
  }
}

function drawShockwaves(context) {
  for (const s of shockwaves) {
    const alpha = s.life / s.maxLife;
    context.save();
    context.globalAlpha = alpha * 0.7;
    context.strokeStyle = s.color;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
}

function recordSettle(piece, strength = 1) {
  const cells = new Set();
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) cells.add((piece.y + r) + ',' + (piece.x + c));
  settlingCells = { cells, start: performance.now(), strength };
}

function updateDangerTarget() {
  let minFilledRow = ROWS;
  for (let r = 0; r < ROWS; r++) {
    if (board[r].some(v => v !== 0)) { minFilledRow = r; break; }
  }
  dangerTarget = Math.max(0, Math.min(1, (6 - minFilledRow) / 6));
}

function applyDangerVisual() {
  canvas.style.setProperty('--danger', danger.toFixed(3));
  dangerLabel.classList.toggle('active', danger > 0.6);
}

function updateSpotlight() {
  if (!current || clearingLines || gameOver || paused || !started) return;
  const { cx, cy } = pieceCenterPx(current);
  boardWrap.style.setProperty('--spot-x', ((cx / (COLS * BLOCK)) * 100) + '%');
  boardWrap.style.setProperty('--spot-y', ((cy / (ROWS * BLOCK)) * 100) + '%');
}

function triggerFlash() {
  flashOverlay.classList.remove('flash');
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add('flash');
}

function triggerChroma() {
  chromaOverlay.classList.remove('chroma');
  void chromaOverlay.offsetWidth;
  chromaOverlay.classList.add('chroma');
}

function triggerZoomPunch() {
  boardWrap.classList.remove('zoom-punch');
  void boardWrap.offsetWidth;
  boardWrap.classList.add('zoom-punch');
}

function triggerMegaShake() {
  boardWrap.classList.remove('mega-shake');
  void boardWrap.offsetWidth;
  boardWrap.classList.add('mega-shake');
}

function triggerMegaEffects(color) {
  triggerFlash();
  triggerChroma();
  triggerZoomPunch();
  triggerMegaShake();
  spawnShockwave(COLS * BLOCK / 2, ROWS * BLOCK / 2, color, 1);
}

// ---- HUD y puntuación ----
function flashValue(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function updateHUD() {
  linesEl.textContent = lines;
  levelEl.textContent = level;
  comboValueEl.textContent = combo > 0 ? `x${combo + 1}` : '-';
}

function syncScoreDisplay() {
  scoreEl.textContent = score.toLocaleString();
}

function animateScore(gained) {
  if (!gained) { syncScoreDisplay(); return; }
  const from = score - gained;
  scoreAnim = { from, to: score, start: performance.now(), duration: 420 };
  flashValue(scoreEl);
}

function updateScoreAnim(now) {
  if (!scoreAnim) return;
  const t = Math.min(1, (now - scoreAnim.start) / scoreAnim.duration);
  const eased = 1 - Math.pow(1 - t, 3);
  const val = Math.round(scoreAnim.from + (scoreAnim.to - scoreAnim.from) * eased);
  scoreEl.textContent = val.toLocaleString();
  if (t >= 1) scoreAnim = null;
}

function showComboText(label, sub) {
  if (!label) return;
  comboMain.textContent = label;
  comboSub.textContent = sub || '';
  const mega = label.includes('TETRIS') || label.includes('PERFECT') || label.includes('T-SPIN');
  comboText.style.color = label.includes('PERFECT') ? '#4dd0e1'
    : label.includes('TETRIS') ? '#ffd54f'
    : label.includes('T-SPIN') ? '#ba68c8'
    : '#7aa2f7';
  comboText.classList.remove('show', 'mega');
  void comboText.offsetWidth;
  comboText.classList.add(mega ? 'mega' : 'show');
}

function onLevelUp() {
  document.body.classList.add('theme-shift');
  document.body.style.setProperty('--hue-rotate', (((level - 1) * 24) % 360) + 'deg');
  playSound('levelup');
  triggerFlash();
}

function formatTime(ms, precise = false) {
  const totalMs = Math.max(0, Math.round(ms));
  let m = Math.floor(totalMs / 60000);
  let s = (totalMs - m * 60000) / 1000;
  // toFixed()/Math.floor() can round s up to 60 right at the minute boundary.
  if (precise ? s.toFixed(2) === '60.00' : Math.floor(s) === 60) { m += 1; s = 0; }
  return precise
    ? `${m}:${s.toFixed(2).padStart(5, '0')}`
    : `${m}:${Math.floor(s).toString().padStart(2, '0')}`;
}

// ---- Bloqueo de pieza y limpieza de líneas ----
function lockPiece(isHardDrop = false) {
  const landedPiece = current;
  const tSpin = detectTSpin(landedPiece);
  merge();
  recordSettle(landedPiece, isHardDrop ? 1.7 : 1);
  updateDangerTarget();
  stats.piecesPlaced++;

  const fullRows = [];
  for (let r = 0; r < ROWS; r++) if (board[r].every(v => v !== 0)) fullRows.push(r);

  if (fullRows.length) {
    fullRows.forEach(r => spawnLineClearParticles(r, fullRows.length === 4 ? 'star' : 'diamond'));
    clearingLines = { rows: fullRows, start: performance.now(), tSpin };
  } else {
    spawnLandParticles(landedPiece);
    playSound('lock');
    if (tSpin) {
      const gained = (tSpin === 'full' ? 400 : 100) * level;
      score += gained;
      combo = -1;
      syncScoreDisplay();
      updateHUD();
      showComboText(tSpin === 'full' ? 'T-SPIN' : 'T-SPIN MINI');
      playSound('tspin');
    } else {
      combo = -1;
      updateHUD();
    }
    lockTimer = 0;
    lockResets = 0;
    lastActionWasRotate = false;
    spawn();
  }
}

function finishClearingLines() {
  const rows = new Set(clearingLines.rows);
  const cleared = clearingLines.rows.length;
  const tSpin = clearingLines.tSpin;
  const remaining = board.filter((_, r) => !rows.has(r));
  const emptyRows = Array.from({ length: cleared }, () => new Array(COLS).fill(0));
  board = emptyRows.concat(remaining);

  const prevLevel = level;
  lines += cleared;

  let gained = 0;
  let label = null, sub = null;
  const difficult = cleared === 4 || (tSpin && cleared > 0);

  if (tSpin) {
    const table = tSpin === 'full' ? [400, 800, 1200, 1600] : [100, 200, 400, 400];
    gained += table[cleared] * level;
    label = (tSpin === 'full' ? 'T-SPIN' : 'T-SPIN MINI') + (cleared ? ' ' + COMBO_LABELS[cleared] : '');
  } else if (cleared) {
    gained += (LINE_SCORES[cleared] || 0) * level;
    label = COMBO_LABELS[cleared];
  }

  if (difficult && backToBack) {
    gained = Math.floor(gained * 1.5);
    sub = 'BACK-TO-BACK';
  }
  if (cleared > 0) backToBack = difficult;

  if (cleared > 0) {
    combo++;
    stats.maxCombo = Math.max(stats.maxCombo, combo + 1);
    if (combo > 0) gained += 50 * combo * level;
  } else {
    combo = -1;
  }

  const isPerfectClear = board.every(row => row.every(v => v === 0));
  if (isPerfectClear && cleared > 0) {
    const pcBonus = [0, 800, 1200, 1800, 2000][cleared] * level;
    gained += pcBonus;
    label = 'PERFECT CLEAR!';
    sub = `+${pcBonus.toLocaleString()}`;
    spawnPerfectClearParticles();
  }

  score += gained;
  level = gameStartLevel + Math.floor(lines / 10);
  dropInterval = Math.max(100, 1000 - (level - 1) * 90);

  updateHUD();
  flashValue(linesEl);
  animateScore(gained);
  if (level !== prevLevel) { flashValue(levelEl); onLevelUp(); }

  if (label) showComboText(label, sub);

  if (isPerfectClear && cleared > 0) {
    triggerMegaEffects('#ffffff');
  } else if (cleared === 4) {
    triggerMegaEffects('#ffd54f');
    playSound('tetris');
  } else if (tSpin && cleared > 0) {
    triggerMegaEffects('#ba68c8');
    playSound('tspin');
  } else if (cleared > 0) {
    const avgRow = clearingLines.rows.reduce((a, b) => a + b, 0) / cleared;
    spawnShockwave(COLS * BLOCK / 2, (avgRow + 0.5) * BLOCK, '#7aa2f7', 0.5);
    playSound('clear');
  }

  clearingLines = null;
  lockResets = 0;
  lastActionWasRotate = false;

  if (mode === 'sprint' && lines >= 40) { endGame('sprint-complete'); return; }
  spawn();
}

// ---- Movimiento ----
function softDropStep() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    lastActionWasRotate = false;
    spawnSoftDropParticles();
    syncScoreDisplay();
  } else {
    lockPiece();
  }
}

function hardDrop() {
  const gy = ghostY();
  const dist = gy - current.y;
  score += dist * 2;
  spawnDropTrail(current.y, gy);
  current.y = gy;
  // Deliberately not clearing lastActionWasRotate here: hard-dropping straight
  // into a T-spin slot right after rotating must still count as a T-Spin.
  syncScoreDisplay();
  triggerZoomPunch();
  canvas.classList.remove('shake');
  void canvas.offsetWidth;
  canvas.classList.add('shake');
  playSound('hard');
  lockPiece(true);
}

// ---- Dibujado ----
function drawSymbol(context, type, cx, cy, size) {
  context.save();
  context.globalAlpha = 0.6;
  context.fillStyle = 'rgba(255,255,255,0.9)';
  context.strokeStyle = 'rgba(255,255,255,0.9)';
  context.lineWidth = 1.4;
  const s = size * 0.22;
  switch (type) {
    case 1:
      context.fillRect(cx - s * 0.35, cy - s * 1.3, s * 0.7, s * 2.6);
      break;
    case 2:
      context.beginPath();
      context.arc(cx, cy, s * 0.9, 0, Math.PI * 2);
      context.stroke();
      break;
    case 3:
      context.beginPath();
      context.moveTo(cx, cy - s);
      context.lineTo(cx + s, cy + s * 0.8);
      context.lineTo(cx - s, cy + s * 0.8);
      context.closePath();
      context.stroke();
      break;
    case 4:
      context.beginPath();
      context.moveTo(cx - s, cy + s * 0.4);
      context.lineTo(cx, cy - s * 0.6);
      context.lineTo(cx + s, cy + s * 0.4);
      context.stroke();
      break;
    case 5:
      context.beginPath();
      context.moveTo(cx - s, cy - s * 0.4);
      context.lineTo(cx, cy + s * 0.6);
      context.lineTo(cx + s, cy - s * 0.4);
      context.stroke();
      break;
    case 6:
      context.strokeRect(cx - s * 0.8, cy - s * 0.8, s * 1.6, s * 1.6);
      break;
    case 7:
      context.beginPath();
      context.moveTo(cx, cy - s);
      context.lineTo(cx + s, cy);
      context.lineTo(cx, cy + s);
      context.lineTo(cx - s, cy);
      context.closePath();
      context.stroke();
      break;
  }
  context.restore();
}

function drawBlockAtPx(context, px, py, colorIndex, size, alpha = 1, colorOverride) {
  if (!colorIndex) return;
  const color = colorOverride || COLORS[colorIndex];
  context.save();
  context.globalAlpha = alpha;
  const grad = context.createLinearGradient(px, py, px + size, py + size);
  grad.addColorStop(0, lighten(color, 0.35));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, darken(color, 0.35));
  context.fillStyle = grad;
  roundRect(context, px + 1, py + 1, size - 2, size - 2, 3);
  context.fill();
  context.fillStyle = 'rgba(255,255,255,0.18)';
  context.fillRect(px + 2, py + 2, size - 4, Math.max(2, size * 0.14));
  context.strokeStyle = 'rgba(0,0,0,0.25)';
  context.lineWidth = 1;
  context.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
  if (settings.colorblind) drawSymbol(context, colorIndex, px + size / 2, py + size / 2, size);
  context.restore();
}

function drawBlock(context, x, y, colorIndex, size, alpha, colorOverride) {
  drawBlockAtPx(context, x * size, y * size, colorIndex, size, alpha, colorOverride);
}

function drawGrid() {
  ctx.strokeStyle = '#22222e';
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function drawGhost(gy) {
  const dashOffset = (performance.now() / 40) % 8;
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -dashOffset;
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      if (!current.shape[r][c]) continue;
      const px = (current.x + c) * BLOCK, py = (gy + r) * BLOCK;
      const color = COLORS[current.shape[r][c]];
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, BLOCK - 4, BLOCK - 4);
    }
  }
  ctx.restore();
}

function drawDropTrails() {
  for (const trail of dropTrails) {
    const alpha = Math.max(0, (trail.life / trail.maxLife) * trail.alpha);
    for (let r = 0; r < trail.shape.length; r++)
      for (let c = 0; c < trail.shape[r].length; c++)
        if (trail.shape[r][c])
          drawBlockAtPx(ctx, (trail.x + c) * BLOCK, (trail.y + r) * BLOCK, trail.shape[r][c], BLOCK, alpha);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const now = performance.now();
  const flashingRows = clearingLines ? new Set(clearingLines.rows) : null;
  const blink = clearingLines
    ? Math.sin(((now - clearingLines.start) / LINE_CLEAR_DURATION) * Math.PI * 6) > 0
    : false;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c]) continue;
      let color = LANDED_COLORS[(r + c) % 2];
      if (flashingRows && flashingRows.has(r)) color = blink ? '#ffffff' : color;
      const key = r + ',' + c;
      if (settlingCells && settlingCells.cells.has(key) && now - settlingCells.start < SETTLE_DURATION) {
        const t = (now - settlingCells.start) / SETTLE_DURATION;
        const { sx, sy } = squashScale(t, settlingCells.strength);
        const cx = (c + 0.5) * BLOCK, cy = (r + 0.5) * BLOCK;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sx, sy);
        ctx.translate(-cx, -cy);
        drawBlock(ctx, c, r, board[r][c], BLOCK, 1, color);
        ctx.restore();
      } else {
        drawBlock(ctx, c, r, board[r][c], BLOCK, 1, color);
      }
    }
  }

  if (!clearingLines && current) {
    const gy = ghostY();
    drawGhost(gy);
    drawDropTrails();

    ctx.save();
    ctx.shadowColor = COLORS[current.type];
    ctx.shadowBlur = 10 + level * 1.2;
    for (let r = 0; r < current.shape.length; r++)
      for (let c = 0; c < current.shape[r].length; c++)
        if (current.shape[r][c]) drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
    ctx.restore();
  }

  drawShockwaves(ctx);
  drawParticles(ctx);
}

function drawNextQueue() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const slotH = nextCanvas.height / NEXT_COUNT;
  const nb = 18;
  for (let i = 0; i < NEXT_COUNT; i++) {
    const type = queue[i];
    if (!type) continue;
    const shape = ROTATION_SHAPES[type][0];
    const offX = (nextCanvas.width - shape[0].length * nb) / 2;
    const offY = i * slotH + (slotH - shape.length * nb) / 2;
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) drawBlockAtPx(nextCtx, offX + c * nb, offY + r * nb, shape[r][c], nb);
  }
}

function drawHold() {
  holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  holdCanvas.classList.toggle('used', holdUsed);
  if (hold === null) return;
  const shape = ROTATION_SHAPES[hold][0];
  const hb = 20;
  const offX = (holdCanvas.width - shape[0].length * hb) / 2;
  const offY = (holdCanvas.height - shape.length * hb) / 2;
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      if (shape[r][c]) drawBlockAtPx(holdCtx, offX + c * hb, offY + r * hb, shape[r][c], hb, holdUsed ? 0.5 : 1);
}

// ---- Ciclo de vida de la pieza / partida ----
function spawn() {
  current = takeFromQueue();
  holdUsed = false;
  lockTimer = 0;
  lockResets = 0;
  lastActionWasRotate = false;
  if (collide(current.shape, current.x, current.y)) {
    endGame('topout');
    return;
  }
  drawNextQueue();
  drawHold();
}

function updateModeTimers(dt) {
  modeElapsed += dt;
  if (mode === 'sprint') {
    modeTimerEl.textContent = formatTime(modeElapsed);
  } else if (mode === 'ultra') {
    const left = Math.max(0, ULTRA_DURATION - modeElapsed);
    modeTimerEl.textContent = formatTime(left);
    modeTimerEl.style.color = left <= 10000 ? '#ff1744' : '';
    if (left <= 0) endGame('ultra-complete');
  }
}

function endGame(reason) {
  if (gameOver) return;
  gameOver = true;
  spawnGameOverParticles();
  playSound('gameover');
  triggerMegaShake();
  triggerFlash();

  overlayTitle.classList.remove('glitch');
  void overlayTitle.offsetWidth;
  overlayTitle.classList.add('glitch');
  overlayTitle.textContent = reason === 'sprint-complete' ? 'SPRINT COMPLETO'
    : reason === 'ultra-complete' ? '¡TIEMPO!'
    : 'GAME OVER';

  const elapsed = performance.now() - modeStartTime;
  const pps = stats.piecesPlaced / Math.max(1, elapsed / 1000);
  overlayStats.textContent = `Piezas: ${stats.piecesPlaced} · PPS: ${pps.toFixed(2)} · Combo máx: x${Math.max(1, stats.maxCombo)}`;

  let scoreLine = `Puntuación: ${score.toLocaleString()}`;
  let isRecord = false;
  if (mode === 'sprint') {
    if (lines >= 40) {
      scoreLine = `Tiempo: ${formatTime(elapsed, true)}`;
      if (highscores.sprint == null || elapsed < highscores.sprint) { highscores.sprint = elapsed; isRecord = true; }
    } else {
      scoreLine = `Líneas: ${lines} / 40`;
    }
  } else if (score > (highscores[mode] || 0)) {
    highscores[mode] = score;
    isRecord = true;
  }
  saveHighscores();
  overlayScore.textContent = scoreLine + (isRecord ? '  🏆 ¡NUEVO RÉCORD!' : '');
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!started || gameOver) return;
  paused = !paused;
  if (!paused) {
    optionsOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    lastTime = performance.now();
    loop(lastTime);
  } else {
    dasState.left.held = false;
    dasState.right.held = false;
    softHeld = false;
    cancelAnimationFrame(animId);
    pauseControlsList.classList.add('hidden');
    pauseControlsToggle.textContent = 'Ver controles';
    startLevelSelect.value = String(settings.startLevel);
    pauseOverlay.classList.remove('hidden');
  }
}

// ---- Entrada: teclado con DAS/ARR propio ----
const dasState = {
  left: { held: false, timer: 0, arr: 0 },
  right: { held: false, timer: 0, arr: 0 },
};
let softHeld = false;
let softArrAccum = 0;

function canAct() {
  return started && !paused && !gameOver && !clearingLines;
}

function handleInputRepeat(dt) {
  ['left', 'right'].forEach(dir => {
    const st = dasState[dir];
    if (!st.held) return;
    st.timer += dt;
    if (st.timer >= DAS) {
      st.arr += dt;
      let guard = 0;
      while (st.arr >= ARR && guard < 20) {
        st.arr -= ARR;
        moveHorizontal(dir === 'left' ? -1 : 1);
        guard++;
      }
    }
  });
  if (softHeld) {
    softArrAccum += dt;
    let guard = 0;
    // canAct() re-checked every iteration: softDropStep() can trigger lockPiece() ->
    // spawn() -> endGame() mid-loop, and repeat must stop the instant that happens.
    while (softArrAccum >= SOFT_ARR && guard < 40 && canAct()) {
      softArrAccum -= SOFT_ARR;
      softDropStep();
      guard++;
    }
  }
}

document.addEventListener('keydown', e => {
  ensureAudio();
  if (e.code === 'KeyP' || e.code === 'Escape') { e.preventDefault(); togglePause(); return; }
  if (!canAct()) return;
  if (e.repeat) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) e.preventDefault();
    return;
  }
  switch (e.code) {
    case 'ArrowLeft':
      e.preventDefault();
      dasState.left.held = true; dasState.left.timer = 0; dasState.left.arr = 0;
      dasState.right.held = false;
      moveHorizontal(-1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      dasState.right.held = true; dasState.right.timer = 0; dasState.right.arr = 0;
      dasState.left.held = false;
      moveHorizontal(1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      softHeld = true; softArrAccum = 0;
      softDropStep();
      break;
    case 'ArrowUp':
    case 'KeyX':
      e.preventDefault();
      attemptRotate(1);
      break;
    case 'KeyZ':
    case 'ControlLeft':
    case 'ControlRight':
      e.preventDefault();
      attemptRotate(-1);
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
    case 'KeyC':
    case 'ShiftLeft':
    case 'ShiftRight':
      e.preventDefault();
      holdPiece();
      break;
    default:
      return;
  }
  updateHUD();
});

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') dasState.left.held = false;
  if (e.code === 'ArrowRight') dasState.right.held = false;
  if (e.code === 'ArrowDown') softHeld = false;
});

// ---- Mando (Gamepad API) ----
let gpPrev = { left: false, right: false, down: false, rotate: false, rotateCcw: false, drop: false, hold: false, pause: false };
function pollGamepad() {
  if (!navigator.getGamepads || !canAct()) return;
  const pads = navigator.getGamepads();
  const gp = pads && pads[0];
  if (!gp) return;
  const btn = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const left = gp.axes[0] < -0.5 || btn(14);
  const right = gp.axes[0] > 0.5 || btn(15);
  const down = gp.axes[1] > 0.5 || btn(13);
  const rotate = btn(0) || btn(12);
  const rotateCcw = btn(1);
  const drop = btn(2) || btn(3);
  const holdBtn = btn(4) || btn(5);

  // dasState/softHeld are shared with the keyboard handler, so releasing a gamepad
  // input only clears the flag if the gamepad itself was the one holding it — this
  // avoids the poll cutting off a hold started from the keyboard.
  if (left && !gpPrev.left) { dasState.left.held = true; dasState.left.timer = 0; dasState.left.arr = 0; dasState.right.held = false; moveHorizontal(-1); }
  if (!left && gpPrev.left) dasState.left.held = false;
  if (right && !gpPrev.right) { dasState.right.held = true; dasState.right.timer = 0; dasState.right.arr = 0; dasState.left.held = false; moveHorizontal(1); }
  if (!right && gpPrev.right) dasState.right.held = false;
  if (down && !gpPrev.down) { softHeld = true; softArrAccum = 0; softDropStep(); }
  if (!down && gpPrev.down) softHeld = false;
  if (rotate && !gpPrev.rotate) attemptRotate(1);
  if (rotateCcw && !gpPrev.rotateCcw) attemptRotate(-1);
  if (drop && !gpPrev.drop) hardDrop();
  if (holdBtn && !gpPrev.hold) holdPiece();

  gpPrev = { left, right, down, rotate, rotateCcw, drop, hold: holdBtn, pause: gpPrev.pause };
  updateHUD();
}

// ---- Controles táctiles ----
function bindTouchButton(el, onDown, onUp) {
  if (!el) return;
  el.addEventListener('pointerdown', e => { e.preventDefault(); if (canAct()) onDown(); });
  if (onUp) {
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
  }
}

bindTouchButton(tLeft, () => { dasState.left.held = true; dasState.left.timer = 0; dasState.left.arr = 0; dasState.right.held = false; moveHorizontal(-1); }, () => { dasState.left.held = false; });
bindTouchButton(tRight, () => { dasState.right.held = true; dasState.right.timer = 0; dasState.right.arr = 0; dasState.left.held = false; moveHorizontal(1); }, () => { dasState.right.held = false; });
bindTouchButton(tDown, () => { softHeld = true; softArrAccum = 0; softDropStep(); }, () => { softHeld = false; });
bindTouchButton(tRotate, () => attemptRotate(1));
bindTouchButton(tDrop, () => hardDrop());
bindTouchButton(tHold, () => holdPiece());

let touchStart = null;
boardWrap.addEventListener('touchstart', e => {
  if (!canAct()) return;
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY, lastX: t.clientX, time: performance.now() };
}, { passive: true });

boardWrap.addEventListener('touchmove', e => {
  if (!touchStart || !canAct()) return;
  const t = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  const cellPx = rect.width / COLS;
  const dx = t.clientX - touchStart.lastX;
  if (Math.abs(dx) >= cellPx) {
    const steps = Math.trunc(dx / cellPx);
    for (let i = 0; i < Math.abs(steps); i++) moveHorizontal(steps > 0 ? 1 : -1);
    touchStart.lastX += steps * cellPx;
  }
  const dy = t.clientY - touchStart.y;
  if (dy > cellPx * 1.5) { softDropStep(); touchStart.y = t.clientY; }
}, { passive: true });

boardWrap.addEventListener('touchend', e => {
  if (!touchStart || !canAct()) { touchStart = null; return; }
  const t = e.changedTouches[0];
  const dt2 = performance.now() - touchStart.time;
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 12 && dt2 < 250) attemptRotate(1);
  else if (dy > 60 && dt2 < 300 && Math.abs(dx) < 40) hardDrop();
  touchStart = null;
  updateHUD();
});

// ---- Perspectiva 3D sutil que sigue al ratón ----
boardWrap.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const rect = boardWrap.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  boardWrap.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
});
boardWrap.addEventListener('pointerleave', () => { boardWrap.style.transform = ''; });

// ---- Interfaz: menús y opciones ----
modeButtons.forEach(btn => btn.addEventListener('click', () => {
  modeButtons.forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedMode = btn.dataset.mode;
  updateHighscoreLine();
}));

function updateHighscoreLine() {
  if (selectedMode === 'sprint') {
    highscoreLine.textContent = highscores.sprint != null ? `Mejor tiempo: ${formatTime(highscores.sprint, true)}` : 'Sin récord aún';
  } else {
    const best = highscores[selectedMode] || 0;
    highscoreLine.textContent = best ? `Récord: ${best.toLocaleString()}` : 'Sin récord aún';
  }
}

function showStartOverlay() {
  overlay.classList.add('hidden');
  updateHighscoreLine();
  startOverlay.classList.remove('hidden');
}

startBtn.addEventListener('click', () => { ensureAudio(); startGame(selectedMode); });
restartBtn.addEventListener('click', () => { ensureAudio(); startGame(mode); });
menuBtn.addEventListener('click', () => showStartOverlay());
optionsBtn.addEventListener('click', () => optionsOverlay.classList.remove('hidden'));
startOptionsBtn.addEventListener('click', () => optionsOverlay.classList.remove('hidden'));
pauseOptionsBtn.addEventListener('click', () => optionsOverlay.classList.remove('hidden'));
closeOptionsBtn.addEventListener('click', () => optionsOverlay.classList.add('hidden'));

resumeBtn.addEventListener('click', () => togglePause());
pauseRestartBtn.addEventListener('click', () => { pauseOverlay.classList.add('hidden'); startGame(mode); });
pauseControlsToggle.addEventListener('click', () => {
  const isHidden = pauseControlsList.classList.toggle('hidden');
  pauseControlsToggle.textContent = isHidden ? 'Ver controles' : 'Ocultar controles';
});
pauseOptionsOpenBtn.addEventListener('click', () => optionsOverlay.classList.remove('hidden'));
startLevelSelect.addEventListener('change', () => {
  settings.startLevel = parseInt(startLevelSelect.value, 10) || 1;
  saveSettings();
});

volumeRange.addEventListener('input', () => {
  settings.volume = parseFloat(volumeRange.value);
  saveSettings();
});
colorblindToggle.addEventListener('change', () => {
  settings.colorblind = colorblindToggle.checked;
  saveSettings();
});
swatches.forEach(sw => sw.addEventListener('click', () => {
  settings.theme = sw.dataset.theme;
  applySettings();
  saveSettings();
  document.body.classList.add('theme-shift');
}));

// ---- Inicio y bucle principal ----
function startGame(chosenMode) {
  mode = chosenMode;
  startOverlay.classList.add('hidden');
  modeTimerSection.style.display = mode === 'marathon' ? 'none' : 'flex';
  modeTimerLabel.textContent = mode === 'sprint' ? 'TIEMPO' : 'RESTANTE';
  init();
}

function init() {
  board = createBoard();
  gameStartLevel = settings.startLevel || 1;
  score = 0; lines = 0; level = gameStartLevel;
  combo = -1; backToBack = false;
  hold = null; holdUsed = false;
  queue = [];
  paused = false; gameOver = false; started = true;
  dropInterval = Math.max(100, 1000 - (level - 1) * 90); dropAccum = 0;
  clearingLines = null;
  particles = []; dropTrails = []; shockwaves = []; settlingCells = null;
  ambientAccum = 0; dangerSoundAccum = 0;
  danger = 0; dangerTarget = 0;
  lockTimer = 0; lockResets = 0; lastActionWasRotate = false;
  modeStartTime = performance.now(); modeElapsed = 0;
  stats = { piecesPlaced: 0, maxCombo: 0 };
  scoreAnim = null;
  dasState.left.held = false; dasState.right.held = false; softHeld = false;

  comboText.classList.remove('show', 'mega');
  overlayTitle.classList.remove('glitch');
  document.body.style.setProperty('--hue-rotate', '0deg');

  lastTime = performance.now();
  fillQueue();
  spawn();
  updateHUD();
  syncScoreDisplay();
  updateDangerTarget();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

function loop(ts) {
  if (paused) return;
  let dt = ts - lastTime;
  lastTime = ts;
  dt = Math.min(dt, 50);

  if (started && !gameOver) {
    if (clearingLines) {
      if (ts - clearingLines.start >= LINE_CLEAR_DURATION) finishClearingLines();
    } else {
      handleInputRepeat(dt);
      pollGamepad();
      const isGrounded = current && collide(current.shape, current.x, current.y + 1);
      if (isGrounded) {
        lockTimer += dt;
        if (lockTimer >= LOCK_DELAY) lockPiece();
      } else {
        lockTimer = 0;
        dropAccum += dt;
        if (dropAccum >= dropInterval) {
          dropAccum = 0;
          current.y++;
          lastActionWasRotate = false;
        }
      }

      updateModeTimers(dt);

      ambientAccum += dt;
      if (ambientAccum >= 260) { ambientAccum = 0; spawnAmbientParticle(); }

      if (danger > 0.7) {
        dangerSoundAccum += dt;
        if (dangerSoundAccum > 1000) { dangerSoundAccum = 0; playSound('danger'); }
      } else {
        dangerSoundAccum = 0;
      }
    }
  }

  updateParticles(dt);
  updateDropTrails(dt);
  updateShockwaves(dt);
  updateScoreAnim(ts);
  danger += (dangerTarget - danger) * Math.min(1, dt / 300);
  applyDangerVisual();
  updateSpotlight();

  draw();

  if (!gameOver || particles.length > 0 || shockwaves.length > 0) {
    animId = requestAnimationFrame(loop);
  }
}

// ---- Arranque ----
function fitCanvasDPR(cnv, context, logicalW, logicalH) {
  const dpr = window.devicePixelRatio || 1;
  cnv.width = logicalW * dpr;
  cnv.height = logicalH * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function fitAllCanvases() {
  fitCanvasDPR(canvas, ctx, COLS * BLOCK, ROWS * BLOCK);
  fitCanvasDPR(nextCanvas, nextCtx, 100, 320);
  fitCanvasDPR(holdCanvas, holdCtx, 100, 100);
  if (started) { draw(); drawNextQueue(); drawHold(); }
}

window.addEventListener('resize', fitAllCanvases);

populateStartLevelSelect();
loadSettings();
loadHighscores();
applySettings();
fitAllCanvases();
showStartOverlay();
