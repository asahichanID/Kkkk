// ============================================================
// 🧮 MATH QUESTION GENERATOR (LOCAL - NO API)
// ============================================================

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generator soal matematika tingkat EASY
 * Operasi 2 angka: +, -, ×, ÷ dengan hasil bilangan bulat bersih
 */
function generateEasy() {
    const op = pickRandom(['+', '-', '*', '/']);
    let a, b, question, answer;

    switch (op) {
        case '+':
            a = randInt(5, 75);
            b = randInt(5, 75);
            question = `${a} + ${b}`;
            answer = a + b;
            break;
        case '-':
            a = randInt(15, 99);
            b = randInt(5, a); // Menjamin hasil non-negatif di level easy
            question = `${a} - ${b}`;
            answer = a - b;
            break;
        case '*':
            a = randInt(2, 12);
            b = randInt(2, 12);
            question = `${a} × ${b}`;
            answer = a * b;
            break;
        case '/':
            b = randInt(2, 10);
            answer = randInt(2, 12);
            a = b * answer; // Memastikan pembagian bulat tanpa koma
            question = `${a} ÷ ${b}`;
            break;
    }

    return { question, answer, difficulty: 'EASY' };
}

/**
 * Generator soal matematika tingkat MEDIUM
 * Operasi 3 angka atau kombinasi tanda kurung
 */
function generateMedium() {
    const pattern = pickRandom(['a+b*c', 'a*b-c', '(a+b)*c', 'a*b+c', 'a/b+c', '(a-b)*c']);
    let a, b, c, question, answer;

    switch (pattern) {
        case 'a+b*c':
            b = randInt(2, 9);
            c = randInt(3, 12);
            a = randInt(10, 50);
            question = `${a} + (${b} × ${c})`;
            answer = a + (b * c);
            break;
        case 'a*b-c':
            a = randInt(3, 12);
            b = randInt(4, 15);
            c = randInt(5, 30);
            question = `(${a} × ${b}) - ${c}`;
            answer = (a * b) - c;
            break;
        case '(a+b)*c':
            a = randInt(4, 20);
            b = randInt(4, 20);
            c = randInt(2, 6);
            question = `(${a} + ${b}) × ${c}`;
            answer = (a + b) * c;
            break;
        case '(a-b)*c':
            a = randInt(15, 40);
            b = randInt(2, a - 1);
            c = randInt(2, 8);
            question = `(${a} - ${b}) × ${c}`;
            answer = (a - b) * c;
            break;
        case 'a*b+c':
            a = randInt(5, 14);
            b = randInt(4, 12);
            c = randInt(15, 60);
            question = `(${a} × ${b}) + ${c}`;
            answer = (a * b) + c;
            break;
        case 'a/b+c':
            b = randInt(2, 8);
            const quotient = randInt(3, 15);
            a = b * quotient;
            c = randInt(10, 50);
            question = `(${a} ÷ ${b}) + ${c}`;
            answer = quotient + c;
            break;
    }

    return { question, answer, difficulty: 'MEDIUM' };
}

/**
 * Generator soal matematika tingkat HARD
 * Operasi multi-langkah / kombinasi perkalian & pengurangan
 */
function generateHard() {
    const pattern = pickRandom(['ab+cd', 'ab-cd', '(a+b)*(c-d)', 'a*(b+c)-d', '(a*b)+(c/d)']);
    let a, b, c, d, question, answer;

    switch (pattern) {
        case 'ab+cd':
            a = randInt(8, 25);
            b = randInt(4, 15);
            c = randInt(6, 20);
            d = randInt(3, 12);
            question = `(${a} × ${b}) + (${c} × ${d})`;
            answer = (a * b) + (c * d);
            break;
        case 'ab-cd':
            a = randInt(12, 30);
            b = randInt(6, 18);
            c = randInt(4, 12);
            d = randInt(2, 8);
            question = `(${a} × ${b}) - (${c} × ${d})`;
            answer = (a * b) - (c * d);
            break;
        case '(a+b)*(c-d)':
            a = randInt(10, 35);
            b = randInt(10, 35);
            c = randInt(8, 20);
            d = randInt(2, c - 1);
            question = `(${a} + ${b}) × (${c} - ${d})`;
            answer = (a + b) * (c - d);
            break;
        case 'a*(b+c)-d':
            a = randInt(4, 12);
            b = randInt(10, 30);
            c = randInt(5, 25);
            d = randInt(10, 50);
            question = `${a} × (${b} + ${c}) - ${d}`;
            answer = a * (b + c) - d;
            break;
        case '(a*b)+(c/d)':
            a = randInt(5, 15);
            b = randInt(5, 15);
            d = randInt(2, 9);
            const q = randInt(4, 16);
            c = d * q;
            question = `(${a} × ${b}) + (${c} ÷ ${d})`;
            answer = (a * b) + q;
            break;
    }

    return { question, answer, difficulty: 'HARD' };
}

/**
 * Hasilkan soal matematika lokal
 * @param {string} [mode] - 'EASY' | 'MEDIUM' | 'HARD' | 'RANDOM'
 */
export function generateQuestion(mode = 'RANDOM') {
    const normalized = (mode || '').toUpperCase().trim();
    let selectedMode = normalized;

    if (!['EASY', 'MEDIUM', 'HARD'].includes(normalized)) {
        selectedMode = pickRandom(['EASY', 'MEDIUM', 'HARD']);
    }

    switch (selectedMode) {
        case 'EASY':
            return generateEasy();
        case 'MEDIUM':
            return generateMedium();
        case 'HARD':
            return generateHard();
        default:
            return generateEasy();
    }
}
