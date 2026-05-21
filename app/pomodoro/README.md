# Pomodoro Mawaqit

Modul produktivitas berbasis teknik Pomodoro dengan integrasi pemutar musik Lofi dan manajemen tugas (To-Do List).

## Mulai Cepat (Quick Start)

Modul Pomodoro dapat diakses langsung melalui rute `/pomodoro` di aplikasi Mawaqit. 
Tidak diperlukan instalasi khusus karena fitur ini di-render sebagai halaman aplikasi Next.js standar. Akses melalui navigasi utama atau langsung ke URL `/pomodoro`.

## Fitur (Features)

- **Sistem Timer Andal:** Timer menggunakan Web Worker (`timer.worker.js`) agar hitungan mundur tidak terhenti oleh mekanisme jeda (*throttling*) peramban saat tab berada di latar belakang.
- **Fase Fleksibel:** Mendukung 3 fase utama:
  - **Focus:** Waktu kerja/belajar produktif.
  - **Short Break:** Istirahat ringan dengan visualisasi panduan pernapasan (*Breathing Guide*).
  - **Long Break:** Istirahat panjang yang aktif secara otomatis setelah target sesi fokus tertentu terpenuhi.
- **Pemutar Musik Lofi (Lofi Player):**
  - Menggunakan YouTube IFrame API tanpa memuat bingkai visual (hanya audio).
  - Dilengkapi *waveform visualizer* responsif.
  - Dukungan untuk menambah, menyimpan, dan menghapus *Custom Station* langsung dari tautan YouTube.
- **Generator Suara (Noise Generator):** Memanfaatkan `AudioContext` murni untuk mensintesis suara *White Noise* dan *Brown Noise* tanpa perlu aset berkas audio eksternal.
- **Manajemen Tugas (Task List):**
  - Menyimpan tugas pengguna menggunakan *Local Storage* peramban.
  - Mendukung penambahan, penandaan (check), dan penghapusan massal.
  - Animasi transisi mulus menggunakan `framer-motion`.
- **Responsivitas & Tema:**
  - Desain antarmuka otomatis menyesuaikan (Terang/Gelap).
  - Terintegrasi penuh dengan lokalisasi (i18n) `LanguageContext`.
  - Mode Layar Penuh (Fullscreen) untuk fokus optimal.

## Konfigurasi (Configuration)

Pengaturan pada panel Pomodoro (Settings) beserta nilai bawaannya:

| Pengaturan | Deskripsi | Default |
|----------|-------------|---------|
| Focus Duration | Durasi waktu untuk satu sesi fokus | 25 Menit |
| Short Break | Durasi sesi istirahat singkat | 5 Menit |
| Long Break | Durasi sesi istirahat panjang | 15 Menit |
| Sessions until Long Break | Target sesi fokus untuk mendapatkan istirahat panjang | 4 Sesi |
| Sound | Suara pendukung fokus (Off / White / Brown) | Off |
| Lofi Stations | *(Local Storage)* Daftar stasiun Lofi kustom | [Bawaan] |
| Tasks | *(Local Storage)* Daftar tugas sesi | Kosong |

## Dokumentasi Teknis

- **Orkestrasi Utama (`page.tsx`):** Menangani perubahan antar fase, sinkronisasi *Web Worker*, memutar bel notifikasi, dan pengelolaan state durasi sesi.
- **Seksi Timer (`TimerSection.tsx`):** Tempat komponen visual (SVG Progress Ring), dan kontrol interaktif (Play, Pause, Reset, Skip).
- **Panel Tambahan (`TaskPanel.tsx`, `TaskList.tsx`, `LofiPlayer.tsx`):** Mengatur fungsionalitas sisi pengguna secara asinkron di dalam *layout* dua kolom saat layar lebar.

### Konsep Utama untuk AI (llms.txt ready)

- Timer berjalan di **Web Worker** (`public/timer.worker.js`) agar tidak tertunda oleh fitur hemat baterai/memori browser.
- **Sintesis Audio** via `AudioContext` untuk meminimalkan ukuran *bundle* dan meningkatkan efisiensi.
- Pemutar Lofi menggunakan metode **headless YouTube iframe** untuk hanya mengambil stream audio.
- Modifikasi status komponen menggunakan **Framer Motion** dan *React state* secara lokal, dipadukan sinkronisasi ke `localStorage`.
