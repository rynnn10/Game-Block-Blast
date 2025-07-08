// --- REFERENSI ELEMEN DOM ---
const mainMenu = document.getElementById("main-menu");
const startGameButton = document.getElementById("startGameButton");
const gameWrapper = document.getElementById("game-wrapper");
const menuToggleButton = document.getElementById("menu-toggle-button");
const inGameMenu = document.getElementById("in-game-menu");
const soundToggleButton = document.getElementById("soundToggleButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const closeMenuButton = document.getElementById("closeMenuButton");

const backgroundSound = document.getElementById("background-sound");
const placeSound = document.getElementById("place-sound");
const clearSound = document.getElementById("clear-sound");
const bombSound = document.getElementById("bomb-sound");
const gameoverSound = document.getElementById("gameover-sound");

const canvas = document.getElementById("gameCanvas");
const canvasWrapper = document.getElementById("canvas-wrapper");
const ctx = canvas.getContext("2d");
const scoreValueElem = document.getElementById("scoreValue");
const highScoreValueElem = document.getElementById("highScoreValue");
const previewBlocksContainer = document.getElementById(
  "previewBlocksContainer"
);
const restartButton = document.getElementById("restartButton");
const gameOverModal = document.getElementById("gameOverModal");
const finalScoreElem = document.getElementById("finalScore");
const modalHighScoreElem = document.getElementById("modalHighScore");
const modalRestartButton = document.getElementById("modalRestartButton");
const gameAreaDiv = document.querySelector(".game-area");
// [DITAMBAHKAN] Objek untuk menyimpan gambar yang sudah dimuat
const blockImages = {};
let imagesLoaded = false;
// --- STATE APLIKASI ---
let isSoundOn = true;

// --- KONFIGURASI GAME ---
const BOARD_SIZE = 8;
let BLOCK_SIZE = 40;
const GRID_COLOR = "#3a475a";
const EMPTY_CELL_COLOR = "#4a5568";
const HIGH_SCORE_KEY = "blockBlazeHighScore";
const BLOCK_SHAPES = [
  { shape: [[1, 1]], color: "#ed8936" },
  { shape: [[1], [1]], color: "#ed8936" },
  { shape: [[1, 1, 1]], color: "#ecc94b" },
  { shape: [[1], [1], [1]], color: "#ecc94b" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#48bb78",
  },
  {
    shape: [
      [1, 0],
      [1, 1],
    ],
    color: "#4299e1",
  },
  {
    shape: [
      [0, 1],
      [1, 1],
    ],
    color: "#4299e1",
  },
  {
    shape: [
      [1, 1],
      [1, 0],
    ],
    color: "#3b82f6",
  },
  {
    shape: [
      [1, 1],
      [0, 1],
    ],
    color: "#3b82f6",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "#a0aec0",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a0aec0",
  },
  { shape: [[1, 1, 1, 1]], color: "#667eea" },
  { shape: [[1], [1], [1], [1]], color: "#667eea" },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#ed64a6",
  },
  { shape: [[1]], color: "#f56565", type: "bomb", bombColor: "#2D3748" },
];

// --- VARIABEL STATE GAME ---
let board, currentBlocks, score, highScore, isGameOver, comboCounter;
let selectedBlockIndex, isDragging, ghostBlockPos;

