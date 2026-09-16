// ============================================================
// 🎮 GAME ENGINE & REGISTRY FOUNDATION
// ============================================================
// Root `game/` hanya untuk fondasi dan registry engine.
// Setiap game memiliki direktori tersendiri (misal `game/math/`).
// ============================================================

import * as mathGame from './math/math.js';

class GameRegistry {
    constructor() {
        this.games = new Map();
        this.initDefaultGames();
    }

    initDefaultGames() {
        // Daftarkan game modular yang sudah ada
        this.register('math', mathGame);
    }

    register(name, gameModule) {
        if (!name || typeof name !== 'string') return;
        this.games.set(name.toLowerCase(), gameModule);
    }

    get(name) {
        if (!name || typeof name !== 'string') return null;
        return this.games.get(name.toLowerCase()) || null;
    }

    has(name) {
        if (!name || typeof name !== 'string') return false;
        return this.games.has(name.toLowerCase());
    }

    list() {
        return Array.from(this.games.keys());
    }
}

export const gameEngine = new GameRegistry();
export { mathGame };
export default gameEngine;
