/**
 * RPG NPC and Monster Database
 * Mengelola ratusan NPC (Warga, Pengawal, Pedagang, Quest Giver) dan Monster di tiap wilayah.
 */

export const KEY_NPCS = [
	// ================= VALORIA (HUMAN KINGDOM) =================
	{
		id: 'npc_valoria_king',
		name: 'Raja Arthurian IV',
		title: 'Raja Valoria',
		mapId: 'valoria_city',
		x: 410,
		y: 280,
		role: 'quest',
		nation: 'VALORIA',
		race: 'Human',
		avatar: '👑',
		color: '#ffd700',
		dialogue: [
			'Selamat datang di Valoria, wahai petualang! Cahaya suci akan menuntun langkahmu.',
			'Kekuatan roh rubah legendaris telah mulai bangkit kembali di benua ini. Rawatlah dengan bijak.',
			'Bantulah rakyatku mengamankan Hutan Berbisik dari serbuan makhluk bayangan!'
		],
		quest: {
			id: 'quest_cleanse_forest',
			title: 'Pembersihan Hutan Berbisik',
			desc: 'Kalahkan 5 Goblin atau Serigala di Hutan Berbisik.',
			targetKills: 5,
			rewardExp: 350,
			rewardGold: 200,
			rewardFoxSoul: 25
		}
	},
	{
		id: 'npc_valoria_alchemist',
		name: 'Elena Sang Alkemis',
		title: 'Pedagang Potion',
		mapId: 'valoria_city',
		x: 490,
		y: 860,
		role: 'merchant',
		nation: 'VALORIA',
		race: 'Human',
		avatar: '🧪',
		color: '#4ade80',
		dialogue: [
			'Ramuan segar baru saja selesai diracik! Butuh pemulih HP atau pengisi MP?',
			'Hati-hati jika bertualang ke luar tembok kota, dunia luar penuh bahaya.'
		],
		shop: [
			{ id: 'item_hp_potion', name: 'Potion HP Menengah', cost: 30, healHp: 180, desc: 'Memulihkan 180 HP seketika.' },
			{ id: 'item_mp_potion', name: 'Elixir MP Murni', cost: 40, healMp: 140, desc: 'Memulihkan 140 MP seketika.' },
			{ id: 'item_fox_charm', name: 'Jimat Roh Rubah', cost: 150, addSoul: 40, desc: 'Menambah 40 Soul Spirit Fox.' }
		]
	},
	{
		id: 'npc_valoria_guild',
		name: 'Komandan Roger',
		title: 'Ketua Guild Ksatria',
		mapId: 'valoria_city',
		x: 910,
		y: 870,
		role: 'guild',
		nation: 'VALORIA',
		race: 'Human',
		avatar: '⚔️',
		color: '#60a5fa',
		dialogue: [
			'Pedang tajam diasah dari disiplin dan ribuan pertempuran!',
			'Setiap ksatria harus siap mempertahankan keadilan dan kedamaian kerajaan.'
		],
		quest: {
			id: 'quest_ruins_scout',
			title: 'Penyelidikan Reruntuhan Kuno',
			desc: 'Hancurkan 2 Pilar Kuno yang telah dirasuki kegelapan.',
			targetDestructions: 2,
			rewardExp: 500,
			rewardGold: 350,
			rewardFoxSoul: 40
		}
	},

	// ================= FANGHEIM (BEASTKIN CLAN) =================
	{
		id: 'npc_fangheim_chieftain',
		name: 'Garruk Cakar Besi',
		title: 'Kepala Suku Beastkin',
		mapId: 'fangheim_fortress',
		x: 410,
		y: 335,
		role: 'quest',
		nation: 'FANGHEIM',
		race: 'Beastkin',
		avatar: '🦁',
		color: '#fb923c',
		dialogue: [
			'Hahaha! Kuat atau mati, itulah hukum rimba Fangheim!',
			'Kami menghormati pejuang sejati tanpa memandang ras atau asal usul.',
			'Tunjukkan taring dan cakarmu di arena, jangan membuat suku kami kecewa!'
		],
		quest: {
			id: 'quest_gladiator_trial',
			title: 'Ujian Gladiator Taring',
			desc: 'Kalahkan 6 musuh dan buktikan keperkasaan fisikmu!',
			targetKills: 6,
			rewardExp: 450,
			rewardGold: 300,
			rewardFoxSoul: 35
		}
	},
	{
		id: 'npc_fangheim_blacksmith',
		name: 'Brok Si Pelebur Baja',
		title: 'Pandai Besi Legendaris',
		mapId: 'fangheim_fortress',
		x: 1080,
		y: 325,
		role: 'merchant',
		nation: 'FANGHEIM',
		race: 'Beastkin',
		avatar: '🔨',
		color: '#f87171',
		dialogue: [
			'Baja terbaik ditempa dengan api naga dan keringat murni!',
			'Senjata tumpul hanya akan mengantarmu ke liang lahat. Mau upgrade?'
		],
		shop: [
			{ id: 'item_atk_buff', name: 'Minyak Asah Taring', cost: 60, buffAtk: 15, durationMs: 60000, desc: '+15 ATK selama 60 detik.' },
			{ id: 'item_def_buff', name: 'Pelat Zirah Beruang', cost: 60, buffDef: 12, durationMs: 60000, desc: '+12 DEF selama 60 detik.' }
		]
	},

	// ================= RUINS & ABYSS LORE NPCS =================
	{
		id: 'npc_ruins_scholar',
		name: 'Pertapa Rubah Putih',
		title: 'Penjaga Segel Kuno',
		mapId: 'crumbling_ruins',
		x: 800,
		y: 340,
		role: 'lore',
		nation: 'NEUTRAL',
		race: 'Fox Spirit',
		avatar: '🦊',
		color: '#c084fc',
		dialogue: [
			'Roh rubah berekor sebelas tertidur di kedalaman dimensi kosmis...',
			'Hanya mereka yang memiliki jiwa murni atau penguasa takdir yang mampu membangkitkan Ekor 11 seutuhnya.'
		],
		quest: {
			id: 'quest_fox_ascension',
			title: 'Kebangkitan Roh Rubah',
			desc: 'Capai Level 5 dan kumpulkan 100 Soul Spirit untuk membuka Ekor 4!',
			reqLevel: 5,
			reqSoul: 100,
			rewardFoxTier: 4,
			rewardExp: 1000,
			rewardGold: 500
		}
	}
];