// --- FUNGSI MENU DAN SUARA ---
function playSound(soundElement) {
  if (isSoundOn && soundElement) {
    soundElement.currentTime = 0;
    soundElement.play().catch((e) => console.error("Error playing sound:", e));
  }
}
function toggleSound() {
  isSoundOn = !isSoundOn;
  soundToggleButton.textContent = `Suara: ${isSoundOn ? "On" : "Off"}`;
  backgroundSound.muted = !isSoundOn;
}
function showInGameMenu() {
  inGameMenu.classList.remove("hidden");
}
function hideInGameMenu() {
  inGameMenu.classList.add("hidden");
}
function goBackToMainMenu() {
  hideInGameMenu();
  gameWrapper.classList.add("hidden");
  mainMenu.style.display = "flex";
  backgroundSound.pause();
  backgroundSound.currentTime = 0;
}
// [DIUBAH] Fungsi untuk memuat gambar dan mengaktifkan tombol start
function loadBlockImages() {
  const imageSources = {
    "#ed8936": "assets/orange_block.png",
    "#ecc94b": "assets/yellow_block.png",
    "#48bb78": "assets/green_block.png",
    "#4299e1": "assets/lightblue_block.png",
    "#3b82f6": "assets/blue_block.png",
    "#a0aec0": "assets/gray_block.png",
    "#667eea": "assets/indigo_block.png",
    "#ed64a6": "assets/pink_block.png",
    "#f56565": "assets/bom.png",
  };

  let loadedCount = 0;
  const totalImages = Object.keys(imageSources).length;

  // Nonaktifkan tombol saat memuat
  startGameButton.textContent = "Memuat Aset...";
  startGameButton.disabled = true;

  if (totalImages === 0) {
    imagesLoaded = true;
    startGameButton.textContent = "Mulai Game";
    startGameButton.disabled = false;
    return;
  }

  for (const color in imageSources) {
    const img = new Image();
    const imagePath = imageSources[color];
    img.src = imagePath;

    img.onload = () => {
      loadedCount++;
      blockImages[color] = img;
      if (loadedCount === totalImages) {
        imagesLoaded = true;
        console.log("Semua gambar berhasil dimuat!");
        // Aktifkan tombol setelah semua siap
        startGameButton.textContent = "Mulai Game";
        startGameButton.disabled = false;
      }
    };

    img.onerror = () => {
      console.error(`ERROR: Gagal memuat gambar dari path: "${imagePath}".`);
      // Tetap lanjutkan agar game tidak macet total
      loadedCount++;
      if (loadedCount === totalImages) {
        imagesLoaded = true;
        startGameButton.textContent = "Mulai Game (Error Aset)";
        startGameButton.disabled = false;
      }
    };
  }
}
// [DIUBAH] initGame kini lebih sederhana
function initGame() {
  board = Array(BOARD_SIZE)
    .fill(0)
    .map(() => Array(BOARD_SIZE).fill(0));
  comboCounter = 0;
  currentBlocks = [];
  score = 0;
  isGameOver = false;
  selectedBlockIndex = -1;
  isDragging = false;
  ghostBlockPos = { row: -1, col: -1 };
  highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0");
  gameOverModal.classList.remove("show");
  generateRandomBlocks();
  updateUI();
  drawBoard();
}

function updateUI() {
  scoreValueElem.textContent = score;
  highScoreValueElem.textContent = highScore;
  drawPreviewBlocks();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!imagesLoaded) {
    ctx.fillStyle = "white";
    ctx.font = "20px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Memuat gambar...", canvas.width / 2, canvas.height / 2);
    return;
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const x = c * BLOCK_SIZE;
      const y = r * BLOCK_SIZE;

      ctx.fillStyle = EMPTY_CELL_COLOR;
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

      const color = board[r][c];
      if (color !== 0 && blockImages[color]) {
        ctx.drawImage(blockImages[color], x, y, BLOCK_SIZE, BLOCK_SIZE);
      }

      ctx.strokeStyle = GRID_COLOR;
      ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  // Logika untuk ghost block
  if (isDragging && selectedBlockIndex !== -1 && ghostBlockPos.row !== -1) {
    const block = currentBlocks[selectedBlockIndex];
    if (block) {
      const shape = block.shape;
      // Gambar ghost block sebagai kotak semi-transparan
      ctx.fillStyle = `${block.color}80`;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const boardR = ghostBlockPos.row + r;
            const boardC = ghostBlockPos.col + c;
            if (boardR < BOARD_SIZE && boardC < BOARD_SIZE) {
              ctx.fillRect(
                boardC * BLOCK_SIZE,
                boardR * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
              );
            }
          }
        }
      }
    }
  }
}

