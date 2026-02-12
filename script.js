// Connect Four, no canvas

const ROWS = 6;
const COLS = 7;

const MAX_HISTORY = 10;

class ConnectFour {
  constructor() {
    this.board = [];
    this.currentPlayer = 1;
    this.gameOver = false;
    this.wins = { 1: 0, 2: 0 };
    this.draws = 0;
    this.history = [];
    this.loadScoreBoard();
  }

  loadScoreBoard() {
    try {
      const saved = localStorage.getItem('connect4-scoreboard'); // persist across sessions
      if (saved) {
        const o = JSON.parse(saved);
        this.wins[1] = o.p1 ?? 0;
        this.wins[2] = o.p2 ?? 0;
        this.draws = o.draws ?? 0;
        this.history = Array.isArray(o.history) ? o.history : [];
      }
    } catch (_) {}
  }

  saveScoreBoard() {
    try {
      localStorage.setItem('connect4-scoreboard', JSON.stringify({
        p1: this.wins[1],
        p2: this.wins[2],
        draws: this.draws,
        history: this.history.slice(-MAX_HISTORY)
      }));
    } catch (_) {}
  }

  recordResult(winner) {
    if (winner === 1 || winner === 2) {
      this.wins[winner]++;
    } else {
      this.draws++;
    }
    this.history.push(winner);
    if (this.history.length > MAX_HISTORY) this.history.shift();
    this.saveScoreBoard();
  }

  resetScoreBoard() {
    this.wins = { 1: 0, 2: 0 };
    this.draws = 0;
    this.history = [];
    this.saveScoreBoard();
  }

  initBoard() {
    this.board = [];
    for (let r = 0; r < ROWS; r++) {
      this.board[r] = [];
      for (let c = 0; c < COLS; c++) {
        this.board[r][c] = 0;
      }
    }
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winningLine = null;
  }

  getLowestRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) return r;
    }
    return -1;
  }

  drop(col) {
    if (this.gameOver) return false;
    const row = this.getLowestRow(col);
    if (row < 0) return false;
    this.board[row][col] = this.currentPlayer;
    return { row, col };
  }

  // used for highlighting the 4 winning pieces
  getWinningLine(row, col) {
    const p = this.currentPlayer;
    const line = (dr, dc) => {
      const cells = [{ row, col }];
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === p) {
        cells.push({ row: r, col: c });
        r += dr; c += dc;
      }
      r = row - dr; c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === p) {
        cells.unshift({ row: r, col: c });
        r -= dr; c -= dc;
      }
      return cells.length >= 4 ? cells.slice(0, 4) : null;
    };
    return line(0, 1) || line(1, 0) || line(1, 1) || line(1, -1);
  }

  checkWin(row, col) {
    return this.getWinningLine(row, col) !== null;
  }

  isDraw() {
    for (let c = 0; c < COLS; c++) {
      if (this.board[0][c] === 0) return false;
    }
    return true;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }
}

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const boardContainer = document.getElementById('board-container');
const boardEl = document.getElementById('board');
const turnDisplayEl = document.getElementById('turn-display');
const messageEl = document.getElementById('game-message');
const rulesModal = document.getElementById('rules-modal');
const winsP1El = document.getElementById('wins-p1');
const winsP2El = document.getElementById('wins-p2');
const drawsEl = document.getElementById('draws-count');
const historyListEl = document.getElementById('score-history-list');

const game = new ConnectFour();

function showScreen(screen) {
  startScreen.classList.toggle('hidden', screen !== 'start');
  gameScreen.classList.toggle('hidden', screen !== 'game');
}

function renderBoard(lastDrop, winningLine) {
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--rows', ROWS);
  boardEl.style.setProperty('--cols', COLS);
  const winSet = winningLine ? new Set(winningLine.map(({ row, col }) => `${row},${col}`)) : null; // fast lookup for winning cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute('role', 'gridcell');
      const slot = document.createElement('div');
      slot.className = 'slot';
      const val = game.board[r][c];
      if (val === 1) slot.classList.add('player1');
      else if (val === 2) slot.classList.add('player2');
      if (winSet && winSet.has(`${r},${c}`)) slot.classList.add('winning');
      if (lastDrop && lastDrop.row === r && lastDrop.col === c) slot.classList.add('just-dropped');
      cell.appendChild(slot);
      boardEl.appendChild(cell);
    }
  }
  updateColumnPreview();
}

function updateTurnDisplay() {
  if (game.gameOver) return;
  turnDisplayEl.textContent = `Player ${game.currentPlayer}'s turn`;
  turnDisplayEl.className = `turn player${game.currentPlayer}`;
}

