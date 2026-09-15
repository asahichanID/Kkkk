/**
 * apiGlobal/services/creator/maker.js
 * -----------------------------------------------------------------------
 * Layanan "pembuat gambar/stiker". Menggantikan pemanggilan langsung di
 * naze.js untuk:
 *   .iqc, .qc/.quote/.fakechat, .brat, .bratvid/.bratvideo,
 *   .wasted, .trigger/.triggered, .nuliskanan/.nuliskiri/.foliokanan/.foliokiri
 *
 * Prioritas provider (sesuai NEOXR_ENDPOINTS.md — hanya iqc/brat/bratvid/nulis
 * yang punya endpoint NeoXR terdokumentasi):
 *   - .iqc      : NeoXR `/iqc`    → Naze `/create/iqc`
 *   - .brat     : NeoXR `/brat`   → Naze `/create/brat` → Naze `/create/brat3`
 *   - .bratvid  : NeoXR `/bratvid`→ Naze `/create/brat2` → Naze `/create/brat4`
 *   - .nulis*   : NeoXR `/nulis`  → Naze `/create/nulis/<variant>`
 *   - .qc/.wasted/.triggered : TETAP Naze saja — tidak ada endpoint NeoXR
 *     terdokumentasi untuk ketiganya (lihat NEOXR_ENDPOINTS.md bagian Creator,
 *     "sisanya yang belum itu tidak terpakai").
 *
 * Command tetap bertanggung jawab menyiapkan payload/gambar sumber
 * (download media, susun teks, dsb) — apiGlobal hanya menangani
 * KOMUNIKASI ke provider, sesuai ruang lingkup API_ARCHITECTURE.md.
 */

import { runProviders } from '../../core/requestEngine.js';
import { nazeRequest } from '../../providers/naze.provider.js';
import { neoxrRequest } from '../../providers/neoxr.provider.js';
import { getTimeout, DEFAULT_RETRY } from '../../config/index.js';
import { envelope, validated } from '../../core/normalizer.js';
import { ValidationError } from '../../core/errors.js';

const SERVICE_GROUP = 'image';

/**
 * Hasil stream/auto-download yang SUKSES selalu berupa path file (string).
 * Jika NeoXR merespons tapi tidak punya `data.url` (gagal/format tak
 * terduga), provider mengembalikan JSON mentah apa adanya — BUKAN string.
 * Validasi ini memastikan kegagalan semacam itu memicu fallback ke Naze,
 * bukan diam-diam "berhasil" dengan hasil yang rusak.
 */
const isFilePath = (raw) => typeof raw === 'string' && raw.length > 0;

/**
 * Gambar kutipan bergaya "iOS iMessage" dari teks (.iqc).
 * @param {string} text
 * @returns {Promise<{result: string, provider: string, raw: string}>} `result` = path file gambar sementara.
 */
