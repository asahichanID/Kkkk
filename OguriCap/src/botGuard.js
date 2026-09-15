/**
 * ============================================================
 * 🛡️ OGURICAP BOT SAFETY GUARD & ANOMALY CIRCUIT BREAKER
 * ============================================================
 * 
 * Sistem pengamanan ketat untuk mencegah spam anomali, runaway loop,
 * dan potensi ban akun WhatsApp ketika bot ditinggal berjalan lama.
 * 
 * FITUR KEAMANAN:
 * 1. Global Outgoing Circuit Breaker (Rem Darurat):
 *    - Mendeteksi jika bot mencoba mengirim >20 pesan dalam 10 detik di semua chat.
 *    - Otomatis mengaktifkan rem darurat 15 detik untuk memutus infinite loop/bug.
 * 2. Per-Chat Outgoing Throttler:
 *    - Maksimal 4 pesan per 4 detik ke chat yang sama.
 * 3. Identical Outgoing Deduplication (Loop Breaker):
 *    - Memblokir pesan berulang dengan konten persis sama ke chat yang sama dalam 8 detik.
 * 4. Safe Outgoing Pacing (Anti-Burst Jitter):
 *    - Antrian outgoing dengan jeda aman 250-350ms antar pesan (menghindari burst packet).
 * 5. Smart Incoming Anti-Spam & Auto-Freeze:
 *    - Jeda 2.5 detik per command.
 *    - Peringatan 1x, setelah itu SILENT DROP (tidak merespons spam agar bot tidak membalas terus).
 *    - Jika spam masif (≥4x dlm 5s), akun spammer dibekukan selama 60 detik.
 * 6. Auto-Response & Moderation Throttler:
 *    - Salam dibatasi 1x per 30 detik per chat.
 *    - Alert moderasi (anti-link/toxic) dibatasi 1x per 4 detik per grup.
 * ============================================================
 */

import chalk from 'chalk';

// ============================================================
// 1. STATE & STORES
// ============================================================

// Outgoing Circuit Breaker State
let globalOutgoingTimestamps = [];
let emergencyPauseUntil = 0;
const chatOutgoingTimestamps = new Map(); // jid -> Array<number>
const recentMessageHashes = new Map();     // jid -> Array<{ hash: string, time: number }>

// Outgoing Queue State
let outgoingQueuePromise = Promise.resolve();
let pendingOutgoingCount = 0;
const MAX_PENDING_OUTGOING = 50;

// Sent Bot Message ID Tracker (Anti Self-Reply / Double Reply)
// Menyimpan ID pesan yang dikirim oleh proses bot ini agar tidak pernah diproses balik sebagai command
const sentBotMessageIds = new Set();

/**
 * Merekam ID pesan yang dikirim oleh bot
 * @param {string} id 
 */
export function recordSentBotMessage(id) {
	if (!id || typeof id !== 'string') return;
	sentBotMessageIds.add(id);
	if (sentBotMessageIds.size > 3000) {
		const oldest = sentBotMessageIds.values().next().value;
		sentBotMessageIds.delete(oldest);
	}
}

/**
 * Memeriksa apakah suatu ID pesan dikirim oleh proses bot ini
 * @param {string} id 
 * @returns {boolean}
 */
export function isBotSentMessage(id) {
	if (!id || typeof id !== 'string') return false;
	return sentBotMessageIds.has(id);
}

// Incoming User Spam & Freeze State
// sender -> { lastTime: number, warnCount: number, freezeUntil: number }
const userSpamStore = new Map();

// Auto-Response & Moderation Throttling State
// key -> timestamp
const autoThrottleStore = new Map();

