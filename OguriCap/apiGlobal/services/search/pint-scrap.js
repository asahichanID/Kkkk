/**
 * apiGlobal/services/search/pint-scrap.js
 * -----------------------------------------------------------------------
 * Layanan Pinterest Scraper Mandiri (Free, No API Key, Ultra Fast, HD Images).
 *
 * Mengambil hingga 10 gambar unik langsung dari sumber publik Pinterest
 * tanpa menggunakan third-party API / API berbayar.
 *
 * Fitur Utama:
 *   - 100% Tanpa API Key / Token berbayar.
 *   - Scrape langsung ke endpoint publik Pinterest dengan HTTP keep-alive & in-memory cache.
 *   - Multi-Strategy Scraper (BaseSearchResource, Sub-domain API, & Direct DOM State).
 *   - Otomatis filter & deduplikasi hingga 10 gambar HD unik.
 *   - Format return 100% kompatibel dan seragam dengan Naze / carousel WhatsApp OguriCap.
 *   - Otomatis Fallback ke provider Pinterest lama jika scraper mengalami kendala.
 */

import axios from 'axios';
import https from 'https';
import { logger } from '../../core/logger.js';
import { getTimeout } from '../../config/index.js';
import { envelope } from '../../core/normalizer.js';
import { ValidationError } from '../../core/errors.js';
import { apiPinterestSearch as apiPinterestSearchBackup } from './pinterest.js';

const SERVICE_GROUP = 'search';

// -----------------------------------------------------------------------
// HTTP Keep-Alive Agent untuk respons secepat kilat & hemat memori
// -----------------------------------------------------------------------
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 8000
});

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*, q=0.01',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Pinterest-AppState': 'active',
  'X-Pinterest-PWS-Handler': 'www/search/pins'
};

// -----------------------------------------------------------------------
// In-Memory Lightweight Cache (Instant 0ms on repeat)
// -----------------------------------------------------------------------
const cache = new Map();
const MAX_CACHE_ENTRIES = 200;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function saveToCache(key, data) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// -----------------------------------------------------------------------
// Helper: Normalisasi Item Pinterest
// -----------------------------------------------------------------------
function normalizePinItem(item, query = '') {
  if (!item || typeof item !== 'object') return null;

  // Cari URL gambar terbaik (orig -> 736x -> 564x -> 474x)
  const imgUrl =
    item.images?.orig?.url ||
    item.images?.['736x']?.url ||
    item.images?.['564x']?.url ||
    item.images?.['474x']?.url ||
    item.images?.url ||
    item.image ||
    item.url;

  if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.startsWith('http')) {
    return null;
  }

  // Bersihkan parameter query gambar
  const cleanImgUrl = imgUrl.split('?')[0].split('#')[0];
  const pinId = item.id ? String(item.id).replace(/\D/g, '') : null;
  const pinSource = pinId
    ? `https://id.pinterest.com/pin/${pinId}/`
    : `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;

  const title = (item.grid_title || item.title || item.description || query || 'Pinterest Image').trim();
  const description = (item.description || item.title || '-').trim();
  const author = item.pinner?.username || item.pinner?.full_name || item.author || 'Pinterest User';

  return {
    url: cleanImgUrl,
    source: pinSource,
    pin: pinSource,
    id: pinId,
    title: title,
    description: description,
    author: author,
    width: item.images?.orig?.width || item.images?.['736x']?.width || null,
    height: item.images?.orig?.height || item.images?.['736x']?.height || null,
    images: {
      url: cleanImgUrl
    },
    content: [
      {
        url: cleanImgUrl
      }
    ]
  };
}

// -----------------------------------------------------------------------
// MULTI-STRATEGY SCRAPER PINTEREST
// -----------------------------------------------------------------------

/**
 * Strategi 1: BaseSearchResource via www.pinterest.com (Utama)
 */
async function scrapeStrategyBaseSearch(query, limit = 10, timeoutMs = 5000) {
  const dataObj = {
    options: {
      query: query,
      scope: 'pins',
      page_size: Math.max(limit * 2, 20),
      no_fetch_context_on_resource: false
    },
    context: {}
  };

  const response = await axios.get('https://www.pinterest.com/resource/BaseSearchResource/get/', {
    params: {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify(dataObj),
      _: Date.now()
    },
    headers: {
      ...DEFAULT_HEADERS,
      'Referer': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
    },
    httpsAgent: keepAliveAgent,
    timeout: timeoutMs,
    validateStatus: (status) => status >= 200 && status < 400
  });

  const rawResults = response.data?.resource_response?.data?.results || [];
  const results = [];
  const seen = new Set();

  for (const item of rawResults) {
    const normalized = normalizePinItem(item, query);
    if (normalized && !seen.has(normalized.url)) {
      seen.add(normalized.url);
      results.push(normalized);
      if (results.length >= limit) break;
    }
  }

  return { results, raw: response.data };
}

/**
 * Strategi 2: BaseSearchResource via id.pinterest.com (Sub-domain Fallback)
 */
async function scrapeStrategyIdSubdomain(query, limit = 10, timeoutMs = 5000) {
  const dataObj = {
    options: {
      query: query,
      scope: 'pins',
      page_size: Math.max(limit * 2, 20),
      no_fetch_context_on_resource: false
    },
    context: {}
  };

  const response = await axios.get('https://id.pinterest.com/resource/BaseSearchResource/get/', {
    params: {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify(dataObj),
      _: Date.now()
    },
    headers: {
      ...DEFAULT_HEADERS,
      'Referer': `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
    },
    httpsAgent: keepAliveAgent,
    timeout: timeoutMs,
    validateStatus: (status) => status >= 200 && status < 400
  });

  const rawResults = response.data?.resource_response?.data?.results || [];
  const results = [];
  const seen = new Set();

  for (const item of rawResults) {
    const normalized = normalizePinItem(item, query);
    if (normalized && !seen.has(normalized.url)) {
      seen.add(normalized.url);
      results.push(normalized);
      if (results.length >= limit) break;
    }
  }

  return { results, raw: response.data };
}

