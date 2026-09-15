export const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

export const botQuotes = [
	'Semangat menjalani hari ini! ✨',
	'Jangan lupa istirahat dan jaga kesehatan. 🍵',
	'Setiap langkah kecil adalah bagian dari kemajuan. 🚀',
	'Tetap fokus dan selesaikan tugasmu dengan baik! 🌟',
	'Nikmati prosesnya, hasil terbaik akan menyusul. 💫'
];

export const getBotQuote = () => {
	return {
		name: 'Oguri Cap',
		quote: pickRandom(botQuotes)
	};
};

export const getUmaQuote = getBotQuote;