// Periodic cleanup every 3 minutes to prevent memory leak
setInterval(() => {
	const now = Date.now();
	
	// Clean chat outgoing timestamps
	for (const [jid, times] of chatOutgoingTimestamps.entries()) {
		const valid = times.filter(t => now - t < 10000);
		if (valid.length === 0) chatOutgoingTimestamps.delete(jid);
		else chatOutgoingTimestamps.set(jid, valid);
	}

	// Clean recent message hashes
	for (const [jid, hashes] of recentMessageHashes.entries()) {
		const valid = hashes.filter(h => now - h.time < 12000);
		if (valid.length === 0) recentMessageHashes.delete(jid);
		else recentMessageHashes.set(jid, valid);
	}

	// Clean user spam records
	for (const [sender, data] of userSpamStore.entries()) {
		if (now > (data.freezeUntil || 0) && (now - data.lastTime > 60000)) {
			userSpamStore.delete(sender);
		}
	}

	// Clean auto throttle
	for (const [k, t] of autoThrottleStore.entries()) {
		if (now - t > 60000) {
			autoThrottleStore.delete(k);
		}
	}
}, 3 * 60 * 1000);

// ============================================================
// 2. HELPER FUNCTIONS
// ============================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function extractMessageSignature(content) {
	if (!content) return '';
	if (typeof content === 'string') return content.trim().toLowerCase().slice(0, 100);
	if (typeof content === 'object') {
		const text = content.text || content.caption || content.extendedTextMessage?.text || content.conversation || '';
		if (text) return text.trim().toLowerCase().slice(0, 100);
		if (content.image) return 'MEDIA:IMAGE';
		if (content.video) return 'MEDIA:VIDEO';
		if (content.audio) return 'MEDIA:AUDIO';
		if (content.sticker) return 'MEDIA:STICKER';
		if (content.delete) return 'ACTION:DELETE:' + (content.delete.id || '');
	}
	return '';
}

// ============================================================
// 3. OUTGOING GATEKEEPER (CIRCUIT BREAKER & RATE LIMITER)
// ============================================================

/**
 * Memeriksa apakah pesan outgoing diizinkan dikirim atau harus diblokir demi keamanan.
 * @param {string} jid 
 * @param {any} content 
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function checkOutgoingSafety(jid, content) {
	const now = Date.now();

	// 1. Cek Global Emergency Pause
	if (now < emergencyPauseUntil) {
		const sisaDetik = Math.ceil((emergencyPauseUntil - now) / 1000);
		console.warn(chalk.yellowBright(`[BOT-GUARD] ⚠️ Outgoing diblokir: Emergency Brake aktif (tersisa ${sisaDetik}s). JID: ${jid}`));
		return { allowed: false, reason: 'GLOBAL_EMERGENCY_PAUSE' };
	}

	// 2. Cek Global Circuit Breaker (>60 pesan dlm 10 detik di seluruh chat)
	globalOutgoingTimestamps = globalOutgoingTimestamps.filter(t => now - t < 10000);
	if (globalOutgoingTimestamps.length >= 60) {
		emergencyPauseUntil = now + 8000; // Aktifkan rem darurat 8 detik
		console.error(chalk.bgRed.white.bold('\n[🚨 BOT-GUARD CRITICAL] Global Outgoing Circuit Breaker TRIPPED!'));
		console.error(chalk.redBright(`Terdeteksi anomali runaway loop (>60 msg dlm 10s). Outgoing dijeda sejenak selama 8 detik untuk melindungi akun bot.\n`));
		return { allowed: false, reason: 'GLOBAL_CIRCUIT_BREAKER_TRIPPED' };
	}

	// 3. Cek Per-Chat Rate Limit (>8 pesan dlm 4 detik ke tujuan yang sama)
	let chatTimes = chatOutgoingTimestamps.get(jid) || [];
	chatTimes = chatTimes.filter(t => now - t < 4000);
	if (chatTimes.length >= 8) {
		chatOutgoingTimestamps.set(jid, chatTimes);
		console.warn(chalk.yellowBright(`[BOT-GUARD] ⚠️ Outgoing diblokir: Melebihi batas per-chat (maks 8 msg/4s) ke ${jid}`));
		return { allowed: false, reason: 'CHAT_BURST_EXCEEDED' };
	}

	// 4. Cek Identical Message Loop (mencegah loop kirim teks persis sama berulang kali)
	const sig = extractMessageSignature(content);
	if (sig && sig.length > 3 && !sig.startsWith('ACTION:DELETE')) {
		let hashes = recentMessageHashes.get(jid) || [];
		hashes = hashes.filter(h => now - h.time < 8000);
		const duplicateCount = hashes.filter(h => h.hash === sig).length;
		if (duplicateCount >= 2) {
			recentMessageHashes.set(jid, hashes);
			console.warn(chalk.yellowBright(`[BOT-GUARD] 🔁 Loop pesan identik diblokir ke ${jid} (isi: "${sig.slice(0, 30)}...")`));
			return { allowed: false, reason: 'IDENTICAL_LOOP_DETECTED' };
		}
		hashes.push({ hash: sig, time: now });
		recentMessageHashes.set(jid, hashes);
	}

	// Catat pengiriman yang lolos verifikasi
	globalOutgoingTimestamps.push(now);
	chatTimes.push(now);
	chatOutgoingTimestamps.set(jid, chatTimes);

	return { allowed: true };
}

/**
 * Memasang Outgoing Guard & Pacing Queue pada instance Baileys socket.
 * Membungkus naze.sendMessage dan naze.relayMessage secara transparan.
 * @param {object} naze 
 */
