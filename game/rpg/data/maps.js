/**
 * RPG Maps Configuration
 * Definisi 5 peta dunia luas dengan portal antar wilayah, rintangan, dan zona destruksi.
 */

export const MAPS = {
	valoria_city: {
		id: 'valoria_city',
		name: 'Kota Cahaya Valoria',
		width: 1400,
		height: 1200,
		safeZone: true,
		spawnPoint: { x: 700, y: 600 },
		groundColor: '#2b3a4a',
		tileType: 'cobblestone',
		portals: [
			{ targetMap: 'whispering_forest', x: 1350, y: 600, w: 50, h: 100, label: 'Menuju Hutan Berbisik' },
			{ targetMap: 'crumbling_ruins', x: 700, y: 50, w: 100, h: 50, label: 'Menuju Reruntuhan Kuno' }
		],
		destructibles: [
			{ id: 'vc_pillar_1', type: 'STONE_PILLAR', x: 450, y: 400, w: 40, h: 80 },
			{ id: 'vc_pillar_2', type: 'STONE_PILLAR', x: 950, y: 400, w: 40, h: 80 },
			{ id: 'vc_gate_1', type: 'WOODEN_GATE', x: 1300, y: 560, w: 30, h: 180 },
			{ id: 'vc_barricade_1', type: 'BARRICADE', x: 700, y: 950, w: 120, h: 30 }
		],
		buildings: [
			{ x: 300, y: 200, w: 220, h: 160, label: 'Kastil Kerajaan Valoria', color: '#1f2d3d' },
			{ x: 880, y: 200, w: 200, h: 150, label: 'Perpustakaan Sihir Agung', color: '#253549' },
			{ x: 400, y: 800, w: 180, h: 130, label: 'Toko Alkemis & Potion', color: '#2e263b' },
			{ x: 820, y: 800, w: 190, h: 140, label: 'Markas Guild Petualang', color: '#322c22' }
		],
		decorations: [
			{ type: 'fountain', x: 700, y: 600, radius: 45, color: '#38bdf8' },
			{ type: 'statue', x: 700, y: 380, w: 36, h: 60, label: 'Patung Raja Ksatria' }
		]
	},

	whispering_forest: {
		id: 'whispering_forest',
		name: 'Hutan Berbisik',
		width: 1600,
		height: 1400,
		safeZone: false,
		spawnPoint: { x: 100, y: 700 },
		groundColor: '#1a3320',
		tileType: 'mossy_grass',
		portals: [
			{ targetMap: 'valoria_city', x: 50, y: 700, w: 50, h: 100, label: 'Kembali ke Valoria' },
			{ targetMap: 'fangheim_fortress', x: 1550, y: 700, w: 50, h: 100, label: 'Menuju Benteng Fangheim' }
		],
		destructibles: [
			{ id: 'wf_tower_1', type: 'WATCHTOWER', x: 600, y: 400, w: 60, h: 90 },
			{ id: 'wf_barricade_1', type: 'BARRICADE', x: 800, y: 680, w: 30, h: 120 },
			{ id: 'wf_barricade_2', type: 'BARRICADE', x: 1100, y: 720, w: 30, h: 120 },
			{ id: 'wf_gate_1', type: 'WOODEN_GATE', x: 1480, y: 660, w: 40, h: 160 },
			{ id: 'wf_crystal_1', type: 'MAGIC_CRYSTAL', x: 800, y: 250, w: 45, h: 65 }
		],
		buildings: [
			{ x: 550, y: 320, w: 160, h: 120, label: 'Pondok Pemburu Liar', color: '#2d3725' },
			{ x: 1000, y: 1000, w: 200, h: 140, label: 'Kuil Roh Alam', color: '#1e382b' }
		],
		decorations: [
			{ type: 'tree_cluster', x: 300, y: 300, radius: 80 },
			{ type: 'tree_cluster', x: 1200, y: 350, radius: 95 },
			{ type: 'tree_cluster', x: 400, y: 1100, radius: 110 },
			{ type: 'tree_cluster', x: 1300, y: 1100, radius: 100 }
		]
	},

	fangheim_fortress: {
		id: 'fangheim_fortress',
		name: 'Benteng Taring Besi',
		width: 1500,
		height: 1300,
		safeZone: true,
		spawnPoint: { x: 750, y: 650 },
		groundColor: '#3a2416',
		tileType: 'hardened_dirt',
		portals: [
			{ targetMap: 'whispering_forest', x: 50, y: 650, w: 50, h: 100, label: 'Menuju Hutan Berbisik' },
			{ targetMap: 'crumbling_ruins', x: 750, y: 50, w: 100, h: 50, label: 'Menuju Reruntuhan Kuno' }
		],
		destructibles: [
			{ id: 'ff_pillar_1', type: 'STONE_PILLAR', x: 500, y: 450, w: 45, h: 80 },
			{ id: 'ff_pillar_2', type: 'STONE_PILLAR', x: 1000, y: 450, w: 45, h: 80 },
			{ id: 'ff_tower_1', type: 'WATCHTOWER', x: 750, y: 250, w: 70, h: 100 },
			{ id: 'ff_barricade_1', type: 'BARRICADE', x: 650, y: 850, w: 200, h: 30 }
		],
		buildings: [
			{ x: 300, y: 250, w: 220, h: 170, label: 'Balairung Suku Beastkin', color: '#4a2810' },
			{ x: 980, y: 250, w: 200, h: 150, label: 'Pandai Besi Taring Naga', color: '#542010' },
			{ x: 620, y: 920, w: 260, h: 160, label: 'Arena Gladiator Liar', color: '#432918' }
		],
		decorations: [
			{ type: 'totem', x: 750, y: 550, w: 30, h: 70, label: 'Totem Serigala Purba' },
			{ type: 'fire_pit', x: 600, y: 650, radius: 25 },
			{ type: 'fire_pit', x: 900, y: 650, radius: 25 }
		]
	},

	crumbling_ruins: {
		id: 'crumbling_ruins',
		name: 'Reruntuhan Kuno',
		width: 1600,
		height: 1400,
		safeZone: false,
		spawnPoint: { x: 800, y: 1300 },
		groundColor: '#303038',
		tileType: 'cracked_stone',
		portals: [
			{ targetMap: 'valoria_city', x: 100, y: 1350, w: 100, h: 50, label: 'Kembali ke Valoria' },
			{ targetMap: 'fangheim_fortress', x: 1500, y: 1350, w: 100, h: 50, label: 'Kembali ke Fangheim' },
			{ targetMap: 'abyssal_rift', x: 800, y: 50, w: 120, h: 50, label: 'Masuk Jurang Abyssal' }
		],
		destructibles: [
			{ id: 'cr_pillar_1', type: 'STONE_PILLAR', x: 400, y: 600, w: 50, h: 90 },
			{ id: 'cr_pillar_2', type: 'STONE_PILLAR', x: 650, y: 500, w: 50, h: 90 },
			{ id: 'cr_pillar_3', type: 'STONE_PILLAR', x: 950, y: 500, w: 50, h: 90 },
			{ id: 'cr_pillar_4', type: 'STONE_PILLAR', x: 1200, y: 600, w: 50, h: 90 },
			{ id: 'cr_crystal_1', type: 'MAGIC_CRYSTAL', x: 800, y: 400, w: 60, h: 80 },
			{ id: 'cr_crystal_2', type: 'MAGIC_CRYSTAL', x: 800, y: 800, w: 60, h: 80 }
		],
		buildings: [
			{ x: 680, y: 250, w: 240, h: 180, label: 'Kuil Penjaga Kuno', color: '#1a1a24' }
		],
		decorations: [
			{ type: 'crack_line', x1: 200, y1: 400, x2: 600, y2: 700 },
			{ type: 'crack_line', x1: 1000, y1: 700, x2: 1400, y2: 400 }
		]
	},

	abyssal_rift: {
		id: 'abyssal_rift',
		name: 'Jurang Kehancuran Abyssal',
		width: 1700,
		height: 1500,
		safeZone: false,
		spawnPoint: { x: 850, y: 1400 },
		groundColor: '#1c0c1e',
		tileType: 'void_magma',
		portals: [
			{ targetMap: 'crumbling_ruins', x: 850, y: 1450, w: 120, h: 50, label: 'Kembali ke Reruntuhan' }
		],
		destructibles: [
			{ id: 'ar_crystal_1', type: 'MAGIC_CRYSTAL', x: 500, y: 500, w: 60, h: 90 },
			{ id: 'ar_crystal_2', type: 'MAGIC_CRYSTAL', x: 1200, y: 500, w: 60, h: 90 },
			{ id: 'ar_crystal_3', type: 'MAGIC_CRYSTAL', x: 850, y: 350, w: 80, h: 110 },
			{ id: 'ar_tower_1', type: 'WATCHTOWER', x: 400, y: 900, w: 70, h: 100 },
			{ id: 'ar_tower_2', type: 'WATCHTOWER', x: 1300, y: 900, w: 70, h: 100 },
			{ id: 'ar_pillar_1', type: 'STONE_PILLAR', x: 700, y: 800, w: 50, h: 90 },
			{ id: 'ar_pillar_2', type: 'STONE_PILLAR', x: 1000, y: 800, w: 50, h: 90 }
		],
		buildings: [
			{ x: 700, y: 150, w: 300, h: 220, label: 'Tahta Penguasa Kegelapan', color: '#110414' }
		],
		decorations: [
			{ type: 'lava_pool', x: 850, y: 650, radius: 120, color: '#f72585' },
			{ type: 'void_rift', x: 850, y: 250, radius: 50, color: '#7209b7' }
		]
	}
};
