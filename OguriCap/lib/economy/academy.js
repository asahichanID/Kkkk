export const audit = async (naze, m, db, args, isCreator, participants) => {
	try {
		const isOwner = Boolean(isCreator || m?.key?.fromMe);
		if (!isOwner) return m.reply('❌ Khusus Owner Bot!');

		const mode = (args[0] || '').toLowerCase();
		if (mode === 'semua' || mode === 'all_group') {
			if (!m.isGroup) return m.reply('❌ Hanya bisa di grup.');
			const groupMembers = Array.isArray(participants) && participants.length > 0
				? participants
				: (m.metadata?.participants || []);

			let totalDisita = 0;
			for (const member of groupMembers) {
				const u = db.users[member.id];
				if (u && u.money > 1000) {
					const sita = Math.floor(u.money * 0.1);
					u.money -= sita;
					totalDisita += sita;
				}
			}
			if (!db.bank) db.bank = {};
			db.bank.kas = (db.bank.kas || 0) + totalDisita;
			return m.reply(`⚖️ *AUDIT SELESAI*\nTotal ${totalDisita.toLocaleString('id-ID')} Carats disita dari 10% saldo anggota grup dan dimasukkan ke kas bank.`);
		}

		return m.reply(`Gunakan:\n- *.audit semua* (Sita 10% carats member grup ke kas bank)`);
	} catch (err) {
		console.error('[AUDIT]', err);
		return m.reply('❌ Gagal menjalankan audit.');
	}
};

export const bansos = async (naze, m, db, args, isCreator, participants) => {
	try {
		const isOwner = Boolean(isCreator || m?.key?.fromMe);
		if (!isOwner) return m.reply('❌ Khusus Owner Bot!');

		const nominal = parseInt(args[0]) || 5000;
		if (!m.isGroup) return m.reply('❌ Bansos hanya bisa dibagikan di dalam grup.');

		const groupMembers = Array.isArray(participants) && participants.length > 0
			? participants
			: (m.metadata?.participants || []);

		let count = 0;
		for (const member of groupMembers) {
			if (!db.users[member.id]) continue;
			db.users[member.id].money = (db.users[member.id].money || 0) + nominal;
			count++;
		}

		return m.reply(`🎁 *BANSOS DIBAGIKAN!*\nSebesar ${nominal.toLocaleString('id-ID')} Carats dibagikan kepada ${count} anggota grup.`);
	} catch (err) {
		console.error('[BANSOS]', err);
		return m.reply('❌ Gagal membagikan bansos.');
	}
};