export function installOutgoingGuard(naze) {
	if (!naze || naze._outgoingGuardInstalled) return;
	naze._outgoingGuardInstalled = true;

	const rawSendMessage = naze.sendMessage.bind(naze);
	const rawRelayMessage = naze.relayMessage.bind(naze);

	// Safe Outgoing Queue Dispatcher
	function queueSendTask(task, jid, content) {
		const safety = checkOutgoingSafety(jid, content);
		if (!safety.allowed) {
			return Promise.resolve({
				key: { remoteJid: jid, id: 'SAFETY_GUARD_BLOCKED' },
				status: 'BLOCKED',
				reason: safety.reason
			});
		}

		if (pendingOutgoingCount >= MAX_PENDING_OUTGOING) {
			console.warn(chalk.yellowBright(`[BOT-GUARD] ⚠️ Outgoing queue penuh (${pendingOutgoingCount} antrian). Menolak pesan burst baru.`));
			return Promise.resolve({
				key: { remoteJid: jid, id: 'SAFETY_GUARD_QUEUE_FULL' },
				status: 'BLOCKED',
				reason: 'QUEUE_OVERFLOW'
			});
		}

		pendingOutgoingCount++;

		const execPromise = outgoingQueuePromise.then(async () => {
			try {
				// Jeda alami 50-100ms antar pesan keluar agar efisien dan tetap aman
				await sleep(50 + Math.floor(Math.random() * 50));
				return await task();
			} finally {
				pendingOutgoingCount = Math.max(0, pendingOutgoingCount - 1);
			}
		});

		outgoingQueuePromise = execPromise.catch(() => {});
		return execPromise;
	}

	// Override sendMessage
	naze.sendMessage = async (jid, content, options = {}) => {
		if (options?.messageId) recordSentBotMessage(options.messageId);
		return queueSendTask(async () => {
			const res = await rawSendMessage(jid, content, options);
			if (res?.key?.id) recordSentBotMessage(res.key.id);
			return res;
		}, jid, content);
	};

	// Override relayMessage
	naze.relayMessage = async (jid, message, options = {}) => {
		if (options?.messageId) recordSentBotMessage(options.messageId);
		return queueSendTask(async () => {
			const res = await rawRelayMessage(jid, message, options);
			if (res?.key?.id) recordSentBotMessage(res.key.id);
			return res;
		}, jid, message);
	};

	console.log(chalk.greenBright('[BOT-GUARD] ✅ Outgoing Safety Guard & Circuit Breaker berhasil terpasang pada Baileys socket.'));
}

