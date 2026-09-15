/**
 * OguriCap Limit Manager
 * Mengatur batas penggunaan perintah (Limit) bot:
 * - Free user: Limit 5 per hari
 * - VIP user & Owner: Bebas limit (Unlimited)
 * - Jika limit habis, bot HANYA mengirim pesan suara Oguri Cap 1 kali
 * - Percakapan selanjutnya dari user yang sama diabaikan tanpa spam
 */

export const OGURI_LIMIT_MESSAGE = `🥕 *Oguri Cap:*
"Haaah... Nafasku habis, Trainer... Energiku (limit) untukmu hari ini sudah habis! 🍚
Aku harus istirahat dan makan wortel dulu... 🥕
Limit harianmu (${global.limit?.free || 5} limit) akan terisi kembali besok pukul 00:00 WIB, atau Trainer bisa upgrade ke VIP untuk akses tanpa batas!"`.trim();

// ============================================================
// 🎫 FITUR BER-LIMIT (KHUSUS DOWNLOADER, IQC, & BRATVID)
// Sesuai aturan: Hanya fitur eksternal/berat yang memiliki batas limit harian.
// Seluruh fitur lokal (sticker, AI, RPG Uma Musume, game, tools, grup, quotes, dll.) BEBAS LIMIT!
// ============================================================
export const limitedCommands = new Set([
	// Downloader: YouTube & Musik
	'play', 'ytplay', 'play2', 'ytplay2', 'spotify2',
	'ytmp3', 'yta', 'ytmp4', 'ytv', 'ytdl',
	// Downloader: TikTok
	'tt', 'tiktok', 'ttmp3', 'tta', 'ttdl', 'tiktokdl',
	// Downloader: Instagram
	'ig', 'igdl', 'instagram', 'igvideo', 'igimage', 'igvideoall', 'igimageall', 'igstory', 'reels',
	// Downloader: Facebook
	'fb', 'fbdl', 'fbdown', 'facebook', 'facebookdl', 'facebookdown', 'fbdownload', 'fbmp4', 'fbvideo',
	// Downloader: Spotify
	'spotify', 'spotifysearch', 'spotify_pilih', 'spotifydl',
	// Downloader: File & Cloud Hosting
	'mediafire', 'mf', 'git', 'gitclone', 'gdrive', 'capcut', 'snackvideo', 'threads', 'twitter', 'x', 'soundcloud',
	
	// Fitur Khusus: IQC (Fake Quote iPhone)
	'iqc',
	
	// Fitur Khusus: Brat Video (Video GIF animasi brat)
	'bratvid', 'bratvideo'
]);

/**
 * Memeriksa apakah suatu perintah termasuk dalam kategori yang dibatasi limit.
 * @param {string} cmd Nama perintah
 * @returns {boolean} true jika perintah memerlukan limit
 */
export function isLimitedCommand(cmd = '') {
	const clean = (cmd || '').toLowerCase().trim();
	return limitedCommands.has(clean);
}

// Backward compatibility jika ada modul yang mengimpor freeCommands
export const freeCommands = {
	has: (cmd) => !isLimitedCommand(cmd)
};

/**
 * Memeriksa dan memotong limit untuk perintah bot.
 * HANYA perintah dalam limitedCommands (downloader, iqc, bratvid) yang dipotong limit.
 * Perintah umum dan lokal lainnya SELALU diizinkan tanpa memotong limit.
 * 
 * @param {object} naze - Baileys client
 * @param {object} m - Objek pesan
 * @param {object} db - Database global
 * @param {boolean} isCreator - Apakah pengirim adalah Owner/Creator
 * @param {string} cmd - Nama command yang dipanggil
 * @returns {Promise<boolean>} true jika diizinkan, false jika diblokir oleh limit
 */
export async function handleUserLimit(naze, m, db, isCreator, cmd = '') {
	const sender = m.sender;
	if (!sender) return true;

	const cleanCmd = (cmd || '').toLowerCase().trim();

	// 1. Jika BUKAN perintah terbatas (bukan downloader, iqc, bratvid),
	// SELALU izinkan langsung tanpa memotong limit! (Bebas limit / Lokal)
	if (!isLimitedCommand(cleanCmd)) return true;

	if (!db.users) db.users = {};
	if (!db.users[sender]) {
		db.users[sender] = {
			vip: false,
			limit: global.limit?.free || 5,
			limitNotified: false
		};
	}

	const user = db.users[sender];
	const isVip = isCreator || Boolean(user.vip);

	// VIP & Owner: Akses tanpa batas (Unlimited), tidak pernah dipotong limit
	if (isVip) return true;

	// Pastikan nilai limit adalah angka yang valid
	if (typeof user.limit !== 'number' || isNaN(user.limit)) {
		user.limit = global.limit?.free || 5;
	}

	// Jika limit untuk fitur berat ini sudah habis (<= 0)
	if (user.limit <= 0) {
		user.limit = 0;
		// Kirim teks notifikasi Oguri Cap HANYA 1 KALI saja
		if (!user.limitNotified) {
			user.limitNotified = true;
			global._dbDirty = true;
			try {
				await m.reply(OGURI_LIMIT_MESSAGE);
			} catch (e) {
				console.error('[LIMIT] Gagal mengirim peringatan limit Oguri:', e);
			}
		}
		// Selebihnya diam (silent return) agar tidak spam jika terus mencoba
		return false;
	}

	// Jika masih memiliki limit, potong 1 limit untuk fitur berat ini
	user.limit -= 1;
	if (user.limit < 0) user.limit = 0;
	user.limitNotified = false; // Reset status notifikasi selama masih punya sisa limit
	global._dbDirty = true;
	return true;
}
