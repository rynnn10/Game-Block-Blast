const CACHE_NAME = "block-blaze-cache-v2"; // Versi cache dinaikkan untuk memicu update
// Daftar semua file yang perlu di-cache untuk mode offline
const urlsToCache = [
  "./", // Menunjuk ke root direktori
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  // Aset gambar utama
  "./assets/icon.png",
  "./assets/bgscore.png",
  // Aset gambar balok
  "./assets/orange_block.png",
  "./assets/yellow_block.png",
  "./assets/green_block.png",
  "./assets/lightblue_block.png",
  "./assets/blue_block.png",
  "./assets/gray_block.png",
  "./assets/indigo_block.png",
  "./assets/pink_block.png", // <-- TYPO SUDAH DIPERBAIKI
  "./assets/bom.png",
  // Aset suara (diasumsikan berada di folder assets)
  "./assets/bgsound.mp3",
  "./assets/place.mp3",
  "./assets/clear.mp3",
  "./assets/bomb.mp3",
  "./assets/gameover.mp3",
  "./assets/goodfix.mp3",
  "./assets/greatjfix.mp3",
  "./assets/unbelievablefix.mp3",
  "./assets/error.mp3",
  // Font dari Google
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
];

// Event 'install': Dipanggil saat Service Worker pertama kali diinstal
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache and caching assets");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("Failed to cache assets during install:", err);
      })
  );
});

// Event 'fetch': Menyajikan aset dari cache jika tersedia
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika file ditemukan di cache, kembalikan dari cache
      if (response) {
        return response;
      }
      // Jika tidak, lakukan permintaan ke jaringan
      return fetch(event.request);
    })
  );
});

// Event 'activate': Membersihkan cache lama
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