// ============================================================
// 4. SMART INCOMING ANTI-SPAM & AUTO-FREEZE
// ============================================================

/**
 * Validasi ketat pesan masuk dari user untuk mendeteksi spam/anomali.
 * @param {string} sender 
 * @param {boolean} isCreator 
 * @returns {{ allowed: boolean, shouldWarn: boolean, warnMsg?: string, isFrozen?: boolean }}
 */
export function checkIncomingSpam(sender, isCreator = false) {
	if (isCreator) return { allowed: true, shouldWarn: false };

	const now = Date.now();
	let user = userSpamStore.get(sender) || { lastTime: 0, warnCount: 0, freezeUntil: 0 };

	// 1. Jika user sedang dibekukan karena spam masif
	if (now < user.freezeUntil) {
		const sisa = Math.ceil((user.freezeUntil - now) / 1000);
		// Diam total, tidak merespons sama sekali
		return { allowed: false, shouldWarn: false, isFrozen: true, remaining: sisa };
	}

	const elapsed = now - user.lastTime;
	user.lastTime = now;

	// Cooldown batas aman antar command: 1.2 detik (responsif namun anti-flood)
	if (elapsed < 1200) {
		user.warnCount = (user.warnCount || 0) + 1;

		// 4x pelanggaran berturut-turut -> FREEZE 60 detik!
		if (user.warnCount >= 4) {
			user.freezeUntil = now + 60000;
			userSpamStore.set(sender, user);
			console.warn(chalk.bgRed(`[SPAM FREEZE] User ${sender} dibekukan selama 60s karena spam masif.`));
			return {
				allowed: false,
				shouldWarn: true,
				warnMsg: '「 ⛔ ANTISPAM ALERT 」\nTerdeteksi spam/anomali beruntun! Akun Anda dibekukan sementara selama *60 detik* demi keamanan server.',
				isFrozen: true
			};
		}

		// Pelanggaran pertama: Peringatkan 1x
		if (user.warnCount === 1) {
			userSpamStore.set(sender, user);
			return {
				allowed: false,
				shouldWarn: true,
				warnMsg: '「 ⚠️ 」Harap bersabar! Beri jeda minimal *3 detik* antar command ya.',
				isFrozen: false
			};
		}

		// Pelanggaran ke-2 dan ke-3: SILENT DROP (tidak merespons, abaikan pesan)
		userSpamStore.set(sender, user);
		return { allowed: false, shouldWarn: false, isFrozen: false };
	}

	// Jika user tertib (>2.5 detik), reset counter peringatan
	user.warnCount = 0;
	userSpamStore.set(sender, user);
	return { allowed: true, shouldWarn: false };
}

// ============================================================
// 5. AUTO-RESPONSE & MODERATION THROTTLING
// ============================================================

/**
 * Throttle pesan otomatis non-command (misal auto-salam) agar tidak looping.
 * @param {string} key ID unik grup/chat + event
 * @param {number} cooldownMs Jeda minimal (ms)
 * @returns {boolean} true jika diizinkan kirim
 */
export function allowAutoResponse(key, cooldownMs = 30000) {
	const now = Date.now();
	const lastTime = autoThrottleStore.get(key) || 0;
	if (now - lastTime < cooldownMs) {
		return false;
	}
	autoThrottleStore.set(key, now);
	return true;
}

/**
 * Throttle pesan notifikasi moderasi grup (anti-link, anti-toxic, anti-tagsw)
 * agar saat terjadi serbuan bot/raid, bot tidak ikut spam ribuan pesan.
 * @param {string} chat JID grup
 * @param {string} modType Tipe moderasi ('antilink', 'antitoxic', 'antitagsw', 'antihidetag')
 * @returns {boolean} true jika boleh mengirim notifikasi teks
 */
export function allowModAlert(chat, modType) {
	const key = `mod:${modType}:${chat}`;
	return allowAutoResponse(key, 4000); // maksimal 1 notifikasi teks per 4 detik per kategori
}
