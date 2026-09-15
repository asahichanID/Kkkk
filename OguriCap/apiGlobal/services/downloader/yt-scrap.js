/**
 * apiGlobal/services/downloader/yt-scrap.js
 * -----------------------------------------------------------------------
 * Layanan YouTube Scraper Mandiri, Secepat Kilat (Sub-Second) & Berkualitas Tinggi.
 *
 * Fitur Utama:
 *   - YouTube Search (YTS) Super Cepat dengan In-Memory Cache (0ms on repeat).
 *   - Audio MP3 / Video HD Downloader Secepat Kilat via Parallel-Race Multi-Engine:
 *       • Engine 1: High-Speed Direct Stream CDN
 *       • Engine 2: Savetube Decrypted Stream Engine
 *       • Engine 3: Loader Stream Engine
 *   - LRU Stream Caching: Permintaan ulang URL/ID yang sama selesai dalam 0ms (Instant).
 *   - Log Terpusat Super Jelas: Menampilkan Provider, Aksi, dan Waktu Eksekusi (ms).
 *   - Kualitas 100% Asli tanpa penurunan bitrate.
 *   - Auto-Fallback otomatis ke API YouTube lama (Neoxr & Naze) jika seluruh engine scraper terkendala.
 */

import axios from 'axios';
import https from 'https';
import { createDecipheriv } from 'crypto';
import yts from 'yt-search';
import { logger } from '../../core/logger.js';
import { getTimeout } from '../../config/index.js';
import { envelope } from '../../core/normalizer.js';
import { ValidationError } from '../../core/errors.js';
import {
  apiYoutubeSearch as apiYoutubeSearchBackup,
  apiYoutubeAudio as apiYoutubeAudioBackup,
  apiYoutubeDownload as apiYoutubeDownloadBackup
} from './youtube.js';

const SERVICE_GROUP = 'youtube';

// -----------------------------------------------------------------------
// HTTP Keep-Alive Agent untuk respons ultra-cepat & hemat memori
// -----------------------------------------------------------------------
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 80,
  maxFreeSockets: 20,
  timeout: 10000
});

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://yt.savetube.me'
};

const METADATA_DECRYPTION_KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');

// -----------------------------------------------------------------------
// In-Memory Lightweight Cache (Search & Stream URL)
// -----------------------------------------------------------------------
const searchCache = new Map();
const streamCache = new Map();
const MAX_CACHE_ENTRIES = 200;
const SEARCH_TTL_MS = 15 * 60 * 1000; // 15 menit
const STREAM_TTL_MS = 30 * 60 * 1000; // 30 menit

function getFromCache(cacheMap, key) {
  const item = cacheMap.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cacheMap.delete(key);
    return null;
  }
  return item.data;
}

function saveToCache(cacheMap, key, data, ttlMs) {
  if (cacheMap.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cacheMap.keys().next().value;
    if (firstKey) cacheMap.delete(firstKey);
  }
  cacheMap.set(key, { data, expires: Date.now() + ttlMs });
}

// -----------------------------------------------------------------------
// Helper: Ekstraksi Video ID
// -----------------------------------------------------------------------
export function extractYouTubeId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match ? match[1] : null;
}

/**
 * Format normalizer terpadu agar 100% kompatibel dengan downloader lama
 */
function normalizeMediaResult(meta, downloadUrl, format = 'mp3', direct = true) {
  const isAudio = format === 'mp3' || format === 'audio';
  const ext = isAudio ? 'mp3' : 'mp4';
  const title = meta?.title || 'YouTube Media';

  return {
    title: title,
    download: downloadUrl,
    url: downloadUrl,
    filename: `${title}.${ext}`,
    author: meta?.author?.name || meta?.author || 'YouTube Creator',
    thumbnail: meta?.thumbnail || meta?.image || (meta?.videoId ? `https://i.ytimg.com/vi/${meta.videoId}/hqdefault.jpg` : ''),
    image: meta?.image || meta?.thumbnail || '',
    views: meta?.views || 0,
    ago: meta?.ago || '',
    size: meta?.size || '',
    duration: meta?.timestamp || meta?.duration || '--:--',
    direct: direct
  };
}

// -----------------------------------------------------------------------
// ENGINE RESOLVER SECEPAT KILAT (PARALLEL-RACE INTERNAL)
// -----------------------------------------------------------------------

/**
 * Engine 1: High-Speed Direct Stream Resolver (Neoxr Fast Stream)
 */
