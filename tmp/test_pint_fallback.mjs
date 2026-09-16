import { apiPinterestSearch as apiPinterestSearchBackup } from '../OguriCap/apiGlobal/services/search/pinterest.js';

async function testFallback() {
  console.log('Testing Legacy Backup Provider Directly ("naruto"):');
  const t0 = Date.now();
  try {
    const res = await apiPinterestSearchBackup('naruto');
    console.log(`Backup provider returned: provider=${res.provider}, count=${res.result.list.length}, elapsed=${Date.now() - t0}ms`);
  } catch (e) {
    console.log('Backup provider error / offline notice:', e.message);
  }
}

testFallback().catch(console.error);