// Generator ratusan warga & penjaga per kota/wilayah (dikirim secara spasial)
export function generateRegionalNPCs() {
	const allNpcs = [...KEY_NPCS];
	const humanFirst = ['Aiden', 'Cedric', 'Gareth', 'Loras', 'Rowan', 'Silas', 'Aria', 'Gwen', 'Lyra', 'Seraphina', 'Elowen'];
	const beastFirst = ['Grimm', 'Ragnar', 'Kaelen', 'Torval', 'Balthazar', 'Zarek', 'Fang', 'Valko', 'Runa', 'Kira', 'Ursula'];
	const roles = ['Warga Kota', 'Pedagang Buah', 'Penjaga Gerbang', 'Prajurit Patroli', 'Pemandu Petualang', 'Biarawan Suci'];

	// 100 NPC Valoria
	for (let i = 1; i <= 80; i++) {
		const name = humanFirst[i % humanFirst.length] + ' ' + (i + 10);
		const role = roles[i % roles.length];
		const x = 300 + ((i * 47) % 800);
		const y = 250 + ((i * 39) % 700);
		allNpcs.push({
			id: `valoria_civ_${i}`,
			name,
			title: role,
			mapId: 'valoria_city',
			x,
			y,
			role: 'ambient',
			nation: 'VALORIA',
			race: 'Human',
			avatar: '🧑',
			color: '#94a3b8',
			dialogue: [
				`Halo petualang! Hari yang indah di Valoria.`,
				`Semoga harimu dipenuhi keberuntungan dan berkah cahaya.`
			]
		});
	}

	// 100 NPC Fangheim
	for (let i = 1; i <= 80; i++) {
		const name = beastFirst[i % beastFirst.length] + ' ' + (i + 10);
		const role = roles[i % roles.length];
		const x = 320 + ((i * 53) % 860);
		const y = 280 + ((i * 43) % 720);
		allNpcs.push({
			id: `fangheim_civ_${i}`,
			name,
			title: role,
			mapId: 'fangheim_fortress',
			x,
			y,
			role: 'ambient',
			nation: 'FANGHEIM',
			race: 'Beastkin',
			avatar: '🐺',
			color: '#d97706',
			dialogue: [
				`Grrr... Jangan lemah di tanah Beastkin!`,
				`Kekuatan adalah kehormatan tertinggi di benteng ini.`
			]
		});
	}

	return allNpcs;
}

export const MONSTER_TEMPLATES = {
	slime: {
		type: 'slime',
		name: 'Slime Hutan',
		maxHp: 160,
		atk: 22,
		def: 8,
		spd: 2.2,
		exp: 45,
		gold: 25,
		soul: 8,
		color: '#22c55e',
		avatar: '🟢',
		radius: 18
	},
	goblin: {
		type: 'goblin',
		name: 'Goblin Pemburu',
		maxHp: 240,
		atk: 32,
		def: 12,
		spd: 2.8,
		exp: 75,
		gold: 45,
		soul: 14,
		color: '#84cc16',
		avatar: '👺',
		radius: 20
	},
	shadow_wolf: {
		type: 'shadow_wolf',
		name: 'Serigala Bayangan',
		maxHp: 320,
		atk: 44,
		def: 16,
		spd: 3.5,
		exp: 110,
		gold: 60,
		soul: 20,
		color: '#6366f1',
		avatar: '🐺',
		radius: 22
	},
	ruins_golem: {
		type: 'ruins_golem',
		name: 'Golem Batu Kuno',
		maxHp: 650,
		atk: 62,
		def: 35,
		spd: 1.8,
		exp: 220,
		gold: 140,
		soul: 35,
		color: '#78716c',
		avatar: '🗿',
		radius: 28
	},
	abyss_lord: {
		type: 'abyss_lord',
		name: 'Penguasa Jurang Abyssal (BOSS)',
		maxHp: 2800,
		atk: 120,
		def: 55,
		spd: 2.6,
		exp: 1200,
		gold: 800,
		soul: 150,
		color: '#dc2626',
		avatar: '👿',
		radius: 40,
		isBoss: true
	}
};
