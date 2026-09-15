# 🥕 KATALOG FITUR LENGKAP — OGURI CAP BOT (WHATSAPP)

Dokumen ini memuat seluruh fitur dan perintah yang tersedia di dalam **Oguri Cap Bot**.  
Sesuai konfigurasi keamanan akun dan aturan limit:
- **🎫 FITUR BER-LIMIT:** HANYA fitur yang mengakses API eksternal / pengunduhan berat (**Downloader**, **IQC**, dan **Bratvid**) yang memotong limit harian pengguna.
- **🆓 FITUR BEBAS LIMIT (UNLIMITED):** Seluruh fitur yang berjalan secara lokal (**Sticker, AI, Game, RPG Uma Musume, Grup/Admin, Search, Primbon, Audio FX, Fun, dll.**) dapat digunakan **sepuasnya tanpa batas limit**.
- **🛡️ SISTEM PACING & KEAMANAN AKUN:**
  - Seluruh command berjalan secara **Strict Global Sequential Queue** (1 antrian pada 1 waktu).
  - Terdapat jeda istirahat acak **3 - 5 detik** antar command agar bot tidak "gragas" (terlihat seperti manusia/natural) untuk mengamankan nomor utama WhatsApp dari risiko banned.

---

## 📋 DAFTAR ISI KATEGORI
1. [📥 Downloader (Ber-Limit)](#1--downloader-ber-limit-)
2. [📱 Fitur Khusus Ber-Limit](#2--fitur-khusus-ber-limit-)
3. [🎨 Maker & Sticker (Bebas Limit)](#3--maker--sticker-bebas-limit-)
4. [🧠 Artificial Intelligence (Bebas Limit)](#4--artificial-intelligence-ai-bebas-limit-)
5. [🏇 Tracen Academy & Uma Musume RPG (Bebas Limit)](#5--tracen-academy--uma-musume-rpg-bebas-limit-)
6. [🎮 Games & Kuis Interaktif (Bebas Limit)](#6--games--kuis-interaktif-bebas-limit-)
7. [👥 Grup & Moderasi Admin (Bebas Limit)](#7--grup--moderasi-admin-bebas-limit-)
8. [🔎 Search & Pencarian (Bebas Limit)](#8--search--pencarian-bebas-limit-)
9. [💬 Quotes & Primbon (Bebas Limit)](#9--quotes--primbon-bebas-limit-)
10. [😂 Fun & Hiburan (Bebas Limit)](#10--fun--hiburan-bebas-limit-)
11. [🌸 Anime & Wibu (Bebas Limit)](#11--anime--wibu-bebas-limit-)
12. [🛠️ Audio & Sound Effects (Bebas Limit)](#12--audio--sound-effects-bebas-limit-)
13. [⚙️ Sistem & Owner Tools (Bebas Limit)](#13--sistem--owner-tools-bebas-limit-)

---

## 1. 📥 DOWNLOADER (BER-LIMIT 🎫)
> *Kategori ini memerlukan limit harian karena mengakses API downloader dan bandwidth eksternal.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.play` / `.ytplay` | `.play <judul lagu>` | 🎫 **Limit** | Cari dan unduh audio YouTube otomatis berdasarkan judul |
| `.play2` / `.ytplay2` | `.play2 <judul lagu>` | 🎫 **Limit** | Cari dan unduh audio YouTube (opsi server kedua) |
| `.ytmp3` / `.yta` | `.ytmp3 <url youtube>` | 🎫 **Limit** | Konversi dan unduh audio YouTube ke MP3 dari link |
| `.ytmp4` / `.ytv` | `.ytmp4 <url youtube>` | 🎫 **Limit** | Unduh video YouTube MP4 dengan kualitas terbaik |
| `.tiktok` / `.tt` | `.tiktok <url tiktok>` | 🎫 **Limit** | Unduh video TikTok tanpa watermark (No WM) |
| `.ttmp3` / `.tta` | `.ttmp3 <url tiktok>` | 🎫 **Limit** | Unduh audio/sound TikTok MP3 dari link video |
| `.ig` / `.instagram` | `.ig <url post/reels>` | 🎫 **Limit** | Unduh foto atau reels video dari Instagram |
| `.igvideo` | `.igvideo <url reels>` | 🎫 **Limit** | Unduh khusus format video reels Instagram |
| `.igimage` | `.igimage <url post>` | 🎫 **Limit** | Unduh khusus format gambar dari Instagram |
| `.igvideoall` | `.igvideoall <url post>` | 🎫 **Limit** | Unduh semua video slide (carousel) di Instagram |
| `.igimageall` | `.igimageall <url post>` | 🎫 **Limit** | Unduh semua foto slide (carousel) di Instagram |
| `.fb` / `.facebook` | `.fb <url video facebook>` | 🎫 **Limit** | Unduh video Facebook dalam kualitas HD / SD |
| `.fbdl` / `.fbdown` | `.fbdl <url video facebook>` | 🎫 **Limit** | Server alternatif untuk unduh video Facebook |
| `.spotify` | `.spotify <judul lagu>` | 🎫 **Limit** | Cari lagu Spotify dengan tombol interaktif |
| `.spotifydl` | `.spotifydl <url lagu>` | 🎫 **Limit** | Unduh file MP3 lagu Spotify langsung dari URL link |
| `.mediafire` / `.mf` | `.mediafire <url mediafire>` | 🎫 **Limit** | Unduh dokumen/file dari server Mediafire |
| `.gitclone` / `.git` | `.gitclone <url github>` | 🎫 **Limit** | Download repository publik GitHub ke bentuk file ZIP |
| `.gdrive` | `.gdrive <url google drive>` | 🎫 **Limit** | Unduh berkas dari link Google Drive publik |
| `.threads` | `.threads <url threads>` | 🎫 **Limit** | Unduh postingan video/gambar dari Threads Meta |
| `.twitter` / `.x` | `.twitter <url twitter/x>` | 🎫 **Limit** | Unduh video atau GIF dari cuitan Twitter / X |
| `.capcut` | `.capcut <url template>` | 🎫 **Limit** | Unduh video template CapCut tanpa watermark |
| `.snackvideo` | `.snackvideo <url snack>` | 🎫 **Limit** | Unduh video dari SnackVideo tanpa watermark |

---

## 2. 📱 FITUR KHUSUS BER-LIMIT (🎫)
> *Fitur pembuat konten berat berbasis cloud generator yang menggunakan kuota limit.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.iqc` | `.iqc <teks chat>` | 🎫 **Limit** | Membuat screenshot palsu chat iPhone (Fake iPhone Quote Chat) |
| `.bratvid` / `.bratvideo` | `.bratvid <teks animasi>` | 🎫 **Limit** | Membuat video animasi klip bertema meme Brat berkedip (MP4) |

---

## 3. 🎨 MAKER & STICKER (BEBAS LIMIT 🆓)
> *Seluruh fitur sticker maker dan konversi media berjalan secara lokal dan BEBAS LIMIT.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.s` / `.sticker` | Kirim/balas gambar/video dengan `.s` | 🆓 **Gratis** | Buat stiker WhatsApp dari gambar atau klip video pendek |
| `.swm` / `.colong` | `.swm <packname\|author>` | 🆓 **Gratis** | Buat stiker dengan watermark dan nama pembuat kustom |
| `.smeme` | `.smeme <teks atas\|teks bawah>` | 🆓 **Gratis** | Bikin stiker meme dengan teks atas dan teks bawah |
| `.smemec` | `.smemec <teks atas\|teks bawah>` | 🆓 **Gratis** | Stiker meme dengan posisi teks rata tengah (centered) |
| `.brat` | `.brat <teks stiker>` | 🆓 **Gratis** | Bikin stiker teks Brat lokal ala Charli XCX (bebas limit) |
| `.qc` | `.qc <teks pesan>` | 🆓 **Gratis** | Bikin stiker quote gelembung chat Telegram style |
| `.toimg` | Balas stiker dengan `.toimg` | 🆓 **Gratis** | Konversi stiker statis menjadi foto JPEG biasa |
| `.tovideo` / `.tovid` | Balas stiker gerak dengan `.tovideo` | 🆓 **Gratis** | Konversi stiker animasi bergerak menjadi video MP4 |
| `.tomp3` | Balas video/vn dengan `.tomp3` | 🆓 **Gratis** | Ekstrak audio dari video menjadi file MP3 |
| `.tovn` | Balas audio/video dengan `.tovn` | 🆓 **Gratis** | Ubah audio biasa menjadi Voice Note WhatsApp (PTT) |
| `.emojimix` | `.emojimix 😂+🔥` | 🆓 **Gratis** | Gabungkan 2 emoji menjadi 1 stiker kombinasi unik |
| `.nulis` | `.nulis <teks cerita/tugas>` | 🆓 **Gratis** | Tulis teks ke lembar kertas buku tulis sekolah otomatis |
| `.tourl` | Balas media dengan `.tourl` | 🆓 **Gratis** | Upload gambar/dokumen ke web hosting dan dapatkan URL link |
| `.toqr` | `.toqr <teks atau link>` | 🆓 **Gratis** | Ubah teks atau link URL menjadi barcode QR Code |
| `.hd` / `.remini` | Balas gambar dengan `.hd` | 🆓 **Gratis** | Tingkatkan ketajaman foto buram (Photo Enhancement) |
| `.dehaze` | Balas foto dengan `.dehaze` | 🆓 **Gratis** | Bersihkan kabut atau distorsi blur pada foto |
| `.colorize` | Balas foto jadul dengan `.colorize` | 🆓 **Gratis** | Berikan warna alami pada foto hitam putih kuno |
| `.hitamkan` | Balas gambar dengan `.hitamkan` | 🆓 **Gratis** | Ubah foto warna menjadi monokrom hitam putih klasik |
| `.wasted` | Balas foto dengan `.wasted` | 🆓 **Gratis** | Beri efek overlay kematian "WASTED" game GTA |
| `.triggered` | Balas foto dengan `.triggered` | 🆓 **Gratis** | Beri efek getar animasi meme TRIGGERED |

---

## 4. 🧠 ARTIFICIAL INTELLIGENCE (AI) (BEBAS LIMIT 🆓)
> *Semua model chatbot kecerdasan buatan tersedia secara gratis dan tanpa memotong kuota limit.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.ai` | `.ai <pertanyaan kamu>` | 🆓 **Gratis** | Tanya AI umum untuk diskusi, solusi masalah, dan koding |
| `.gemini` | `.gemini <prompt>` | 🆓 **Gratis** | Chat menggunakan model Google Gemini AI |
| `.grok` | `.grok <prompt>` | 🆓 **Gratis** | Model AI Grok xAI cerdas dan tanpa filter |
| `.claude` | `.claude <prompt>` | 🆓 **Gratis** | Asisten AI Anthropic Claude dengan analisis mendalam |
| `.deepseek` | `.deepseek <prompt>` | 🆓 **Gratis** | Model penalaran logis dan matematika DeepSeek |
| `.glm` | `.glm <prompt>` | 🆓 **Gratis** | Chatbot AI General Language Model |
| `.archipelago` | `.archipelago <prompt>` | 🆓 **Gratis** | Chatbot berbasis wawasan Nusantara |
| `.txt2img` | `.txt2img <deskripsi visual>` | 🆓 **Gratis** | Buat ilustrasi/gambar visual dari teks deskripsi prompt |

---

## 5. 🏇 TRACEN ACADEMY & UMA MUSUME RPG (BEBAS LIMIT 🆓)
> *Mini RPG bertema akademi balap kuda Uma Musume yang lengkap dengan sistem Gacha, Training, Balapan, dan Perbankan.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.pull` | `.pull` | 🆓 **Gratis** | Gacha 1x banner reguler Uma Musume |
| `.multipull` | `.multipull` | 🆓 **Gratis** | Gacha 10x sekaligus pada banner reguler |
| `.lpull` | `.lpull` | 🆓 **Gratis** | Gacha 1x Limited Banner dengan peluang rate-up |
| `.lmulti` | `.lmulti` | 🆓 **Gratis** | Gacha 10x Limited Banner (Peluang SSR lebih tinggi) |
| `.banner` | `.banner` | 🆓 **Gratis** | Cek karakter rate-up di banner reguler yang sedang aktif |
| `.bannerl` | `.bannerl` | 🆓 **Gratis** | Cek daftar karakter Limited Banner aktif |
| `.myuma` | `.myuma` | 🆓 **Gratis** | Lihat daftar Uma Musume yang kamu miliki serta levelnya |
| `.koleksi` | `.koleksi` | 🆓 **Gratis** | Cek galeri kartu Uma Musume (R, SR, SSR) |
| `.umainfo` | `.umainfo <nama uma>` | 🆓 **Gratis** | Cek profil lengkap, skill, dan statistik dasar Uma Musume |
| `.selectuma` | `.selectuma <nama uma>` | 🆓 **Gratis** | Pasang Uma Musume pilihanmu sebagai partner utama |
| `.training` | `.training <speed\|stamina\|power>` | 🆓 **Gratis** | Latih atribut kekuatan Uma partner untuk persiapan balap |
| `.feed` | `.feed <nama makanan>` | 🆓 **Gratis** | Beri makan wortel/parfait untuk memulihkan energi latihan |
| `.umalb` | `.umalb <nama uma>` | 🆓 **Gratis** | Naikkan batas level (Limit Break) menggunakan duplikat |
| `.race` | `.race` | 🆓 **Gratis** | Ikuti balapan solo Tracen Academy Cup |
| `.race5` | `.race5` | 🆓 **Gratis** | Buka room balapan multiplayer untuk 5 pemain sekaligus |
| `.join5` | `.join5 <id room>` | 🆓 **Gratis** | Masuk ke room balapan multiplayer yang dibuka teman |
| `.start5` | `.start5` | 🆓 **Gratis** | Mulai jalankan balapan multiplayer 5 orang (oleh Host) |
| `.batalroom5` | `.batalroom5` | 🆓 **Gratis** | Batalkan room balapan yang belum dimulai |
| `.inforoom5` | `.inforoom5` | 🆓 **Gratis** | Cek daftar pemain yang sudah masuk di room balapan |
| `.bank` | `.bank` | 🆓 **Gratis** | Menu rekening tabungan Bank Tracen Academy |
| `.cekbank` | `.cekbank` | 🆓 **Gratis** | Cek saldo simpanan dan bunga tabungan harian |
| `.daily` | `.daily` | 🆓 **Gratis** | Klaim bonus harian uang Tracen dan item Trainer |
| `.bansos` | `.bansos` | 🆓 **Gratis** | Bantuan uang tunai darurat bagi Trainer yang bangkrut |
| `.transfer` | `.transfer @user <jumlah>` | 🆓 **Gratis** | Transfer uang Tracen ke sesama Trainer |
| `.leaderboard` / `.top` | `.leaderboard` | 🆓 **Gratis** | Peringkat Trainer terkaya dan Uma Musume terkuat |
| `.umashop` | `.umashop` | 🆓 **Gratis** | Daftar barang di toko Tracen (wortel, tiket, boost) |
| `.buyuma` | `.buyuma <id item>` | 🆓 **Gratis** | Beli perlengkapan latihan di toko Tracen |
| `.exchange` | `.exchange` | 🆓 **Gratis** | Tukar gacha shards dengan Uma Musume impian |

---

## 6. 🎮 GAMES & KUIS INTERAKTIF (BEBAS LIMIT 🆓)
> *Semua permainan asah otak, papan strategi, dan tantangan duel PvP berjalan gratis.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.sonic` | `.sonic` | 🆓 **Gratis** | Balapan Sonic Dash mini-game |
| `.blackjack` | `.blackjack` | 🆓 **Gratis** | Permainan kartu 21 Blackjack |
| `.dadu` | `.dadu` | 🆓 **Gratis** | Lempar dadu angka 1-6 |
| `.catur` / `.chess` | `.catur` | 🆓 **Gratis** | Papan catur visual interaktif 2 pemain via chat grup |
| `.tictactoe` / `.ttt` | `.ttt @lawan` | 🆓 **Gratis** | Permainan Tic-Tac-Toe X-O 3x3 melawan teman |
| `.ulartangga` | `.ulartangga` | 🆓 **Gratis** | Permainan papan Ular Tangga multiplayer dengan dadu |
| `.tebakbom` | `.tebakbom` | 🆓 **Gratis** | Permainan ranjau bom (Minesweeper) interaktif |
| `.suitpvp` | `.suitpvp @lawan` | 🆓 **Gratis** | Duel suit batu-gunting-kertas melawan teman |
| `.rampok` | `.rampok @user` | 🆓 **Gratis** | Coba rampok uang Trainer lain dengan risiko tertangkap |
| `.begal` | `.begal @user` | 🆓 **Gratis** | Begal Trainer di jalanan akademi |
| `.tekateki` | `.tekateki` | 🆓 **Gratis** | Kuis tebak teka-teki logika |
| `.tebaklirik` | `.tebaklirik` | 🆓 **Gratis** | Kuis tebak judul lagu dari penggalan lirik |
| `.tebakkata` | `.tebakkata` | 🆓 **Gratis** | Kuis tebak kata berpetunjuk |
| `.susunkata` | `.susunkata` | 🆓 **Gratis** | Susun huruf acak menjadi kata baku Indonesia |
| `.caklontong` | `.caklontong` | 🆓 **Gratis** | Kuis tebak-tebakan humor ala Cak Lontong |
| `.tebakangka` | `.tebakangka` | 🆓 **Gratis** | Tebak angka rahasia antara 1 sampai 100 |
| `.tebaknegara` | `.tebaknegara` | 🆓 **Gratis** | Tebak nama negara dari petunjuk geografis |
| `.tebakgambar` | `.tebakgambar` | 🆓 **Gratis** | Kuis tebak arti gabungan gambar |
| `.tebakbendera` | `.tebakbendera` | 🆓 **Gratis** | Tebak bendera kebangsaan negara dunia |
| `.math` | `.math <mode>` | 🆓 **Gratis** | Kuis hitung cepat matematika berhadiah koin |
| `.colorblind` | `.colorblind` | 🆓 **Gratis** | Tes buta warna mengenali angka dalam lingkaran titik |
| `.family100` | `.family100` | 🆓 **Gratis** | Kuis survei Family 100 dengan multi-jawaban di grup |

---

## 7. 👥 GRUP & MODERASI ADMIN (BEBAS LIMIT 🆓)
> *Manajemen grup WhatsApp untuk memudahkan admin mengelola anggota dan menjaga ketertiban.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.hidetag` | `.hidetag <pesan pengumuman>` | 🆓 **Gratis** | Tag seluruh anggota grup secara tersembunyi (Admin) |
| `.tagall` | `.tagall <pesan>` | 🆓 **Gratis** | Tag semua anggota grup dengan memunculkan daftar nomor |
| `.group` | `.group open` / `.group close` | 🆓 **Gratis** | Buka atau tutup obrolan grup untuk member biasa |
| `.kick` | `.kick @user` | 🆓 **Gratis** | Keluarkan anggota dari grup (Admin) |
| `.add` | `.add <nomor HP>` | 🆓 **Gratis** | Tambahkan nomor baru ke dalam grup (Admin) |
| `.promote` | `.promote @user` | 🆓 **Gratis** | Angkat anggota menjadi Admin grup |
| `.demote` | `.demote @user` | 🆓 **Gratis** | Turunkan Admin menjadi anggota biasa |
| `.warn` | `.warn @user` | 🆓 **Gratis** | Berikan kartu peringatan pelanggaran (3x warn = kick) |
| `.unwarn` | `.unwarn @user` | 🆓 **Gratis** | Hapus poin pelanggaran kartu peringatan member |
| `.linkgrup` | `.linkgrup` | 🆓 **Gratis** | Dapatkan link tautan undangan grup saat ini |
| `.revoke` | `.revoke` | 🆓 **Gratis** | Reset link undangan grup lama dan buat link baru |
| `.setname` | `.setname <nama baru>` | 🆓 **Gratis** | Ganti nama/subjek grup |
| `.setdesc` | `.setdesc <deskripsi baru>` | 🆓 **Gratis** | Ganti teks deskripsi grup |
| `.setppgc` | Balas foto dengan `.setppgc` | 🆓 **Gratis** | Ganti foto profil ikon grup |
| `.delete` / `.del` | Balas pesan dengan `.delete` | 🆓 **Gratis** | Hapus pesan spam atau pesan bot di grup (Admin) |
| `.pin` / `.unpin` | Balas pesan dengan `.pin` | 🆓 **Gratis** | Sematkan atau lepas sematan pesan penting di grup |
| `.totag` | Balas pesan dengan `.totag` | 🆓 **Gratis** | Kutip pesan lama lalu mention semua anggota grup |
| `.listonline` | `.listonline` | 🆓 **Gratis** | Cek daftar anggota grup yang sedang aktif |
| `.afk` | `.afk <alasan>` | 🆓 **Gratis** | Set mode AFK (Away From Keyboard) saat kamu istirahat |

---

## 8. 🔎 SEARCH & PENCARIAN (BEBAS LIMIT 🆓)
> *Pencarian informasi, media, dan referensi internet langsung ke WhatsApp.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.google` | `.google <kata kunci>` | 🆓 **Gratis** | Cari hasil pencarian Google Search |
| `.gimage` | `.gimage <nama foto>` | 🆓 **Gratis** | Cari gambar di Google Images |
| `.pinterest` / `.pin` | `.pinterest <kata kunci>` | 🆓 **Gratis** | Cari foto estetis dan wallpaper di Pinterest |
| `.pixiv` | `.pixiv <nama karakter>` | 🆓 **Gratis** | Cari karya ilustrasi anime di Pixiv |
| `.wallpaper` | `.wallpaper <tema>` | 🆓 **Gratis** | Cari wallpaper beresolusi tinggi untuk HP/PC |
| `.ringtone` | `.ringtone <judul>` | 🆓 **Gratis** | Cari cuplikan nada dering dan sound effect |
| `.npm` | `.npm <nama package>` | 🆓 **Gratis** | Cari informasi library package Node.js di npmjs.com |
| `.cuaca` | `.cuaca <nama kota>` | 🆓 **Gratis** | Cek suhu dan perkiraan cuaca di kota tujuan |
| `.tenor` | `.tenor <kata kunci>` | 🆓 **Gratis** | Cari gambar animasi GIF bergerak di Tenor |
| `.urban` | `.urban <istilah slang>` | 🆓 **Gratis** | Cari arti kata gaul di Urban Dictionary |

---

## 9. 💬 QUOTES & PRIMBON (BEBAS LIMIT 🆓)
> *Kutipan motivasi, hiburan cinta, tafsir mimpi, dan ramalan jodoh tradisional.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.quotes` | `.quotes` | 🆓 **Gratis** | Kutipan inspiratif dari tokoh-tokoh ternama |
| `.motivasi` | `.motivasi` | 🆓 **Gratis** | Kata-kata penyemangat menghadapi hari |
| `.bijak` | `.bijak` | 🆓 **Gratis** | Mutiara nasihat bijak kehidupan |
| `.truth` | `.truth` | 🆓 **Gratis** | Pertanyaan kejujuran permainan Truth or Dare |
| `.dare` | `.dare` | 🆓 **Gratis** | Tantangan aksi permainan Truth or Dare |
| `.bucin` | `.bucin` | 🆓 **Gratis** | Kata-kata gombal romantis bikin baper |
| `.renungan` | `.renungan` | 🆓 **Gratis** | Renungan hati untuk muhasabah diri |
| `.artimimpi` | `.artimimpi <isi mimpi>` | 🆓 **Gratis** | Tafsir arti mimpi menurut primbon Jawa |
| `.artinama` | `.artinama <nama lengkap>` | 🆓 **Gratis** | Cari arti dan makna filosofis di balik nama |
| `.ramaljodoh` | `.ramaljodoh <nama 1> & <nama 2>` | 🆓 **Gratis** | Ramalan kecocokan jodoh pasangan |
| `.nomorhoki` | `.nomorhoki <nomor HP>` | 🆓 **Gratis** | Analisis energi keberuntungan nomor telepon |
| `.zodiak` | `.zodiak <nama zodiak>` | 🆓 **Gratis** | Ramalan zodiak seputar asmara, karir, dan keuangan |

---

## 10. 😂 FUN & HIBURAN (BEBAS LIMIT 🆓)
> *Perintah santai untuk seru-seruan bersama teman di dalam obrolan grup.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.apakah` | `.apakah <pertanyaan>` | 🆓 **Gratis** | Tanya bot apakah hal itu benar atau tidak |
| `.bisakah` | `.bisakah <pertanyaan>` | 🆓 **Gratis** | Cek kemampuan seseorang menurut bot |
| `.kapan` | `.kapan <kejadian>` | 🆓 **Gratis** | Prediksi waktu kapan sesuatu akan terjadi |
| `.cekmati` | `.cekmati <nama orang>` | 🆓 **Gratis** | Ramalan humor kapan dan kenapa ajal menjemput |
| `.cantikcek` | `.cantikcek @user` | 🆓 **Gratis** | Hitung persentase kecantikan teman |
| `.gantengcek` | `.gantengcek @user` | 🆓 **Gratis** | Hitung persentase ketampanan teman |
| `.cekkhodam` | `.cekkhodam <nama>` | 🆓 **Gratis** | Cek nama khodam mistis yang menjaga seseorang |
| `.halah` / `.hilih` / `.huluh` / `.heleh` / `.holoh` | Balas teks dengan perintah | 🆓 **Gratis** | Ubah semua huruf vokal dalam kalimat menjadi vokal terpilih |
| `.tanyakerang` | `.tanyakerang <pertanyaan>` | 🆓 **Gratis** | Minta jawaban bijak dari Kerang Ajaib SpongeBob |

---

## 11. 🌸 ANIME & WIBU (BEBAS LIMIT 🆓)
> *Koleksi gambar ilustrasi anime berkualitas tinggi.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.waifu` | `.waifu` | 🆓 **Gratis** | Kirim foto ilustrasi waifu anime acak |
| `.neko` | `.neko` | 🆓 **Gratis** | Kirim foto ilustrasi gadis kucing anime (Nekomimi) |

---

## 12. 🛠️ AUDIO & SOUND EFFECTS (BEBAS LIMIT 🆓)
> *Filter dan pengubah suara (voice changer) lokal untuk video atau rekaman suara.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.bass` | Balas audio/video dengan `.bass` | 🆓 **Gratis** | Tambahkan bass boost menggelegar pada lagu |
| `.blown` | Balas audio/video dengan `.blown` | 🆓 **Gratis** | Berikan efek audio terdistorsi keras |
| `.deep` | Balas audio/video dengan `.deep` | 🆓 **Gratis** | Ubah nada suara menjadi sangat dalam dan berat |
| `.earrape` | Balas audio/video dengan `.earrape` | 🆓 **Gratis** | Tingkatkan volume audio secara ekstrem |
| `.fast` | Balas audio/video dengan `.fast` | 🆓 **Gratis** | Percepat tempo playback audio |
| `.nightcore` | Balas audio/video dengan `.nightcore` | 🆓 **Gratis** | Ubah lagu menjadi tempo cepat dan nada tinggi (Nightcore) |
| `.reverse` | Balas audio/video dengan `.reverse` | 🆓 **Gratis** | Putar terbalik rekaman audio dari belakang ke depan |
| `.robot` | Balas audio/video dengan `.robot` | 🆓 **Gratis** | Beri filter suara robot futuristik |
| `.slow` | Balas audio/video dengan `.slow` | 🆓 **Gratis** | Perlambat tempo audio dengan efek chopped and slowed |
| `.smooth` | Balas audio/video dengan `.smooth` | 🆓 **Gratis** | Buat frekuensi audio terdengar lebih halus dan lembut |
| `.tupai` | Balas audio/video dengan `.tupai` | 🆓 **Gratis** | Buat suara menjadi melengking lucu seperti tupai kartun |

---

## 13. ⚙️ SISTEM & OWNER TOOLS (BEBAS LIMIT 🆓)
> *Pengecekan status server, sisa limit pengguna, dan perintah khusus pemilik bot.*

| Perintah / Command | Format / Argumen | Status Limit | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| `.ping` / `.speed` | `.ping` | 🆓 **Gratis** | Cek latency respon bot dan kecepatan koneksi server |
| `.runtime` / `.uptime` | `.runtime` | 🆓 **Gratis** | Lihat berapa lama bot sudah aktif menyala |
| `.profile` / `.me` | `.profile` | 🆓 **Gratis** | Cek kartu identitas Trainer, saldo uang, status VIP, dan sisa limit |
| `.limit` / `.ceklimit` | `.limit` | 🆓 **Gratis** | Cek sisa kuota limit harian untuk fitur downloader |
| `.totalfitur` | `.totalfitur` | 🆓 **Gratis** | Tampilkan ringkasan seluruh jumlah fitur yang tersedia di bot |
| `.backup` | `.backup` | 👑 **Owner** | Backup file database pengguna bot ke berkas aman |
| `.update` | `.update` | 👑 **Owner** | Tarik dan pasang pembaruan script terbaru dari repository |
| `.shutdown` / `.off` | `.shutdown` | 👑 **Owner** | Matikan server bot secara manual |
| `.setbio` | `.setbio <teks bio>` | 👑 **Owner** | Ganti bio teks "About" WhatsApp pada nomor bot |
| `.setppbot` | Balas foto dengan `.setppbot` | 👑 **Owner** | Ganti foto profil avatar bot WhatsApp |
| `.delppbot` | `.delppbot` | 👑 **Owner** | Hapus foto profil avatar bot WhatsApp |
| `.block` | `.block @user` | 👑 **Owner** | Blokir kontak WhatsApp dari bot |
| `.unblock` | `.unblock @user` | 👑 **Owner** | Buka blokir kontak WhatsApp |
| `.ban` | `.ban @user` | 👑 **Owner** | Banned nomor agar tidak bisa menggunakan semua perintah bot |
| `.unban` | `.unban @user` | 👑 **Owner** | Cabut status banned pengguna |
| `.adduang` | `.adduang @user <jumlah>` | 👑 **Owner** | Tambah saldo rekening Tracen Bank milik pengguna |
| `.addlimit` | `.addlimit @user <jumlah>` | 👑 **Owner** | Tambah kuota limit harian pengguna tertentu |
| `.setlimitbot` | `.setlimitbot <angka>` | 👑 **Owner** | Atur batas limit default harian untuk pengguna gratis |

---

### 💡 Catatan untuk Trainer / Pengguna:
1. Jika limit harian Anda habis, Anda **tetap bisa menggunakan 90% fitur bot** seperti stiker, AI, game, catur, gacha Uma Musume, dan alat grup secara bebas!
2. Kuota limit harian akan otomatis direset menjadi penuh kembali setiap hari pada pukul **00:00 WIB**.
3. Hubungi Owner untuk upgrade status akun ke **VIP / Premium** untuk menikmati akses tanpa batas limit sepuasnya!
