// --- REFERENSI ELEMEN DOM ---
const mainMenu = document.getElementById("main-menu");
const startGameButton = document.getElementById("startGameButton");
const continueGameButton = document.getElementById("continueGameButton"); // [TAMBAHKAN INI]
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
const goodSound = document.getElementById("goodSound");
const greatSound = document.getElementById("greatSound");
const unbelievableSound = document.getElementById("unbelievableSound");
const errorSound = document.getElementById("error-sound"); // [TAMBAHKAN INI]

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
// [TAMBAHKAN KODE INI]
const topBarHighScore = document.getElementById("top-bar-highscore");
const highScoresModal = document.getElementById("highScoresModal");
const closeHighScoresModal = document.getElementById("closeHighScoresModal");
const highScoresListModal = document.getElementById("highScoresListModal");
const resetScoresButtonModal = document.getElementById(
  "resetScoresButtonModal"
);
const topBarHighScoreValue = topBarHighScore.querySelector("span");
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
const HIGH_SCORES_KEY = "blockBlazeHighScores"; // Ganti nama key

// [FUNGSI BARU]
function showHighScoresModal() {
  displayHighScores(); // Pastikan data terbaru ditampilkan
  highScoresModal.classList.add("show");
}

function hideHighScoresModal() {
  highScoresModal.classList.remove("show");
}

// [FUNGSI BARU]
function loadHighScores() {
  const scoresJSON = localStorage.getItem(HIGH_SCORES_KEY);
  return scoresJSON ? JSON.parse(scoresJSON) : [];
}

// [FUNGSI BARU]
function saveNewHighScore(newScore) {
  let scores = loadHighScores();
  scores.push(newScore);
  scores.sort((a, b) => b - a); // Urutkan dari tertinggi
  const topScores = scores.slice(0, 5); // Ambil 5 teratas
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topScores));
  return topScores;
}

