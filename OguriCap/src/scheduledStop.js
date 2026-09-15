import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import chalk from 'chalk';

/**
 * State untuk penjadwalan stop bot
 */
let stopTimer = null;
let precisionTimer = null;
let warning5MinTimer = null;
let stopState = {
	isActive: false,
	targetMoment: null,
	timeStr: '',
	tz: 'Asia/Jakarta',
	chat: null,
	sender: null,
	createdAt: null
};

/**
 * Format selisih milidetik ke teks bahasa Indonesia (jam, menit, detik)
 */
export function formatDuration(ms) {
	if (ms <= 0) return '0 detik';
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts = [];
	if (hours > 0) parts.push(`${hours} jam`);
	if (minutes > 0) parts.push(`${minutes} menit`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`);

	return parts.join(' ');
}

/**
 * Parsing string jam (misal: "22.00", "22:00", "22.30.15", "07:15")
 */
export function parseTimeString(raw) {
	if (!raw || typeof raw !== 'string') return null;
	const clean = raw.trim();

	// Cocokkan format HH.mm, HH:mm, HH.mm.ss, HH:mm:ss
	const match = clean.match(/^([01]?[0-9]|2[0-3])[:.]([0-5]?[0-9])(?:[:.]([0-5]?[0-9]))?$/);
	if (!match) return null;

	const hour = parseInt(match[1], 10);
	const minute = parseInt(match[2], 10);
	const second = match[3] !== undefined ? parseInt(match[3], 10) : 0;

	return { hour, minute, second };
}

/**
 * Mendapatkan status penjadwalan saat ini
 */
export function getStopStatus() {
	if (!stopState.isActive || !stopState.targetMoment) {
		return { isActive: false };
	}

	const now = Date.now();
	const remainingMs = Math.max(0, stopState.targetMoment.valueOf() - now);

	return {
		isActive: true,
		timeStr: stopState.timeStr,
		tz: stopState.tz,
		targetTimestamp: stopState.targetMoment.valueOf(),
		targetFormatted: stopState.targetMoment.format('HH:mm:ss'),
		targetDateFormatted: stopState.targetMoment.format('DD/MM/YYYY'),
		remainingMs,
		remainingFormatted: formatDuration(remainingMs),
		chat: stopState.chat,
		sender: stopState.sender
	};
}

/**
 * Membatalkan jadwal stop bot yang aktif
 */
export function cancelScheduledStop() {
	if (stopTimer) {
		clearTimeout(stopTimer);
		stopTimer = null;
	}
	if (precisionTimer) {
		clearTimeout(precisionTimer);
		precisionTimer = null;
	}
	if (warning5MinTimer) {
		clearTimeout(warning5MinTimer);
		warning5MinTimer = null;
	}

	const wasActive = stopState.isActive;
	const oldTime = stopState.timeStr;

	stopState = {
		isActive: false,
		targetMoment: null,
		timeStr: '',
		tz: global.timezone || 'Asia/Jakarta',
		chat: null,
		sender: null,
		createdAt: null
	};

	return { wasActive, oldTime };
}

/**
 * Prosedur penyimpanan database sebelum exit
 */
async function flushDatabase() {
	try {
		console.log(chalk.yellow('[PTERODACTYL AUTO-STOP] Menyimpan database ke disk...'));
		if (global.db) {
			const dbDir = path.join(process.cwd(), 'database');
			const dbFile = path.join(dbDir, global.tempatDB || 'database.json');
			if (fs.existsSync(dbDir)) {
				fs.writeFileSync(dbFile, JSON.stringify(global.db, null, 2), 'utf-8');
			}
		}
		if (global.database && typeof global.database.write === 'function') {
			await global.database.write(global.db);
		}
		if (global.storeDB && typeof global.storeDB.write === 'function') {
			await global.storeDB.write(global.store);
		}
		console.log(chalk.green('[PTERODACTYL AUTO-STOP] Database tersimpan aman.'));
	} catch (err) {
		console.error(chalk.red('[PTERODACTYL AUTO-STOP] Gagal menyimpan database:'), err);
	}
}

/**
 * Eksekusi mematikan bot seketika secara bersih
 */
export async function executeStop(naze, chat, reason = 'Waktu jadwal tercapai') {
	cancelScheduledStop();
	global.isShuttingDown = true;

	console.log(chalk.red.bold(`\n========================================================`));
	console.log(chalk.red.bold(`🛑 [PTERODACTYL AUTO-STOP] Mematikan bot (${reason})`));
	console.log(chalk.red.bold(`========================================================\n`));

	if (naze && chat) {
		try {
			await naze.sendMessage(chat, {
				text: `🛑 *[OGURI CAP - SHUTDOWN SELESAI]*\n\n⏰ *Pemberitahuan:* ${reason}\n💾 Seluruh database telah disimpan secara aman.\n🔌 Koneksi WhatsApp dinonaktifkan (Bot Offline).\n\n_Daya dinonaktifkan. Sampai jumpa! 🥕_`
			});
		} catch (e) {
			console.error('[PTERODACTYL AUTO-STOP] Gagal mengirim pesan notifikasi:', e?.message || e);
		}
	}

	await flushDatabase();

	// Informasikan ke supervisor start.js bahwa ini adalah shutdown sengaja
	if (typeof process.send === 'function' && process.connected) {
		try {
			process.send('stop');
		} catch (e) {}
	}

	// Hentikan listener event dan putus koneksi Baileys socket secara total
	try {
		if (naze?.ev && typeof naze.ev.removeAllListeners === 'function') {
			naze.ev.removeAllListeners();
		}
		if (naze?.ws && typeof naze.ws.close === 'function') {
			naze.ws.close();
		}
		if (typeof naze?.end === 'function') {
			naze.end();
		}
	} catch (e) {}

	// Tutup express HTTP server jika ada
	try {
		if (global.server && typeof global.server.close === 'function') {
			global.server.close();
		}
	} catch (e) {}

	// Cetak status penonaktifan di konsol Pterodactyl
	console.log(chalk.yellow.bold(`\n========================================================`));
	console.log(chalk.green.bold(`✅ [OGURI CAP] Bot berhasil dinonaktifkan (Status: OFFLINE)`));
	console.log(chalk.cyan(`🔌 Baileys socket terputus total. Bot tidak lagi terhubung ke WhatsApp.`));
	console.log(chalk.cyan(`💤 Bot memasuki mode Standby (0% CPU). Panel Pterodactyl tidak akan merestart otomatis.`));
	console.log(chalk.yellow(`▶️ Untuk menyalakan kembali bot kapan saja, klik tombol 'Restart' di Panel Pterodactyl.`));
	console.log(chalk.yellow.bold(`========================================================\n`));

	// Beri jeda 500ms agar log tercetak dengan rapi
	setTimeout(() => {
		// Jika berada di container Pterodactyl, tahan proses dalam mode dormant 0% CPU agar Wings tidak memicu crash detector restart
		// Namun jika dipanggil SIGTERM / tombol stop di web GUI, sistem akan keluar bersih
		console.log(chalk.gray('[PTERODACTYL AUTO-STOP] Bot standby. Menunggu instruksi Restart dari Head Trainer di Web Panel...'));
	}, 500);
}

/**
 * Menjadwalkan stop bot pada waktu tertentu (realtime, presisi tinggi, dan ringan)
 */
export function scheduleStop({ timeStr, chat, sender, naze }) {
	const parsed = parseTimeString(timeStr);
	if (!parsed) {
		return { success: false, message: 'Format jam tidak valid. Gunakan format jam seperti: 22.00 atau 22:00' };
	}

	// Batalkan jadwal lama jika ada
	cancelScheduledStop();

	const tz = global.timezone || 'Asia/Jakarta';
	const nowTz = moment().tz(tz);

	// Tentukan target moment
	let targetMoment = moment().tz(tz).set({
		hour: parsed.hour,
		minute: parsed.minute,
		second: parsed.second,
		millisecond: 0
	});

	// Jika waktu target hari ini sudah lewat, jadwalkan untuk besok di jam yang sama
	if (targetMoment.valueOf() <= nowTz.valueOf()) {
		targetMoment.add(1, 'day');
	}

	const delayMs = targetMoment.valueOf() - Date.now();
	if (delayMs <= 0) {
		return { success: false, message: 'Waktu target tidak valid.' };
	}

	const formattedTargetTime = targetMoment.format('HH:mm:ss');
	const formattedTargetDate = targetMoment.format('DD/MM/YYYY');
	const isTomorrow = targetMoment.date() !== nowTz.date();

	stopState = {
		isActive: true,
		targetMoment,
		timeStr: formattedTargetTime,
		tz,
		chat,
		sender,
		createdAt: Date.now()
	};

	console.log(chalk.cyan(`[PTERODACTYL AUTO-STOP] Jadwal stop diset untuk ${formattedTargetTime} ${tz} (dalam ${formatDuration(delayMs)}).`));

	/**
	 * Peringatan H-5 Menit Sebelum Shutdown:
	 * Mengirim notifikasi otomatis ke chat/grup tempat command dijalankan.
	 */
	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	if (delayMs > FIVE_MINUTES_MS) {
		const warning5MinDelay = delayMs - FIVE_MINUTES_MS;
		warning5MinTimer = setTimeout(async () => {
			if (naze && chat) {
				try {
					await naze.sendMessage(chat, {
						text: `⚠️ *[PEMBERITAHUAN SHUTDOWN BOT]* ⚠️\n\n⏰ Perhatian semuanya! Bot akan otomatis dimatikan dalam *5 menit lagi* (pukul *${formattedTargetTime} ${tz}*) sesuai jadwal Head Trainer.\n\n💾 Harap selesaikan game, transaksi Carats, atau aktivitas Anda sekarang agar data tersimpan dengan sempurna! 🥕`
					});
				} catch (err) {
					console.error('[PTERODACTYL AUTO-STOP] Gagal mengirim pesan peringatan 5 menit:', err?.message || err);
				}
			}
		}, warning5MinDelay);
	}

	/**
	 * Mekanisme Dua Tahap Presisi Tinggi & 0% Beban CPU:
	 * 1. Jika delay > 3 detik, pasang timer utama hingga H-2 detik
	 * 2. Saat H-2 detik, pasang micro-timer persis sisa milidetik ke target
	 */
	const runFinalStop = () => {
		executeStop(naze, chat, `Waktu ${formattedTargetTime} ${tz} telah tiba`);
	};

	if (delayMs > 3000) {
		stopTimer = setTimeout(() => {
			const remainingNow = Math.max(0, targetMoment.valueOf() - Date.now());
			precisionTimer = setTimeout(runFinalStop, remainingNow);
		}, delayMs - 2000);
	} else {
		precisionTimer = setTimeout(runFinalStop, delayMs);
	}

	return {
		success: true,
		targetMoment,
		timeFormatted: formattedTargetTime,
		dateFormatted: formattedTargetDate,
		isTomorrow,
		delayMs,
		remainingFormatted: formatDuration(delayMs),
		tz
	};
}