function generateRandomBlocks() {
  currentBlocks = Array.from({ length: 3 }, () => {
    if (Math.random() < 0.05) {
      return { ...BLOCK_SHAPES.find((b) => b.type === "bomb"), placed: false };
    }
    const regularBlocks = BLOCK_SHAPES.filter((b) => !b.type);
    return {
      ...regularBlocks[Math.floor(Math.random() * regularBlocks.length)],
      placed: false,
    };
  });
}

function drawPreviewBlocks() {
  previewBlocksContainer.innerHTML = "";
  if (!imagesLoaded) return; // Jangan lakukan apa pun jika gambar belum siap

  currentBlocks.forEach((block, index) => {
    const blockDiv = document.createElement("div");
    blockDiv.className = "preview-block";
    if (block.placed) blockDiv.classList.add("placed");
    blockDiv.dataset.index = index;

    // Buat canvas sementara untuk menggambar bentuk blok
    const tempCanvas = document.createElement("canvas");
    const shape = block.shape;
    const cellSize = 12; // Ukuran sel untuk pratinjau
    tempCanvas.width = shape[0].length * cellSize;
    tempCanvas.height = shape.length * cellSize;
    const tempCtx = tempCanvas.getContext("2d");

    // Dapatkan gambar yang sesuai dengan warna blok
    const img = blockImages[block.color];

    // Gambar bentuk blok ke canvas sementara
    if (img) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            tempCtx.drawImage(
              img,
              c * cellSize,
              r * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
    }

    // Buat elemen img dan gunakan data canvas sebagai sumbernya
    const previewImage = new Image();
    previewImage.src = tempCanvas.toDataURL();
    previewImage.style.maxWidth = "100%";
    previewImage.style.maxHeight = "100%";

    blockDiv.appendChild(previewImage);
    previewBlocksContainer.appendChild(blockDiv);
  });
}

function isValidPlacement(blockShape, startRow, startCol) {
  for (let r = 0; r < blockShape.length; r++) {
    for (let c = 0; c < blockShape[r].length; c++) {
      if (blockShape[r][c]) {
        const boardR = startRow + r;
        const boardC = startCol + c;
        if (
          boardR >= BOARD_SIZE ||
          boardC >= BOARD_SIZE ||
          boardR < 0 ||
          boardC < 0 ||
          board[boardR]?.[boardC] !== 0
        )
          return false;
      }
    }
  }
  return true;
}

function placeBlock(blockIndex, startRow, startCol) {
  const block = currentBlocks[blockIndex];
  if (!block || block.placed) return false;

  if (block.type === "bomb") {
    if (
      startRow < 0 ||
      startRow >= BOARD_SIZE ||
      startCol < 0 ||
      startCol >= BOARD_SIZE
    )
      return false;
    detonateBomb(startRow, startCol);
    block.placed = true;
  } else {
    if (!isValidPlacement(block.shape, startRow, startCol)) {
      if (isDragging) {
        canvas.classList.add("shake");
        setTimeout(() => canvas.classList.remove("shake"), 300);
      }
      return false;
    }
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          board[startRow + r][startCol + c] = block.color;
        }
      }
    }
    playSound(placeSound);
    block.placed = true;
  }
  setTimeout(() => checkAndClearLines(true), 0);
  if (currentBlocks.every((b) => b.placed)) {
    generateRandomBlocks();
  }
  updateUI();
  setTimeout(checkGameOver, 50);
  return true;
}

function detonateBomb(row, col) {
  let cellsCleared = 0;
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] !== 0
      ) {
        board[r][c] = 0;
        cellsCleared++;
      }
    }
  }
  if (cellsCleared > 0) {
    playSound(bombSound);
    const bombScore = cellsCleared * 5;
    score += bombScore;
    showScorePopup(`+${bombScore}`, col * BLOCK_SIZE, row * BLOCK_SIZE);
  }
}