// Ganti fungsi displayHighScores yang lama dengan ini:
function displayHighScores() {
  const scores = loadHighScores();

  // Perbarui nilai di ikon pojok kiri atas
  const topScore = scores.length > 0 ? scores[0] : 0;
  topBarHighScoreValue.textContent = topScore.toLocaleString("id-ID");

  // Perbarui daftar di dalam modal
  highScoresListModal.innerHTML = ""; // Kosongkan daftar lama

  if (scores.length === 0) {
    highScoresListModal.innerHTML = "<li>Belum ada skor</li>";
  } else {
    scores.forEach((score, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span style="color: var(--accent-yellow); margin-right: 1rem;">${
        index + 1
      }.</span> ${score.toLocaleString("id-ID")}`;
      highScoresListModal.appendChild(li);
    });
  }
}
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
  // [BLOK BARU DITAMBAHKAN] Blok lurus panjang untuk meningkatkan peluang kombo
  { shape: [[1, 1, 1, 1]], color: "#667eea" }, // Lurus 1x4
  { shape: [[1], [1], [1], [1]], color: "#667eea" }, // Lurus 4x1
  { shape: [[1, 1, 1, 1, 1]], color: "#ed64a6" }, // Lurus 1x5
  { shape: [[1], [1], [1], [1], [1]], color: "#ed64a6" }, // Lurus 5x1
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

  // [PERBAIKAN] Cek kembali state game saat kembali ke menu
  const savedGame = loadGameState();
  if (savedGame) {
    continueGameButton.classList.remove("hidden");
  } else {
    continueGameButton.classList.add("hidden");
  }
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
  // Inisialisasi papan dengan array 2D yang benar
  board = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(0));

  comboCounter = 0;
  score = 0;
  isGameOver = false;
  selectedBlockIndex = -1;
  isDragging = false;
  ghostBlockPos = { row: -1, col: -1 };

  // Muat high score dari localStorage
  const scores = loadHighScores();
  highScore = scores.length > 0 ? scores[0] : 0; // Ambil skor teratas dari array

  // Sembunyikan modal game over jika terbuka
  gameOverModal.classList.remove("show");

  // Generate blok awal
  generateRandomBlocks();

  // Update UI dan gambar papan
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
      if (board[r][c] !== 0) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
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
  const placeableBlocks = findPlaceableBlocks();

  if (placeableBlocks.length === 0 && currentBlocks.every((b) => b.placed)) {
    isGameOver = true;
    gameOverModal.classList.add("show");
    return;
  }

  // --- LOGIKA ANTI-BUNTU (TETAP SAMA) ---
  let filledCells = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) filledCells++;
    }
  }
  const fullness = filledCells / (BOARD_SIZE * BOARD_SIZE);
  const DANGER_THRESHOLD = 0.65;
  let blockPool = [];

  if (fullness > DANGER_THRESHOLD) {
    const rescueBlocks = placeableBlocks.filter(
      (b) => b.shape.flat().reduce((a, v) => a + v, 0) <= 2
    );
    if (rescueBlocks.length > 0) {
      blockPool = rescueBlocks;
    }
  }

  // --- LOGIKA PRIORITAS KOMBO (TETAP SAMA) ---
  if (blockPool.length === 0) {
    const guaranteedTiers = findGuaranteedClearBlocks(placeableBlocks);
    if (guaranteedTiers.unbelievable.length > 0) {
      blockPool = guaranteedTiers.unbelievable;
    } else if (guaranteedTiers.great.length > 0) {
      blockPool = guaranteedTiers.great;
    } else if (guaranteedTiers.good.length > 0) {
      blockPool = guaranteedTiers.good;
    } else {
      blockPool = placeableBlocks;
    }
  }

  if (blockPool.length === 0) {
    isGameOver = true;
    gameOverModal.classList.add("show");
    return;
  }

  // --- [LOGIKA BARU] MENCEGAH DUPLIKAT DAN BLOK SPESIAL BERUNTUN ---
  currentBlocks = [];
  let specialBlockSpawned = false; // Penanda agar blok spesial hanya muncul sekali
  const tempPool = [...blockPool]; // Salin pool agar bisa dimodifikasi

  for (let i = 0; i < 3; i++) {
    let chosenBlock;
    const rand = Math.random();

    // Peluang 7% untuk mendapatkan bom, HANYA jika belum ada blok spesial lain
    if (!specialBlockSpawned && rand < 0.07) {
      const bombBlock = BLOCK_SHAPES.find((b) => b.type === "bomb");
      if (bombBlock) {
        chosenBlock = bombBlock;
        specialBlockSpawned = true; // Set penanda
      }
    }

    // Jika tidak dapat blok spesial, ambil dari pool biasa
    if (!chosenBlock) {
      if (tempPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        chosenBlock = tempPool[randomIndex];
        // Hapus blok yang sudah dipilih dari pool sementara untuk mengurangi duplikat
        tempPool.splice(randomIndex, 1);
      } else {
        // Jika pool sementara habis, ambil lagi dari pool utama
        const randomIndex = Math.floor(Math.random() * blockPool.length);
        chosenBlock = blockPool[randomIndex];
      }
    }

    currentBlocks.push({ ...chosenBlock, placed: false });
  }

  updateUI();
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
  // Pastikan startRow dan startCol valid
  if (startRow < 0 || startCol < 0) return false;

  // Hitung ujung bawah dan kanan blok
  const endRow = startRow + blockShape.length;
  const endCol = startCol + blockShape[0].length;

  // Jika melebihi batas papan
  if (endRow > BOARD_SIZE || endCol > BOARD_SIZE) return false;

  // Periksa setiap sel blok
  for (let r = 0; r < blockShape.length; r++) {
    for (let c = 0; c < blockShape[r].length; c++) {
      if (blockShape[r][c]) {
        const boardR = startRow + r;
        const boardC = startCol + c;

        // Periksa apakah sel di papan sudah terisi
        // Pastikan kita memeriksa board[boardR] dan board[boardR][boardC] ada
        if (
          boardR >= BOARD_SIZE ||
          boardC >= BOARD_SIZE ||
          !board[boardR] ||
          board[boardR][boardC] !== 0
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

async function placeBlock(blockIndex, startRow, startCol) {
  try {
    const block = currentBlocks[blockIndex];
    if (!block || block.placed) return false;

    if (block.type === "bomb") {
      // Logika untuk bom
      if (
        startRow < 0 ||
        startRow >= BOARD_SIZE ||
        startCol < 0 ||
        startCol >= BOARD_SIZE
      ) {
        return false;
      }
      // [PERBAIKAN] Tambahkan pengecekan apakah petak target kosong
      if (board[startRow][startCol] !== 0) {
        return false; // Batalkan jika petak sudah terisi
      }
      detonateBomb(startRow, startCol);
      score += 1;
      block.placed = true;
    } else {
      // Logika untuk blok biasa
      if (!isValidPlacement(block.shape, startRow, startCol)) {
        if (isDragging) {
          playSound(errorSound); // [TAMBAHKAN INI] Mainkan suara error
          canvas.classList.add("shake");
          setTimeout(() => canvas.classList.remove("shake"), 300);
        }
        return false;
      }

      // [LOGIKA DIUBAH 1/3]
      // Tempatkan blok ke papan dengan multiplier default 1.
      // Peluang bonus akan diterapkan NANTI setelah clear.
      for (let r = 0; r < block.shape.length; r++) {
        for (let c = 0; c < block.shape[r].length; c++) {
          if (block.shape[r][c]) {
            board[startRow + r][startCol + c] = {
              color: block.color,
              multiplier: 1,
            };
          }
        }
      }

      playSound(placeSound);
      const blockSize = block.shape.flat().reduce((a, v) => a + v, 0);
      score += blockSize;
      block.placed = true;
    }

    // Periksa dan bersihkan garis, dan dapatkan daftar sel yang terhapus
    const clearResult = await checkAndClearLines(
      block.shape,
      startRow,
      startCol
    );
    if (!clearResult.cleared) {
      comboCounter = 0;
    }

    // [LOGIKA DIUBAH 2/3]
    // Setelah clear, terapkan peluang multiplier HANYA pada sel yang selamat.
    if (block.type !== "bomb") {
      for (let r = 0; r < block.shape.length; r++) {
        for (let c = 0; c < block.shape[r].length; c++) {
          if (block.shape[r][c]) {
            const boardR = startRow + r;
            const boardC = startCol + c;
            const cellKey = `${boardR}-${boardC}`;

            if (!clearResult.clearedCells.has(cellKey)) {
              // [DIUBAH] Logika peluang berjenjang untuk multiplier
              const rand = Math.random();
              let newMultiplier = 1;

              // Peluang 2% untuk menjadi x7 (sangat langka)
              if (rand < 0.02) {
                newMultiplier = 7;
                // Peluang 5% berikutnya untuk menjadi x6 (langka)
              } else if (rand < 0.07) {
                newMultiplier = 6;
                // Peluang 10% berikutnya untuk menjadi x3 (cukup sering)
              } else if (rand < 0.17) {
                newMultiplier = 3;
                // Peluang 18% berikutnya untuk menjadi x2 (sering)
              } else if (rand < 0.35) {
                newMultiplier = 2;
              }

              if (newMultiplier > 1) {
                // Pastikan sel masih ada di papan sebelum diubah
                if (board[boardR] && board[boardR][boardC]) {
                  board[boardR][boardC].multiplier = newMultiplier;
                }
              }
            }
          }
        }
      }
    }

    // [LOGIKA DIUBAH 3/3]
    // Panggil decayMultipliers SETELAH semua proses di atas selesai.
    decayMultipliers(clearResult.clearedCells);

    if (currentBlocks.every((b) => b.placed)) {
      generateRandomBlocks();
    }

    updateUI();
    // Panggil drawBoard lagi untuk memastikan multiplier baru tergambar
    drawBoard();
    setTimeout(checkGameOver, 50);

    if (!isGameOver) {
      saveGameState();
    }

    return true;
  } catch (error) {
    console.error("Error in placeBlock:", error);
    return false;
  }
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
  placedBlockShape = null,
  placedBlockRow = -1,
  placedBlockCol = -1
) {
  let rowsToClear = [],
    colsToClear = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i].every((cell) => cell !== 0)) rowsToClear.push(i);
    if (board.every((row) => row[i] !== 0)) colsToClear.push(i);
  }

  const totalLines = rowsToClear.length + colsToClear.length;

  if (totalLines > 0) {
    comboCounter++;
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
    let soundPlayed = false;
    // Prioritas utama: clear multi-baris sekaligus
    if (totalLines >= 4) {
      playSound(unbelievableSound);
      soundPlayed = true;
    } else if (totalLines === 3) {
      playSound(greatSound);
      soundPlayed = true;
    } else if (totalLines === 2) {
      playSound(goodSound);
      soundPlayed = true;
    }

    // Jika tidak ada clear multi-baris, cek apakah ini sebuah combo beruntun
    if (!soundPlayed && comboCounter >= 2) {
      playSound(goodSound); // Beri reward "Good!" untuk streak
      soundPlayed = true;
    }

    // Jika tidak ada yang spesial, putar suara clear biasa
    if (!soundPlayed) {
      playSound(clearSound);
    }

    // Tampilkan popup (logika ini tetap sama)
    let popupText = `+${totalScoreGained.toLocaleString("id-ID")}`;
    if (currentMultiplier > 1) popupText += ` (Bonus x${currentMultiplier}!)`;
    if (comboCounter > 1) {
      popupText += ` (Kombo x${comboCounter}!)`;
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

function findPlaceableBlocks() {
  const placeable = [];

  // Filter hanya blok reguler (bukan bom)
  const allRegularBlocks = BLOCK_SHAPES.filter((b) => !b.type);

  for (const block of allRegularBlocks) {
    let canPlace = false;

    // Cari semua posisi yang mungkin untuk blok ini
    outerLoop: for (let r = 0; r <= BOARD_SIZE - block.shape.length; r++) {
      for (let c = 0; c <= BOARD_SIZE - block.shape[0].length; c++) {
        if (isValidPlacement(block.shape, r, c)) {
          canPlace = true;
          break outerLoop;
        }
      }
    }

    if (canPlace) {
      placeable.push(block);
    }
  }

  return placeable;
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
  // [LOGIKA DIUBAH]
  const updatedHighScores = saveNewHighScore(score);
  const newHighScore = updatedHighScores.length > 0 ? updatedHighScores[0] : 0;

  finalScoreElem.textContent = score.toLocaleString("id-ID");
  modalHighScoreElem.textContent = newHighScore.toLocaleString("id-ID");
  highScoreValueElem.textContent = newHighScore.toLocaleString("id-ID");

  gameOverModal.classList.add("show");
  clearGameState();
  displayHighScores(); // Perbarui tampilan di menu utama setelah game over
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

function findGuaranteedClearBlocks(blocksToCheck) {
  const clearingBlocks = {
    unbelievable: [], // Untuk clear >= 4 baris
    great: [], // Untuk clear 3 baris
    good: [], // Untuk clear 1-2 baris
  };
  const checkedShapes = new Set();

  for (const block of blocksToCheck) {
    const shapeKey = JSON.stringify(block.shape);
    if (checkedShapes.has(shapeKey)) continue;

    let bestClearForThisShape = 0;
    let bestBlockData = null;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (isValidPlacement(block.shape, r, c)) {
          const potential = checkPotentialClear(block.shape, r, c);
          const totalClear = potential.rows.length + potential.cols.length;

          if (totalClear > bestClearForThisShape) {
            bestClearForThisShape = totalClear;
            bestBlockData = block;
          }
        }
      }
    }

    if (bestBlockData) {
      // [LOGIKA DIPERBAIKI] AI kini lebih agresif mencari kombo besar
      if (bestClearForThisShape >= 4) {
        // Mencakup 4, 5, 6, dst.
        clearingBlocks.unbelievable.push(bestBlockData);
      } else if (bestClearForThisShape === 3) {
        clearingBlocks.great.push(bestBlockData);
      } else if (bestClearForThisShape > 0) {
        clearingBlocks.good.push(bestBlockData);
      }
      checkedShapes.add(shapeKey);
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

  // Hitung posisi mouse relatif terhadap canvas
  const mouseX = x - canvasRect.left;
  const mouseY = y - canvasRect.top;

  // Pastikan mouse berada dalam canvas
  if (
    mouseX < 0 ||
    mouseY < 0 ||
    mouseX > canvas.width ||
    mouseY > canvas.height
  ) {
    ghostBlockPos = { row: -1, col: -1 };
    drawBoard();
    return;
  }

  // Hitung posisi grid
  const ghostCol = Math.floor(mouseX / BLOCK_SIZE);
  const ghostRow = Math.floor(mouseY / BLOCK_SIZE);

  // Sesuaikan posisi berdasarkan ukuran blok
  const blockHeight = block.shape.length;
  const blockWidth = block.shape[0].length;

  // Adjust position so block doesn't go off the board
  const adjustedRow = Math.min(ghostRow, BOARD_SIZE - blockHeight);
  const adjustedCol = Math.min(ghostCol, BOARD_SIZE - blockWidth);

  if (ghostBlockPos.row !== adjustedRow || ghostBlockPos.col !== adjustedCol) {
    ghostBlockPos = { row: adjustedRow, col: adjustedCol };

    // Gambar ulang dengan petunjuk clear yang potensial
    let clearHint = { rows: [], cols: [] };
    if (isValidPlacement(block.shape, adjustedRow, adjustedCol)) {
      clearHint = checkPotentialClear(block.shape, adjustedRow, adjustedCol);
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
  if (!container) return;

  const containerStyle = getComputedStyle(container);
  let canvasSize;

  // Untuk tampilan mobile
  if (window.innerWidth < 738) {
    const availableWidth =
      container.clientWidth -
      parseFloat(containerStyle.paddingLeft) -
      parseFloat(containerStyle.paddingRight);
    canvasSize = Math.min(availableWidth, 400); // Batasi maksimal 400px
  }
  // Untuk tampilan desktop
  else {
    const availableWidth = canvasWrapper.clientWidth;
    canvasSize = Math.min(availableWidth, 500); // Batasi maksimal 500px
  }

  // Pastikan ukuran canvas adalah kelipatan dari BOARD_SIZE
  BLOCK_SIZE = Math.floor(canvasSize / BOARD_SIZE);
  canvasSize = BLOCK_SIZE * BOARD_SIZE;

  // Terapkan ukuran baru
  canvas.width = canvas.height = canvasSize;

  // Gambar ulang papan
  if (typeof drawBoard === "function") {
    drawBoard();
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

window.addEventListener("load", () => {
  // --- SETUP EVENT LISTENER DASAR (TIDAK BERUBAH) ---
  startTitleAnimation();
  mainMenuInfoButton.addEventListener("click", showInfoModal);
  inGameInfoButton.addEventListener("click", showInfoModal);
  closeInfoModalButton.addEventListener("click", hideInfoModal);
  infoModalCloseIcon.addEventListener("click", hideInfoModal);
  menuToggleButton.addEventListener("click", showInGameMenu);
  closeMenuButton.addEventListener("click", hideInGameMenu);
  soundToggleButton.addEventListener("click", toggleSound);
  backToMenuButton.addEventListener("click", goBackToMainMenu);
  topBarHighScore.addEventListener("click", showHighScoresModal);
  closeHighScoresModal.addEventListener("click", hideHighScoresModal);
  resetScoresButtonModal.addEventListener("click", () => {
    if (confirm("Anda yakin ingin menghapus semua peringkat skor?")) {
      localStorage.removeItem(HIGH_SCORES_KEY);
      displayHighScores();
    }
  });
  const shareScoreGameOverButton =
    document.getElementById("shareScoreGameOver");
  const finalScoreElement = document.getElementById("finalScore");

  shareScoreGameOverButton.addEventListener("click", () => {
    const finalScore = finalScoreElement.textContent;
    generateScoreImage(finalScore, null); // Tidak ada peringkat di Game Over
  });
  const shareScoreRankingButton = document.getElementById("shareScoreRanking");
  const highScoresListModal = document.getElementById("highScoresListModal");

  shareScoreRankingButton.addEventListener("click", () => {
    // [DIPERBAIKI] Menggunakan nama fungsi yang benar: loadHighScores
    const highScores = loadHighScores();

    // [DIPERBAIKI] Mengambil skor dari papan skor dan membersihkan format angka
    const currentScoreText = document.getElementById("scoreValue").textContent;
    const currentScore = parseInt(currentScoreText.replace(/\./g, ""), 10) || 0;

    // Cari peringkat pemain saat ini dalam daftar 5 teratas
    let playerRanking = 0; // Default 0 jika tidak ditemukan
    const scoreIndex = highScores.indexOf(currentScore);

    if (scoreIndex !== -1) {
      playerRanking = scoreIndex + 1;
    }

    // Generate gambar hanya jika skornya ada di peringkat, atau berikan pesan default
    if (playerRanking > 0) {
      generateScoreImage(currentScore.toLocaleString("id-ID"), playerRanking);
    } else {
      // Jika skor saat ini tidak masuk peringkat, bagikan skor teratas saja
      const topScore = highScores.length > 0 ? highScores[0] : 0;
      generateScoreImage(topScore.toLocaleString("id-ID"), 1);
    }
  });
  setupGameEventListeners();
  displayHighScores();

  // --- LOGIKA ALUR PERMAINAN BARU ---

  // 1. Selalu cek apakah ada game yang tersimpan
  const savedGame = loadGameState();

  if (savedGame) {
    // JIKA ADA GAME TERSIMPAN:
    // Tampilkan tombol "Lanjutkan" dan siapkan game di latar belakang
    continueGameButton.classList.remove("hidden");

    // Siapkan game lanjutan di memory, tapi jangan tampilkan dulu
    board = savedGame.board;
    currentBlocks = savedGame.currentBlocks;
    score = savedGame.score;
    comboCounter = savedGame.comboCounter;
    const scores = loadHighScores();
    highScore = scores.length > 0 ? scores[0] : 0;

    loadBlockImages(); // Muat aset di latar belakang
  } else {
    // JIKA TIDAK ADA GAME TERSIMPAN:
    // Pastikan tombol "Lanjutkan" tersembunyi dan siapkan game baru
    continueGameButton.classList.add("hidden");
    loadBlockImages();
    initGame();
  }

  // 2. Setup event listener untuk tombol-tombol utama

  // Tombol "Lanjutkan": Memuat state game yang sudah ada
  continueGameButton.addEventListener("click", () => {
    mainMenu.style.display = "none";
    gameWrapper.classList.remove("hidden");
    if (isSoundOn) backgroundSound.play();

    // Perbarui UI dengan data yang dimuat dari savedGame
    updateUI();
    resizeCanvas();
    drawBoard();
  });

  // Tombol "Mulai Game": Selalu memulai dari awal
  startGameButton.addEventListener("click", () => {
    // Hapus game lama dan reset semuanya
    clearGameState();
    initGame();

    // Sembunyikan tombol "Lanjutkan" karena game lama sudah dihapus
    continueGameButton.classList.add("hidden");

    mainMenu.style.display = "none";
    gameWrapper.classList.remove("hidden");
    if (isSoundOn) backgroundSound.play();

    updateUI();
    resizeCanvas();
  });
});

// [FUNGSI BARU YANG DIPERBAIKI] Animasi judul berurutan
function startTitleAnimation() {
  const letters = document.querySelectorAll(".title-word .letter");
  if (letters.length === 0) return;

  let currentLetterIndex = 0; // [DIUBAH] Inisialisasi penghitung untuk urutan

  setInterval(() => {
    // Ambil huruf sesuai urutan
    const currentLetter = letters[currentLetterIndex];

    // Tambahkan kelas untuk memicu animasi
    currentLetter.classList.add("blinking");

    // Hapus kelas setelah animasi selesai agar bisa diulang
    setTimeout(() => {
      currentLetter.classList.remove("blinking");
    }, 1500); // Durasi animasi dari CSS

    // [DIUBAH] Naikkan penghitung untuk huruf berikutnya
    currentLetterIndex++;

    // Jika sudah di huruf terakhir, kembali ke awal untuk loop
    if (currentLetterIndex >= letters.length) {
      currentLetterIndex = 0;
    }
  }, 500); // Ulangi setiap 0.5 detik untuk efek gelombang
}

// ======================================================================
// [FUNGSI DIUBAH] - Logika Berbagi Menggunakan Web Share API
// ======================================================================
async function generateScoreImage(score, ranking) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 400;

    // Muat gambar latar belakang menggunakan Promise
    const backgroundImage = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "assets/bgscore.png"; // Pastikan path ini benar
    });

    // Gambar semua elemen ke canvas
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Lapisan gelap untuk kontras

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 52px Inter";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText("Pencapaian Block Blaze!", canvas.width / 2, 80);

    ctx.font = "bold 96px Inter";
    ctx.fillStyle = "#FFD700"; // Warna emas untuk skor
    ctx.fillText(score, canvas.width / 2, 200);

    let shareText = `Wow! Saya dapat skor ${score} di Block Blaze!`;

    if (ranking) {
      ctx.font = "32px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Peringkat #${ranking}`, canvas.width / 2, 260);
      shareText += ` dan mencapai peringkat #${ranking}! Bisakah kamu mengalahkan ini?`;
    } else {
      ctx.font = "32px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Ayo kalahkan skor ini!", canvas.width / 2, 260);
      shareText += ` Bisakah kamu mengalahkan ini?`;
    }

    ctx.font = "italic 24px Inter";
    ctx.fillText(
      "mainkan di https://rynnn10.github.io/Game-Block-Blast/",
      canvas.width / 2,
      350
    );
    ctx.shadowBlur = 0; // Matikan shadow untuk teks kecil

    // Konversi canvas ke blob (format data yang bisa dibagikan)
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      throw new Error("Gagal membuat data gambar.");
    }

    const file = new File([blob], "skor-block-blaze.png", {
      type: "image/png",
    });
    const shareData = {
      title: "Skor Block Blaze",
      text: shareText,
      files: [file],
    };

    // Cek apakah browser mendukung Web Share API untuk file
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback jika tidak didukung: tawarkan untuk mengunduh gambar
      console.log("Web Share API tidak didukung, menggunakan metode unduh.");
      const link = document.createElement("a");
      link.download = "skor-block-blaze.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href); // Bersihkan memori
    }
  } catch (err) {
    console.error("Gagal membagikan:", err);
    // Beri tahu pengguna jika ada masalah (misalnya, mereka membatalkan dialog share)
    // alert("Gagal membagikan skor. Mungkin Anda membatalkannya.");
  }
}
