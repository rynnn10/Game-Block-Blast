// --- REFERENSI ELEMEN DOM ---
const mainMenu = document.getElementById("main-menu");
const startGameButton = document.getElementById("startGameButton");
const gameWrapper = document.getElementById("game-wrapper");
const menuToggleButton = document.getElementById("menu-toggle-button");
const inGameMenu = document.getElementById("in-game-menu");
const soundToggleButton = document.getElementById("soundToggleButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const menuRestartButton = document.getElementById("menuRestartButton"); // [DITAMBAHKAN]

const backgroundSound = document.getElementById("background-sound");
const placeSound = document.getElementById("place-sound");
const clearSound = document.getElementById("clear-sound");
const bombSound = document.getElementById("bomb-sound");
const gameoverSound = document.getElementById("gameover-sound");
const comboSound = document.getElementById("combo-sound"); // [DITAMBAHKAN]

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
// [DITAMBAHKAN] Referensi untuk fitur info
const mainMenuInfoButton = document.getElementById("mainMenuInfoButton");
const inGameInfoButton = document.getElementById("inGameInfoButton");
const infoModal = document.getElementById("infoModal");
const closeInfoModalButton = document.getElementById("closeInfoModalButton");
const infoModalCloseIcon = document.getElementById("infoModalCloseIcon");

// [DITAMBAHKAN] Referensi untuk daftar skor tertinggi
const inGameHighScoreValue = document.getElementById("inGameHighScoreValue");
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
// script.js
const HIGH_SCORE_KEY = "blockBlazeHighScore";
// [DITAMBAHKAN] Kunci untuk menyimpan state game yang sedang berjalan
const GAME_STATE_KEY = "blockBlazeGameState";

// [DITAMBAHKAN] Fungsi untuk menyimpan state game saat ini
function saveGameState() {
  const gameState = {
    board: board,
    currentBlocks: currentBlocks,
    score: score,
    comboCounter: comboCounter,
  };
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
}

// [DITAMBAHKAN] Fungsi untuk memuat state game dari localStorage
function loadGameState() {
  const savedState = localStorage.getItem(GAME_STATE_KEY);
  if (savedState) {
    return JSON.parse(savedState);
  }
  return null;
}

// [DITAMBAHKAN] Fungsi untuk menghapus state game yang tersimpan
function clearGameState() {
  localStorage.removeItem(GAME_STATE_KEY);
}

// [DITAMBAHKAN] Fungsi untuk menampilkan modal info
function showInfoModal() {
  infoModal.classList.add("show");
}

// [DITAMBAHKAN] Fungsi untuk menyembunyikan modal info
function hideInfoModal() {
  infoModal.classList.remove("show");
}

const BLOCK_SHAPES = [
  // Bentuk mudah
  { shape: [[1, 1]], color: "#ed8936" },
  { shape: [[1], [1]], color: "#ed8936" },
  { shape: [[1, 1, 1]], color: "#ecc94b" },
  { shape: [[1], [1], [1]], color: "#ecc94b" },
  { shape: [[1, 1, 1, 1]], color: "#667eea" },
  { shape: [[1], [1], [1], [1]], color: "#667eea" },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#48bb78",
  }, // Kotak 2x2

  // Bentuk L sederhana
  {
    shape: [
      [1, 0],
      [1, 1],
    ],
    color: "#4299e1",
  },
  {
    shape: [
      [1, 1],
      [1, 0],
    ],
    color: "#4299e1",
  },
  {
    shape: [
      [0, 1],
      [1, 1],
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

  // Bom (tetap ada)
  { shape: [[1]], color: "#f56565", type: "bomb", bombColor: "#2D3748" },
  // [DITAMBAHKAN] Blok L 3x1 berbagai arah
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: "#a0aec0",
  },
  {
    shape: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: "#a0aec0",
  },
  {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: "#a0aec0",
  },
  {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: "#a0aec0",
  },
  // Letakkan bersama definisi blok lainnya di array BLOCK_SHAPES
  // [DITAMBAHKAN] Persegi 3x3
  {
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: "#48bb78",
  },
  // [DITAMBAHKAN] Persegi panjang 3x2 dan 2x3
  {
    shape: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: "#667eea",
  },
  {
    shape: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    color: "#667eea",
  },
  // [DITAMBAHKAN] Blok L 3x3
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    color: "#ed64a6",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#a0aec0",
  },
  {
    shape: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#a0aec0",
  },
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
function loadBlockImages(callback) {
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
        if (callback) {
          callback();
        }
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
        if (callback) {
          callback();
        }
      }
    };
  }
}
// [DIUBAH] initGame kini lebih sederhana
function initGame() {
  board = Array(BOARD_SIZE)
    .fill(0)
    .map(() => Array(BOARD_SIZE).fill(0));
  // [DITAMBAHKAN] Isi papan dengan beberapa blok acak di awal
  const initialBlockCount = Math.floor(Math.random() * 5) + 4; // 4-8 blok awal
  const availableColors = Object.keys(blockImages).filter(
    (c) => c !== "#f56565"
  ); // Semua warna kecuali bom

  for (let i = 0; i < initialBlockCount; i++) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    if (board[row][col] === 0) {
      const randomColor =
        availableColors[Math.floor(Math.random() * availableColors.length)];
      board[row][col] = { color: randomColor, multiplier: 1 };
    }
  }
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

