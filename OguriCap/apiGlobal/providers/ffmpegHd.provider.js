/**
 * apiGlobal/providers/ffmpegHd.provider.js
 * -----------------------------------------------------------------------
 * Provider: FFmpeg Lanczos 4x Rescaling (Local Subprocess)
 *
 * Fallback lokal berbasis binary ffmpeg untuk perbesaran resolusi
 * dengan filter lanczos saat seluruh provider online dan libvips tidak tersedia.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

function resolveTempDir() {
	const candidate1 = path.join(process.cwd(), 'database', 'temp');
	const candidate2 = path.join(process.cwd(), 'OguriCap', 'database', 'temp');
	const dir = fs.existsSync(path.join(process.cwd(), 'OguriCap')) ? candidate2 : candidate1;
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return dir;
}

/**
 * @param {Buffer|string} input - Buffer gambar atau path file lokal.
 * @param {number} [scaleFactor=4]
 * @param {number} [timeout=15000]
 * @returns {import('../core/requestEngine.js').ProviderDescriptor}
 */
export function ffmpegHdProvider(input, scaleFactor = 4, timeout = 15000) {
	return {
		name: 'ffmpegLanczos',
		timeout,
		run: async () => {
			const tempDir = resolveTempDir();
			let srcPath = '';
			let cleanupSrc = false;

			if (typeof input === 'string' && fs.existsSync(input)) {
				srcPath = input;
			} else if (Buffer.isBuffer(input)) {
				srcPath = path.join(tempDir, `src_ffmpeg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`);
				fs.writeFileSync(srcPath, input);
				cleanupSrc = true;
			} else {
				throw new Error('ffmpegHd: Input gambar tidak valid.');
			}

			const outPath = path.join(tempDir, `hd_ffmpeg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`);
			const scale = Math.min(Math.max(scaleFactor, 2), 6);

			try {
				await new Promise((resolve, reject) => {
					exec(`ffmpeg -i "${srcPath}" -vf "scale=iw*${scale}:ih*${scale}:flags=lanczos" -q:v 1 "${outPath}"`, (err) => {
						if (err) return reject(err);
						resolve(outPath);
					});
				});

				return outPath;
			} finally {
				if (cleanupSrc && fs.existsSync(srcPath)) {
					try { fs.unlinkSync(srcPath); } catch {}
				}
			}
		}
	};
}

export default { ffmpegHdProvider };
