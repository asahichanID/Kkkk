// ============================================================
// 🥕 MATH REWARD ENGINE
// ============================================================
// Aturan:
// - Benar -> game langsung selesai +8.500 carrot
// - Salah -> reward <= 1.000 carrot (hiburan/partisipasi)
// - Timeout -> tanpa reward kemenangan
// ============================================================

export const REWARD_CONFIG = {
    WIN_CARROT: 8500,
    WRONG_CARROT_MIN: 200,
    WRONG_CARROT_MAX: 1000
};

/**
 * Hitung reward untuk tebakan salah (≤ 1.000 carrot)
 */
export function calculateWrongReward() {
    // Random antara 200 s/d 1.000 carrot (kelipatan 50)
    const steps = Math.floor(Math.random() * 17); // 0 sampai 16 (0*50=0 ... 16*50=800)
    const reward = REWARD_CONFIG.WRONG_CARROT_MIN + (steps * 50);
    return Math.min(reward, REWARD_CONFIG.WRONG_CARROT_MAX);
}

/**
 * Tambahkan carrot / money ke database user secara aman
 * @param {object} db - Database global
 * @param {string} playerJid - JID pemain
 * @param {number} amount - Jumlah carrot yang diberikan
 */
export function awardCarrot(db, playerJid, amount) {
    if (!db || !playerJid || !amount || amount <= 0) return 0;

    if (!db.users) db.users = {};
    if (!db.users[playerJid]) {
        db.users[playerJid] = {
            money: 0,
            limit: 5
        };
    }

    const user = db.users[playerJid];
    user.money = (Number(user.money) || 0) + amount;

    if (user.carrot !== undefined) {
        user.carrot = (Number(user.carrot) || 0) + amount;
    }

    return amount;
}