export async function apiIqcCreate(text) {
	if (!text) throw new ValidationError('apiIqcCreate: parameter "text" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);
	const now = new Date();
	const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
	const chat_time = time;

	const providers = [
		validated(neoxrRequest('/iqc', { text, time, chat_time }, { timeout, responseType: 'stream' }), isFilePath),
		nazeRequest('/create/iqc', { text }, { timeout, responseType: 'stream' })
	];
	const { raw, providerName } = await runProviders('image.iqc', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

/**
 * Gambar tangkapan-layar chat palsu (.qc/.quote/.fakechat).
 * Tidak ada endpoint NeoXR terdokumentasi untuk ini — Naze saja.
 * @param {Object} payload - Payload lengkap (type/format/messages/dst) yang sudah disusun command.
 * @returns {Promise<{result: Buffer, provider: string, raw: Buffer}>}
 */
export async function apiQuoteCreate(payload) {
	if (!payload) throw new ValidationError('apiQuoteCreate: parameter "payload" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);
	const providers = [
		nazeRequest('/create/qc', payload, { method: 'POST', timeout, responseType: 'buffer' })
	];
	const { raw, providerName } = await runProviders('image.qc', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

/**
 * Stiker teks gaya "brat" (.brat).
 * Prioritas:
 * 1. NeoXR `/brat` (auto-download file PNG dari data.url, mime: image/png)
 * 2. Fallback Lokal (renderBrat)
 * 3. Fallback Naze (/create/brat & /create/brat3)
 * @param {string} text
 * @returns {Promise<{result: string|Buffer, provider: string, raw: string|Buffer}>}
 */
export async function apiBratSticker(text) {
	if (!text) throw new ValidationError('apiBratSticker: parameter "text" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);

	// 1. Prioritas Utama: NeoXR /brat (JSON response -> auto-download PNG dari data.url)
	try {
		const neoxrRunner = validated(
			neoxrRequest('/brat', { text }, {
				timeout,
				responseType: 'stream',
				extensionHint: 'png'
			}),
			isFilePath
		);
		const { raw, providerName } = await runProviders('image.brat', [
			{ ...neoxrRunner, name: 'neoxr:brat' }
		], { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
		return envelope(raw, providerName, raw);
	} catch (neoErr) {
		console.log('[brat] NeoXR /brat error, falling back to local / naze:', neoErr?.message || neoErr);
	}

	// 2. Fallback 1: Local engine renderBrat
	try {
		const { renderBrat } = await import('../../../lib/sticker/brat.js');
		const buffer = await renderBrat(text);
		if (buffer && buffer.length > 0) {
			return envelope(buffer, 'local:brat', buffer);
		}
	} catch (localErr) {
		console.log('[brat] Local renderBrat error, falling back to Naze:', localErr?.message || localErr);
	}

	// 3. Fallback 2: Naze API /create/brat & /create/brat3
	const nazeProviders = [
		{ ...nazeRequest('/create/brat', { text }, { timeout, responseType: 'stream' }), name: 'naze:brat' },
		{ ...nazeRequest('/create/brat3', { text }, { timeout, responseType: 'stream' }), name: 'naze:brat3' }
	];
	const { raw, providerName } = await runProviders('image.brat', nazeProviders, {
		defaultTimeout: timeout,
		defaultRetry: DEFAULT_RETRY
	});
	return envelope(raw, providerName, raw);
}

/**
 * Video animasi teks gaya "brat" (.bratvid/.bratvideo).
 * Menghubungi API NeoXR `/bratvid` yang mengembalikan respon:
 * {
 *   "creator": "@neoxr.js - Wildan Izzudin",
 *   "status": true,
 *   "data": {
 *     "id": "...",
 *     "filename": "...",
 *     "original_name": "...",
 *     "bytes": 21294,
 *     "size": "20.79 KB",
 *     "mime": "video/mp4",
 *     "extension": "mp4",
 *     "url": "https://..."
 *   }
 * }
 * Auto-download URL video MP4 dari data.url langsung ke path tujuan.
 * @param {string} text - Teks lengkap yang ingin dianimasikan
 * @param {string} [outputPath] - Path tujuan penyimpanan file MP4 sementara
 * @returns {Promise<{result: string, provider: string, raw: string}>}
 */
export async function apiBratVideo(text, outputPath) {
	if (!text) throw new ValidationError('apiBratVideo: parameter "text" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);

	const providers = [
		{
			...validated(
				neoxrRequest('/bratvid', { text }, {
					timeout,
					responseType: 'stream',
					streamTo: outputPath,
					extensionHint: 'mp4'
				}),
				isFilePath
			),
			name: 'neoxr:bratvid'
		}
	];

	const { raw, providerName } = await runProviders('image.bratvid', providers, {
		defaultTimeout: timeout,
		defaultRetry: DEFAULT_RETRY
	});
	return envelope(raw, providerName, raw);
}

/**
 * Satu frame video teks gaya "brat" (Naze per-frame fallback).
 * Dipakai saat NeoXR /bratvid tidak tersedia / offline untuk merangkai video frame demi frame.
 * @param {string} text
 * @param {string} framePath - Path tujuan file frame (video pendek).
 * @returns {Promise<{result: string, provider: string, raw: string}>}
 */
export async function apiBratVideoFrame(text, framePath) {
	if (!text) throw new ValidationError('apiBratVideoFrame: parameter "text" wajib diisi.');
	if (!framePath) throw new ValidationError('apiBratVideoFrame: parameter "framePath" wajib diisi.');

	const timeout = getTimeout(SERVICE_GROUP);
	const providers = [
		{ ...nazeRequest('/create/brat2', { text }, { timeout, responseType: 'stream', streamTo: framePath }), name: 'naze:brat2' },
		{ ...nazeRequest('/create/brat4', { text }, { timeout, responseType: 'stream', streamTo: framePath }), name: 'naze:brat4' }
	];
	const { raw, providerName } = await runProviders('image.bratVideoFrame', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

/**
 * Efek gambar "wasted" di atas foto (.wasted). Tidak ada endpoint NeoXR
 * terdokumentasi untuk ini — Naze saja.
 * @param {import('form-data')} form - FormData berisi field `buffer` (gambar sumber).
 */
export async function apiWastedImage(form) {
	if (!form) throw new ValidationError('apiWastedImage: parameter "form" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);
	const providers = [nazeRequest('/create/wasted', {}, { timeout, responseType: 'stream', form })];
	const { raw, providerName } = await runProviders('image.wasted', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

/**
 * Efek gambar "triggered" di atas foto (.trigger/.triggered). Tidak ada
 * endpoint NeoXR terdokumentasi untuk ini — Naze saja.
 * @param {import('form-data')} form
 */
export async function apiTriggeredImage(form) {
	if (!form) throw new ValidationError('apiTriggeredImage: parameter "form" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);
	const providers = [nazeRequest('/create/triggered', {}, { timeout, responseType: 'stream', form })];
	const { raw, providerName } = await runProviders('image.triggered', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

/**
 * Gambar "tulisan buku catatan" (.nuliskanan/.nuliskiri/.foliokanan/.foliokiri).
 * Prioritas: NeoXR /nulis → Naze /create/nulis/<variant>.
 * @param {string} variant - Salah satu dari 'nuliskanan' | 'nuliskiri' | 'foliokanan' | 'foliokiri'.
 * @param {string} text
 */
export async function apiNulisCreate(variant, text) {
	if (!variant) throw new ValidationError('apiNulisCreate: parameter "variant" wajib diisi.');
	if (!text) throw new ValidationError('apiNulisCreate: parameter "text" wajib diisi.');
	const timeout = getTimeout(SERVICE_GROUP);
	const providers = [
		validated(neoxrRequest('/nulis', { text }, { timeout, responseType: 'stream' }), isFilePath),
		nazeRequest(`/create/nulis/${variant}`, { text }, { timeout, responseType: 'stream' })
	];
	const { raw, providerName } = await runProviders('image.nulis', providers, { defaultTimeout: timeout, defaultRetry: DEFAULT_RETRY });
	return envelope(raw, providerName, raw);
}

export default {
	apiIqcCreate,
	apiQuoteCreate,
	apiBratSticker,
	apiBratVideo,
	apiBratVideoFrame,
	apiWastedImage,
	apiTriggeredImage,
	apiNulisCreate
};
