# Connect Four

A two-player Connect Four game built with HTML, CSS, and JavaScript. No frameworks or canvas — the board and all interactions use the DOM.

## How to Run

Open `index.html` in a modern web browser. No build step or server required.

## How to Play

- **Goal:** Be the first to get four of your pieces in a row (horizontally, vertically, or diagonally).
- **Turns:** Player 1 (red) and Player 2 (yellow) take turns. Red goes first.
- **Drop a piece:** Click a column to drop your piece into the lowest empty slot in that column.

### Controls

| Input | Action |
|-------|--------|
| Mouse click | Drop piece in the clicked column |
| ← / → | Select column (updates hover preview) |
| Enter or Space | Drop piece in selected column |

## Features

- **Start screen** — Game does not begin until you click "Start Game".
- **Rules** — "How to Play" on the start screen and "?" during the game open a rules modal.
- **Score board** — Visible in the game view: total wins for each player, draws, and the last 10 results. Scores persist in `localStorage`.
- **Replay** — "New Game" starts a fresh round; "Back to menu" returns to the start screen.
- **Column hover preview** — Hovering a column shows a ghost piece where your piece will land.
- **Winning line highlight** — The four winning pieces are highlighted when someone wins.
- **Drop animation** — New pieces animate into place.
- **Keyboard support** — Arrow keys plus Enter/Space for column selection and drop.

## Tech Stack

- **HTML5** — Structure, semantic sections, ARIA where useful.
- **CSS3** — Layout (Flexbox, Grid), custom properties, animations, responsive behavior.
- **JavaScript (ES6+)** — Single `ConnectFour` class for game state and logic; DOM APIs and event listeners for UI.

## Project Structure

```
csc/
├── index.html   # Markup, start/game screens, rules modal, score board
├── styles.css   # Layout, theme, board, score board, animations
├── script.js    # ConnectFour class, board rendering, events, keyboard
└── README.md
```

## Browser Support

Works in current versions of Chrome, Firefox, Safari, and Edge. Requires JavaScript enabled and `localStorage` available for the score board.
