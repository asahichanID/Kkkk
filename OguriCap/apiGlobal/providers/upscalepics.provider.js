/**
 * apiGlobal/providers/upscalepics.provider.js
 * -----------------------------------------------------------------------
 * Provider: UpscalePics AI (https://upscalepics.com)
 * Endpoint: https://api.upscalepics.com/upscale-to-size
 *
 * Layanan AI Super-Resolution upscaler berkualitas tinggi (4x) dan gratis,
 * tanpa memerlukan API Key.
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

function resolveTempDir() {
	const candidate1 = path.join(process.cwd(), 'database', 'temp');
	const candidate2 = path.join(process.cwd(), 'OguriCap', 'database', 'temp');
	const dir = fs.existsSync(path.join(process.cwd(), 'OguriCap')) ? candidate2 : candidate1;
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

async function downloadUrlToTemp(url, ext = 'png', timeout = 30000) {
	const tempDir = resolveTempDir();
	const filename = `hd_upscalepics_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
	const destPath = path.join(tempDir, filename);

	const res = await axios({
		method: 'GET',
		url,
		responseType: 'stream',
		timeout
	});

	await new Promise((resolve, reject) => {
		const writer = fs.createWriteStream(destPath);
		res.data.pipe(writer);
		writer.on('finish', resolve);
		writer.on('error', reject);
	});

	return destPath;
}

/**
 * @param {Buffer|string} input - Buffer gambar atau path file gambar lokal.
 * @param {number} [timeout=30000] - Timeout dalam milidetik.
 * @returns {import('../core/requestEngine.js').ProviderDescriptor}
 */
export function upscalepicsProvider(input, timeout = 30000) {
	return {
		name: 'upscalepics',
		timeout,
		run: async () => {
			let buffer;
			if (Buffer.isBuffer(input)) {
				buffer = input;
			} else if (typeof input === 'string' && fs.existsSync(input)) {
				buffer = fs.readFileSync(input);
			} else {
				throw new Error('upscalepics: Buffer gambar atau path file tidak valid.');
			}

			let meta;
			try {
				meta = await sharp(buffer).metadata();
			} catch {
				meta = { width: 512, height: 512 };
			}

			const origW = Math.max(1, meta.width || 512);
			const origH = Math.max(1, meta.height || 512);

			// Skala proporsional 100% akurat: batas sisi terpanjang maksimal 3840 (4K)
			// Menjaga rasio aspek tetap asli (anti-gepeng / anti-distorsi)
			const maxDim = Math.max(origW, origH);
			let scale = 4;
			if (maxDim * scale > 3840) {
				scale = 3840 / maxDim;
			}
			if (scale < 1) scale = 1;

			let targetWidth = Math.round(origW * scale);
			let targetHeight = Math.round(origH * scale);

			// Pastikan bilangan genap untuk kompatibilitas encoder
			if (targetWidth % 2 !== 0) targetWidth += 1;
			if (targetHeight % 2 !== 0) targetHeight += 1;

			const form = new FormData();
			form.append('image_file', buffer, { filename: 'image.png', contentType: 'image/png' });
			form.append('name', 'image.png');
			form.append('desiredHeight', String(targetHeight));
			form.append('desiredWidth', String(targetWidth));
			form.append('outputFormat', 'png');
			form.append('compressionLevel', 'none');
			form.append('anime', 'False');

			const res = await axios.post('https://api.upscalepics.com/upscale-to-size', form, {
				headers: {
					...form.getHeaders(),
					origin: 'https://upscalepics.com',
					referer: 'https://upscalepics.com/',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				},
				timeout: timeout - 5000
			});

			const imageUrl = res.data?.processed_image_url;
			if (!imageUrl) {
				throw new Error('upscalepics: URL hasil pemrosesan gambar tidak ditemukan dalam respons.');
			}

			const savedPath = await downloadUrlToTemp(imageUrl, 'png', 25000);
			return savedPath;
		}
	};
}

export default { upscalepicsProvider };
