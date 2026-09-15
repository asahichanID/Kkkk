/**
 * apiGlobal/services/tools/remini.js
 * -----------------------------------------------------------------------
 * Layanan peningkatan kualitas gambar (.remini/.tohd/.hd).
 *
 * Provider Chain:
 *   1. Primary  : UpscalePics AI Super-Resolution (4x HD gratis, tanpa API Key)
 *   2. Backup 1 : Remaker AI Photo Enhancer (Restorasi detail & wajah gratis)
 *   3. Backup 2 : Sharp Multi-Pass Lanczos3 & Unsharp Mask (Lokal, 100% andal & instan)
 *   4. Backup 3 : FFmpeg Lanczos 4x Rescaling (Lokal via sistem subprocess)
 *   5. Fallback : Neoxr & Naze (kompatibilitas backward jika ada API Key)
 */

import fs from 'fs';
import FormData from 'form-data';
import { runProviders } from '../../core/requestEngine.js';
import { upscalepicsProvider } from '../../providers/upscalepics.provider.js';
import { remakerProvider } from '../../providers/remaker.provider.js';
import { sharpHdProvider } from '../../providers/sharpHd.provider.js';
import { ffmpegHdProvider } from '../../providers/ffmpegHd.provider.js';
import { nazeRequest } from '../../providers/naze.provider.js';
import { neoxrRequest } from '../../providers/neoxr.provider.js';
import { getTimeout, DEFAULT_RETRY } from '../../config/index.js';
import { envelope, validated } from '../../core/normalizer.js';
import { ValidationError } from '../../core/errors.js';

const SERVICE_GROUP = 'image';

/**
 * Hasil stream/auto-download yang SUKSES selalu berupa path file (string) yang ada di disk.
 */
const isFilePath = (raw) => typeof raw === 'string' && raw.length > 0 && fs.existsSync(raw);

/**
 * @param {import('form-data')|Buffer|string} input - FormData, Buffer gambar, atau path file gambar.
 * @param {string} [filePathHint] - Opsional path file gambar lokal langsung.
 * @returns {Promise<{result: string, provider: string, raw: string}>} `result` = path file gambar sementara.
 */
export async function apiRemini(input, filePathHint = null) {
	if (!input && !filePathHint) throw new ValidationError('apiRemini: parameter input gambar wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP) || 30000;

	let imageBuffer = null;
	let imagePath = null;

	if (typeof filePathHint === 'string' && fs.existsSync(filePathHint)) {
		imagePath = filePathHint;
		try { imageBuffer = fs.readFileSync(filePathHint); } catch {}
	} else if (typeof input === 'string' && fs.existsSync(input)) {
		imagePath = input;
		try { imageBuffer = fs.readFileSync(input); } catch {}
	} else if (Buffer.isBuffer(input)) {
		imageBuffer = input;
	} else if (input && typeof input === 'object') {
		if (Array.isArray(input._streams)) {
			for (const s of input._streams) {
				if (s?.source?.path && fs.existsSync(s.source.path)) {
					imagePath = s.source.path;
					try { imageBuffer = fs.readFileSync(imagePath); } catch {}
					break;
				}
				if (Buffer.isBuffer(s)) {
					imageBuffer = s;
				}
			}
		}
	}

	// Buat payload FormData untuk provider warisan (Neoxr / Naze) jika diperlukan
	let formPayload = null;
	if (input && typeof input.getHeaders === 'function') {
		formPayload = input;
	} else if (imagePath) {
		formPayload = new FormData();
		formPayload.append('buffer', fs.createReadStream(imagePath), {
			filename: 'image.jpg',
			contentType: 'image/jpeg'
		});
	} else if (imageBuffer) {
		formPayload = new FormData();
		formPayload.append('buffer', imageBuffer, {
			filename: 'image.jpg',
			contentType: 'image/jpeg'
		});
	}

	const source = imageBuffer || imagePath;
	if (!source) throw new ValidationError('apiRemini: Gagal membaca buffer atau file gambar.');

	const providers = [
		// Provider Utama: UpscalePics AI (4x super resolution, cepat dan stabil)
		validated(upscalepicsProvider(source, timeout), isFilePath),

		// Backup 1: Remaker AI (Detail & Face restoration enhancer)
		validated(remakerProvider(source, timeout), isFilePath),

		// Backup 2: Sharp Multi-Pass Lanczos3 & Unsharp Mask (Offline, zero network failure)
		validated(sharpHdProvider(source, 4, 10000), isFilePath),

		// Backup 3: FFmpeg Lanczos 4x Rescaling (Subprocess offline)
		validated(ffmpegHdProvider(source, 4, 15000), isFilePath)
	];

	// Tambahkan Neoxr dan Naze sebagai fallback tambahan jika ada payload form
	if (formPayload) {
		providers.push(
			validated(neoxrRequest('/remini', {}, { timeout, responseType: 'stream', form: formPayload }), isFilePath),
			nazeRequest('/tools/remini', {}, { timeout, responseType: 'stream', form: formPayload })
		);
	}

	const { raw, providerName } = await runProviders('tools.remini', providers, {
		defaultTimeout: timeout,
		defaultRetry: DEFAULT_RETRY
	});

	return envelope(raw, providerName, raw);
}

export default { apiRemini };