// script.js
function updateUI() {
  scoreValueElem.textContent = score.toLocaleString("id-ID");
  highScoreValueElem.textContent = highScore.toLocaleString("id-ID");
  // [DITAMBAHKAN] Perbarui juga tampilan skor tertinggi di pojok layar
  if (inGameHighScoreValue) {
    inGameHighScoreValue.textContent = highScore.toLocaleString("id-ID");
  }
  drawPreviewBlocks();
}

function drawBoard(clearHint = { rows: [], cols: [] }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!imagesLoaded) {
    ctx.fillStyle = "white";
    ctx.font = "20px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Memuat gambar...", canvas.width / 2, canvas.height / 2);
    return;
  }
  if (clearHint.rows.length > 0 || clearHint.cols.length > 0) {
    ctx.fillStyle = "rgba(236, 201, 75, 0.3)"; // Warna kuning transparan
    clearHint.rows.forEach((r) =>
      ctx.fillRect(0, r * BLOCK_SIZE, canvas.width, BLOCK_SIZE)
    );
    clearHint.cols.forEach((c) =>
      ctx.fillRect(c * BLOCK_SIZE, 0, BLOCK_SIZE, canvas.height)
    );
  }
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const x = c * BLOCK_SIZE;
      const y = r * BLOCK_SIZE;

      ctx.fillStyle = EMPTY_CELL_COLOR;
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

      const cell = board[r][c];
      if (cell !== 0) {
        const color = cell.color;
        const multiplier = cell.multiplier;

        // Gambar balok seperti biasa
        if (blockImages[color]) {
          ctx.drawImage(blockImages[color], x, y, BLOCK_SIZE, BLOCK_SIZE);
        }

        // Jika ada pengganda, gambar angka di atasnya
        if (multiplier > 1) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE); // Lapisan gelap agar teks terbaca

          ctx.fillStyle = "#FFD700"; // Warna emas untuk angka
          ctx.font = `bold ${BLOCK_SIZE * 0.6}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `x${multiplier}`,
            x + BLOCK_SIZE / 2,
            y + BLOCK_SIZE / 2
          );
        }
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

// [DITAMBAHKAN] Fungsi baru untuk menurunkan nilai multiplier
function decayMultipliers(clearedCells) {
  // Terima argumen baru
  let multiplierDecayed = false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      const cellKey = `${r}-${c}`; // Buat kunci unik untuk posisi sel

      // Jika ada blok bonus DAN blok ini TIDAK termasuk yang baru saja dibersihkan
      if (cell && cell.multiplier > 1 && !clearedCells.has(cellKey)) {
        cell.multiplier--;
        multiplierDecayed = true;
      }
    }
  }

  if (multiplierDecayed) {
    drawBoard();
  }
}

function generateRandomBlocks() {
  // Coba cari blok yang dijamin bisa membersihkan baris/kolom
  const guaranteedBlocks = findGuaranteedClearBlocks();

  currentBlocks = Array.from({ length: 3 }, () => {
    // Tetap berikan sedikit kemungkinan untuk bom
    if (Math.random() < 0.05) {
      return { ...BLOCK_SHAPES.find((b) => b.type === "bomb"), placed: false };
    }

    let chosenBlock;
    if (guaranteedBlocks.length > 0) {
      // Jika ada blok solusi, pilih salah satunya secara acak
      chosenBlock =
        guaranteedBlocks[Math.floor(Math.random() * guaranteedBlocks.length)];
    } else {
      // FALLBACK: Jika tidak ada solusi sama sekali (papan sangat buntu)
      // Berikan blok kecil secara acak untuk memberi kesempatan
      console.warn(
        "Tidak ada solusi ditemukan. Memberikan blok kecil secara acak."
      );
      const smallBlocks = BLOCK_SHAPES.filter(
        (b) => !b.type && b.shape.flat().length <= 3
      );
      chosenBlock = smallBlocks[Math.floor(Math.random() * smallBlocks.length)];
    }

    return { ...chosenBlock, placed: false };
  });

  // Jika setelah semua logika di atas tidak ada blok (sangat jarang terjadi), panggil game over
  if (currentBlocks.some((b) => !b)) {
    isGameOver = true;
  }
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

async function placeBlock(blockIndex, startRow, startCol) {
  // [DIUBAH] Jadikan fungsi ini async
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
    score += 1; // [DITAMBAHKAN] Tambah 1 poin untuk meletakkan bom
    block.placed = true;
  } else {
    if (!isValidPlacement(block.shape, startRow, startCol)) {
      if (isDragging) {
        canvas.classList.add("shake");
        setTimeout(() => canvas.classList.remove("shake"), 300);
      }
      return false;
    }
    const isBonusBlock = Math.random() < 0.2;
    const bonusValue = isBonusBlock ? Math.floor(Math.random() * 2) + 6 : 1;
    const filledCells = [];
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          filledCells.push({ r, c });
        }
      }
    }
    let bonusCell = null;
    if (isBonusBlock && filledCells.length > 0) {
      bonusCell = filledCells[Math.floor(Math.random() * filledCells.length)];
    }
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          let currentMultiplier = 1;
          if (bonusCell && bonusCell.r === r && bonusCell.c === c) {
            currentMultiplier = bonusValue;
          }
          board[startRow + r][startCol + c] = {
            color: block.color,
            multiplier: currentMultiplier,
          };
        }
      }
    }
    playSound(placeSound);
    const blockSize = block.shape.flat().reduce((a, v) => a + v, 0);
    score += blockSize;
    block.placed = true;
  }

  // [DIUBAH] Logika async disederhanakan dan ditunggu (await)
  const clearResult = await checkAndClearLines(
    true,
    block.shape,
    startRow,
    startCol
  );
  decayMultipliers(clearResult.clearedCells);

  if (currentBlocks.every((b) => b.placed)) {
    generateRandomBlocks();
  }

  updateUI();
  setTimeout(checkGameOver, 50);

  // [DIUBAH] Pindahkan saveGameState ke paling akhir untuk memastikan semua perubahan (termasuk decay) tersimpan
  if (!isGameOver) {
    saveGameState();
  }

  return true;
}

// [DITAMBAHKAN] Fungsi untuk mengecek potensi clear
function checkPotentialClear(shape, startRow, startCol) {
  const tempBoard = JSON.parse(JSON.stringify(board));

  // Simulasikan penempatan blok
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        tempBoard[startRow + r][startCol + c] = 1; // Isi dengan nilai sementara
      }
    }
  }

  // Cek baris dan kolom yang penuh di papan sementara
  let rowsToClear = [],
    colsToClear = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (tempBoard[i].every((cell) => cell !== 0)) rowsToClear.push(i);
    if (tempBoard.every((row) => row[i] !== 0)) colsToClear.push(i);
  }
  return { rows: rowsToClear, cols: colsToClear };
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

// [DITAMBAHKAN] Fungsi baru untuk animasi garis
async function drawClearAnimation(rows, cols) {
  const duration = 250; // Durasi animasi dalam ms
  const startTime = Date.now();

  return new Promise((resolve) => {
    function animate() {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      drawBoard(); // Gambar ulang papan dasarnya

      ctx.save();
      ctx.lineWidth = 5 + progress * 10; // Garis menebal
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`; // Garis memudar
      ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
      ctx.shadowBlur = 15;

      // Gambar garis horizontal
      rows.forEach((r) => {
        const y = (r + 0.5) * BLOCK_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      });

      // Gambar garis vertikal
      cols.forEach((c) => {
        const x = (c + 0.5) * BLOCK_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      });

      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(animate);
  });
}

