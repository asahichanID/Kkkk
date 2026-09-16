import axios from 'axios';
import https from 'https';

const agent = new https.Agent({ keepAlive: true, timeout: 8000 });

// Strategy A: Pinterest BaseSearchResource with App Headers
async function testPinterestBaseSearch(query, limit = 10) {
  try {
    const t0 = Date.now();
    const dataObj = {
      options: {
        query: query,
        scope: 'pins',
        page_size: Math.max(limit, 15),
        no_fetch_context_on_resource: false
      },
      context: {}
    };

    const searchUrl = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
    const apiRes = await axios.get(searchUrl, {
      params: {
        source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
        data: JSON.stringify(dataObj),
        _: Date.now()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*, q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Pinterest-AppState': 'active',
        'X-Pinterest-PWS-Handler': 'www/search/pins',
        'Referer': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
      },
      httpsAgent: agent,
      timeout: 6000
    });

    const rawResults = apiRes.data?.resource_response?.data?.results || [];
    const parsed = [];
    const seen = new Set();

    for (const item of rawResults) {
      if (!item || typeof item !== 'object') continue;
      // Extract best image url
      const imgUrl = item.images?.orig?.url || item.images?.['736x']?.url || item.images?.['564x']?.url || item.images?.['474x']?.url;
      if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.startsWith('http')) continue;
      
      const cleanImgUrl = imgUrl.split('?')[0];
      if (seen.has(cleanImgUrl)) continue;
      seen.add(cleanImgUrl);

      const pinId = item.id ? String(item.id) : null;
      const source = pinId ? `https://id.pinterest.com/pin/${pinId}/` : `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
      const title = item.grid_title || item.title || item.description || query;
      const description = item.description || item.title || '-';

      parsed.push({
        url: cleanImgUrl,
        source: source,
        pin: source,
        id: pinId,
        title: title,
        description: description,
        author: item.pinner?.username || item.pinner?.full_name || 'Pinterest User',
        width: item.images?.orig?.width || item.images?.['736x']?.width || null,
        height: item.images?.orig?.height || item.images?.['736x']?.height || null,
        content: [{ url: cleanImgUrl }] // compatibility with NeoXR format
      });

      if (parsed.length >= limit) break;
    }

    console.log(`[BaseSearchResource] Found ${parsed.length} items for "${query}" in ${Date.now() - t0}ms`);
    return parsed;
  } catch (e) {
    console.log(`[BaseSearchResource] Error for "${query}":`, e.response?.status || e.message);
    return [];
  }
}

// Strategy B: SearchResource (Alternative Pinterest endpoint)
async function testPinterestSearchResource(query, limit = 10) {
  try {
    const t0 = Date.now();
    const dataObj = {
      options: {
        query: query,
        scope: 'pins',
        page_size: Math.max(limit, 15)
      },
      context: {}
    };

    const searchUrl = 'https://www.pinterest.com/resource/SearchResource/get/';
    const apiRes = await axios.get(searchUrl, {
      params: {
        source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
        data: JSON.stringify(dataObj),
        _: Date.now()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*, q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Pinterest-AppState': 'active',
        'X-Pinterest-PWS-Handler': 'www/search/pins',
        'Referer': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
      },
      httpsAgent: agent,
      timeout: 6000
    });

    const rawResults = apiRes.data?.resource_response?.data?.results || [];
    const parsed = [];
    const seen = new Set();

    for (const item of rawResults) {
      if (!item || typeof item !== 'object') continue;
      const imgUrl = item.images?.orig?.url || item.images?.['736x']?.url || item.images?.['564x']?.url || item.images?.['474x']?.url;
      if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.startsWith('http')) continue;
      
      const cleanImgUrl = imgUrl.split('?')[0];
      if (seen.has(cleanImgUrl)) continue;
      seen.add(cleanImgUrl);

      const pinId = item.id ? String(item.id) : null;
      const source = pinId ? `https://id.pinterest.com/pin/${pinId}/` : `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

      parsed.push({
        url: cleanImgUrl,
        source: source,
        pin: source,
        id: pinId,
        title: item.grid_title || item.title || item.description || query,
        description: item.description || item.title || '-',
        content: [{ url: cleanImgUrl }]
      });

      if (parsed.length >= limit) break;
    }

    console.log(`[SearchResource] Found ${parsed.length} items for "${query}" in ${Date.now() - t0}ms`);
    return parsed;
  } catch (e) {
    console.log(`[SearchResource] Error for "${query}":`, e.response?.status || e.message);
    return [];
  }
}

// Strategy C: ID Pinterest sub-domain Search
async function testIdPinterest(query, limit = 10) {
  try {
    const t0 = Date.now();
    const dataObj = {
      options: {
        query: query,
        scope: 'pins',
        page_size: Math.max(limit, 15)
      },
      context: {}
    };

    const searchUrl = 'https://id.pinterest.com/resource/BaseSearchResource/get/';
    const apiRes = await axios.get(searchUrl, {
      params: {
        source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
        data: JSON.stringify(dataObj),
        _: Date.now()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*, q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Pinterest-AppState': 'active',
        'X-Pinterest-PWS-Handler': 'www/search/pins',
        'Referer': `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
      },
      httpsAgent: agent,
      timeout: 6000
    });

    const rawResults = apiRes.data?.resource_response?.data?.results || [];
    const parsed = [];
    const seen = new Set();

    for (const item of rawResults) {
      if (!item || typeof item !== 'object') continue;
      const imgUrl = item.images?.orig?.url || item.images?.['736x']?.url || item.images?.['564x']?.url;
      if (!imgUrl) continue;
      const cleanImgUrl = imgUrl.split('?')[0];
      if (seen.has(cleanImgUrl)) continue;
      seen.add(cleanImgUrl);

      const pinId = item.id ? String(item.id) : null;
      parsed.push({
        url: cleanImgUrl,
        source: pinId ? `https://id.pinterest.com/pin/${pinId}/` : `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
        pin: pinId ? `https://id.pinterest.com/pin/${pinId}/` : '',
        id: pinId,
        title: item.grid_title || item.title || query,
        description: item.description || '-',
        content: [{ url: cleanImgUrl }]
      });
      if (parsed.length >= limit) break;
    }

    console.log(`[IdPinterest] Found ${parsed.length} items in ${Date.now() - t0}ms`);
    return parsed;
  } catch (e) {
    console.log(`[IdPinterest] Error:`, e.response?.status || e.message);
    return [];
  }
}

async function run() {
  const queries = ['hu tao', 'oguri cap anime', 'aesthetic cat wallpaper', 'cyberpunk city night'];
  for (const q of queries) {
    console.log(`\n================ Testing Query: "${q}" ================`);
    const r1 = await testPinterestBaseSearch(q, 10);
    if (r1.length > 0) {
      console.log('Sample result #1:', {
        url: r1[0].url,
        source: r1[0].source,
        title: r1[0].title,
        author: r1[0].author
      });
    }
    await testPinterestSearchResource(q, 10);
    await testIdPinterest(q, 10);
  }
}

run();
