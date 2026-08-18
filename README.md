# Tetris

Implementación de **Tetris** en JavaScript vanilla, usando HTML5 Canvas y CSS. Sin dependencias externas, sin frameworks, sin proceso de build: solo abrir y jugar. Incluye mecánicas de nivel competitivo (SRS, T-Spins, hold, 7-bag), tres modos de juego, audio 100% sintetizado y un apartado visual con animaciones extremas: bloques 3D con glow dinámico, ondas de choque, estelas de caída, glitch en Game Over, perspectiva 3D que sigue al ratón y mucho más.

![Tech](https://img.shields.io/badge/HTML5-Canvas-orange)
![Tech](https://img.shields.io/badge/CSS3-blueviolet)
![Tech](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

---

## Tabla de contenidos

- [Tetris](#tetris)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el juego](#cómo-ejecutar-el-juego)
  - [Modos de juego](#modos-de-juego)
  - [Controles](#controles)
  - [Mecánicas](#mecánicas)
  - [Apartado visual y de audio](#apartado-visual-y-de-audio)
  - [Accesibilidad y opciones](#accesibilidad-y-opciones)
  - [Cómo funciona el código](#cómo-funciona-el-código)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Personalización](#personalización)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

Una versión de Tetris con las mecánicas del "Tetris Guideline" moderno además de un apartado de pulido visual muy por encima de un clon básico:

- Tablero de **10 × 20** con las 7 piezas estándar.
- **7-bag randomizer**: cada set de 7 piezas se reparte barajado, nunca hay rachas largas sin una pieza concreta.
- **Hold piece** (guardar pieza para más tarde).
- **SRS** (Super Rotation System) con tabla oficial de _wall kicks_.
- **T-Spin** y **Mini T-Spin** con detección por regla de las 3 esquinas y bonus de puntuación.
- **Lock delay** con reinicio limitado al mover/rotar (hasta 15 reinicios).
- **Back-to-back** y **combos** con multiplicador de puntuación.
- **DAS/ARR propio**: repetición de movimiento horizontal/soft-drop gestionada a mano, no depende del autorepeat del navegador.
- **All Clear / Perfect Clear** con bonus y celebración especial.
- Cola de **5 siguientes piezas** y panel de **hold**.
- **3 modos de juego**: Maratón, Sprint (40 líneas) y Ultra (2 minutos).
- **Highscores y opciones persistentes** en `localStorage`.
- **Audio** 100% sintetizado con la Web Audio API (sin ficheros externos).
- **Controles táctiles, mando (Gamepad API) y teclado**, canvas responsive.
- **Modo daltónico** (símbolo distintivo por pieza) y **4 temas de color**.

---

## Cómo ejecutar el juego

No hay nada que instalar ni compilar.

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

O con un servidor local (recomendado, para que `localStorage` funcione igual que en producción):

```bash
python3 -m http.server 8000
# o
npx serve .
```

Después abre `http://localhost:8000`.

---

## Modos de juego

| Modo | Descripción |
| --- | --- |
| **Maratón** | Clásico, sin fin. Sube de nivel cada 10 líneas. |
| **Sprint** | Limpia 40 líneas lo más rápido posible. Se cronometra el tiempo. |
| **Ultra** | 2 minutos para conseguir la máxima puntuación posible. |

El highscore de cada modo se guarda por separado en `localStorage`.

---

## Controles

| Tecla | Acción |
| --- | --- |
| `←` / `→` | Mover (con DAS/ARR propio) |
| `↑` / `X` | Rotar en sentido horario |
| `Z` / `Ctrl` | Rotar en sentido antihorario |
| `↓` | Soft drop |
| `Espacio` | Hard drop |
| `C` / `Shift` | Guardar pieza (hold) |
| `P` / `Esc` | Pausar / reanudar |

También disponible con **controles táctiles** (botones en pantalla + swipes) en dispositivos con puntero táctil, y con **mando** (Gamepad API): D-pad/stick para mover, botón inferior para rotar, gatillos para hard drop y hombros para hold.

---

## Mecánicas

- **7-bag** (`refillBag`, `game.js`): baraja `[1..7]` con Fisher-Yates y lo añade a la cola; garantiza que las 7 piezas aparezcan una vez cada 7 turnos.
- **SRS** (`ROTATION_SHAPES`, `JLSTZ_KICKS`, `I_KICKS`, `attemptRotate`): cada pieza tiene 4 matrices de rotación explícitas; al rotar se prueban hasta 5 desplazamientos (_kicks_) oficiales antes de descartar el giro.
- **T-Spin** (`detectTSpin`): tras una rotación que deja al T bloqueado, se comprueban las 4 esquinas de su caja 3×3; si 3 o más están ocupadas es T-Spin (completo si las dos esquinas del lado "apuntado" están llenas, si no, mini).
- **Lock delay** (`loop`, `onSuccessfulMove`): al tocar el suelo hay 500 ms de margen antes de fijar la pieza; moverla o rotarla con éxito reinicia ese margen, hasta 15 veces.
- **Combo / Back-to-back** (`finishClearingLines`): cada línea consecutiva sin fallar suma `50 × combo × nivel`; encadenar Tetrises o T-Spins con líneas da un multiplicador ×1.5.
- **Perfect Clear**: si el tablero queda completamente vacío tras una limpieza, bonus extra y confeti de partículas.
- **DAS/ARR** (`handleInputRepeat`, `dasState`): temporización manual (retardo inicial + repetición) en vez de depender del autorepeat del teclado del navegador.

---

## Apartado visual y de audio

Pensado para que cada acción tenga una respuesta sensorial exagerada:

- Bloques con gradiente/bisel 3D y glow dinámico en la pieza activa.
- Ghost piece con contorno punteado animado ("láser que respira").
- Estela de caída en el hard drop y squash & stretch al fijar cualquier pieza.
- Onda expansiva (shockwave), flash blanco, aberración cromática y "mega shake" en Tetris, T-Spin y Perfect Clear.
- Confeti de partículas (estrellas/diamantes) en Perfect Clear.
- Glitch/RGB-split en el título al perder.
- Vignette + spotlight que sigue a la pieza activa; perspectiva 3D del tablero que reacciona al ratón.
- Borde del tablero con degradado azul → rojo continuo según la altura de la pila ("peligro").
- Contador de puntuación animado (roll-up) y progresión de tono (hue-rotate) según el nivel.
- Partículas variadas (círculos, diamantes, estrellas, chispas) según el tipo de evento.
- Audio sintetizado con osciladores Web Audio (sin assets): mover, rotar, hold, drops, clears, Tetris, T-Spin, subida de nivel, peligro y Game Over.

---

## Accesibilidad y opciones

- **Controles táctiles** con botones en pantalla y gestos (swipe para mover/soft-drop, tap para rotar, swipe rápido hacia abajo para hard drop).
- **Canvas responsive**, escalado con `devicePixelRatio` para verse nítido en cualquier pantalla.
- **Modo daltónico**: dibuja un símbolo distintivo por tipo de pieza, no solo color.
- **4 temas visuales** (Aurora, Synthwave, Matrix, Mono) intercambiables desde el menú de opciones.
- **Control de volumen** y opciones persistentes en `localStorage`.

---

## Cómo funciona el código

El juego sigue siendo tres archivos que cooperan, sin build ni dependencias:

### 1. `index.html`
Estructura del tablero, panel lateral (score/lines/level/combo/hold/next), controles táctiles, y tres overlays: selección de modo, pausa/game over, y opciones.

### 2. `style.css`
Estética _dark / retro arcade_ con variables CSS de color (`--c1/--c2/--c3`) que permiten cambiar de tema sin tocar el resto de reglas, más todas las animaciones (`shake`, `megaShake`, `zoomPunch`, `glitchText`, `irisIn`, `comboPopMega`...).

### 3. `game.js`
Toda la lógica: tablero, piezas y SRS, sistema de partículas/estelas/shockwaves, puntuación y combos, audio sintetizado, entrada (teclado con DAS/ARR, táctil, mando), persistencia y el bucle principal (`loop`) basado en `requestAnimationFrame`.

---

## Tecnologías

- **HTML5** — tres `<canvas>` (tablero, hold, siguientes piezas).
- **CSS3** — variables de color, `color-mix()`, `backdrop-filter`, `clip-path`, animaciones.
- **JavaScript (ES6+) vanilla** — sin frameworks ni bundler.
- **Canvas 2D API** — todo el renderizado.
- **Web Audio API** — audio sintetizado, sin ficheros.
- **Gamepad API** — soporte de mando.
- **`localStorage`** — highscores y opciones.

**Sin dependencias.** No hay `package.json`, ni bundler, ni transpilador.

---

## Estructura del proyecto

```
├── index.html      # Estructura del DOM, overlays y canvases
├── style.css       # Estilos, temas y animaciones
├── game.js         # Toda la lógica del Tetris
└── README.md
```

---

## Personalización

| Constante | Significado | Por defecto |
| --- | --- | --- |
| `COLS` / `ROWS` | Tamaño del tablero | `10` / `20` |
| `BLOCK` | Tamaño lógico de cada celda (px) | `30` |
| `NEXT_COUNT` | Piezas visibles en la cola de "siguientes" | `5` |
| `LOCK_DELAY` | Margen antes de fijar una pieza apoyada (ms) | `500` |
| `DAS` / `ARR` | Retardo inicial / repetición del movimiento horizontal (ms) | `150` / `35` |
| `ULTRA_DURATION` | Duración del modo Ultra (ms) | `120000` |
| `LINE_SCORES` | Puntos por 1–4 líneas | `[0,100,300,500,800]` |

> Si cambias `COLS`, `ROWS` o `BLOCK`, recuerda ajustar `width`/`height` del `<canvas id="board">` en `index.html`.

---

## Licencia

Proyecto de uso libre con fines educativos y de práctica.