function showScorePopup(text, x, y) {
  const popup = document.createElement("div");
  popup.textContent = text;
  popup.className = "score-popup";
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  canvasWrapper.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

async function checkAndClearLines(isFirstClear = false) {
  if (isFirstClear) comboCounter = 0;
  let rowsToClear = [],
    colsToClear = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i].every((cell) => cell !== 0)) rowsToClear.push(i);
    if (board.every((row) => row[i] !== 0)) colsToClear.push(i);
  }
  const totalLines = rowsToClear.length + colsToClear.length;
  if (totalLines > 0) {
    comboCounter++;
    playSound(clearSound);
    let lineScore = 0;
    for (let i = 1; i <= totalLines; i++) lineScore += i * 10;
    const comboBonus = comboCounter > 1 ? (comboCounter - 1) * 10 : 0;
    const totalScoreGained = lineScore + comboBonus;
    score += totalScoreGained;
    const popupY = (rowsToClear[0] ?? 0) * BLOCK_SIZE;
    const popupX = (colsToClear[0] ?? BOARD_SIZE / 2) * BLOCK_SIZE;
    let popupText = `+${totalScoreGained}`;
    if (comboCounter > 1) popupText += ` (Kombo x${comboCounter}!)`;
    showScorePopup(popupText, popupX, popupY);
    rowsToClear.forEach((r) => board[r].fill(0));
    colsToClear.forEach((c) => board.forEach((row) => (row[c] = 0)));

    drawBoard();
    updateUI();

    await new Promise((res) => setTimeout(res, 50));
    await checkAndClearLines(false);
  }
}

function applyGravity() {
  let newBoard = Array(BOARD_SIZE)
    .fill(0)
    .map(() => Array(BOARD_SIZE).fill(0));
  let newRow = BOARD_SIZE - 1;
  for (let r = BOARD_SIZE - 1; r >= 0; r--) {
    if (board[r].some((cell) => cell !== 0)) {
      newBoard[newRow--] = [...board[r]];
    }
  }
  board = newBoard;
}

function checkGameOver() {
  if (isGameOver) return;
  const availableBlocks = currentBlocks.filter((b) => !b.placed);
  for (const block of availableBlocks) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (isValidPlacement(block.shape, r, c)) return;
      }
    }
  }
  isGameOver = true;
  playSound(gameoverSound);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
  }
  finalScoreElem.textContent = score;
  modalHighScoreElem.textContent = highScore;
  gameOverModal.classList.add("show");
}

function getEventCoordinates(e) {
  const touch = e.touches?.[0] || e.changedTouches?.[0];
  return touch
    ? { x: touch.clientX, y: touch.clientY }
    : { x: e.clientX, y: e.clientY };
}
function handleDragStart(e) {
  if (isGameOver) return;
  const target = e.target.closest(".preview-block");
  if (target && !target.classList.contains("placed")) {
    selectedBlockIndex = parseInt(target.dataset.index);
    isDragging = true;
    target.classList.add("selected");
    e.preventDefault();
  }
}
function handleDragMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  const { x, y } = getEventCoordinates(e);
  const canvasRect = canvas.getBoundingClientRect();
  const block = currentBlocks[selectedBlockIndex];
  if (!block) return;
  const mouseX = x - canvasRect.left;
  const mouseY = y - canvasRect.top;
  const blockWidth = block.shape[0].length * BLOCK_SIZE;
  const blockHeight = block.shape.length * BLOCK_SIZE;
  const ghostRow = Math.round((mouseY - blockHeight / 2) / BLOCK_SIZE);
  const ghostCol = Math.round((mouseX - blockWidth / 2) / BLOCK_SIZE);
  if (ghostBlockPos.row !== ghostRow || ghostBlockPos.col !== ghostCol) {
    ghostBlockPos = { row: ghostRow, col: ghostCol };
    drawBoard();
  }
}
function handleDragEnd(e) {
  if (!isDragging) return;
  placeBlock(selectedBlockIndex, ghostBlockPos.row, ghostBlockPos.col);
  const previewBlock = previewBlocksContainer.querySelector(
    `[data-index="${selectedBlockIndex}"]`
  );
  if (previewBlock) previewBlock.classList.remove("selected");
  isDragging = false;
  selectedBlockIndex = -1;
  ghostBlockPos = { row: -1, col: -1 };
  drawBoard();
}

