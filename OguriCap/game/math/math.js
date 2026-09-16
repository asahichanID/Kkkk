// ============================================================
// 🧮 MATH GAME COORDINATOR (MODULAR .math)
// ============================================================
// Aturan:
// - .math -> soal random EASY/MEDIUM/HARD.
// - Soal + logic LOCAL, tanpa API.
// - Waktu selalu 60 detik.
// - Semua pemain boleh rebutan, bukan multiplayer/team.
// - Salah tetap dicatat sebagai attempt.
// - Benar -> game langsung selesai +8.500 carrot.
// - Salah -> reward <= 1.000 carrot.
// - Timeout -> tanpa reward kemenangan.
// - Setelah selesai/timeout, jawaban berikutnya diabaikan.
// ============================================================

import { generateQuestion } from './question.js';
import { mathSessionManager } from './session.js';
import { REWARD_CONFIG, calculateWrongReward, awardCarrot } from './reward.js';
import { getWinTaunt, getTimeoutTaunt, getWrongTaunt } from './taunt.js';

export { generateQuestion } from './question.js';
export { MathBoard } from './board.js';
export { REWARD_CONFIG, calculateWrongReward, awardCarrot } from './reward.js';
export { getWinTaunt, getTimeoutTaunt, getWrongTaunt } from './taunt.js';
export { mathSessionManager, MathSession } from './session.js';

/**
 * Mulai game matematika di chat
 */