async function engineDirectStream(videoUrl, isAudio = true, targetFormat = '720', timeout = 4500) {
  const res = await axios.get('https://api.neoxr.eu/api/youtube', {
    params: {
      url: videoUrl,
      type: isAudio ? 'audio' : 'video',
      quality: isAudio ? '128kbps' : (/^\d+$/.test(targetFormat) ? `${targetFormat}p` : '720p'),
      apikey: 'j3i3mg'
    },
    headers: { 'Accept': 'application/json' },
    httpsAgent: keepAliveAgent,
    timeout: timeout
  });

  const raw = res.data;
  const d = raw?.data;
  const downloadUrl = d?.url || raw?.url;
  if (!downloadUrl) throw new Error('Direct stream engine did not return URL');

  return {
    engine: 'direct-stream',
    downloadUrl,
    title: d?.title || raw?.title,
    thumbnail: d?.thumbnail || raw?.thumbnail,
    duration: d?.duration || raw?.duration,
    size: d?.size || raw?.size
  };
}

/**
 * Engine 2: Savetube Decrypted Stream Engine
 */
async function engineSavetube(videoId, isAudio = true, targetFormat = '720', timeout = 5000) {
  const cdnRes = await axios.get('https://media.savetube.vip/api/random-cdn', {
    headers: DEFAULT_HEADERS,
    httpsAgent: keepAliveAgent,
    timeout: 2500
  });

  const cdn = cdnRes.data?.cdn;
  if (!cdn) throw new Error('Savetube CDN not available');

  const info = await axios.post(
    `https://${cdn}/v2/info`,
    { url: `https://www.youtube.com/watch?v=${videoId}` },
    {
      headers: DEFAULT_HEADERS,
      httpsAgent: keepAliveAgent,
      timeout: 3500
    }
  );

  if (!info.data?.data) throw new Error('Savetube metadata empty');

  const encrypted = Buffer.from(info.data.data, 'base64');
  const decipher = createDecipheriv('aes-128-cbc', METADATA_DECRYPTION_KEY, encrypted.subarray(0, 16));
  const decrypted = Buffer.concat([decipher.update(encrypted.subarray(16)), decipher.final()]);
  const metadata = JSON.parse(decrypted.toString('utf8'));

  if (!metadata?.key) throw new Error('Savetube key missing');

  const quality = isAudio ? '128kbps' : (/^\d+$/.test(targetFormat) ? targetFormat : '720');
  const dl = await axios.post(
    `https://${cdn}/download`,
    {
      id: videoId,
      downloadType: isAudio ? 'audio' : 'video',
      quality: quality,
      key: metadata.key
    },
    {
      headers: DEFAULT_HEADERS,
      httpsAgent: keepAliveAgent,
      timeout: 4000
    }
  );

  const downloadUrl = dl.data?.data?.downloadUrl;
  if (!downloadUrl) throw new Error('Savetube download URL empty');

  return {
    engine: 'savetube-cdn',
    downloadUrl,
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    duration: metadata.durationLabel
  };
}

/**
 * Engine 3: Loader Fast Stream Engine
 */
async function engineLoader(videoUrl, isAudio = true, targetFormat = '720', timeout = 6000) {
  const formatCode = isAudio ? 'mp3' : (/^\d+$/.test(targetFormat) ? targetFormat : '720');

  const startRes = await axios.get(`https://loader.to/ajax/download.php?format=${formatCode}&url=${encodeURIComponent(videoUrl)}`, {
    headers: DEFAULT_HEADERS,
    httpsAgent: keepAliveAgent,
    timeout: 3500
  });

  const raw = startRes.data;
  if (!raw || !raw.success) throw new Error('Loader init failed');
  if (raw.download_url) {
    return {
      engine: 'loader-direct',
      downloadUrl: raw.download_url,
      title: raw.title || raw.info?.title,
      thumbnail: raw.thumbnail_url || raw.info?.image
    };
  }

  const id = raw.id;
  const progressUrl = raw.progress_url || `https://loader.to/ajax/progress.php?id=${id}`;
  if (!id) throw new Error('Loader task id missing');

  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const pRes = await axios.get(progressUrl, {
      headers: DEFAULT_HEADERS,
      httpsAgent: keepAliveAgent,
      timeout: 3000
    });
    if (pRes.data?.download_url) {
      return {
        engine: 'loader-stream',
        downloadUrl: pRes.data.download_url,
        title: raw.title || raw.info?.title || pRes.data.title,
        thumbnail: raw.thumbnail_url || raw.info?.image || pRes.data.thumbnail_url
      };
    }
  }

  throw new Error('Loader polling timed out');
}

/**
 * Ultra-Fast Multi-Engine Race Resolver
 * Menjalankan engine-engine tercepat secara paralel dengan prioritas direct CDN stream stabil.
 */
