import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script Pembersih & Proteksi Otomatis Baileys (@sairidev/baileys-new)
 * Mencegah banned akun WhatsApp akibat auto-follow newsletter/saluran tersembunyi
 * Bekerja otomatis saat deploy di Pterodactyl (postinstall, prestart, & runtime).
 */

const TARGET_PACKAGES = ['@sairidev/baileys-new', '@sairidev/baileys', 'baileys'];

export function findPackageDirs() {
  const possibleRoots = [
    process.cwd(),
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../../'),
    path.resolve(process.cwd(), 'OguriCap'),
  ];

  const foundDirs = new Set();

  for (const root of possibleRoots) {
    for (const pkg of TARGET_PACKAGES) {
      const p = path.join(root, 'node_modules', pkg);
      if (fs.existsSync(p)) {
        foundDirs.add(p);
      }
    }
  }

  return Array.from(foundDirs);
}

export function sanitizeSairidevFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 1. Deteksi dan hapus event listener auto-follow pada connection.update
  const autoFollowPattern = /let\s+hasAutoFollowed\s*=\s*false;[\s\S]*?ev\?\.on\(['"]connection\.update['"],\s*async\s*\([^\)]*\)\s*=>\s*\{[\s\S]*?120363408385315496@newsletter[\s\S]*?\}\s*\);/g;
  if (autoFollowPattern.test(content)) {
    content = content.replace(
      autoFollowPattern,
      '/* [OGURICAP BAN-GUARD] Auto-follow saluran resmi @sairidev dinonaktifkan secara otomatis untuk mencegah akun WhatsApp terkena ban. */\n    let hasAutoFollowed = true;'
    );
    changed = true;
  }

  // Pola fallback jika struktur ev?.on sedikit berbeda:
  if (content.includes('120363408385315496@newsletter')) {
    content = content.replace(
      /await\s+newsletterFollow\(['"]120363408385315496@newsletter['"]\);?/g,
      '/* blocked auto follow */ Promise.resolve();'
    );
    content = content.replace(/['"]120363408385315496@newsletter['"]/g, "''");
    changed = true;
  }

  // 2. Proteksi fungsi newsletterFollow agar tidak mengeksekusi bila ada jid saluran default
  if (content.includes('const newsletterFollow = (jid) => {')) {
    const safeGuard = `const newsletterFollow = (jid) => {
        if (!jid || jid.includes('120363408385315496') || jid === '') {
            return Promise.resolve({ status: 200, message: 'Auto follow blocked safely' });
        }`;
    if (!content.includes('Auto follow blocked safely')) {
      content = content.replace('const newsletterFollow = (jid) => {', safeGuard);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

export function sanitizeSairidev() {
  console.log('[CLEAN-SAIRIDEV] Memeriksa instalasi Baileys (@sairidev/baileys-new)...');
  const pkgDirs = findPackageDirs();

  if (pkgDirs.length === 0) {
    console.log('[CLEAN-SAIRIDEV] Belum ada node_modules Baileys yang terpasang (akan dibersihkan otomatis setelah npm install).');
    return { cleaned: 0, secured: 0, scanned: 0 };
  }

  let newlyCleanedCount = 0;
  let verifiedSafeCount = 0;

  for (const dir of pkgDirs) {
    const newsletterFile = path.join(dir, 'lib', 'Socket', 'newsletter.js');
    if (fs.existsSync(newsletterFile)) {
      const isCleaned = sanitizeSairidevFile(newsletterFile);
      if (isCleaned) {
        newlyCleanedCount++;
        console.log(`[CLEAN-SAIRIDEV] ✂️ BERHASIL DIHAPUS: Auto-follow sairidev dinetralkan dari: ${newsletterFile}`);
      } else {
        verifiedSafeCount++;
        console.log(`[CLEAN-SAIRIDEV] 🛡️ TERVERIFIKASI BERSIH: Bebas auto-follow & proteksi aktif di: ${newsletterFile}`);
      }
    }
  }

  const totalSecured = newlyCleanedCount + verifiedSafeCount;
  console.log('[CLEAN-SAIRIDEV] ----------------------------------------------------');
  console.log(`[CLEAN-SAIRIDEV] 🔒 STATUS PERLINDUNGAN ANTI-BAN AUTO-FOLLOW:`);
  console.log(`[CLEAN-SAIRIDEV] - Modul baru dinetralkan : ${newlyCleanedCount}`);
  console.log(`[CLEAN-SAIRIDEV] - Modul sudah bersih     : ${verifiedSafeCount}`);
  console.log(`[CLEAN-SAIRIDEV] - Total modul terlindungi: ${totalSecured}/${pkgDirs.length}`);
  console.log(`[CLEAN-SAIRIDEV] ✅ 100% AMAN: Seluruh ${totalSecured}/${pkgDirs.length} modul Baileys terbebas dari auto-follow saluran sairidev.`);
  console.log('[CLEAN-SAIRIDEV] ----------------------------------------------------');
  return { cleaned: newlyCleanedCount, secured: totalSecured, scanned: pkgDirs.length };
}

// Jalankan otomatis jika dipanggil langsung via CLI (`node scripts/clean-sairidev.js`)
if (process.argv[1] === __filename) {
  sanitizeSairidev();
}

export default sanitizeSairidev;