// [DIPERBAIKI] Logika resize canvas disesuaikan dengan struktur HTML baru
function resizeCanvas() {
  const container = document.querySelector(".game-container");
  if (!container) return; // Guard clause jika container tidak ditemukan

  const containerStyle = getComputedStyle(container);
  let canvasSize;

  if (window.innerWidth < 768) {
    // Ambil elemen yang ada
    const scorePanel = document.querySelector(".score-panel");
    const previewPanel = document.querySelector(".preview-panel");
    const restartBtn = document.querySelector(".restart-button");

    // Pastikan semua elemen ada sebelum mengukur
    if (!scorePanel || !previewPanel || !restartBtn) return;

    const scorePanelHeight = scorePanel.offsetHeight;
    const previewPanelHeight = previewPanel.offsetHeight;
    const restartButtonHeight = restartBtn.offsetHeight;

    // Total gap antara 4 elemen adalah 3
    const totalGap = parseFloat(containerStyle.gap) * 3;
    const verticalPadding =
      parseFloat(containerStyle.paddingTop) +
      parseFloat(containerStyle.paddingBottom);

    const otherElementsHeight =
      scorePanelHeight + previewPanelHeight + restartButtonHeight + totalGap;

    const availableWidth =
      container.clientWidth -
      parseFloat(containerStyle.paddingLeft) -
      parseFloat(containerStyle.paddingRight);
    const availableHeight =
      container.clientHeight - otherElementsHeight - verticalPadding;

    canvasSize = Math.min(availableWidth, availableHeight);
  } else {
    // Logika untuk desktop
    const containerHeight =
      container.clientHeight -
      parseFloat(containerStyle.paddingTop) -
      parseFloat(containerStyle.paddingBottom);
    const scorePanel = document.querySelector(".score-panel");
    if (!scorePanel) return;
    const scorePanelHeight = scorePanel.offsetHeight;
    const gameArea = document.querySelector(".game-area"); // Diperlukan untuk gap di desktop
    canvasSize =
      containerHeight -
      scorePanelHeight -
      parseFloat(getComputedStyle(gameArea ?? container).gap);
  }

  canvasSize = Math.max(150, canvasSize); // Batas ukuran minimal
  canvasSize = Math.floor(canvasSize / BOARD_SIZE) * BOARD_SIZE;

  canvas.width = canvas.height = canvasSize;
  canvas.style.width = canvas.style.height = `${canvasSize}px`;

  BLOCK_SIZE = canvas.width / BOARD_SIZE;

  // Cek apakah gameStarted ada di scope global sebelum menggambar ulang
  if (window.gameStarted) {
    drawBoard();
    updateUI();
  }
}

// --- INISIALISASI ---
function setupGameEventListeners() {
  previewBlocksContainer.addEventListener("mousedown", handleDragStart);
  previewBlocksContainer.addEventListener("touchstart", handleDragStart, {
    passive: false,
  });
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchend", handleDragEnd);
  restartButton.addEventListener("click", initGame);
  modalRestartButton.addEventListener("click", initGame);
  window.addEventListener("resize", resizeCanvas);
}

// [DIUBAH] Alur inisialisasi utama
window.addEventListener("load", () => {
  // Langsung mulai memuat gambar saat halaman siap
  loadBlockImages();

  startGameButton.addEventListener("click", () => {
    mainMenu.style.display = "none";
    gameWrapper.classList.remove("hidden");
    if (isSoundOn) {
      backgroundSound.play();
    }
    // Cukup panggil initGame, karena gambar sudah pasti dimuat
    initGame();
    resizeCanvas();
  });

  // Setup event listener lainnya
  menuToggleButton.addEventListener("click", showInGameMenu);
  closeMenuButton.addEventListener("click", hideInGameMenu);
  soundToggleButton.addEventListener("click", toggleSound);
  backToMenuButton.addEventListener("click", goBackToMainMenu);
  setupGameEventListeners();
});
