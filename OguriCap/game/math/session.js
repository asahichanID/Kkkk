// ============================================================
// ⏱️ MATH SESSION MANAGER
// ============================================================
// Aturan:
// - Waktu selalu 60 detik.
// - Semua pemain boleh rebutan (bukan per-player/team lock).
// - Selesai saat ada jawaban benar ATAU waktu habis (60s).
// - Setelah selesai / timeout, jawaban berikutnya diabaikan.
// ============================================================

import { MathBoard } from './board.js';

export const SESSION_DURATION_MS = 60000; // Selalu 60 detik

export class MathSession {
    constructor({ chatId, question, answer, difficulty, onTimeout }) {
        this.chatId = chatId;
        this.question = question;
        this.answer = answer;
        this.difficulty = difficulty;
        this.startTime = Date.now();
        this.duration = SESSION_DURATION_MS;
        this.board = new MathBoard(5);
        this.status = 'ACTIVE'; // 'ACTIVE' | 'FINISHED' | 'TIMEOUT'
        this.timer = null;
        this.onTimeout = onTimeout;

        // Pasang timer 60 detik
        this.timer = setTimeout(() => {
            if (this.status === 'ACTIVE') {
                this.status = 'TIMEOUT';
                if (typeof this.onTimeout === 'function') {
                    try {
                        this.onTimeout(this);
                    } catch (err) {
                        console.error('[MATH SESSION] Error onTimeout callback:', err);
                    }
                }
                mathSessionManager.deleteSession(this.chatId);
            }
        }, this.duration);
        if (this.timer && typeof this.timer.unref === 'function') {
            this.timer.unref();
        }
    }

    /**
     * Hitung sisa waktu dalam detik
     */
    getRemainingSeconds() {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.duration - elapsed);
        return Math.ceil(remaining / 1000);
    }

    /**
     * Hitung waktu yang telah berlalu dalam detik
     */
    getElapsedSeconds() {
        const elapsed = Date.now() - this.startTime;
        return Math.max(1, Math.floor(elapsed / 1000));
    }

    /**
     * Akhiri sesi (saat ada pemenang)
     */
    finish() {
        this.status = 'FINISHED';
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

class MathSessionManager {
    constructor() {
        this.sessions = new Map();
    }

    /**
     * Cek apakah chat memiliki sesi aktif
     */
    hasSession(chatId) {
        const session = this.sessions.get(chatId);
        return Boolean(session && session.status === 'ACTIVE');
    }

    /**
     * Ambil sesi aktif
     */
    getSession(chatId) {
        const session = this.sessions.get(chatId);
        if (session && session.status === 'ACTIVE') {
            return session;
        }
        return null;
    }

    /**
     * Buat sesi baru untuk chat
     */
    createSession(chatId, questionData, onTimeout) {
        // Jika sudah ada sesi aktif, jangan tumpuk
        if (this.hasSession(chatId)) {
            return null;
        }

        const session = new MathSession({
            chatId,
            question: questionData.question,
            answer: questionData.answer,
            difficulty: questionData.difficulty,
            onTimeout
        });

        this.sessions.set(chatId, session);
        try {
            if (global.db?.game) {
                global.db.game.kuismath = global.db.game.kuismath || {};
                global.db.game.kuismath[chatId] = {
                    id: chatId,
                    soal: questionData.question,
                    jawaban: String(questionData.answer),
                    waktu: Date.now()
                };
            }
        } catch {}
        return session;
    }

    /**
     * Hapus sesi dari map
     */
    deleteSession(chatId) {
        const session = this.sessions.get(chatId);
        if (session) {
            session.finish();
            this.sessions.delete(chatId);
        }
        try {
            if (global.db?.game?.kuismath) {
                delete global.db.game.kuismath[chatId];
            }
        } catch {}
    }

    /**
     * Selesaikan sesi aktif
     */
    endSession(chatId) {
        const session = this.getSession(chatId);
        if (session) {
            session.finish();
            this.sessions.delete(chatId);
            return session;
        }
        return null;
    }
}

// Gunakan global singleton agar tetap persisten meski naze.js direload secara dinamis dengan query string (?update=...)
if (!global.__oguriMathSessionManager) {
    global.__oguriMathSessionManager = new MathSessionManager();
}
export const mathSessionManager = global.__oguriMathSessionManager;