/**
 * Strategi 3: Direct HTML Scraping & Hydration Data Parsing
 */
async function scrapeStrategyHtml(query, limit = 10, timeoutMs = 5000) {
  const response = await axios.get(`https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    httpsAgent: keepAliveAgent,
    timeout: timeoutMs
  });

  const html = typeof response.data === 'string' ? response.data : '';
  const results = [];
  const seen = new Set();

  // Pola 1: Script data __PWS_DATA__ jika ada
  const pwsMatch = html.match(/<script id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (pwsMatch) {
    try {
      const data = JSON.parse(pwsMatch[1]);
      const walk = (obj) => {
        if (!obj || typeof obj !== 'object' || results.length >= limit) return;
        if (obj.images && typeof obj.images === 'object') {
          const norm = normalizePinItem(obj, query);
          if (norm && !seen.has(norm.url)) {
            seen.add(norm.url);
            results.push(norm);
          }
        }
        if (Array.isArray(obj)) {
          for (const el of obj) walk(el);
        } else {
          for (const k of Object.keys(obj)) walk(obj[k]);
        }
      };
      walk(data);
    } catch {}
  }

  // Pola 2: Regex fallback ekstraksi gambar langsung dari HTML
  if (results.length < limit) {
    const pinimgMatches = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x|564x|474x|236x)\/[a-f0-9/]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    const pinMatches = html.match(/\/pin\/(\d{15,19})/g) || [];

    for (let i = 0; i < pinimgMatches.length; i++) {
      let rawImg = pinimgMatches[i];
      const upgraded = rawImg.replace(/\/(236x|474x|564x)\//i, '/736x/');
      const cleanImg = upgraded.split('?')[0].split('#')[0];
      if (!seen.has(cleanImg)) {
        seen.add(cleanImg);
        const pinId = pinMatches[i] ? pinMatches[i].replace('/pin/', '') : null;
        const pinSource = pinId
          ? `https://id.pinterest.com/pin/${pinId}/`
          : `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;

        results.push({
          url: cleanImg,
          source: pinSource,
          pin: pinSource,
          id: pinId,
          title: query,
          description: query,
          author: 'Pinterest User',
          images: { url: cleanImg },
          content: [{ url: cleanImg }]
        });
        if (results.length >= limit) break;
      }
    }
  }

  if (results.length === 0) {
    throw new Error('HTML scraper tidak menemukan gambar');
  }

  return { results, raw: html.substring(0, 1000) };
}

/**
 * Scraper Mandiri Pinterest Utama (Mengeksekusi Strategi 1 -> 2 -> 3)
 * @param {string} query - Kata kunci pencarian
 * @param {number} [limit=10] - Maksimal jumlah gambar unik (default 10)
 */
export async function scrapePinterest(query, limit = 10) {
  const timeoutMs = 5000;

  // Strategi 1: BaseSearchResource
  try {
    const res = await scrapeStrategyBaseSearch(query, limit, timeoutMs);
    if (Array.isArray(res?.results) && res.results.length > 0) {
      return res;
    }
  } catch (err) {
    logger.fallback('search.pinterest', 'pint-scrap-strategy-1', 'pint-scrap-strategy-2', err?.message || String(err));
  }

  // Strategi 2: id.pinterest.com Subdomain
  try {
    const res = await scrapeStrategyIdSubdomain(query, limit, timeoutMs);
    if (Array.isArray(res?.results) && res.results.length > 0) {
      return res;
    }
  } catch (err) {
    logger.fallback('search.pinterest', 'pint-scrap-strategy-2', 'pint-scrap-strategy-3', err?.message || String(err));
  }

  // Strategi 3: Direct DOM Scraping
  try {
    const res = await scrapeStrategyHtml(query, limit, timeoutMs);
    if (Array.isArray(res?.results) && res.results.length > 0) {
      return res;
    }
  } catch (err) {
    logger.fallback('search.pinterest', 'pint-scrap-strategy-3', 'pinterest.legacy-backup', err?.message || String(err));
  }

  throw new Error(`Scraper Pinterest tidak menemukan hasil untuk "${query}"`);
}

// -----------------------------------------------------------------------
// Layanan Utama Pinterest Search dengan Auto-Fallback
// -----------------------------------------------------------------------

/**
 * Cari gambar Pinterest secepat kilat (Scraper Utama -> Auto-Fallback ke Provider Lama).
 *
 * Format kembalian:
 *   {
 *     result: {
 *       list: [
 *         {
 *           url: string,
 *           source: string,
 *           pin: string,
 *           id: string,
 *           title: string,
 *           description: string,
 *           author: string,
 *           images: { url: string },
 *           content: [{ url: string }]
 *         }
 *       ],
 *       raw: string
 *     },
 *     provider: string,
 *     raw: any
 *   }
 *
 * @param {string} query - Kata kunci pencarian
 * @param {object} [options]
 * @param {number} [options.limit=10]
 * @returns {Promise<{result: {list: Array<object>, raw: string}, provider: string, raw: any}>}
 */
export async function apiPinterestSearch(query, options = {}) {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('apiPinterestSearch: parameter "query" wajib diisi.');
  }

  const startAt = Date.now();
  const trimmed = query.trim();
  const limit = Math.min(Math.max(Number(options.limit) || 10, 1), 10);
  const cacheKey = `pint:${limit}:${trimmed.toLowerCase()}`;

  // 1. Cek In-Memory Cache (0ms)
  const cached = getFromCache(cacheKey);
  if (cached) {
    logger.cacheHit('search.pinterest', `"${trimmed}" (${cached.length} images)`);
    return envelope({ list: cached, raw: JSON.stringify(cached) }, 'pinterest-scraper-cache', cached);
  }

  logger.action('search.pinterest', `Mencari gambar Pinterest: "${trimmed}"`);

  // 2. SCRAPER UTAMA: Direct Scraper Tanpa API Key
  try {
    const { results, raw } = await scrapePinterest(trimmed, limit);
    if (Array.isArray(results) && results.length > 0) {
      saveToCache(cacheKey, results);
      const elapsed = Date.now() - startAt;
      logger.success('search.pinterest', 'pinterest-scraper', `${results.length} gambar unik ditemukan untuk "${trimmed}"`, elapsed);
      return envelope({ list: results, raw: JSON.stringify(raw) }, 'pinterest-scraper', raw);
    }
  } catch (scrapErr) {
    logger.fallback('search.pinterest', 'pinterest-scraper', 'pinterest.legacy-backup', scrapErr?.message || String(scrapErr));
  }

  // 3. FALLBACK OTOMATIS: Provider Pinterest Lama (NeoXR, Naze, Maelyn, FGMods, Nexoracle)
  return apiPinterestSearchBackup(trimmed);
}

// Alias untuk kompatibilitas eksplisit
export const apiPinterestScrapSearch = apiPinterestSearch;

export default {
  apiPinterestSearch,
  apiPinterestScrapSearch,
  scrapePinterest
};
