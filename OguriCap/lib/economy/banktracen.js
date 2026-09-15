import { addBankActivity } from './bankaktivitas.js';

export const banktracen = async (
	naze,
	m,
	db,
	isCreator,
	owner
) => {
	try {
		let bank = db.bank;
		let user = db.users[m.sender];
		if (!user) return m.reply('❌ User tidak ditemukan');
		if (!user.lastBank) user.lastBank = 0;

		let now = Date.now();
		let cooldown = 86400000;
		let sisa = cooldown - (now - user.lastBank);

		if (sisa > 0) {
			let jam = Math.floor(sisa / 3600000);
			let menit = Math.floor((sisa % 3600000) / 60000);
			return m.reply(
`🏦 𝐊𝐀𝐒 𝐁𝐎𝐓 𝐁𝐀𝐍𝐊
💸 Kamu sudah mengambil dana bantuan hari ini.
⏳ Tunggu *${jam} jam ${menit} menit* lagi.`
			);
		}

		let kas = bank.kas || 0;
		if (kas <= 0) {
			return m.reply(
`🏦 𝐊𝐀𝐒 𝐁𝐎𝐓 𝐁𝐀𝐍𝐊
❌ Kas Bank sedang kosong.
Tunggu setoran pajak dan transaksi pengguna lain.`
			);
		}

		let batasPenarikan = 50000;
		let jumlah = Math.min(batasPenarikan, kas);

		user.money = (user.money || 0) + jumlah;
		bank.kas -= jumlah;
		bank.totalTarik = (bank.totalTarik || 0) + jumlah;
		bank.danaKeluar = (bank.danaKeluar || 0) + jumlah;
		bank.totalTransaksi = (bank.totalTransaksi || 0) + 1;
		user.lastBank = now;

		addBankActivity(db, `@${m.sender.split('@')[0]} mengambil bantuan kas sebesar ${jumlah.toLocaleString('id-ID')} Carats`);

		return m.reply(
`🏦 𝐊𝐀𝐒 𝐁𝐎𝐓 𝐁𝐀𝐍𝐊 𝐒𝐔𝐊𝐒𝐄𝐒
💸 Berhasil mengambil: +${jumlah.toLocaleString('id-ID')} Carats
💰 Saldo Kamu: ${(user.money).toLocaleString('id-ID')} Carats
🏛️ Sisa Kas Bank: ${(bank.kas).toLocaleString('id-ID')} Carats`
		);
	} catch (err) {
		console.error('[BANK TRACEN]', err);
		return m.reply('❌ Terjadi kesalahan pada sistem Bank.');
	}
};

export const cekbank = async (naze, m, db) => {
	try {
		let bank = db.bank || {};
		let kas = (bank.kas || 0).toLocaleString('id-ID');
		let pajak = (bank.totalPajak || 0).toLocaleString('id-ID');
		let tarik = (bank.totalTarik || 0).toLocaleString('id-ID');
		let trx = (bank.totalTransaksi || 0).toLocaleString('id-ID');

		let aktivitas = (bank.aktivitas || []).slice(0, 5).map((a, i) => {
			let d = new Date(a.waktu);
			let time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
			return `├ ${i + 1}. [${time}] ${a.text}`;
		}).join('\n') || '├ Belum ada aktivitas transaksi.';

		let text =
`╭─❖「 🏦 𝐈𝐍𝐅𝐎 𝐊𝐀𝐒 𝐁𝐀𝐍𝐊 𝐁𝐎𝐓 」
│
│ 🏛️ *Total Kas Saat Ini:* ${kas} Carats
│ 📈 *Total Pajak Masuk:* ${pajak} Carats
│ 📉 *Total Bantuan Keluar:* ${tarik} Carats
│ 🔄 *Total Transaksi:* ${trx}
│
├─❖「 📜 𝐀𝐊𝐓𝐈𝐕𝐈𝐓𝐀𝐒 𝐓𝐄𝐑𝐀𝐊𝐇𝐈𝐑 」
${aktivitas}
╰───────────────────────────❖`;

		return m.reply(text);
	} catch (err) {
		console.error('[CEK BANK]', err);
		return m.reply('❌ Gagal memeriksa saldo Kas Bank.');
	}
};
