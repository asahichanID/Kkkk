/**
 * apiGlobal/services/downloader/tiktok-scrap.js
 * -----------------------------------------------------------------------
 * Layanan TikTok Scraper Mandiri (Free, No API Key, HD Quality First).
 *
 * Mengambil metadata, audio, gambar/slides, dan stream video HD/original tanpa
 * watermark dari URL TikTok publik secara langsung tanpa bergantung pada API berbayar.
 *
 * Fitur:
 *   - Bebas API Key / Token
 *   - Auto-resolving shortlink (vt.tiktok.com, vm.tiktok.com, t.co, dll)
 *   - Prioritas Video HD (nowm_hd -> nowm -> wm)
 *   - Format return 100% kompatibel dan seragam dengan Naze / tracendd.js
 *   - Fallback otomatis ke provider API lama jika scraper mengalami kendala
 */

import axios from 'axios';
import https from 'https';
import { getTimeout } from '../../config/index.js';
import { envelope } from '../../core/normalizer.js';
import { ValidationError } from '../../core/errors.js';
import { apiTiktokDownload as apiTiktokBackup } from './tiktok.js';

const SERVICE_GROUP = 'tiktok';

// Agent https reusable dengan keep-alive untuk respons super cepat & hemat RAM
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 10000
});

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.tikwm.com/',
  'Origin': 'https://www.tikwm.com'
};

/**
 * Petakan hasil data scraper ke format standar seragam sistem downloader OguriCap.
 * @param {object} data - Raw data dari scraper engine
 * @returns {object}
 */
export function normalizeTikTokScraper(data) {
  if (!data) return null;

  const images = Array.isArray(data.images)
    ? data.images.filter(Boolean)
    : Array.isArray(data.photos)
      ? data.photos.filter(Boolean)
      : data.image
        ? [data.image]
        : [];

  const likes = Number(data.digg_count ?? data.diggCount ?? data.likes ?? 0) || 0;
  const views = Number(data.play_count ?? data.playCount ?? data.views ?? 0) || 0;
  const comments = Number(data.comment_count ?? data.commentCount ?? data.comments ?? 0) || 0;
  const shares = Number(data.share_count ?? data.shareCount ?? data.shares ?? 0) || 0;
  const saved = Number(data.collect_count ?? data.collectCount ?? data.saved ?? 0) || 0;

  const nowmHd = data.hdplay || data.hd_play || data.play || data.nowm_hd || null;
  const nowm = data.play || data.nowm || data.hdplay || null;
  const wm = data.wmplay || data.wm_play || data.wm || null;

  const audioUrl = data.music || data.music_info?.play || data.audio || null;
  const audioTitle = data.music_info?.title || data.music_title || 'TikTok Audio';
  const audioAuthor = data.music_info?.author || data.music_author || data.author?.nickname || 'TikTok Creator';

  const authorUniqueId = (data.author?.unique_id || data.author?.uniqueId || '').replace(/^@/, '').trim();
  const authorNickname = (data.author?.nickname || data.author?.name || authorUniqueId || '').trim();

  return {
    id: data.id ? String(data.id) : null,
    desc: data.title ?? data.desc ?? data.caption ?? '',
    title: data.title ?? data.desc ?? data.caption ?? '',
    create_time: data.create_time ?? data.createTime ?? null,
    createTime: data.create_time ?? data.createTime ?? null,

    author: {
      id: data.author?.id ? String(data.author.id) : null,
      nickname: authorNickname,
      uniqueId: authorUniqueId,
      unique_id: authorUniqueId,
      avatarThumb: data.author?.avatar ?? data.author?.avatarThumb ?? null,
      avatarMedium: data.author?.avatar ?? data.author?.avatarMedium ?? null,
      avatarLarger: data.author?.avatar ?? data.author?.avatarLarger ?? null,
      signature: data.author?.signature ?? null,
      verified: Boolean(data.author?.verified),
      secUid: data.author?.secUid ?? null
    },

    stats: {
      diggCount: likes,
      shareCount: shares,
      commentCount: comments,
      playCount: views,
      collectCount: saved,
      likes,
      views,
      comments,
      shares,
      saved
    },

    statistics: {
      likes,
      views,
      comments,
      shares,
      saved,
      diggCount: likes,
      playCount: views,
      commentCount: comments,
      shareCount: shares,
      collectCount: saved
    },

    statistic: {
      likes,
      views,
      comments,
      shares,
      saved
    },

    statsV2: {
      diggCount: String(likes),
      shareCount: String(shares),
      commentCount: String(comments),
      playCount: String(views),
      collectCount: String(saved),
      repostCount: '0'
    },

    authorStats: {
      followerCount: data.author?.followers ?? 0,
      followingCount: data.author?.following ?? 0,
      heart: likes,
      heartCount: likes,
      videoCount: data.author?.videos ?? 0,
      diggCount: 0,
      friendCount: 0
    },

    authorStatsV2: {
      followerCount: String(data.author?.followers ?? 0),
      followingCount: String(data.author?.following ?? 0),
      heart: String(likes),
      heartCount: String(likes),
      videoCount: String(data.author?.videos ?? 0),
      diggCount: '0',
      friendCount: '0'
    },

    video: {
      id: data.id ? String(data.id) : null,
      width: data.width ?? null,
      height: data.height ?? null,
      duration: data.duration ?? null,
      ratio: data.ratio ?? null,
      definition: nowmHd ? 'HD' : 'SD',
      format: 'mp4',
      size: data.hd_size ?? data.size ?? null,
      cover: data.cover ?? null,
      dynamicCover: data.ai_dynamic_cover ?? data.dynamic_cover ?? null,
      originCover: data.origin_cover ?? null
    },

    music: {
      id: data.music_info?.id ? String(data.music_info.id) : null,
      title: audioTitle,
      authorName: audioAuthor,
      playUrl: audioUrl,
      duration: data.music_info?.duration ?? data.duration ?? null,
      coverLarge: data.music_info?.cover ?? null,
      coverMedium: data.music_info?.cover ?? null,
      coverThumb: data.music_info?.cover ?? null,
      original: Boolean(data.music_info?.original)
    },

    musicInfo: {
      id: data.music_info?.id ? String(data.music_info.id) : null,
      title: audioTitle,
      author: audioAuthor,
      duration: data.music_info?.duration ?? data.duration ?? null,
      cover: data.music_info?.cover ?? null,
      original: Boolean(data.music_info?.original)
    },

    photo: images,
    photos: images,
    images: images,
    image: images[0] ?? null,

    download: {
      video: {
        nowm_hd: nowmHd,
        nowm: nowm,
        wm: wm
      },
      audio: audioUrl,
      music: audioUrl,
      music_info: {
        title: audioTitle,
        author: audioAuthor
      },
      cover: data.cover ?? null,
      dynamicCover: data.ai_dynamic_cover ?? data.dynamic_cover ?? null,
      originCover: data.origin_cover ?? null
    }
  };
}