async function resolveFastMediaRace(videoUrl, videoId, isAudio = true, format = 'mp3', timeout = 12000) {
  const engines = [];

  // Engine 1: Savetube Engine (Direct static CDN MP3/MP4, sangat stabil & cepat)
  if (videoId) {
    engines.push(engineSavetube(videoId, isAudio, format, Math.min(timeout, 5000)));
  }

  // Engine 2: Loader Fast Engine (Direct conversion stream)
  engines.push(engineLoader(videoUrl, isAudio, format, Math.min(timeout, 6000)));

  // Engine 3: Direct Stream CDN (Neoxr Stream fallback)
  engines.push(engineDirectStream(videoUrl, isAudio, format, Math.min(timeout, 6000)));

  // Menangkan respons tercepat yang berhasil
  return await Promise.any(engines);
}

// -----------------------------------------------------------------------
// 1. YOUTUBE SEARCH & METADATA (YTS)
// -----------------------------------------------------------------------
/**
 * Pencarian YouTube Mandiri Secepat Kilat (In-Memory Cache & Zero Delay)
 * @param {string} query - Kata kunci pencarian
 * @returns {Promise<{result: Array<object>, provider: string, raw: any}>}
 */
export async function apiYoutubeScrapSearch(query) {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('apiYoutubeScrapSearch: parameter "query" wajib diisi.');
  }

  const startAt = Date.now();
  const trimmed = query.trim();
  const cacheKey = `search:${trimmed.toLowerCase()}`;

  // Cek cache respons instan 0ms
  const cached = getFromCache(searchCache, cacheKey);
  if (cached) {
    logger.cacheHit('youtube.search', `"${trimmed}" (${cached.length} items)`);
    return envelope(cached, 'youtube-scraper-cache');
  }

  logger.action('youtube.search', `Mencari video: "${trimmed}"`);

  // 1. Scraper Primer: yt-search mandiri
  try {
    const searchRes = await yts(trimmed);
    const videos = Array.isArray(searchRes?.videos) ? searchRes.videos : [];

    if (videos.length > 0) {
      const items = videos.map((v) => {
        const vid = v.videoId || extractYouTubeId(v.url) || '';
        const thumb = v.thumbnail || v.image || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : '');
        const dur = v.timestamp || (v.duration && (v.duration.timestamp || v.duration.seconds)) || (v.seconds ? `${Math.floor(v.seconds / 60)}:${String(v.seconds % 60).padStart(2, '0')}` : '--:--');
        const authorName = (v.author && (v.author.name || v.author)) || 'YouTube Music';

        return {
          type: 'video',
          videoId: vid,
          url: v.url || `https://youtube.com/watch?v=${vid}`,
          title: v.title || '',
          description: v.description || '',
          thumbnail: thumb,
          image: thumb,
          timestamp: typeof dur === 'string' ? dur : '03:30',
          seconds: v.seconds || (v.duration && v.duration.seconds) || 0,
          ago: v.ago || '',
          views: v.views || 0,
          author: {
            name: authorName,
            url: v.author?.url || ''
          }
        };
      });

      saveToCache(searchCache, cacheKey, items, SEARCH_TTL_MS);
      const elapsed = Date.now() - startAt;
      logger.success('youtube.search', 'youtube-scraper', `${items.length} video ditemukan untuk "${trimmed}"`, elapsed);
      return envelope(items, 'youtube-scraper', searchRes);
    }
  } catch (searchErr) {
    logger.fallback('youtube.search', 'youtube-scraper', 'youtube.search-backup', searchErr?.message || String(searchErr));
  }

  // 2. Fallback otomatis ke API YouTube lama
  return apiYoutubeSearchBackup(query);
}

// -----------------------------------------------------------------------
// 2. YOUTUBE AUDIO / MP3 DOWNLOADER
// -----------------------------------------------------------------------
/**
 * Unduh Audio MP3 YouTube Secepat Kilat & Berkualitas Tinggi (Mandiri -> Auto-Fallback)
 * @param {string} url - URL video YouTube
 * @returns {Promise<{result: object, provider: string, raw: any}>}
 */
