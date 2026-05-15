# Dokumentasi Fitur Pomodoro Mawaqit

Dokumen ini berisi analisis dan dokumentasi lengkap mengenai fitur-fitur yang terdapat pada halaman Pomodoro di aplikasi Mawaqit. Halaman ini dirancang untuk membantu produktivitas pengguna dengan antarmuka yang modern, responsif, dan interaktif.

## 1. Arsitektur Utama & Manajemen State (`page.tsx`)
Halaman utama Pomodoro bertindak sebagai orkestrator (pengatur utama) dari seluruh komponen Pomodoro.
*   **Sistem Timer Berbasis Web Worker:** Timer menggunakan Web Worker (`timer.worker.js`) untuk memastikan hitungan mundur tetap berjalan akurat bahkan saat tab peramban (browser) tidak aktif atau berada di latar belakang.
*   **Fase Pomodoro:** Memiliki 3 fase utama:
    *   **Focus:** Waktu fokus untuk bekerja (default/kustomisasi).
    *   **Short Break:** Waktu istirahat singkat (default 5 menit).
    *   **Long Break:** Waktu istirahat panjang (default 15 menit), dipicu setelah sejumlah sesi fokus selesai (biasanya 4 sesi).
*   **Audio & Notifikasi:**
    *   **Bel (Bell):** Bunyi penanda saat satu fase telah selesai.
    *   **Noise Generator:** Fitur suara latar (White Noise / Brown Noise) yang dihasilkan melalui `AudioContext` untuk membantu fokus.
*   **Mode Layar Penuh (Fullscreen):** Terdapat tombol untuk mengubah tampilan menjadi layar penuh tanpa gangguan.
*   **Dukungan Tema:** Terintegrasi dengan sistem tema aplikasi (Gelap/Terang) yang memperbarui warna elemen dan latar belakang secara dinamis.

## 2. Bagian Timer (`TimerSection.tsx`)
Komponen ini menangani visualisasi dan kontrol timer.
*   **Visualisasi Progres (Progress Ring):** Menampilkan sisa waktu dalam bentuk lingkaran progres (Progress Ring) menggunakan animasi dari `framer-motion`.
*   **Panduan Pernapasan (Breathing Guide):** Saat berada di fase istirahat (Short Break / Long Break), progres lingkaran digantikan dengan panduan pernapasan visual untuk membantu pengguna relaksasi.
*   **Kontrol Timer:** Tombol untuk *Play/Pause*, *Skip* (langsung ke fase berikutnya), dan *Reset* (mengulang waktu saat ini).
*   **Peralihan Fase Manual:** Pengguna dapat berpindah antar fase (Focus, Short Break, Long Break) melalui tombol *pill* di atas timer.
*   **Statistik Sesi (Session Stats):** Menampilkan data sesi saat ini:
    *   Jumlah sesi fokus yang telah diselesaikan.
    *   Total menit fokus.
    *   Jumlah istirahat panjang (*Long Breaks*) yang telah diambil.
*   **Titik Sesi (Session Dots):** Indikator visual berupa titik-titik yang menunjukkan progres menuju istirahat panjang.

## 3. Manajemen Tugas (`TaskList.tsx`)
Panel untuk mengelola daftar pekerjaan (To-Do List) selama menggunakan Pomodoro.
*   **CRUD Sederhana:** Pengguna dapat menambahkan tugas baru, menandai tugas selesai (*checklist*), dan menghapus tugas secara individu.
*   **Penyimpanan Lokal (Local Storage):** Semua tugas disimpan di `localStorage` peramban (dengan *key* `pomodoro-tasks`), sehingga data tidak hilang ketika halaman dimuat ulang (refresh).
*   **Aksi Massal:** 
    *   **Clear Done:** Menghapus semua tugas yang sudah ditandai selesai.
    *   **Clear All:** Menghapus seluruh daftar tugas.
*   **Animasi Halus:** Menggunakan `framer-motion` (`AnimatePresence` dan `layout`) untuk animasi *layout shift* ketika tugas ditambah, dicentang, atau dihapus.

## 4. Pemutar Lofi YouTube (`LofiPlayer.tsx`)
Fitur pemutar musik latar berbasis YouTube IFrame API tanpa menampilkan video YouTube secara langsung.
*   **Pemutar Tersembunyi:** Video YouTube di-*embed* dan disembunyikan menggunakan CSS, sehingga hanya memutar audionya saja.
*   **Visualizer Gelombang (Waveform):** Menampilkan animasi gelombang suara buatan saat stasiun musik diputar.
*   **Kontrol Volume:** Pengguna dapat mengatur volume suara menggunakan *slider* khusus.
*   **Manajemen Stasiun Musik:**
    *   Dilengkapi stasiun default ("Lofi Hip Hop").
    *   Pengguna dapat menambahkan stasiun YouTube khusus (*Custom Station*) dengan menempelkan URL YouTube. Aplikasi akan mengekstrak ID video secara otomatis.
    *   Stasiun khusus disimpan ke `localStorage` (`pomodoro-lofi-stations`) dan dapat dihapus.
*   **Panel yang Dapat Dilipat (Collapsible):** Antarmuka pemutar dirancang ringkas; pengguna bisa mengklik area utama untuk memperluas panel volume dan daftar stasiun.

## 5. Fitur Pengaturan Tambahan (`SettingsPanel.tsx`)
Walaupun tidak dirender penuh dalam analisis *file* inti, kontrol pengaturan disalurkan dari `page.tsx`:
*   **Durasi Kustom:** Pengguna dapat mengubah durasi waktu "Focus" (misalnya dari 25 menit menjadi 50 menit).
*   **Pilihan Suara:** Pengguna dapat memilih jenis suara latar (Off, White Noise, atau Brown Noise).

## 6. Lokalisasi / Multi-Bahasa
Semua komponen menggunakan `useLanguage()` dari `LanguageContext` untuk mendukung perubahan teks bahasa (Inggris, Arab, dsb) secara dinamis tanpa me-*refresh* halaman (misalnya `t('focus')`, `t('tasks')`).