export async function startMathGame(naze, m, args = [], db = global.db) {
    const chatId = m.chat;

    // Cek apakah masih ada sesi aktif di chat ini
    if (mathSessionManager.hasSession(chatId)) {
        // Jika pemain mengirim argumen berupa tebakan (misal: .math 42), proses sebagai jawaban
        if (args.length > 0) {
            const rawGuess = args.join(' ');
            const candidateGuess = extractMathGuess(rawGuess, false);
            if (candidateGuess !== null) {
                return await handleMathAnswer(naze, m, rawGuess, rawGuess, db);
            }
        }
        return m.reply('⚠️ *Masih ada sesi Math yang sedang berlangsung di chat ini!*\nSilakan jawab soal yang ada atau tunggu 60 detik hingga waktu habis.');
    }

    // Tentukan tingkat kesulitan: random EASY/MEDIUM/HARD atau sesuai parameter jika ada
    let requestedMode = (args[0] || '').toUpperCase();
    if (!['EASY', 'MEDIUM', 'HARD'].includes(requestedMode)) {
        requestedMode = 'RANDOM';
    }

    const questionData = generateQuestion(requestedMode);

    // Callback saat waktu 60 detik habis (TIMEOUT)
    const onTimeout = async (session) => {
        try {
            const boardRender = session.board.renderBoard(session.answer);
            const timeoutTaunt = getTimeoutTaunt({
                answer: session.answer,
                attemptsCount: session.board.getCount()
            });

            const text = 
`⌛ ━━━━━━━━━━━━━━━━━━━━━━ ⌛
┃ ⏰ *WAKTU HABIS (60 DETIK)!*
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 📝 *Soal:* ${session.question}
┃ 💡 *Jawaban Benar:* *${session.answer}*
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 🐴 *Oguri Cap:*
┃ "${timeoutTaunt}"
┣━━━━━━━━━━━━━━━━━━━━━━
┃
┃ ${boardRender.text}
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 🚫 _Game selesai tanpa pemenang._
┃ _Ketik .math untuk memulai kuis baru!_
╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

            await naze.sendMessage(session.chatId, {
                text,
                mentions: boardRender.mentions
            });
        } catch (err) {
            console.error('[MATH TIMEOUT ERROR]', err);
        }
    };

    // Buat sesi aktif dengan timer 60 detik
    const session = mathSessionManager.createSession(chatId, questionData, onTimeout);
    if (!session) {
        return m.reply('Gagal memulai sesi Math. Coba lagi.');
    }

    const caption = 
`╭━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🧮 𝗠𝗔𝗧𝗛 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘
┣━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 📝 *Soal Matematika:*
┃ ❝ *${questionData.question} = ?* ❞
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 🎯 *Tingkat:* ${questionData.difficulty}
┃ ⏱️ *Waktu:* 60 Detik (Semua Boleh Rebutan!)
┃ 🥕 *Benar:* +${REWARD_CONFIG.WIN_CARROT.toLocaleString('id-ID')} Carrot Coin
┃ 🥕 *Salah:* ≤ 1.000 Carrot Coin (Hiburan)
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 💡 _Ketik jawaban angka langsung di chat!_
┃ _Papan akan mencatat siapa saja yang hampir benar._
╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

    const sentMsg = await naze.sendMessage(chatId, { text: caption }, { quoted: m });
    if (sentMsg?.key?.id) {
        session.questionMsgId = sentMsg.key.id;
    }
    return sentMsg;
}

/**
 * Cek apakah pesan merupakan reply (quote) ke soal math kuis
 */
export function isReplyingToMathQuestion(m, session = null) {
    if (!m || !m.quoted) return false;

    // 1. Cocokkan langsung dengan ID pesan soal yang dikirim bot
    if (session?.questionMsgId && m.quoted.id && m.quoted.id === session.questionMsgId) {
        return true;
    }

    // 2. Normalisasi Unicode (NFKD) agar bold font WhatsApp terbaca sebagai teks biasa
    const quotedRaw = (
        m.quoted.text || 
        m.quoted.body || 
        m.quoted.caption || 
        m.quoted.msg?.text || 
        m.quoted.msg?.caption || 
        ''
    );
    const quotedText = quotedRaw.normalize('NFKD').toLowerCase();

    return (
        quotedText.includes('math challenge') ||
        quotedText.includes('soal matematika') ||
        quotedText.includes('kuis matematika') ||
        quotedText.includes('semua boleh rebutan') ||
        (m.quoted.fromMe && quotedText.includes('carrot coin'))
    );
}

/**
 * Ekstraksi angka jawaban matematika dari teks input.
 * Fleksibel & Ramah Percakapan (TIDAK HARDCORE):
 * - Support reply quote soal
 * - Support command (.math 42)
 * - Support prefix (jawab: 42, = 42, hasil 42)
 * - Support obrolan santai (42 bang, kayaknya 42, itu 42 deh, 42 kah)
 * - Support angka langsung (.42, 42, -15)
 */
export function extractMathGuess(rawText, isReply = false) {
    if (typeof rawText !== 'string') return null;

    // Bersihkan karakter zero-width, invisible unicode marker, dan normalisasikan teks
    const cleaned = rawText
        .normalize('NFKD')
        .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
        .trim();

    if (!cleaned) return null;

    // Pola 1: Command eksplisit (.math 42, !math 42, #math -15, math 42)
    const cmdMatch = cleaned.match(/^(?:[.!#/$%^&+=~]?math\s+)([+-]?\d+)\b/i);
    if (cmdMatch) {
        const val = parseInt(cmdMatch[1], 10);
        return isNaN(val) ? null : val;
    }

    // Pola 2: Format awalan jawaban (jawab: 42, jawaban: 42, hasil = 42, = 42, jwb 42, tebak 42)
    const prefixMatch = cleaned.match(/^(?:(?:jawab(?:an)?|jwb|hasil(?:nya)?|tebak(?:an)?)\s*[:=]?|=)\s*([+-]?\d+)\b/i);
    if (prefixMatch) {
        const val = parseInt(prefixMatch[1], 10);
        return isNaN(val) ? null : val;
    }

    // Pola 3: Frasa percakapan santai di awal ("kayaknya 42", "keknya 42", "itu 42", "jawabannya 42", "pasti 42")
    const casualPrefixMatch = cleaned.match(/^(?:kayaknya|keknya|mungkin|pasti|itu|jawabannya|jawaban|tebakan|gw rasa|gua rasa|menurut gw|menurut gua|soal itu)\s*([+-]?\d+)\b/i);
    if (casualPrefixMatch) {
        const val = parseInt(casualPrefixMatch[1], 10);
        return isNaN(val) ? null : val;
    }

    // Pola 4: Angka dengan partikel panggilan / akhiran santai ("42 bang", "42 min", "42 kak", "42 bro", "42 deh", "42 lah", "42 kah", "42 ya", "42 nih")
    const suffixMatch = cleaned.match(/^([+-]?\d+)\s*(?:bang|min|kak|bro|dong|deh|lah|nih|ya|kan|kah|bukan|kali|gan|ges|sih)?[.!?]?$/i);
    if (suffixMatch) {
        const val = parseInt(suffixMatch[1], 10);
        return isNaN(val) ? null : val;
    }

    // Pola 5: Angka murni (dengan prefix command opsional .42 atau tanda baca akhir 42. / 42!)
    const pureNumberMatch = cleaned.match(/^[.!#/$%^&+=~]?([+-]?\d+)[.!?]?$/);
    if (pureNumberMatch) {
        const val = parseInt(pureNumberMatch[1], 10);
        return isNaN(val) ? null : val;
    }

    // Pola 6: Jika me-REPLY pesan soal kuis bot secara spesifik (ambil angka pertama di dalam pesan)
    if (isReply) {
        const replyNumberMatch = cleaned.match(/([+-]?\d+)/);
        if (replyNumberMatch) {
            const val = parseInt(replyNumberMatch[1], 10);
            return isNaN(val) ? null : val;
        }
    }

    // Pola 7: Fleksibel untuk pesan pendek (<= 35 karakter) yang menyebut angka secara jelas
    if (cleaned.length <= 35) {
        const shortMatch = cleaned.match(/(?:^|\s)([+-]?\d+)(?:\s|[.!?]|$)/);
        if (shortMatch) {
            const val = parseInt(shortMatch[1], 10);
            return isNaN(val) ? null : val;
        }
    }

    return null;
}

/**
 * Handle jawaban dari pemain di chat
 * Support reply (quoted) maupun chat langsung tanpa reply.
 * Bot BENAR-BENAR DIAM jika jawaban salah untuk mencegah spam/tertrigger chat biasa.
 * @returns {Promise<boolean>} true jika jawaban diproses, false jika diabaikan
 */
export async function handleMathAnswer(naze, m, budy = '', body = '', db = global.db) {
    if (!m || !m.chat) return false;

    const chatId = m.chat;
    const session = mathSessionManager.getSession(chatId);

    // Setelah selesai / timeout, jawaban berikutnya diabaikan
    if (!session) return false;

    const isReply = isReplyingToMathQuestion(m, session);

    // Kumpulkan seluruh kemungkinan string teks pesan dari Baileys
    const candidateTexts = [
        typeof budy === 'string' ? budy : '',
        typeof body === 'string' ? body : '',
        typeof m.text === 'string' ? m.text : '',
        typeof m.body === 'string' ? m.body : '',
        typeof m.msg?.text === 'string' ? m.msg.text : ''
    ].filter(t => t && t.trim() !== '');

    let guess = null;
    for (const text of candidateTexts) {
        const parsed = extractMathGuess(text, isReply);
        if (parsed !== null) {
            guess = parsed;
            break;
        }
    }

    // Jika pesan bukan jawaban matematika yang valid, abaikan (jangan ganggu chat biasa)
    if (guess === null) {
        return false;
    }

    const playerJid = m.sender;
    const playerName = m.pushName || playerJid.split('@')[0];

    // Cek apakah jawaban benar
    if (guess === session.answer) {
        // 🏆 JAWABAN BENAR: Game langsung selesai
        session.finish();
        mathSessionManager.deleteSession(chatId);

        // Tambahkan reward kemenangan +8.500 carrot
        awardCarrot(db, playerJid, REWARD_CONFIG.WIN_CARROT);

        // Catat ke Attempt Board
        session.board.recordAttempt({
            playerJid,
            playerName,
            answer: guess,
            isCorrect: true,
            carrotEarned: REWARD_CONFIG.WIN_CARROT,
            targetAnswer: session.answer
        });

        const elapsedSeconds = session.getElapsedSeconds();
        const winTaunt = getWinTaunt({
            elapsedSeconds,
            attemptsCount: session.board.getCount(),
            playerName
        });
        const boardRender = session.board.renderBoard(session.answer);

        const allMentions = Array.from(new Set([playerJid, ...boardRender.mentions]));

        const winMessage = 
`🎉 ━━━━━━━━━━━━━━━━━━━━━━ 🎉
┃ 🏆 *SELAMAT, JAWABAN BENAR!*
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 👤 *Pemenang:* @${playerJid.split('@')[0]}
┃ 📝 *Soal:* ${session.question} = *${session.answer}*
┃ ⏱️ *Waktu Menjawab:* ${elapsedSeconds} detik
┃ 🥕 *Reward:* +${REWARD_CONFIG.WIN_CARROT.toLocaleString('id-ID')} Carrot Coin
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 🐴 *Oguri Cap:*
┃ "${winTaunt}"
┣━━━━━━━━━━━━━━━━━━━━━━
┃
┃ ${boardRender.text}
┃
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 🎮 _Game selesai! Ketik .math untuk main lagi._
╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

        await naze.sendMessage(chatId, {
            text: winMessage,
            mentions: allMentions
        }, { quoted: m });

        return true;
    } else {
        // ❌ JAWABAN SALAH: Tetap dicatat sebagai attempt + dapat reward ≤ 1.000 carrot
        const wrongCarrot = calculateWrongReward();
        awardCarrot(db, playerJid, wrongCarrot);

        // Perbarui attempt di Board (dengan info targetAnswer untuk hitung selisih hampir benar)
        session.board.recordAttempt({
            playerJid,
            playerName,
            answer: guess,
            isCorrect: false,
            carrotEarned: wrongCarrot,
            targetAnswer: session.answer
        });

        // 🤫 ATURAN MUTLAK USER:
        // Bot BENAR-BENAR DIAM jika salah (TIDAK ADA reply / sendMessage ke chat).
        // Attempt pemain yang hampir benar tersimpan di Board dan akan tampil saat timeout / menang!

        return true;
    }
}
