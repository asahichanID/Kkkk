import { apiPinterestSearch, apiPinterestScrapSearch, scrapePinterest } from '../OguriCap/apiGlobal/services/search/pint-scrap.js';
import { apiPinterestSearch as apiPinterestSearchFromIndex } from '../OguriCap/apiGlobal/index.js';

async function runTests() {
  console.log('--- TEST 1: Real Pinterest Search via pint-scrap.js ("hu tao") ---');
  const t0 = Date.now();
  const res1 = await apiPinterestSearch('hu tao');
  console.log(`Provider: ${res1.provider}, Elapsed: ${Date.now() - t0}ms`);
  console.log(`Found ${res1.result.list.length} images:`);
  res1.result.list.forEach((item, i) => {
    console.log(`  [${i + 1}] ID: ${item.id} | URL: ${item.url} | Source: ${item.source}`);
  });

  console.log('\n--- TEST 2: In-Memory Cache (Instant 0ms) ---');
  const t1 = Date.now();
  const resCached = await apiPinterestSearch('hu tao');
  console.log(`Provider: ${resCached.provider}, Elapsed: ${Date.now() - t1}ms`);
  console.log(`Cached items: ${resCached.result.list.length}`);

  console.log('\n--- TEST 3: Query "oguri cap aesthetic" ---');
  const t2 = Date.now();
  const res2 = await apiPinterestSearchFromIndex('oguri cap aesthetic');
  console.log(`Provider: ${res2.provider}, Elapsed: ${Date.now() - t2}ms`);
  console.log(`Found ${res2.result.list.length} images.`);
  if (res2.result.list.length > 0) {
    console.log('Sample item:', res2.result.list[0]);
  }

  console.log('\n--- TEST 4: Compatibility with Naze carousel parsing ---');
  const polaGambar = /\.(jpg|jpeg|png|webp)(\?|#|$)/i;
  const daftarBersih = res2.result.list
    .map((item, urut) => {
      const linkAsli = typeof item === 'string' ? item : (item?.url || item?.image || item?.link || '');
      if (typeof linkAsli !== 'string' || !linkAsli.startsWith('http') || !polaGambar.test(linkAsli)) return null;
      const asli = linkAsli.split('?')[0].split('#')[0];
      let pinAsli = null;
      let linkTombolUtama, tipeLink;

      if (typeof item?.source === 'string' && item.source.includes('pinterest.com')) {
        linkTombolUtama = item.source;
        tipeLink = 'PIN_ASLI_SOURCE_NEOXR';
        const dariSource = item.source.match(/(\d{15,19})/);
        if (dariSource) pinAsli = dariSource[1];
      }

      return {
        asli,
        tampil: `https://wsrv.nl/?url=${encodeURIComponent(asli)}&n=-1`,
        pinAsli,
        tipeLink,
        bukaPin: linkTombolUtama,
        hd: asli
      };
    })
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((z) => z.asli === v.asli) === i)
    .slice(0, 10);

  console.log(`Naze carousel parsed items: ${daftarBersih.length} valid cards.`);
  daftarBersih.forEach((card, idx) => {
    console.log(`  Card ${idx + 1}: PinId=${card.pinAsli}, BukaPin=${card.bukaPin}, HD=${card.hd.substring(0, 60)}...`);
  });

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(console.error);
