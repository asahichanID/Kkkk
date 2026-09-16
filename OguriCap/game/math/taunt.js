// ============================================================
// 🎭 MATH TAUNT ENGINE (WIN & TIMEOUT DIALOGUES)
// ============================================================
// Aturan:
// - Menang -> komentar lucu / ekspresif sesuai kondisi
// - Timeout -> lebih pedas / lucu & playful
// - Variatif / random, khas karakter Oguri Cap / Tracen Academy
// ============================================================

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Komentar ekspresif saat pemain MENANG
 */
export function getWinTaunt({ elapsedSeconds = 0, attemptsCount = 1, playerName = 'Trainer' } = {}) {
    if (elapsedSeconds <= 10) {
        const fastTaunts = [
            `⚡ Wuss! Cuma ${elapsedSeconds} detik langsung bener! Ini tangan manusia apa kalkulator kuantum NASA?! 🚀🐴`,
            `⚡ Baru kedip sekali udah kejawab! Otakmu secepat Oguri Cap melibas tikungan terakhir! 🏎️💨`,
            `⚡ Kecepatan kilat! Jangan-jangan udah ngitung sebelum soalnya muncul ya?! 🐴✨`
        ];
        return pickRandom(fastTaunts);
    }

    if (attemptsCount >= 4) {
        const battleTaunts = [
            `🔥 Setelah adu hitung sengit dan lempar-lemparan angka, akhirnya ${playerName} mengamankan 8.500 wortel! 🥕🏆`,
            `🔥 Perjuangan pantang menyerah berbuah manis! Usaha ga pernah mengkhianati hasil! 🐴🎉`,
            `🔥 Perebutan sengit selesai! Yang lain jangan berkecil hati, wortel hiburan tetep cair kok! 🥕`
        ];
        return pickRandom(battleTaunts);
    }

    const generalWinTaunts = [
        `🎉 Cerdas banget! Besok tolong bantu hitungin tagihan makan Oguri di kantin Tracen ya! 🍜🐴`,
        `🎉 Langsung bener! Oguri bangga sama kamu, Trainer! Sekarang jangan lupa traktir Oguri ramen! 🍲🥕`,
        `🎉 Otak encer tanpa tandingan! 8.500 Carrot Coin langsung masuk ke dompetmu! 🥕✨`,
        `🎉 Gokil, matematika level segini dilibas tanpa ampun! Oguri kasih jempol empat! 👍🐴👍`,
        `🎉 Mantap jiwa! Hitunganmu akurat kayak tarikan napas Oguri di garis finish! 🏆🐴`
    ];
    return pickRandom(generalWinTaunts);
}

/**
 * Komentar pedas & lucu saat WAKTU HABIS (TIMEOUT)
 */
export function getTimeoutTaunt({ answer, attemptsCount = 0 } = {}) {
    if (attemptsCount === 0) {
        const zeroAttempts = [
            `🗿 60 detik berlalu dan chat hening kayak kuburan... Kalkulator pada kehabisan baterai ya?! Jawabannya itu *${answer}*!`,
            `🗿 Ga ada yang berani jawab sama sekali? Soal segampang ini bikin satu grup mati kutu! Jawabannya *${answer}*! 😭`,
            `🗿 60 detik dibiarin lewat gitu aja... Oguri keburu ngabisin 5 mangkok ramen nungguin kalian! Jawabannya: *${answer}*! 🍜`
        ];
        return pickRandom(zeroAttempts);
    }

    const wrongAttempts = [
        `🗿 60 detik mikir keras, jawab berkali-kali tapi tetep meleset! Otak butuh di-restart nih! Jawaban yang bener tuh *${answer}*! 😭`,
        `🗿 Waktu habis! Jawabannya *${answer}*! Ternyata kalian semua kompak... kompak salah ngitung! 🗿🐴`,
        `🗿 Kalkulator error apa rumus yang salah nih? Soal segitu doang lewat waktu! Jawabannya *${answer}*! 🥕`,
        `🗿 Oguri yang ngitung pake kuku kaki aja udah selesai dari tadi, kalian malah timeout! Jawabannya *${answer}*! 🐴🍜`,
        `🗿 60 detik terbuang sia-sia, uang kas kemenangan 8.500 wortel ditarik balik sama Tracen! Jawaban aslinya *${answer}*! 🥕`
    ];
    return pickRandom(wrongAttempts);
}

/**
 * Komentar singkat saat tebakan pemain SALAH
 */
export function getWrongTaunt({ answer, carrotEarned = 0 } = {}) {
    const wrongTaunts = [
        `❌ Kurang tepat! Tapi dapet +${carrotEarned} 🥕 buat modal jajan. Ayo hitung lagi!`,
        `❌ Tetot! Masih meleset, coba cek perkalian/penjumlahannya lagi sebelum waktu habis!`,
        `❌ Hampir bener... tapi tetep salah! Waktu 60 detik masih jalan, buruan rebutan lagi! 🐴`,
        `❌ Yah salah tebak! Tenang, +${carrotEarned} 🥕 masuk kantong. Masih bisa jawab lagi kok!`
    ];
    return pickRandom(wrongTaunts);
}
