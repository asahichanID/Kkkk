# 🌐 DAFTAR LENGKAP FITUR & COMMAND BERBASIS API — OGURI CAP BOT

Dokumen ini memuat **seluruh perintah (command)** di dalam sistem **Oguri Cap Bot WhatsApp** yang terhubung langsung dengan **API Eksternal** (melalui arsitektur sentral `apiGlobal`).

Setiap fitur dikelompokkan berdasarkan kategorinya masing-masing dengan rincian:
- **Format Command**: Cara penggunaan dan argumen yang dibutuhkan.
- **Provider Utama & Fallback**: Layanan penyedia API (NeoXR, Naze, Neosantara, Uguu, GitHub, dsb) beserta sistem proteksi kegagalannya (*multi-provider fallback*).
- **Status Kuota/Limit**: Keterangan apakah fitur memotong limit harian pengguna atau bebas limit.
- **Fungsi & Kegunaan**: Penjelasan hasil output dari pemanggilan API tersebut.

---

## 📋 DAFTAR ISI KATEGORI API

1. [📥 Downloader (Pengunduh Media)](#1--downloader-pengunduh-media)
2. [🧠 Artificial Intelligence (AI & Chatbot)](#2--artificial-intelligence-ai--chatbot)
3. [🎨 Creator, Maker & Media Tools](#3--creator-maker--media-tools)
4. [🛠️ Utility & Tools Online](#4--utility--tools-online)
5. [🔎 Search & Information Online](#5--search--information-online)
6. [🌸 Random, Quotes & Anime Media](#6--random-quotes--anime-media)
7. [🎮 Games & Kuis Online](#7--games--kuis-online)

---

## 1. 📥 DOWNLOADER (PENGUNDUH MEDIA)

> Kategori pengunduhan konten multimedia dari berbagai platform media sosial populer secara otomatis.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.play` / `.ytplay` | `.play blue yung kai` | **NeoXR** (`/youtube`) ➔ **Naze** (`/download/youtube`) | 🎫 **Limit** | Mencari lagu di YouTube dan mengunduh audio MP3 otomatis hasil teratas. |
| 2 | `.play2` / `.ytplay2` | `.play2 blue` | **YouTube Search API** ➔ **NeoXR / Naze Audio** | 🎫 **Limit** | Menampilkan Spotify-style interactive HTML Audio Player (9:16) dengan audio streaming inline Base64 64kbps dan tombol salin command `.ytmp3`. |
| 3 | `.ytmp3` / `.yta` | `.ytmp3 https://youtu.be/...` | **Naze** (`/download/youtube?format=mp3`) | 🎫 **Limit** | Mengunduh audio YouTube berkualitas tinggi dalam format file MP3 dari tautan link. |
| 4 | `.ytmp4` / `.ytv` | `.ytmp4 https://youtu.be/...` | **Naze** (`/download/youtube?format=720`) | 🎫 **Limit** | Mengunduh video YouTube dalam format MP4 jernih (HD/SD). |
| 5 | `.tiktok` / `.tt` | `.tiktok https://vt.tiktok.com/...` | **Naze** (`/download/tiktok`) | 🎫 **Limit** | Mengunduh video TikTok tanpa watermark (No Watermark / HD). |
| 6 | `.ttmp3` / `.tta` | `.ttmp3 https://vt.tiktok.com/...` | **Naze** (`/download/tiktok`) | 🎫 **Limit** | Mengekstrak dan mengunduh sound / audio musik TikTok menjadi file MP3. |
| 7 | `.ig` / `.instagram` | `.ig https://www.instagram.com/p/...` | **Naze** (`/download/instagram2`) | 🎫 **Limit** | Mengunduh foto, video reels, atau slide carousel dari Instagram. |
| 8 | `.fb` / `.facebook` | `.fb https://fb.watch/...` | **Naze** (`/download/facebook`) | 🎫 **Limit** | Mengunduh video Facebook dalam kualitas HD atau SD. |
| 9 | `.fbdl` / `.fbdown` | `.fbdl https://fb.watch/...` | **Naze** (`/download/facebook`) | 🎫 **Limit** | Server alternatif pengunduh video Facebook. |
| 10 | `.spotify` | `.spotify monolog pamungkas` | **Naze** ➔ **FGMods** ➔ **Vihangayt** (`/search/spotify`) | 🎫 **Limit** | Mencari lagu Spotify dan menampilkan daftar tombol interaktif untuk diputar/diunduh. |
| 11 | `.spotifydl` | `.spotifydl https://open.spotify.com/...` | **Naze** ➔ **FGMods** ➔ **Vihangayt** (`/download/spotify`) | 🎫 **Limit** | Mengunduh langsung file MP3 lagu Spotify dari URL link resmi Spotify. |
| 12 | `.mediafire` / `.mf` | `.mediafire https://www.mediafire.com/...` | **Naze** (`/download/mediafire`) | 🎫 **Limit** | Mengunduh berkas file (ZIP, RAR, APK, PDF, dll.) dari server MediaFire. |

---

## 2. 🧠 ARTIFICIAL INTELLIGENCE (AI & CHATBOT)

> Kategori kecerdasan buatan untuk menjawab pertanyaan, analisis mendalam, penalaran logika, koding, dan percakapan interaktif.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.ai` / `.gemini` / `.bard` | `.ai apa ibu kota prancis?` | **Naze** (`/ai/gemini-flash-lite`) | 🆓 **Gratis** | Chat cepat dengan AI Google Gemini Flash Lite untuk pertanyaan sehari-hari. |
| 2 | `.grok` | `.grok analisis masa depan AI` | **Neosantara** (`/chat/completions` - `x-ai/grok-2-1212`) | 🆓 **Gratis** | Menggunakan model cerdas Grok xAI tanpa batasan ketat dengan penalaran tajam. |
| 3 | `.claude` | `.claude jelaskan teori relativitas` | **Neosantara** (`/chat/completions` - `anthropic/claude-3-5-sonnet`) | 🆓 **Gratis** | Asisten AI Anthropic Claude 3.5 Sonnet untuk analisis tulisan dan koding mendalam. |
| 4 | `.deepseek` / `.r1` | `.deepseek selesaikan persamaan x^2 + 5x = 0` | **Neosantara** (`/chat/completions` - `deepseek/deepseek-r1`) | 🆓 **Gratis** | Model DeepSeek R1 dengan kemampuan *Chain-of-Thought (CoT)* / proses berpikir nalar logis. |
| 5 | `.glm` | `.glm buatkan puisi tentang laut` | **Neosantara** (`/chat/completions` - `thudm/glm-4-9b-chat`) | 🆓 **Gratis** | Model percakapan General Language Model (GLM-4) yang responsif dan kreatif. |
| 6 | `.archipelago` | `.archipelago ceritakan sejarah Majapahit` | **Neosantara** (`/chat/completions` - `archipelago/archipelago-7b`) | 🆓 **Gratis** | AI berbahasa Indonesia dengan spesialisasi budaya dan wawasan Nusantara. |
| 7 | `.cai` / `.roomai` | `.cai 1\|siapa namamu?` | **Naze** (`/ai/chat4`) | 🆓 **Gratis** | Chatbot *Character AI* dengan berbagai pilihan kepribadian karakter fiksi. |
| 8 | **Chatbot Oguri Cap** | Balas chat / tag bot | **Naze** (`/ai/chat` ➔ `/ai/message` ➔ `/ai/llama`) | 🆓 **Gratis** | Respon natural kepribadian gadis kuda *Uma Musume: Oguri Cap* berbasis memori kontekstual. |

---

## 3. 🎨 CREATOR, MAKER & MEDIA TOOLS

> Kategori pembuatan stiker, manipulasi foto, meme generator, dan konversi media.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.bratvid` / `.bratvideo` | `.bratvid teks berjalan animasi` | **NeoXR** (`/bratvid`) ➔ **Naze** (`/create/brat2` per-frame) | 🎫 **Limit** | Membuat video MP4 klip animasi teks kedip ala album Brat karya Charli XCX. |
| 2 | `.brat` | `.brat teks stiker brat` | **NeoXR** (`/brat`) ➔ **Naze** (`/create/brat`) ➔ **Local Engine** | 🆓 **Gratis** | Membuat stiker teks Brat dengan tipografi buram khas berwarna hijau neon. |
| 3 | `.iqc` | `.iqc Halo sayang, lagi apa?` | **Naze** (`/create/iqc`) | 🎫 **Limit** | Membuat screenshot palsu gelembung chat iMessage iPhone (*Fake iPhone Quote Chat*). |
| 4 | `.qc` / `.quote` / `.fakechat` | `.qc Selamat pagi dunia` | **Naze** (`/create/qc`) + **Uguu.se** (Upload avatar) | 🆓 **Gratis** | Membuat stiker kutipan pesan (*Quote Chat*) bergaya bubble Telegram dengan foto profil pengirim. |
| 5 | `.hd` / `.remini` / `.tohd` | Balas foto dengan `.hd` | **Naze** (`/tools/remini`) | 🆓 **Gratis** | Meningkatkan resolusi dan ketajaman foto buram menggunakan algoritma AI Super-Resolution. |
| 6 | `.dehaze` | Balas foto dengan `.dehaze` | **Naze** (`/tools/recolor` - dehaze) | 🆓 **Gratis** | Menghilangkan kabut, efek pudar, dan distorsi blur pada foto lama/buram. |
| 7 | `.colorize` | Balas foto dengan `.colorize` | **Naze** (`/tools/recolor` - colorize) | 🆓 **Gratis** | Memberikan warna alami (*colorization*) pada foto klasik hitam-putih. |
| 8 | `.hitamkan` / `.toblack` | Balas foto dengan `.hitamkan` | **Naze** (`/create/skin-tone`) | 🆓 **Gratis** | Mengubah *skin tone* foto menjadi gelap/monokrom kontras tinggi. |
| 9 | `.wasted` | Balas foto dengan `.wasted` | **Naze** (`/create/wasted`) | 🆓 **Gratis** | Memberikan efek kematian layar abu-abu dengan stempel "WASTED" khas game GTA. |
| 10 | `.trigger` / `.triggered` | Balas foto dengan `.triggered` | **Naze** (`/create/triggered`) | 🆓 **Gratis** | Membuat stiker/video animasi bergerak dengan efek getar dan banner merah "TRIGGERED". |
| 11 | `.nuliskanan` | `.nuliskanan Nama: Budi...` | **Naze** (`/create/nulis/nuliskanan`) | 🆓 **Gratis** | Mengonversi teks menjadi tulisan tangan di lembar buku tulis garis (format halaman kanan). |
| 12 | `.nuliskiri` | `.nuliskiri Tugas Matematika...` | **Naze** (`/create/nulis/nuliskiri`) | 🆓 **Gratis** | Menulis teks ke lembar buku tulis garis (format halaman kiri). |
| 13 | `.foliokanan` | `.foliokanan Laporan Praktikum...` | **Naze** (`/create/nulis/foliokanan`) | 🆓 **Gratis** | Menulis teks ke kertas lembar folio bergaris (halaman kanan). |
| 14 | `.foliokiri` | `.foliokiri Rangkuman Materi...` | **Naze** (`/create/nulis/foliokiri`) | 🆓 **Gratis** | Menulis teks ke kertas lembar folio bergaris (halaman kiri). |
| 15 | `.emojimix` | `.emojimix 😂+🔥` | **Naze** (`/tools/emojimix`) | 🆓 **Gratis** | Menggabungkan dua emoji standar menjadi satu stiker kombinasi unik Google Kitchen. |
| 16 | `.tourl` | Balas media foto/dokumen dengan `.tourl` | **Uguu.se API** (`/upload.php`) | 🆓 **Gratis** | Mengunggah file media ke cloud server dan menghasilkan link URL publik yang bisa dibagikan. |

---

## 4. 🛠️ UTILITY & TOOLS ONLINE

> Kategori utilitas praktis, konversi, rendering, dan informasi online.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.tts` | `.tts id Halo kawan semua` | **Naze** (`/tools/tts`) | 🆓 **Gratis** | Mengubah teks menjadi suara ucapan (Text-to-Speech) dalam berbagai bahasa (id, en, ja, dll). |
| 2 | `.translate` / `.tr` | `.translate id I love coding` | **Naze** (`/tools/translate`) | 🆓 **Gratis** | Menerjemahkan kalimat teks antar bahasa di seluruh dunia. |
| 3 | `.toqr` | `.toqr https://google.com` | **Naze** (`/tools/to-qr`) | 🆓 **Gratis** | Membuat gambar barcode QR Code dari teks atau link URL yang dimasukkan. |
| 4 | `.ssweb` / `.ss` | `.ssweb https://wikipedia.org` | **Naze** (`/tools/ss`) | 🆓 **Gratis** | Mengambil screenshot penuh tampilan halaman website secara online. |
| 5 | `.cuaca` / `.weather` | `.cuaca Jakarta` | **Naze** (`/tools/cuaca`) | 🆓 **Gratis** | Memeriksa ramalan cuaca, suhu, kelembaban, dan kondisi angin di kota tertentu. |
| 6 | `.style` / `.styletext` | `.style Oguri Cap` | **Naze** (`/tools/styletext`) | 🆓 **Gratis** | Mengubah tulisan teks biasa menjadi aneka font unik Unicode yang keren. |
| 7 | `.tinyurl` / `.shorturl` | `.tinyurl https://linkpanjang.com/...` | **Naze** (`/other/tinyurl`) | 🆓 **Gratis** | Memperpendek URL link yang panjang menjadi tautan ringkas TinyURL. |
| 8 | `.catur` | `.catur e4` | **Lichess / Chessboard API** | 🆓 **Gratis** | Me-render dan menampilkan gambar papan catur visual secara real-time pada game catur. |

---

## 5. 🔎 SEARCH & INFORMATION ONLINE

> Kategori pencarian gambar, konten digital, database paket pengembang, dan kamus online.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.gimage` / `.bingimg` | `.gimage kucing anggora lucu` | **Naze** (`/search/google`) | 🆓 **Gratis** | Mencari dan mengirimkan foto berkualitas dari mesin pencari Google Image. |
| 2 | `.pinterest` / `.pin` | `.pinterest aesthetic wallpaper` | **Naze** ➔ **Maelyn** ➔ **FGMods** ➔ **NexOracle** | 🆓 **Gratis** | Mencari gambar inspirasi dan estetika dari platform Pinterest. |
| 3 | `.wallpaper` | `.wallpaper pemandangan alam` | **Naze** ➔ **Maelyn** ➔ **FGMods** ➔ **NexOracle** | 🆓 **Gratis** | Mencari wallpaper HD untuk latar belakang HP atau desktop. |
| 4 | `.pixiv` | `.pixiv anime girl cute` | **Naze** (`/search/pixiv`) | 🆓 **Gratis** | Mencari karya ilustrasi dan fanart anime dari Pixiv. |
| 5 | `.ringtone` | `.ringtone nokia original` | **Naze** (`/search/meloboom`) | 🆓 **Gratis** | Mencari dan mengunduh nada dering suara musik dari database Meloboom. |
| 6 | `.npm` / `.npmjs` | `.npm axios` | **Naze** (`/search/npm`) | 🆓 **Gratis** | Mencari package library NodeJS di registri publik NPM (versi, deskripsi, publisher). |
| 7 | `.tenor` | `.tenor happy dance` | **Naze** (`/search/tenor`) | 🆓 **Gratis** | Mencari animasi GIF bergerak dari database Tenor. |
| 8 | `.urban` | `.urban rizz` | **Urban Dictionary API** (`api.urbandictionary.com`) | 🆓 **Gratis** | Mencari arti kata gaul dan definisi slang bahasa Inggris dari Urban Dictionary. |
| 9 | `.ghstalk` / `.githubstalk` | `.ghstalk torvalds` | **GitHub REST API** (`api.github.com/users`) | 🆓 **Gratis** | Melihat profil akun GitHub, bio, jumlah repositori publik, follower, dan tanggal pembuatan. |
| 10 | `.umur` / `.agify` | `.agify budi` | **Agify API** (`api.agify.io`) | 🆓 **Gratis** | Memprediksi estimasi usia statistik seseorang berdasarkan nama panggilan. |

---

## 6. 🌸 RANDOM, QUOTES & ANIME MEDIA

> Kategori konten hiburan santai, asupan kutipan harian, dan ilustrasi karakter anime.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.motivasi` | `.motivasi` | **Naze** (`/random/motivasi`) | 🆓 **Gratis** | Mengirimkan satu kalimat motivasi hidup untuk membangkitkan semangat. |
| 2 | `.bijak` | `.bijak` | **Naze** (`/random/bijak`) | 🆓 **Gratis** | Mengirimkan untaian kata-kata bijak penuh makna. |
| 3 | `.dare` | `.dare` | **Naze** (`/random/dare`) | 🆓 **Gratis** | Memberikan tantangan seru untuk permainan *Truth or Dare*. |
| 4 | `.truth` | `.truth` | **Naze** (`/random/truth`) | 🆓 **Gratis** | Memberikan pertanyaan jujur untuk permainan *Truth or Dare*. |
| 5 | `.quotes` | `.quotes` | **Naze** (`/random/quotes`) | 🆓 **Gratis** | Mengirimkan kutipan inspiratif acak dari tokoh-tokoh dunia. |
| 6 | `.renungan` | `.renungan` | **Naze** (`/random/renungan`) | 🆓 **Gratis** | Menghadirkan bacaan renungan introspeksi diri. |
| 7 | `.bucin` | `.bucin` | **Naze** (`/random/bucin`) | 🆓 **Gratis** | Mengirimkan rayuan gombal dan kata-kata romantis buat pasangan. |
| 8 | `.waifu` | `.waifu` | **Safebooru** ➔ **NekosAPI** ➔ **Nekos.best** | 🆓 **Gratis** | Mengirimkan gambar acak karakter anime perempuan (*waifu*) yang lucu dan aman (SFW). |
| 9 | `.neko` | `.neko` | **Safebooru** ➔ **NekosAPI** ➔ **Nekos.best** | 🆓 **Gratis** | Mengirimkan gambar acak karakter gadis kucing anime (*nekomimi*). |
| 10 | `.coffe` / `.kopi` | `.coffe` | **AlexFlipnote** ➔ **SampleAPIs** | 🆓 **Gratis** | Mengirimkan foto cangkir kopi estetis beserta fakta unik seputar kopi. |

---

## 7. 🎮 GAMES & KUIS ONLINE

> Kategori kuis edukatif dan permainan tebak-tebakan interaktif yang mengambil bank soal langsung dari server API.

| No | Command / Alias | Format / Contoh | Provider API & Fallback | Status Limit | Deskripsi & Fungsi |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `.tebakgambar` | `.tebakgambar` | **Naze** (`/games/tebakgambar`) | 🆓 **Gratis** | Kuis menebak susunan makna kata dari potongan gambar teka-teki. |
| 2 | `.caklontong` | `.caklontong` | **Naze** (`/games/caklontong`) | 🆓 **Gratis** | Kuis teka-teki logika humoris khas Cak Lontong beserta penjelasan jawabannya. |
| 3 | `.family100` | `.family100` | **Naze** (`/games/family100`) | 🆓 **Gratis** | Permainan tebak survei Family 100 dengan multi-jawaban di dalam grup. |
| 4 | `.tebakkata` | `.tebakkata` | **Naze** (`/games/tebakkata`) | 🆓 **Gratis** | Kuis menebak kata berdasarkan petunjuk definisi / kisi-kisi yang diberikan. |
| 5 | `.susunkata` | `.susunkata` | **Naze** (`/games/susunkata`) | 🆓 **Gratis** | Permainan menyusun huruf-huruf acak menjadi satu kata yang valid. |
| 6 | `.tekateki` | `.tekateki` | **Naze** (`/games/tekateki`) | 🆓 **Gratis** | Kuis teka-teki tradisional Indonesia yang asah otak. |
| 7 | `.tebaklirik` | `.tebaklirik` | **Naze** (`/games/tebaklirik`) | 🆓 **Gratis** | Kuis melengkapi potongan lirik lagu Indonesia atau mancanegara. |
| 8 | `.tebaknegara` | `.tebaknegara` | **Naze** (`/games/tebaknegara`) | 🆓 **Gratis** | Kuis menebak nama negara berdasarkan petunjuk karakteristik dan ibukota. |
| 9 | `.tebakbendera` | `.tebakbendera` | **Naze** (`/games/tebakbendera`) | 🆓 **Gratis** | Kuis menebak nama negara dari gambar bendera nasional yang ditampilkan. |
| 10 | `.tebakkimia` | `.tebakkimia` | **Naze** (`/games/tebakkimia`) | 🆓 **Gratis** | Kuis edukasi kimia: menebak nama unsur dari lambang/nomor atom tabel periodik. |
| 11 | `.butawarna` | `.butawarna` | **Naze** (`/random/color-blind`) | 🆓 **Gratis** | Permainan tes buta warna menggunakan plat gambar lingkaran angka Ishihara. |

---

## 🛡️ RINGKASAN KEBIJAKAN LIMIT & RESILIENSI SISTEM

1. **Aturan Pemotongan Limit**:
   - Hanya fitur pengunduh berat (**Downloader**), **IQC**, dan **Brat Video** yang memotong jatah limit harian pengguna untuk mencegah spam kuota server.
   - Fitur AI, Maker, Search, Quotes, Game, dan RPG Uma Musume bersifat **100% Bebas Limit (Unlimited)**.

2. **Arsitektur Multi-Provider Fallback**:
   - Seluruh pemanggilan API dirutekan melalui modul sentral `OguriCap/apiGlobal/`.
   - Jika provider utama mengalami *downtime*, gangguan jaringan, atau *rate limit*, sistem secara otomatis beralih (*auto-fallback*) ke provider cadangan tanpa memunculkan pesan *error crash* pada pengguna.