async function checkAndClearLines(
  isFirstClear = false,
  placedBlockShape = null,
  placedBlockRow = -1,
  placedBlockCol = -1
) {
  if (isFirstClear) {
    comboCounter = 0;
  }

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
    await drawClearAnimation(rowsToClear, colsToClear);

    const cellsToClearNow = new Set();
    rowsToClear.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) cellsToClearNow.add(`${r}-${c}`);
    });
    colsToClear.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) cellsToClearNow.add(`${r}-${c}`);
    });

    let currentMultiplier = 1;
    cellsToClearNow.forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      const cell = board[r][c];
      if (cell && cell.multiplier > 1) {
        currentMultiplier *= cell.multiplier;
      }
    });

    // ======================================================================
    // [LOGIKA SKOR BARU DITERAPKAN DI SINI]
    // ======================================================================

    // 1. Skor dasar dari jumlah sel yang hancur.
    let scoreFromClear = cellsToClearNow.size;

    // 2. Hitung sisa sel dari blok yang baru diletakkan yang tidak ikut hancur.
    let scoreFromRemainder = 0;
    if (placedBlockShape) {
      for (let r = 0; r < placedBlockShape.length; r++) {
        for (let c = 0; c < placedBlockShape[r].length; c++) {
          if (placedBlockShape[r][c]) {
            const boardR = placedBlockRow + r;
            const boardC = placedBlockCol + c;
            const cellKey = `${boardR}-${boardC}`;
            if (!cellsToClearNow.has(cellKey)) {
              scoreFromRemainder++;
            }
          }
        }
      }
    }

    // 3. Gabungkan semua komponen skor
    const baseScore = scoreFromClear + scoreFromRemainder;
    const comboBonus = comboCounter > 1 ? (comboCounter - 1) * 25 : 0;
    const totalScoreGained = (baseScore + comboBonus) * currentMultiplier;
    score += totalScoreGained;

    // ======================================================================

    const popupY = (rowsToClear[0] ?? 0) * BLOCK_SIZE;
    const popupX = (colsToClear[0] ?? BOARD_SIZE / 2) * BLOCK_SIZE;
    let popupText = `+${totalScoreGained.toLocaleString("id-ID")}`;
    if (currentMultiplier > 1) popupText += ` (Bonus x${currentMultiplier}!)`;
    if (comboCounter > 1) {
      popupText += ` (Kombo x${comboCounter}!)`;
      if (comboCounter > 1 && totalLines > 1) playSound(comboSound);
    }
    showScorePopup(popupText, popupX, popupY);

    rowsToClear.forEach((r) => board[r].fill(0));
    colsToClear.forEach((c) => board.forEach((row) => (row[c] = 0)));

    drawBoard();
    updateUI();
    await new Promise((res) => setTimeout(res, 50));

    const recursiveResult = await checkAndClearLines(false); // Panggilan rekursif tidak membawa info blok
    const allClearedCells = new Set([
      ...cellsToClearNow,
      ...recursiveResult.clearedCells,
    ]);

    return { cleared: true, clearedCells: allClearedCells };
  }

  return { cleared: false, clearedCells: new Set() };
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
  clearGameState(); // [DITAMBAHKAN] Hapus progres setelah game over
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