/**
 * Scraper Engine Primer (TikWM HTTP Engine)
 * Mengambil link video HD langsung dari server CDN tanpa re-encoding/kompresi.
 * @param {string} url - Target URL TikTok
 * @param {number} timeout - Timeout per request (ms)
 */
async function scrapeTikTok(url, timeout = 10000) {
  const response = await axios.post(
    'https://www.tikwm.com/api/',
    new URLSearchParams({
      url: url.trim(),
      hd: '1'
    }),
    {
      headers: DEFAULT_HEADERS,
      httpsAgent: agent,
      timeout,
      validateStatus: (status) => status >= 200 && status < 400
    }
  );

  const raw = response.data;
  if (raw && (raw.code === 0 || raw.msg === 'success') && raw.data) {
    const data = raw.data;
    const hasMedia = Boolean(
      data.hdplay ||
      data.play ||
      data.music ||
      (Array.isArray(data.images) && data.images.length > 0)
    );

    if (hasMedia) {
      const normalized = normalizeTikTokScraper(data);
      return {
        normalized,
        raw
      };
    }
  }

  throw new Error(raw?.msg || 'Scraper tidak menemukan media pada URL tersebut');
}

/**
 * Layanan Utama TikTok Downloader.
 * Alur: "TikTok Scraper → jika gagal/error/timeout → Fallback otomatis ke API TikTok lama"
 *
 * @param {string} url - URL video / slide foto TikTok
 * @param {object} [options]
 * @param {boolean} [options.withMetadata=true]
 * @returns {Promise<{result: object, provider: string, raw: any}>}
 */
export async function apiTiktokScrapDownload(url, options = {}) {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('apiTiktokScrapDownload: parameter "url" wajib diisi.');
  }

  const timeout = getTimeout(SERVICE_GROUP) || 12000;

  // 1. PROVIDER PERTAMA: TikTok Scraper Mandiri (Free, No Key, HD Stream)
  try {
    const { normalized, raw } = await scrapeTikTok(url, timeout);
    if (normalized) {
      return envelope(normalized, 'tiktok-scraper', raw);
    }
  } catch (scrapErr) {
    console.warn(`[TIKTOK-SCRAPER] Scraper gagal (${scrapErr?.message || scrapErr}), beralih otomatis ke API TikTok lama...`);
  }

  // 2. PROVIDER BACKUP: API TikTok Lama (Naze & NeoXR)
  try {
    const backupRes = await apiTiktokBackup(url, options);
    return backupRes;
  } catch (backupErr) {
    throw backupErr;
  }
}

// Ekspor default
export default {
  apiTiktokScrapDownload,
  normalizeTikTokScraper
};
