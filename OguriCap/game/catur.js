/**
 * Handler Game Catur 3D Multiplayer untuk WhatsApp Bot OguriCap
 */

import fs from 'fs';
import path from 'path';
import { CaturManager } from './caturWs.js';

const TUTORIAL_STORAGE_PATH = path.join(process.cwd(), 'database', 'catur_tutorial_users.json');

// Membaca daftar pengguna yang sudah pernah melihat tutorial catur
function getTutorialUsers() {
  try {
    if (!fs.existsSync(TUTORIAL_STORAGE_PATH)) {
      fs.mkdirSync(path.dirname(TUTORIAL_STORAGE_PATH), { recursive: true });
      fs.writeFileSync(TUTORIAL_STORAGE_PATH, JSON.stringify([]));
      return new Set();
    }
    const raw = fs.readFileSync(TUTORIAL_STORAGE_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

// Menyimpan pengguna yang sudah menerima tutorial
function markTutorialShown(senderJid) {
  try {
    const users = getTutorialUsers();
    users.add(senderJid);
    fs.mkdirSync(path.dirname(TUTORIAL_STORAGE_PATH), { recursive: true });
    fs.writeFileSync(TUTORIAL_STORAGE_PATH, JSON.stringify(Array.from(users), null, 2));
  } catch (err) {
    console.error('[CATUR] Gagal simpan catur_tutorial_users:', err);
  }
}

/**
 * Teks tutorial memainkan catur (detail tapi to the point)
 */
export const TEKS_TUTORIAL_CATUR = `📖 *PANDUAN LENGKAP & CEPAT CATUR 3D*
━━━━━━━━━━━━━━━━━━━━━━
🎯 *Tujuan:* Jebak Raja lawan sampai tidak ada langkah legal tersisa (*Skakmat / Checkmate*).

🕹️ *2 MODE PERMAINAN:*
1. 🤖 *[Lawan Bot AI]:*
   • Latihan solo langsung di browser.
   • Tersedia 4 tingkat kesulitan:
     - 🟢 *Easy:* Santai & sering blunder, cocok untuk pemula.
     - 🔵 *Normal:* Sedang, paham nilai bidak & makan perwira gratis.
     - 🟠 *Hard:* Sulit, bermain agresif & menguasai petak sentral.
     - 🔴 *Extreme:* Master, kalkulasi taktis mendalam minim blunder!
2. 👥 *[2 Player Multiplayer]:*
   • Tanding realtime antar pemain via WebSocket.
   • Cukup masukkan kode 4 digit, otomatis langsung mulai tanding!

♟️ *GERAKAN BIDAK:*
• ♙ *Pion (Pawn):* Maju 1 petak ke depan (langkah pertama bisa 2 petak). Makan musuh diagonal 1 petak.
• ♘ *Kuda (Knight):* Gerakan huruf *L* (2 petak lurus + 1 belok). Bidak yang *bisa melompati* bidak lain!
• ♗ *Gajah (Bishop):* Meluncur miring (diagonal) bebas di jalur warnanya.
• ♖ *Benteng (Rook):* Meluncur lurus (vertikal / horizontal) bebas sejauh tidak terhalang.
• ♕ *Menteri / Ratu (Queen):* Bidak terkuat! Bebas melangkah lurus maupun diagonal.
• ♔ *Raja (King):* Melangkah 1 petak ke segala arah. Wajib selalu dilindungi!

⚡ *ATURAN PENTING:*
1. ⚔️ *Skak (Check):* Raja diserang! Wajib selamatkan raja.
2. 👑 *Skakmat (Checkmate):* Raja terancam mati tanpa jalan keluar = *MENANG!*
3. 🤝 *Remis (Draw/Stalemate):* Tidak ada langkah sah tersisa & raja tidak diskak.`;

export async function kirimCatur(sock, chatId, senderJid, args = []) {
  try {
    const subCmd = (args[0] || '').toLowerCase().trim();
    const sender = senderJid || chatId;
    const tutorialUsers = getTutorialUsers();
    const hasSeenTutorial = tutorialUsers.has(sender);

    // Dapatkan URL dasar bot
    const baseUrl = process.env.APP_URL
      || (process.env.AIS_DEV_URL || 'https://ais-dev-ic3ftvrdbjctievskdq2ae-743012417910.asia-east1.run.app');

    // Jika user secara spesifik meminta .catur tutorial
    if (subCmd === 'tutorial' || subCmd === 'tutor' || subCmd === 'panduan' || subCmd === 'guide') {
      markTutorialShown(sender);
      return sock.sendMessage(chatId, {
        text: TEKS_TUTORIAL_CATUR
      });
    }

    // Generate room catur 4 digit baru (jika ingin beralih ke 2-player)
    const { code } = CaturManager.createRoomDirect('Pemain 1');
    const playUrl = `${baseUrl.replace(/\/$/, '')}/?tab=catur`;

    let caption = [
      "♟️ *CATUR 3D KLASIK REALTIME*",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "🤖 *Otomatis Mode Lawan Bot (Normal)*",
      "Papan catur 3D langsung aktif dan siap dimainkan!",
      "Tingkat tantangan (*Easy, Normal, Hard, Extreme*) bisa kamu pilih langsung di *bagian atas papan catur*.",
      "",
      `🌐 *Tautan Langsung Main:*`,
      `${playUrl}`,
      "",
      "👥 *Mau Tanding 2-Player Bareng Teman?*",
      `🔑 *Kode Room:* \`${code}\` *(4 Digit)*`,
      `Cukup klik tombol *[👥 2-Player]* di bagian atas papan catur dan bagikan kode di atas ke temanmu!`
    ];

    // Jika pengguna BARU pertama kali menjalankan .catur, lampirkan tutorialnya sekali doang
    if (!hasSeenTutorial) {
      caption.push("");
      caption.push(TEKS_TUTORIAL_CATUR);
      markTutorialShown(sender);
    } else {
      caption.push("");
      caption.push("💡 *Tips:* Ketik *.catur tutorial* kapan saja jika ingin membaca ulang gerakan bidak & strategi catur.");
    }

    await sock.sendMessage(chatId, {
      text: caption.join("\n")
    });

  } catch (err) {
    console.error('[CATUR]', err?.message || err);
    await sock.sendMessage(chatId, {
      text: '❌ Gagal membuat room catur: ' + (err?.message || err)
    }).catch(() => {});
  }
}

const pluginConfig = {
  name: "catur",
  alias: ['chess', 'ct'],
  category: "game",
  description: "Catur 3D Multiplayer Realtime via WebSocket (2 Player)",
  usage: ".catur / .catur tutorial",
  example: ".catur",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 1,
  energi: 0,
  isEnabled: true,
};

async function handler(m, options = {}) {
  const sock = options?.sock || options?.conn || options?.naze || options;
  const chatId = m?.chat || m?.key?.remoteJid;
  const senderJid = m?.sender || m?.key?.participant || chatId;
  const args = m?.args || [];
  try {
    await kirimCatur(sock, chatId, senderJid, args);
  } catch (e) {
    console.error("[CATUR]", e?.message || e);
    if (m?.reply) await m.reply("❌ Gagal mengirim game: " + (e?.message || e));
  }
}

export { pluginConfig as config, handler };
export default handler;