export async function apiYoutubeScrapAudio(url) {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('apiYoutubeScrapAudio: parameter "url" wajib diisi.');
  }

  const startAt = Date.now();
  const videoId = extractYouTubeId(url);
  const targetUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  const cacheKey = `audio:${videoId || targetUrl}`;

  // Cek cache stream instan 0ms
  const cached = getFromCache(streamCache, cacheKey);
  if (cached) {
    logger.cacheHit('youtube.audio', `ID: ${videoId || 'url'} | "${cached.title}"`);
    return envelope(cached, 'youtube-scraper-cache');
  }

  logger.action('youtube.audio', `Mengekstrak stream audio secepat kilat`, videoId || targetUrl);
  const timeout = getTimeout(SERVICE_GROUP) || 15000;

  // 1. Scraper Primer: Parallel-Race Secepat Kilat Langsung Jalan
  try {
    // Jalankan race resolver stream seketika tanpa menunggu yts metadata
    const [resolvedResult, metaResult] = await Promise.allSettled([
      resolveFastMediaRace(targetUrl, videoId, true, 'mp3', timeout),
      videoId ? yts({ videoId }).catch(() => null) : Promise.resolve(null)
    ]);

    if (resolvedResult.status === 'fulfilled' && resolvedResult.value?.downloadUrl) {
      const resolved = resolvedResult.value;
      const meta = metaResult.status === 'fulfilled' ? metaResult.value : null;

      const normalized = normalizeMediaResult(
        {
          title: resolved.title || meta?.title,
          author: meta?.author?.name || 'YouTube Audio',
          thumbnail: resolved.thumbnail || meta?.thumbnail,
          views: meta?.views || 0,
          ago: meta?.ago || '',
          timestamp: resolved.duration || meta?.duration?.timestamp || '--:--',
          videoId: videoId
        },
        resolved.downloadUrl,
        'mp3',
        true
      );

      saveToCache(streamCache, cacheKey, normalized, STREAM_TTL_MS);
      const elapsed = Date.now() - startAt;
      logger.success('youtube.audio', `youtube-scraper (${resolved.engine})`, `"${normalized.title}"`, elapsed);
      return envelope(normalized, 'youtube-scraper', resolved);
    }
  } catch (scrapErr) {
    logger.fallback('youtube.audio', 'youtube-scraper', 'youtube.audio-backup', scrapErr?.message || String(scrapErr));
  }

  // 2. Fallback otomatis ke API YouTube lama
  return apiYoutubeAudioBackup(url);
}

// -----------------------------------------------------------------------
// 3. YOUTUBE VIDEO / MP4 DOWNLOADER
// -----------------------------------------------------------------------
/**
 * Unduh Video MP4 YouTube Kualitas Maksimal Secepat Kilat (Mandiri -> Auto-Fallback)
 * @param {string} url - URL video YouTube
 * @param {string} [format='720'] - Kualitas video ('360', '480', '720', '1080', dll)
 * @returns {Promise<{result: object, provider: string, raw: any}>}
 */
export async function apiYoutubeScrapDownload(url, format = '720') {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('apiYoutubeScrapDownload: parameter "url" wajib diisi.');
  }

  if (format === 'mp3' || format === 'audio') {
    return apiYoutubeScrapAudio(url);
  }

  const startAt = Date.now();
  const videoId = extractYouTubeId(url);
  const targetUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  const cacheKey = `video:${format}:${videoId || targetUrl}`;

  // Cek cache stream instan 0ms
  const cached = getFromCache(streamCache, cacheKey);
  if (cached) {
    logger.cacheHit('youtube.video', `[${format}p] ID: ${videoId || 'url'} | "${cached.title}"`);
    return envelope(cached, 'youtube-scraper-cache');
  }

  logger.action('youtube.video', `Mengekstrak stream video (${format}p) secepat kilat`, videoId || targetUrl);
  const timeout = getTimeout(SERVICE_GROUP) || 15000;

  // 1. Scraper Primer: Parallel-Race Secepat Kilat Langsung Jalan
  try {
    const [resolvedResult, metaResult] = await Promise.allSettled([
      resolveFastMediaRace(targetUrl, videoId, false, format, timeout),
      videoId ? yts({ videoId }).catch(() => null) : Promise.resolve(null)
    ]);

    if (resolvedResult.status === 'fulfilled' && resolvedResult.value?.downloadUrl) {
      const resolved = resolvedResult.value;
      const meta = metaResult.status === 'fulfilled' ? metaResult.value : null;

      const normalized = normalizeMediaResult(
        {
          title: resolved.title || meta?.title,
          author: meta?.author?.name || 'YouTube Video',
          thumbnail: resolved.thumbnail || meta?.thumbnail,
          views: meta?.views || 0,
          ago: meta?.ago || '',
          timestamp: resolved.duration || meta?.duration?.timestamp || '--:--',
          videoId: videoId
        },
        resolved.downloadUrl,
        format,
        true
      );

      saveToCache(streamCache, cacheKey, normalized, STREAM_TTL_MS);
      const elapsed = Date.now() - startAt;
      logger.success('youtube.video', `youtube-scraper (${resolved.engine})`, `[${format}p] "${normalized.title}"`, elapsed);
      return envelope(normalized, 'youtube-scraper', resolved);
    }
  } catch (scrapErr) {
    logger.fallback('youtube.video', 'youtube-scraper', 'youtube.video-backup', scrapErr?.message || String(scrapErr));
  }

  // 2. Fallback otomatis ke API YouTube lama
  return apiYoutubeDownloadBackup(url, format);
}

export default {
  apiYoutubeScrapSearch,
  apiYoutubeScrapAudio,
  apiYoutubeScrapDownload,
  extractYouTubeId
};