// [DITAMBAHKAN] Fungsi untuk mencari semua blok yang bisa membersihkan baris/kolom
function findGuaranteedClearBlocks() {
  const clearingBlocks = [];
  const checkedShapes = new Set(); // Untuk efisiensi, agar tidak mengecek bentuk yang sama berulang kali
  const allRegularBlocks = BLOCK_SHAPES.filter((b) => !b.type);

  // Iterasi melalui semua kemungkinan blok
  for (const block of allRegularBlocks) {
    const shapeKey = JSON.stringify(block.shape);
    if (checkedShapes.has(shapeKey)) continue; // Lewati jika bentuk ini sudah ditemukan solusinya

    // Iterasi melalui semua kemungkinan posisi di papan
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        // Jika blok bisa diletakkan di sini
        if (isValidPlacement(block.shape, r, c)) {
          // Cek apakah penempatan ini akan menghasilkan 'clear'
          const potential = checkPotentialClear(block.shape, r, c);
          if (potential.rows.length > 0 || potential.cols.length > 0) {
            clearingBlocks.push(block);
            checkedShapes.add(shapeKey);
            // Langsung hentikan pencarian untuk blok ini dan lanjut ke blok berikutnya
            r = BOARD_SIZE; // Trik untuk menghentikan loop luar
            break;
          }
        }
      }
    }
  }
  return clearingBlocks;
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
    // [DITAMBAHKAN] Cek potensi clear dan gambar ulang
    let clearHint = { rows: [], cols: [] };
    if (isValidPlacement(block.shape, ghostRow, ghostCol)) {
      clearHint = checkPotentialClear(block.shape, ghostRow, ghostCol);
    }
    drawBoard(clearHint);
  }
}
async function handleDragEnd(e) {
  // [DIUBAH] Jadikan fungsi ini async
  if (!isDragging) return;

  // [DIUBAH] Tunggu (await) sampai semua proses di placeBlock selesai
  await placeBlock(selectedBlockIndex, ghostBlockPos.row, ghostBlockPos.col);

  const previewBlock = previewBlocksContainer.querySelector(
    `[data-index="${selectedBlockIndex}"]`
  );
  if (previewBlock) previewBlock.classList.remove("selected");

  isDragging = false;
  selectedBlockIndex = -1;
  ghostBlockPos = { row: -1, col: -1 };

  // Gambar ulang papan dengan kondisi final yang sudah benar-benar diperbarui
  drawBoard();
}

