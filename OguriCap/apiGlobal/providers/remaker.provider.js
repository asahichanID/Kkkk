/**
 * apiGlobal/providers/remaker.provider.js
 * -----------------------------------------------------------------------
 * Provider: Remaker AI Photo Enhancer (https://remaker.ai)
 * Endpoint: https://api.remaker.ai/api/pai/v4/ai-enhance/create-job-new
 *
 * Layanan AI Face Restoration & Detail Enhancement gratis.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';

function resolveTempDir() {
	const candidate1 = path.join(process.cwd(), 'database', 'temp');
	const candidate2 = path.join(process.cwd(), 'OguriCap', 'database', 'temp');
	const dir = fs.existsSync(path.join(process.cwd(), 'OguriCap')) ? candidate2 : candidate1;
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

async function downloadUrlToTemp(url, ext = 'jpg', timeout = 25000) {
	const tempDir = resolveTempDir();
	const filename = `hd_remaker_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
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
 * @param {number} [timeout=35000] - Timeout dalam milidetik.
 * @returns {import('../core/requestEngine.js').ProviderDescriptor}
 */
export function remakerProvider(input, timeout = 35000) {
	return {
		name: 'remaker',
		timeout,
		run: async () => {
			let buffer;
			if (Buffer.isBuffer(input)) {
				buffer = input;
			} else if (typeof input === 'string' && fs.existsSync(input)) {
				buffer = fs.readFileSync(input);
			} else {
				throw new Error('remaker: Buffer gambar atau path file tidak valid.');
			}

			const serial = crypto.randomBytes(16).toString('hex');
			const form = new FormData();
			form.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

			const createRes = await axios.post('https://api.remaker.ai/api/pai/v4/ai-enhance/create-job-new', form, {
				headers: {
					...form.getHeaders(),
					'product-code': '067003',
					'product-serial': serial,
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				},
				timeout: 15000
			});

			const resData = createRes.data;
			if (resData?.code !== 0 && resData?.code !== 200) {
				const errMsg = resData?.message?.en || resData?.message?.id || resData?.message || 'Gagal membuat job AI enhance';
				throw new Error(`remaker [${resData?.code}]: ${errMsg}`);
			}

			const jobId = resData?.data?.job_id;
			if (!jobId) {
				throw new Error('remaker: Job ID tidak ditemukan dalam respons create-job.');
			}

			// Polling hingga job selesai (maksimal ~20 detik)
			const startTime = Date.now();
			const maxPollTime = Math.min(timeout - 10000, 20000);

			while (Date.now() - startTime < maxPollTime) {
				await new Promise(r => setTimeout(r, 1500));

				const pollRes = await axios.get(`https://api.remaker.ai/api/pai/v4/ai-enhance/get-job/${jobId}`, {
					headers: {
						'product-code': '067003',
						'product-serial': serial,
						'user-agent': 'Mozilla/5.0'
					},
					timeout: 10000
				});

				const jobData = pollRes.data?.data;
				const status = jobData?.status;

				if (status === 1) { // Selesai
					const outputUrl = jobData?.output_image_url?.[0];
					if (!outputUrl) throw new Error('remaker: Output URL kosong meski status sukses.');
					const savedPath = await downloadUrlToTemp(outputUrl, 'jpg', 20000);
					return savedPath;
				} else if (status === 2 || status === -1) { // Gagal
					throw new Error('remaker: Job pemrosesan gambar di server gagal.');
				}
			}

			throw new Error('remaker: Timeout saat menunggu polling job selesai.');
		}
	};
}

export default { remakerProvider };