function showMessage(text, isWin) {
  messageEl.textContent = text;
  messageEl.className = isWin ? 'game-message win' : 'game-message';
  messageEl.classList.remove('hidden');
}

function hideMessage() {
  messageEl.classList.add('hidden');
}

function updateScoreBoard() {
  winsP1El.textContent = game.wins[1];
  winsP2El.textContent = game.wins[2];
  drawsEl.textContent = game.draws;
  historyListEl.innerHTML = '';
  if (game.history.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'history-empty';
    empty.textContent = 'No games yet';
    historyListEl.appendChild(empty);
  } else {
    const reversed = [...game.history].reverse();
    for (const result of reversed) {
      const li = document.createElement('li');
      li.className = result === 1 ? 'result-p1' : result === 2 ? 'result-p2' : 'result-draw';
      li.textContent = result === 1 ? 'Player 1 won' : result === 2 ? 'Player 2 won' : 'Draw';
      historyListEl.appendChild(li);
    }
  }
}

function handleColumnClick(col) {
  const result = game.drop(col);
  if (!result) return;
  const { row } = result;
  let winningLine = null;
  if (game.checkWin(row, col)) {
    game.gameOver = true;
    winningLine = game.getWinningLine(row, col);
    game.recordResult(game.currentPlayer);
    updateScoreBoard();
    showMessage(`Player ${game.currentPlayer} wins!`, true);
    updateTurnDisplay();
  } else if (game.isDraw()) {
    game.gameOver = true;
    game.recordResult('draw');
    updateScoreBoard();
    showMessage("It's a draw!", false);
    updateTurnDisplay();
  } else {
    game.switchPlayer();
    updateTurnDisplay();
  }
  renderBoard(result, winningLine);
}

let previewCol = null;   // hover ghost
let selectedCol = Math.floor(COLS / 2);

function updateColumnPreview() {
  boardEl.querySelectorAll('.slot.drop-preview').forEach((slot) => {
    slot.classList.remove('drop-preview', 'player1', 'player2');
  });
  if (previewCol === null || game.gameOver) return;
  const row = game.getLowestRow(previewCol);
  if (row < 0) return;
  const cell = boardEl.querySelector(`.cell[data-row="${row}"][data-col="${previewCol}"]`);
  if (cell) {
    const slot = cell.querySelector('.slot');
    if (slot && !slot.classList.contains('player1') && !slot.classList.contains('player2')) {
      slot.classList.add('drop-preview', `player${game.currentPlayer}`);
    }
  }
}

function setupBoardListeners() {
  boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell || game.gameOver) return;
    const col = parseInt(cell.dataset.col, 10);
    handleColumnClick(col);
  });
  boardEl.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) {
      previewCol = parseInt(cell.dataset.col, 10);
      updateColumnPreview();
    }
  });
  boardEl.addEventListener('mouseleave', () => {
    previewCol = null;
    updateColumnPreview();
  });
}

function startGame() {
  game.initBoard();
  hideMessage();
  previewCol = null;
  selectedCol = Math.floor(COLS / 2);
  renderBoard();
  updateTurnDisplay();
  updateScoreBoard();
  showScreen('game');
}

function openRules() {
  rulesModal.classList.remove('hidden');
}

function closeRules() {
  rulesModal.classList.add('hidden');
}

// --- Event bindings ---

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-back-menu').addEventListener('click', () => showScreen('start'));
document.getElementById('btn-replay').addEventListener('click', startGame);
document.getElementById('btn-rules').addEventListener('click', openRules);
document.getElementById('btn-help').addEventListener('click', openRules);
document.getElementById('btn-close-rules').addEventListener('click', closeRules);
document.getElementById('btn-reset-scores').addEventListener('click', () => {
  game.resetScoreBoard();
  updateScoreBoard();
});

rulesModal.addEventListener('click', (e) => {
  if (e.target === rulesModal) closeRules();
});

document.addEventListener('keydown', (e) => {
  if (gameScreen.classList.contains('hidden') || !rulesModal.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') {
    selectedCol = Math.max(0, selectedCol - 1);
    previewCol = selectedCol;
    updateColumnPreview();
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    selectedCol = Math.min(COLS - 1, selectedCol + 1);
    previewCol = selectedCol;
    updateColumnPreview();
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleColumnClick(selectedCol);
  }
});

game.initBoard();
updateScoreBoard();
renderBoard();
setupBoardListeners();