// [DIPERBAIKI] Logika resize canvas disesuaikan dengan struktur HTML baru
// script.js
function resizeCanvas() {
  const container = document.querySelector(".game-container");
  if (!container) return; // Guard clause jika container tidak ditemukan

  const containerStyle = getComputedStyle(container);
  let canvasSize;

  // Untuk tampilan mobile (di bawah 738px)
  if (window.innerWidth < 738) {
    const scorePanel = document.querySelector(".score-panel");
    const previewPanel = document.querySelector(".preview-panel");

    // Pastikan elemen ada sebelum mengukur
    if (!scorePanel || !previewPanel) return;

    const scorePanelHeight = scorePanel.offsetHeight;
    const previewPanelHeight = previewPanel.offsetHeight;

    // DIPERBAIKI: Hanya ada 2 gap antara 3 elemen (skor, canvas, pratinjau)
    const totalGap = parseFloat(containerStyle.gap) * 2;
    const verticalPadding =
      parseFloat(containerStyle.paddingTop) +
      parseFloat(containerStyle.paddingBottom);

    // DIPERBAIKI: Menghapus tinggi tombol restart dari kalkulasi
    const otherElementsHeight =
      scorePanelHeight + previewPanelHeight + totalGap;

    const availableWidth =
      container.clientWidth -
      parseFloat(containerStyle.paddingLeft) -
      parseFloat(containerStyle.paddingRight);
    const availableHeight =
      container.clientHeight - otherElementsHeight - verticalPadding;

    canvasSize = Math.min(availableWidth, availableHeight);
  } else {
    // Untuk tampilan desktop (di atas 738px), logika grid lebih sederhana
    const containerHeight =
      container.clientHeight -
      parseFloat(containerStyle.paddingTop) -
      parseFloat(containerStyle.paddingBottom);
    const availableWidth = canvasWrapper.clientWidth;

    canvasSize = Math.min(containerHeight, availableWidth);
  }

  // Membersihkan nilai ukuran agar pas dengan grid
  canvasSize = Math.max(150, canvasSize); // Batas ukuran minimal
  canvasSize = Math.floor(canvasSize / BOARD_SIZE) * BOARD_SIZE; // Pastikan kelipatan dari BOARD_SIZE

  // Terapkan ukuran baru ke canvas
  canvas.width = canvas.height = canvasSize;
  BLOCK_SIZE = canvas.width / BOARD_SIZE;

  // Gambar ulang jika game sudah berjalan
  if (typeof drawBoard === "function") {
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
  modalRestartButton.addEventListener("click", initGame);
  menuRestartButton.addEventListener("click", () => {
    clearGameState(); // Hapus progres lama
    hideInGameMenu(); // Tutup menu dulu
    initGame(); // Baru mulai ulang game
  });
  window.addEventListener("resize", resizeCanvas);
}

// script.js
window.addEventListener("load", () => {
  // Setup event listener dasar terlebih dahulu
  mainMenuInfoButton.addEventListener("click", showInfoModal);
  inGameInfoButton.addEventListener("click", showInfoModal);
  closeInfoModalButton.addEventListener("click", hideInfoModal);
  infoModalCloseIcon.addEventListener("click", hideInfoModal);
  menuToggleButton.addEventListener("click", showInGameMenu);
  closeMenuButton.addEventListener("click", hideInGameMenu);
  soundToggleButton.addEventListener("click", toggleSound);
  backToMenuButton.addEventListener("click", goBackToMainMenu);
  setupGameEventListeners();

  // Coba muat state game yang ada
  const savedGame = loadGameState();

  if (savedGame) {
    // Jika ada game tersimpan, langsung masuk ke permainan
    board = savedGame.board;
    currentBlocks = savedGame.currentBlocks;
    score = savedGame.score;
    comboCounter = savedGame.comboCounter;
    isGameOver = false;
    highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0");
    selectedBlockIndex = -1;
    isDragging = false;
    ghostBlockPos = { row: -1, col: -1 };
    mainMenu.style.display = "none";
    gameWrapper.classList.remove("hidden");

    // Panggil fungsi untuk memuat aset visual
    loadBlockImages(() => {
      if (isSoundOn) backgroundSound.play();
      resizeCanvas();
      updateUI(); // Perbarui UI dengan data yang dimuat
      drawBoard();
    });
  } else {
    // Jika tidak ada game tersimpan, tampilkan menu utama seperti biasa
    loadBlockImages(); // Cukup panggil untuk memuat aset di latar belakang
    initGame(); // [DITAMBAHKAN] Siapkan game baru di latar belakang
  }

  // Event listener untuk memulai game BARU dari menu utama
  // Event listener untuk tombol "Mulai Game" atau "Lanjutkan"
  startGameButton.addEventListener("click", () => {
    // Tombol ini sekarang hanya bertugas menampilkan layar game
    mainMenu.style.display = "none";
    gameWrapper.classList.remove("hidden");
    if (isSoundOn) backgroundSound.play();

    // Papan digambar ulang dengan state yang ada (baik baru maupun lanjutan)
    resizeCanvas();
  });
});
