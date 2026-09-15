/**
 * RPG Data Constants
 * Konfigurasi kelas karakter, ras/negara, skill, fox power, dan objek lingkungan.
 */

export const CLASSES = {
	KNIGHT: {
		id: 'knight',
		name: 'Blade Knight',
		title: 'Ksatria Pedang',
		desc: 'Ahli pedang jarak dekat dengan HP dan pertahanan tinggi.',
		baseHp: 380,
		baseMp: 120,
		baseAtk: 38,
		baseDef: 28,
		baseSpd: 4.2,
		color: '#4a90e2',
		spriteType: 'knight',
		weapons: ['Pedang Besi Tempa', 'Perisai Baja'],
	},
	ARCHER: {
		id: 'archer',
		name: 'Wind Archer',
		title: 'Pemanah Angin',
		desc: 'Penembak jitu jarak jauh dengan kelincahan tinggi dan panah penembus.',
		baseHp: 270,
		baseMp: 160,
		baseAtk: 46,
		baseDef: 16,
		baseSpd: 5.0,
		color: '#7ed321',
		spriteType: 'archer',
		weapons: ['Busur Kayu Kuno', 'Anak Panah Angin'],
	},
	MAGE: {
		id: 'mage',
		name: 'Arcane Mage',
		title: 'Penyihir Mantra',
		desc: 'Penguasa sihir elemen dahsyat dengan cadangan MP dan ledakan area luas.',
		baseHp: 230,
		baseMp: 300,
		baseAtk: 52,
		baseDef: 12,
		baseSpd: 4.0,
		color: '#9013fe',
		spriteType: 'mage',
		weapons: ['Tongkat Kristal Mana', 'Grimoire Kuno'],
	}
};

export const NATIONS = {
	VALORIA: {
		id: 'valoria',
		name: 'Kerajaan Valoria',
		capital: 'Valoria Castle',
		desc: 'Negara manusia (80% Manusia), unggul dalam sihir kuno, teknologi alkimia, dan peradaban megah.',
		dominantRace: 'Human',
		bonus: { mpBonus: 1.25, magicAtkBonus: 1.20 }
	},
	FANGHEIM: {
		id: 'fangheim',
		name: 'Klan Taring Fangheim',
		capital: 'Iron Fang Fortress',
		desc: 'Negara beastkin (80% Beastkin), unggul dalam kekuatan fisik, insting bertahan hidup, dan pertarungan liar.',
		dominantRace: 'Beastkin',
		bonus: { hpBonus: 1.25, physAtkBonus: 1.20 }
	}
};

export const REGIONS = {
	VALORIA_CITY: {
		id: 'valoria_city',
		name: 'Kota Cahaya Valoria',
		nation: 'VALORIA',
		isSafe: true,
		levelReq: 1,
		theme: 'castle',
		bgMusic: 'city_peace',
		desc: 'Pusat peradaban megah dengan toko potion, serikat petualang, dan istana raja.'
	},
	WHISPERING_FOREST: {
		id: 'whispering_forest',
		name: 'Hutan Berbisik',
		nation: 'VALORIA',
		isSafe: false,
		levelReq: 2,
		theme: 'forest',
		bgMusic: 'forest_wild',
		desc: 'Hutan lebat dengan pepohonan raksasa, bandit goblin, dan serigala bayangan.'
	},
	FANGHEIM_FORTRESS: {
		id: 'fangheim_fortress',
		name: 'Benteng Taring Besi',
		nation: 'FANGHEIM',
		isSafe: true,
		levelReq: 1,
		theme: 'fortress',
		bgMusic: 'tribal_war',
		desc: 'Markas utama kaum Beastkin, arena gladiator, dan pandai besi legendaris.'
	},
	CRUMBLING_RUINS: {
		id: 'crumbling_ruins',
		name: 'Reruntuhan Kuno',
		nation: 'NEUTRAL',
		isSafe: false,
		levelReq: 5,
		theme: 'ruins',
		bgMusic: 'ruins_ancient',
		desc: 'Kuil kuno berdebu dengan pilar-pilar batu yang bisa hancur dan golem penjaga.'
	},
	ABYSSAL_RIFT: {
		id: 'abyssal_rift',
		name: 'Jurang Kehancuran Abyssal',
		nation: 'NEUTRAL',
		isSafe: false,
		levelReq: 10,
		theme: 'abyss',
		bgMusic: 'abyss_doom',
		desc: 'Zona bencana ekstrim dengan lava gelap, kristal hampa, dan iblis purba.'
	}
};

export const FOX_POWER = {
	TAIL_4: {
		tier: 4,
		name: 'Ekor 4 - Kebangkitan Jiwa Serigala Kuno',
		auraColor: '#ff5722',
		passive: { spdMult: 1.30, hpRegen: 8, atkMult: 1.25 },
		skillName: 'Cakar Neraka Cepat',
		skillCd: 6000,
		mpCost: 35,
		damageMult: 2.2,
		desc: 'Aura api merah membakar tubuh. Kecepatan dan serangan cakar meningkat tajam.'
	},
	TAIL_7: {
		tier: 7,
		name: 'Ekor 7 - Gelombang Roh Biru Surgawi',
		auraColor: '#00e5ff',
		passive: { spdMult: 1.55, hpRegen: 18, atkMult: 1.65, defMult: 1.4 },
		skillName: 'Hujan Bola Roh Kuno',
		skillCd: 10000,
		mpCost: 65,
		damageMult: 3.8,
		desc: 'Tujuh ekor chakra biru berkibar. Menembakkan hujan bola roh yang melumpuhkan musuh.'
	},
	TAIL_11: {
		tier: 11,
		name: 'Ekor 11 - Mahadewa Rubah Emas Purba',
		auraColor: '#ffd700',
		passive: { spdMult: 1.95, hpRegen: 45, atkMult: 2.8, defMult: 2.2, immuneStun: true },
		skillName: 'Bencana Sinar Ekor 11 (Cataclysmic Fox Beam)',
		skillCd: 16000,
		mpCost: 110,
		damageMult: 7.5,
		destructionRadius: 180,
		desc: 'Wujud tertinggi dewa rubah legendaris! Ekor 11 memancarkan sinar laser kosmis masif yang meremukkan bangunan dan musuh.'
	}
};

export const DESTRUCTIBLE_TYPES = {
	STONE_PILLAR: { maxHp: 300, name: 'Pilar Batu Kuno', respawnMs: 30000, color: '#8d99ae' },
	WOODEN_GATE: { maxHp: 200, name: 'Gerbang Kayu', respawnMs: 25000, color: '#8b5a2b' },
	MAGIC_CRYSTAL: { maxHp: 500, name: 'Kristal Mana Padat', respawnMs: 40000, color: '#4cc9f0' },
	WATCHTOWER: { maxHp: 650, name: 'Menara Pengawas', respawnMs: 45000, color: '#5c677d' },
	BARRICADE: { maxHp: 180, name: 'Barikade Pertahanan', respawnMs: 20000, color: '#a06cd5' }
};
