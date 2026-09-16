// ============================================================
// 📊 MATH ATTEMPT BOARD (HANYA YANG HAMPIR BENAR)
// ============================================================
// Aturan:
// - Menyimpan attempt pemain.
// - Menghitung selisih jawaban pemain dengan kunci jawaban (diff).
// - HANYA menampilkan user yang jawabannya "hampir benar" (close to target).
// - Jawaban benar (diff = 0) ditampilkan paling atas.
// - Urutkan dari yang paling dekat (selisih terkecil).
// ============================================================

/**
 * Hitung batas toleransi selisih agar dianggap "hampir benar"
 */
export function calculateNearTolerance(targetAnswer) {
    if (typeof targetAnswer !== 'number' || isNaN(targetAnswer)) return 5;
    const absTarget = Math.abs(targetAnswer);
    if (absTarget === 0) return 3;
    if (absTarget <= 10) return 3;
    if (absTarget <= 30) return 5;
    if (absTarget <= 100) return 10;
    return Math.min(25, Math.ceil(absTarget * 0.15));
}

export class MathBoard {
    constructor(maxEntries = 5) {
        this.maxEntries = maxEntries;
        // Map playerJid -> { playerJid, playerName, answer, isCorrect, carrotEarned, timestamp, diff }
        this.attempts = [];
    }

    /**
     * Catat atau perbarui percobaan pemain
     */
    recordAttempt({ playerJid, playerName, answer, isCorrect, carrotEarned = 0, targetAnswer = null }) {
        if (!playerJid) return null;

        const diff = (typeof targetAnswer === 'number' && !isNaN(targetAnswer))
            ? Math.abs(answer - targetAnswer)
            : null;

        const newEntry = {
            playerJid,
            playerName: playerName || playerJid.split('@')[0],
            answer,
            isCorrect: Boolean(isCorrect),
            carrotEarned: Number(carrotEarned) || 0,
            diff,
            timestamp: Date.now()
        };

        // Jika pemain sudah pernah mencoba:
        const existingIndex = this.attempts.findIndex(a => a.playerJid === playerJid);
        if (existingIndex !== -1) {
            const old = this.attempts[existingIndex];
            // Jika percobaan baru lebih dekat ke kunci jawaban, simpan yang baru
            if (diff !== null && old.diff !== null) {
                if (diff <= old.diff) {
                    this.attempts[existingIndex] = newEntry;
                }
            } else {
                this.attempts[existingIndex] = newEntry;
            }
        } else {
            this.attempts.push(newEntry);
        }

        return newEntry;
    }

    /**
     * Ambil daftar percobaan saat ini
     */
    getAttempts() {
        return [...this.attempts];
    }

    /**
     * Jumlah percobaan yang tercatat
     */
    getCount() {
        return this.attempts.length;
    }

    /**
     * Format tampilan papan percobaan:
     * HANYA menampilkan user yang jawabannya hampir benar (selisih kecil).
     */
    renderBoard(targetAnswer) {
        if (this.attempts.length === 0) {
            return {
                text: '_(Belum ada percobaan jawaban)_',
                mentions: []
            };
        }

        const tolerance = calculateNearTolerance(targetAnswer);

        // Filter hanya yang benar ATAU yang selisihnya masuk toleransi "hampir benar"
        const closeAttempts = this.attempts
            .map(item => {
                const diff = (typeof targetAnswer === 'number' && !isNaN(targetAnswer))
                    ? Math.abs(item.answer - targetAnswer)
                    : (item.diff !== null ? item.diff : 0);
                return { ...item, diff };
            })
            .filter(item => item.isCorrect || item.diff <= tolerance)
            .sort((a, b) => {
                // Yang benar paling pertama
                if (a.isCorrect && !b.isCorrect) return -1;
                if (!a.isCorrect && b.isCorrect) return 1;
                // Urutkan dari selisih terkecil
                return a.diff - b.diff;
            })
            .slice(0, this.maxEntries);

        if (closeAttempts.length === 0) {
            return {
                text: '🎯 *Papan Tebakan Hampir Benar:*\n_(Tidak ada tebakan yang mendekati jawaban benar)_',
                mentions: []
            };
        }

        const mentions = [];
        const lines = closeAttempts.map((item, index) => {
            const num = index + 1;
            mentions.push(item.playerJid);
            const userTag = `@${item.playerJid.split('@')[0]}`;
            const nameDisplay = item.playerName && item.playerName !== item.playerJid.split('@')[0]
                ? `${item.playerName} (${userTag})`
                : userTag;

            if (item.isCorrect) {
                return `${num}. 🏆 ${nameDisplay}\n   ➜ Jawab: *${item.answer}* | ✅ *TEPAT BENAR!* (+${item.carrotEarned.toLocaleString('id-ID')} 🥕)`;
            }

            let proximityTag = '🏃 Dikit lagi!';
            if (item.diff === 1) proximityTag = '🤏 Nyaris banget (Beda 1)!';
            else if (item.diff <= 2) proximityTag = '🔥 Sangat dekat!';
            else if (item.diff <= 5) proximityTag = '⚡ Mendekati!';

            return `${num}. ${nameDisplay}\n   ➜ Jawab: *${item.answer}* | Selisih: *${item.diff}* (${proximityTag})`;
        });

        const header = `🎯 *PAPAN JAWABAN HAMPIR BENAR (Top Terdekat)*:`;
        const text = `${header}\n${lines.join('\n')}`;

        return { text, mentions };
    }
}

