/**
 * RPG NPC Manager
 * Spatially partitioned NPC interactions, dialogue, quests, and shops.
 */

import { generateRegionalNPCs, KEY_NPCS } from '../data/npcs.js';

export class NpcManager {
	constructor() {
		this.allNpcs = generateRegionalNPCs();
		this.npcMap = new Map(); // id -> npc
		for (const npc of this.allNpcs) {
			this.npcMap.set(npc.id, npc);
		}
	}

	getNpcsNear(mapId, x, y, radius = 450) {
		const result = [];
		for (const npc of this.allNpcs) {
			if (npc.mapId !== mapId) continue;
			const dist = Math.hypot(npc.x - x, npc.y - y);
			if (dist <= radius) {
				result.push({
					id: npc.id,
					name: npc.name,
					title: npc.title,
					role: npc.role,
					nation: npc.nation,
					race: npc.race,
					avatar: npc.avatar,
					color: npc.color,
					x: npc.x,
					y: npc.y
				});
			}
		}
		return result;
	}

	getNpcDetail(npcId) {
		return this.npcMap.get(npcId) || null;
	}

	interact(player, npcId) {
		const npc = this.npcMap.get(npcId);
		if (!npc) return { success: false, message: 'NPC tidak ditemukan' };

		const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
		if (dist > 160) {
			return { success: false, message: 'Kamu terlalu jauh dari NPC ini' };
		}

		return {
			success: true,
			npc: {
				id: npc.id,
				name: npc.name,
				title: npc.title,
				role: npc.role,
				avatar: npc.avatar,
				dialogue: npc.dialogue,
				quest: npc.quest || null,
				shop: npc.shop || null
			}
		};
	}

	buyItem(player, npcId, itemId) {
		const npc = this.npcMap.get(npcId);
		if (!npc || !npc.shop) return { success: false, message: 'NPC tidak menjual barang' };

		const item = npc.shop.find(i => i.id === itemId);
		if (!item) return { success: false, message: 'Barang tidak ditemukan' };

		if (player.gold < item.cost) {
			return { success: false, message: 'Gold kamu tidak mencukupi' };
		}

		player.gold -= item.cost;

		if (item.healHp) {
			player.hp = Math.min(player.maxHp, player.hp + item.healHp);
		}
		if (item.healMp) {
			player.mp = Math.min(player.maxMp, player.mp + item.healMp);
		}
		if (item.addSoul) {
			player.foxSoul = Math.min(player.maxFoxSoul, player.foxSoul + item.addSoul);
		}

		// Add to inventory
		const existing = player.inventory.find(i => i.id === item.id);
		if (existing) {
			existing.count = (existing.count || 1) + 1;
		} else {
			player.inventory.push({ id: item.id, name: item.name, count: 1 });
		}

		return {
			success: true,
			message: `Berhasil membeli ${item.name}!`,
			player: player.toJSON()
		};
	}
}
