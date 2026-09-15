import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { toPTT } from './converter.js';
import { isLocked } from '../group/kunci.js';
import {
  generateWAMessageContent as generateWAMessageContentSairi,
  generateWAMessageFromContent as generateWAMessageFromContentSairi,
} from '@sairidev/baileys-new/lib/Utils/messages.js';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const adhan = require('adhan');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../database/sholat_config.json');

export const ADZAN_REGULAR_PATH = path.join(__dirname, '../src/media/adzan.mp3');
export const ADZAN_SUBUH_PATH = path.join(__dirname, '../src/media/adzan_subuh.mp3');

// Daftar Wilayah di Indonesia dengan koordinat lintang/bujur & timezone resmi
export const INDONESIA_REGIONS = [
  { id: 'jakarta', name: 'DKI Jakarta & Sekitarnya', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -6.2088, lon: 106.8456 },
  { id: 'bandung', name: 'Bandung & Jawa Barat', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -6.9175, lon: 107.6191 },
  { id: 'semarang', name: 'Semarang & Jawa Tengah', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -6.9667, lon: 110.4167 },
  { id: 'yogyakarta', name: 'DI Yogyakarta', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -7.7956, lon: 110.3695 },
  { id: 'surabaya', name: 'Surabaya & Jawa Timur', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -7.2575, lon: 112.7521 },
  { id: 'medan', name: 'Medan & Sumatera Utara', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: 3.5952, lon: 98.6722 },
  { id: 'palembang', name: 'Palembang & Sumsel', timezone: 'Asia/Jakarta', tzLabel: 'WIB', lat: -2.9761, lon: 104.7754 },
  { id: 'makassar', name: 'Makassar & Sulsel', timezone: 'Asia/Makassar', tzLabel: 'WITA', lat: -5.1477, lon: 119.4327 },
  { id: 'denpasar', name: 'Denpasar & Bali', timezone: 'Asia/Makassar', tzLabel: 'WITA', lat: -8.6705, lon: 115.2126 },
  { id: 'balikpapan', name: 'Balikpapan & Kaltim', timezone: 'Asia/Makassar', tzLabel: 'WITA', lat: -1.2379, lon: 116.8529 },
  { id: 'banjarmasin', name: 'Banjarmasin & Kalsel', timezone: 'Asia/Makassar', tzLabel: 'WITA', lat: -3.3194, lon: 114.5908 },
  { id: 'jayapura', name: 'Jayapura & Papua', timezone: 'Asia/Jayapura', tzLabel: 'WIT', lat: -2.5337, lon: 140.7181 },
  { id: 'ambon', name: 'Ambon & Maluku', timezone: 'Asia/Jayapura', tzLabel: 'WIT', lat: -3.6954, lon: 128.1814 },
];

/**
 * Ayat-ayat Al-Qur'an berisi ajakan mendirikan sholat fardhu
 */
export const PRAYER_AYAT = {
  Subuh: {
    arabic: 'أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًۭا',
    translation: '“Dan (dirikanlah pula sholat) Subuh. Sesungguhnya sholat Subuh itu disaksikan (oleh para malaikat).”',
    surah: "QS. Al-Isra' [17]: 78",
  },
  Dzuhur: {
    arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ',
    translation: '“Apabila telah diseru untuk melaksanakan sholat, maka segeralah mengingat Allah dan tinggalkanlah jual beli.”',
    surah: "QS. Al-Jumu'ah [62]: 9",
  },
  Ashar: {
    arabic: 'حَـٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُوا۟ لِلَّهِ قَـٰنِتِينَ',
    translation: '“Peliharalah semua sholat(mu), dan (peliharalah) sholat wustha (Ashar). Berdirilah untuk Allah dengan khusyuk.”',
    surah: 'QS. Al-Baqarah [2]: 238',
  },
  Maghrib: {
    arabic: 'وَأَقِمِ ٱلصَّلَوٰةَ طَرَفَىِ ٱلنَّهَارِ وَزُلَفًۭا مِّنَ ٱلَّيْلِ ۚ إِنَّ ٱلْحَسَنَٰتِ يُذْهِبْنَ ٱلسَّيِّـَٔاتِ',
    translation: '“Dan dirikanlah sholat itu pada kedua tepi siang dan pada bagian-bagian permulaan malam.”',
    surah: 'QS. Hud [11]: 114',
  },
  Isya: {
    arabic: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَٰبًۭا مَّوْقُوتًۭا',
    translation: '“Sungguh, sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.”',
    surah: "QS. An-Nisa' [4]: 103",
  },
  Imsak: {
    arabic: 'وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ',
    translation: '“Dan dirikanlah sholat, tunaikanlah zakat, dan ruku\'lah beserta orang-orang yang ruku\'.”',
    surah: 'QS. Al-Baqarah [2]: 43',
  },
  Terbit: {
    arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ ٱلشَّمْسِ وَقَبْلَ غُرُوبِهَا',
    translation: '“Maka bertasbihlah dengan memuji Tuhanmu sebelum terbit matahari dan sebelum terbenamnya.”',
    surah: 'QS. Thaha [20]: 130',
  },
};

// Cache jadwal realtime per tanggal dan wilayah
const prayerTimeCache = new Map();

/**
 * Menghitung waktu sholat REALTIME asli saat ini (sampai kapan pun)
 * Menggunakan integrasi Aladhan API (Metode 20 - Kemenag RI) dan
 * algoritma astronomi adhan (Singapore / SE Asia Shafi'i) sebagai fallback offline.
 */
export async function getRealtimePrayerSchedule(regionId = 'jakarta', targetDate = new Date()) {
  const reg = INDONESIA_REGIONS.find((r) => r.id === regionId) || INDONESIA_REGIONS[0];
  const tz = reg.timezone || 'Asia/Jakarta';
  const dateKey = moment(targetDate).tz(tz).format('YYYY-MM-DD');
  const cacheKey = `${reg.id}_${dateKey}`;

  if (prayerTimeCache.has(cacheKey)) {
    return prayerTimeCache.get(cacheKey);
  }

  // 1. Coba ambil dari Aladhan Live API (Waktu Realtime Astronomis Resmi)
  try {
    const timestamp = Math.floor(targetDate.getTime() / 1000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${reg.lat}&longitude=${reg.lon}&method=20`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const t = data?.data?.timings;
      if (t && t.Fajr && t.Dhuhr && t.Maghrib) {
        const schedule = {
          Imsak: t.Imsak ? t.Imsak.slice(0, 5) : formatTimeOffset(t.Fajr, -10),
          Subuh: t.Fajr.slice(0, 5),
          Terbit: t.Sunrise.slice(0, 5),
          Dzuhur: t.Dhuhr.slice(0, 5),
          Ashar: t.Asr.slice(0, 5),
          Maghrib: t.Maghrib.slice(0, 5),
          Isya: t.Isha.slice(0, 5),
        };
        prayerTimeCache.set(cacheKey, schedule);
        return schedule;
      }
    }
  } catch (err) {
    // API timeout atau offline, beralih ke engine astronomi
  }

  // 2. Engine Astronomi Lokal (Adhan Library) — 100% Akurat kapan pun tanpa internet
  try {
    const coordinates = new adhan.Coordinates(reg.lat, reg.lon);
    const params = adhan.CalculationMethod.Singapore(); // Standard Kemenag: Fajr 20°, Isha 18°
    params.madhab = adhan.Madhab.Shafi;

    const pt = new adhan.PrayerTimes(coordinates, targetDate, params);
    const formatMoment = (d) => moment(d).tz(tz).format('HH:mm');

    const subuhStr = formatMoment(pt.fajr);
    const schedule = {
      Imsak: formatTimeOffset(subuhStr, -10),
      Subuh: subuhStr,
      Terbit: formatMoment(pt.sunrise),
      Dzuhur: formatMoment(pt.dhuhr),
      Ashar: formatMoment(pt.asr),
      Maghrib: formatMoment(pt.maghrib),
      Isya: formatMoment(pt.isha),
    };

    prayerTimeCache.set(cacheKey, schedule);
    return schedule;
  } catch (err) {
    console.error('[SHOLAT] Error calculating adhan:', err.message);
  }

  // Fallback aman jika semua gagal
  return {
    Imsak: '04:32',
    Subuh: '04:42',
    Terbit: '05:54',
    Dzuhur: '12:06',
    Ashar: '15:14',
    Maghrib: '18:10',
    Isya: '19:19',
  };
}

function formatTimeOffset(timeStr, offsetMinutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + offsetMinutes;
  const safeTotal = (total + 1440) % 1440;
  const nh = Math.floor(safeTotal / 60);
  const nm = safeTotal % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function getSholatConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return {
        region: data.region || 'DKI Jakarta & Sekitarnya',
        regionId: data.regionId || 'jakarta',
        timezone: data.timezone || 'Asia/Jakarta',
        tzLabel: data.tzLabel || 'WIB',
        schedule: data.schedule || null,
        enabledGroups: data.enabledGroups || {},
        updatedAt: data.updatedAt || Date.now(),
      };
    }
  } catch (e) {
    console.error('[SHOLAT] Error reading config:', e.message);
  }

  return {
    region: 'DKI Jakarta & Sekitarnya',
    regionId: 'jakarta',
    timezone: 'Asia/Jakarta',
    tzLabel: 'WIB',
    schedule: null,
    enabledGroups: {},
    updatedAt: Date.now(),
  };
}

export function saveSholatConfig(newConfig) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('[SHOLAT] Error saving config:', e.message);
    return false;
  }
}

export async function updateSholatGroupState(groupId, isEnabled) {
  const cfg = getSholatConfig();
  if (!cfg.enabledGroups) cfg.enabledGroups = {};
  cfg.enabledGroups[groupId] = isEnabled;
  cfg.updatedAt = Date.now();
  saveSholatConfig(cfg);
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Menghasilkan poster gambar Canvas bertema Visual Ramadan Islami
 * (Hilal, lentera fanous, kaligrafi, ornamen bintang emas) yang berlaku sepanjang tahun / realtime.
 * Resolusi 1200 x 675 (Rasio 16:9 pas di tampilan WhatsApp)
 */
export async function generateRamadanPrayerCanvas({
  prayerName = 'MAGHRIB',
  prayerTime = '18:10',
  region = 'DKI Jakarta & Sekitarnya',
  tzLabel = 'WIB',
  schedule = {},
  isStatusInfo = false,
}) {
  const pName = escapeXml(prayerName.toUpperCase());
  const normalizedKey =
    prayerName.charAt(0).toUpperCase() + prayerName.slice(1).toLowerCase();
  const ayatData = PRAYER_AYAT[normalizedKey] || PRAYER_AYAT.Maghrib;

  const safeSurah = escapeXml(ayatData.surah);
  const safeTranslation = escapeXml(ayatData.translation);
  const safeRegion = escapeXml(region);
  const safeTz = escapeXml(tzLabel);
  const safeTime = escapeXml(prayerTime);

  const currentDateStr = escapeXml(
    moment().tz('Asia/Jakarta').locale('id').format('dddd, DD MMMM YYYY')
  );

  // Buat badge daftar waktu sholat bawah
  const scheduleItems = Object.entries(schedule).map(([k, v]) => {
    const isCurrent = k.toLowerCase() === prayerName.toLowerCase();
    return { name: escapeXml(k), time: escapeXml(v), isCurrent };
  });

  const itemWidth = 145;
  const startX = 600 - (scheduleItems.length * itemWidth) / 2;

  const scheduleCardsSvg = scheduleItems
    .map((item, idx) => {
      const x = startX + idx * itemWidth;
      const bgColor = item.isCurrent ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)';
      const textColor = item.isCurrent ? '#0F172A' : '#E2E8F0';
      const labelColor = item.isCurrent ? '#78350F' : '#94A3B8';
      const borderColor = item.isCurrent ? '#FCD34D' : 'rgba(255, 255, 255, 0.15)';

      return `
      <g transform="translate(${x}, 535)">
        <rect width="130" height="75" rx="14" fill="${bgColor}" stroke="${borderColor}" stroke-width="1.5" />
        <text x="65" y="28" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="${labelColor}" text-anchor="middle" letter-spacing="1">${item.name.toUpperCase()}</text>
        <text x="65" y="56" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="${textColor}" text-anchor="middle">${item.time}</text>
      </g>
    `;
    })
    .join('');

  const svg = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient: Deep Night Navy to Regal Indigo -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070B19" />
        <stop offset="50%" stop-color="#0D1B3E" />
        <stop offset="100%" stop-color="#14213D" />
      </linearGradient>

      <!-- Golden Glow Gradients -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="50%" stop-color="#FDE68A" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>

      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(30, 41, 59, 0.85)" />
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0.95)" />
      </linearGradient>

      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5" />
      </filter>
    </defs>

    <!-- Base Canvas Background -->
    <rect width="1200" height="675" fill="url(#bgGrad)" />

    <!-- Ornate Outer Border -->
    <rect x="25" y="25" width="1150" height="625" rx="24" fill="none" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1.5" />
    <rect x="33" y="33" width="1134" height="609" rx="18" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

    <!-- Corner Islamic Star Ornaments -->
    <g fill="#F59E0B" opacity="0.7">
      <circle cx="45" cy="45" r="4" />
      <circle cx="1155" cy="45" r="4" />
      <circle cx="45" cy="630" r="4" />
      <circle cx="1155" cy="630" r="4" />
    </g>

    <!-- Top Left Crescent Moon & Star (Hilal Emas) -->
    <g transform="translate(90, 60)" filter="url(#goldGlow)">
      <!-- Crescent -->
      <path d="M 45 0 A 45 45 0 1 0 45 90 A 36 36 0 1 1 45 0 Z" fill="url(#goldGrad)" opacity="0.95" />
      <!-- Star -->
      <polygon points="56,38 60,48 70,50 62,56 65,66 56,60 47,66 50,56 42,50 52,48" fill="#FDE68A" />
    </g>

    <!-- Top Right Hanging Lantern (Fanous Lentera Tradisional) -->
    <g transform="translate(1040, 35)">
      <line x1="40" y1="0" x2="40" y2="40" stroke="#F59E0B" stroke-width="2" stroke-dasharray="3,2" />
      <path d="M 30 40 L 50 40 L 55 55 L 25 55 Z" fill="#D97706" />
      <path d="M 25 55 L 55 55 L 60 95 L 20 95 Z" fill="#F59E0B" fill-opacity="0.85" filter="url(#goldGlow)" />
      <!-- Lantern Windows -->
      <rect x="28" y="62" width="10" height="25" rx="3" fill="#FFFBEB" opacity="0.9" />
      <rect x="42" y="62" width="10" height="25" rx="3" fill="#FFFBEB" opacity="0.9" />
      <path d="M 20 95 L 60 95 L 45 110 L 35 110 Z" fill="#B45309" />
      <circle cx="40" cy="115" r="3" fill="#FDE68A" />
    </g>

    <!-- Header / Title -->
    <g text-anchor="middle">
      <text x="600" y="75" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F59E0B" letter-spacing="4">
        ✦ PANGGILAN SHOLAT FARDHU REALTIME ✦
      </text>
      <text x="600" y="112" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="2">
        ${isStatusInfo ? 'JADWAL WAKTU SHOLAT' : 'WAKTU SHOLAT TELAH TIBA'}
      </text>
      <text x="600" y="138" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" fill="#94A3B8">
        ${currentDateStr} • ${safeRegion} (${safeTz})
      </text>
    </g>

    <!-- Center Hero Card for Prayer Name & Time -->
    <g transform="translate(250, 165)" filter="url(#softShadow)">
      <rect width="700" height="220" rx="24" fill="url(#cardGrad)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="2" />

      <!-- Ornate Header Ribbon inside card -->
      <rect x="220" y="18" width="260" height="32" rx="16" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)" />
      <text x="350" y="39" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#FDE68A" text-anchor="middle" letter-spacing="3">
        SERUAN ADZAN &amp; SHOLAT
      </text>

      <!-- Prayer Name (Big Display) -->
      <text x="350" y="115" font-family="'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4" filter="url(#goldGlow)">
        ${pName}
      </text>

      <!-- Time & Region Text -->
      <text x="350" y="165" font-family="'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
        ${safeTime} <tspan font-size="22" font-weight="600" fill="#F59E0B">${safeTz}</tspan>
      </text>

      <text x="350" y="195" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94A3B8" text-anchor="middle">
        Waktu Asli Wilayah ${safeRegion} dan Sekitarnya
      </text>
    </g>

    <!-- Verse & Invitation Section -->
    <g text-anchor="middle">
      <text x="600" y="425" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#FDE68A">
        ${safeTranslation}
      </text>
      <text x="600" y="455" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-style="italic" fill="#94A3B8">
        ${safeSurah}
      </text>
    </g>

    <!-- Divider -->
    <line x1="300" y1="485" x2="900" y2="485" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <circle cx="600" cy="485" r="4" fill="#F59E0B" />

    <!-- Label above cards -->
    <text x="600" y="515" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#CBD5E1" text-anchor="middle" letter-spacing="2">
      JADWAL REALTIME HARI INI
    </text>

    <!-- All Prayer Times Ribbon Cards -->
    ${scheduleCardsSvg}
  </svg>
  `;

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toBuffer();
}

/**
 * Format teks WhatsApp seruan sholat yang elegan, khusyuk,
 * tertata rapi, dan tidak norak (bebas emoji berlebihan).
 */
export function buildPrayerMessageCaption({
  prayerName,
  prayerTime,
  region,
  tzLabel,
  schedule,
}) {
  const pName = prayerName.toUpperCase();
  const normalizedKey =
    prayerName.charAt(0).toUpperCase() + prayerName.slice(1).toLowerCase();
  const ayat = PRAYER_AYAT[normalizedKey] || PRAYER_AYAT.Maghrib;
  const dayDate = moment().tz('Asia/Jakarta').locale('id').format('dddd, D MMMM YYYY');

  let text = `*PANGGILAN SHOLAT ${pName}*\n`;
  text += `──────────────\n`;
  text += `• Waktu   : *${prayerTime} ${tzLabel}*\n`;
  text += `• Wilayah : ${region}\n`;
  text += `• Hari    : ${dayDate}\n\n`;

  text += `${ayat.arabic}\n\n`;
  text += `_${ayat.translation}_\n`;
  text += `*— ${ayat.surah}*\n\n`;

  text += `──────────────\n`;
  text += `_"Hayya 'alas-shalah, hayya 'alal-falah."_\n`;
  text += `Mari sejenak menghentikan aktivitas, sucikan diri dengan berwudhu, dan tunaikan sholat fardhu berjamaah tepat waktu.`;

  return text;
}

/**
 * Mengirim audio adzan sebagai Voice Note (VN) interaktif menggunakan @sairidev/baileys-new
 * dengan konversi PTT Opus agar dapat diputar langsung di WhatsApp tanpa error.
 */
export async function sendPrayerAudioVN(naze, groupId, prayerName, options = {}) {
  const isSubuh = prayerName.toLowerCase() === 'subuh';
  const audioPath = isSubuh ? ADZAN_SUBUH_PATH : ADZAN_REGULAR_PATH;

  if (!fs.existsSync(audioPath)) {
    console.warn(`[SHOLAT] File audio adzan tidak ditemukan di ${audioPath}`);
    return false;
  }

  try {
    const rawBuffer = fs.readFileSync(audioPath);
    let finalBuffer = rawBuffer;
    let mimetype = 'audio/ogg; codecs=opus';

    // Konversi MP3 ke Opus PTT agar didukung sebagai Voice Note (VN) resmi WhatsApp
    try {
      finalBuffer = await toPTT(rawBuffer, 'mp3');
    } catch (pttErr) {
      console.warn('[SHOLAT] toPTT conversion failed, fallback ke audio mp4:', pttErr.message);
      mimetype = 'audio/mp4';
      finalBuffer = rawBuffer;
    }

    // Bangun WAMessage content menggunakan @sairidev/baileys-new
    const mediaContent = await generateWAMessageContentSairi(
      {
        audio: finalBuffer,
        mimetype,
        ptt: true,
      },
      {
        upload: naze.waUploadToServer,
      }
    );

    const fullMsg = generateWAMessageFromContentSairi(
      groupId,
      mediaContent,
      {
        userJid: naze.user?.id,
        quoted: options.quoted,
      }
    );

    // Relay pesan ke WhatsApp
    if (typeof naze.relayMessage === 'function') {
      await naze.relayMessage(groupId, fullMsg.message, {
        messageId: fullMsg.key.id,
      });
    } else {
      await naze.sendMessage(groupId, {
        audio: finalBuffer,
        mimetype,
        ptt: true,
      }, options.quoted ? { quoted: options.quoted } : {});
    }

    return true;
  } catch (err) {
    console.error(`[SHOLAT] Gagal kirim adzan via @sairidev/baileys-new:`, err.message);
    // Fallback cadangan
    try {
      const fallbackBuffer = fs.readFileSync(audioPath);
      await naze.sendMessage(groupId, {
        audio: fallbackBuffer,
        mimetype: 'audio/mp4',
        ptt: true,
      }, options.quoted ? { quoted: options.quoted } : {});
      return true;
    } catch (fbErr) {
      console.error('[SHOLAT] Fallback audio adzan juga gagal:', fbErr.message);
      return false;
    }
  }
}

/**
 * Mengirim notifikasi lengkap: Poster Canvas + Teks Ayat Ajakan + Audio Adzan Voice Note (VN)
 */
export async function sendPrayerNotification(naze, groupId, prayerName, prayerTime, config, options = {}) {
  try {
    if (isLocked(groupId) && !options.isTest) {
      return false;
    }
    const tz = config?.timezone || 'Asia/Jakarta';
    const schedule = config?.schedule || (await getRealtimePrayerSchedule(config?.regionId || 'jakarta'));
    const finalPrayerTime = prayerTime || schedule[prayerName] || '18:10';

    // 1. Poster Canvas
    const canvasBuffer = await generateRamadanPrayerCanvas({
      prayerName,
      prayerTime: finalPrayerTime,
      region: config?.region || 'DKI Jakarta & Sekitarnya',
      tzLabel: config?.tzLabel || 'WIB',
      schedule: schedule,
    });

    // 2. Teks dengan Ayat Ajakan
    let caption = buildPrayerMessageCaption({
      prayerName,
      prayerTime: finalPrayerTime,
      region: config?.region || 'DKI Jakarta & Sekitarnya',
      tzLabel: config?.tzLabel || 'WIB',
      schedule: schedule,
    });

    if (options.isTest) {
      const pfx = options.prefix || '.';
      caption += `\n\n*STATUS PENGUJIAN:*\n_Simulasi poster visual dan audio adzan berhasil dikirimkan._\n\n• Kelola grup aktif : *${pfx}aktifkansholat*\n• Tes waktu Subuh   : *${pfx}tessholat subuh*`;
    }

    const sendOptions = options.quoted ? { quoted: options.quoted } : {};

    // Kirim poster gambar dan caption
    await naze.sendMessage(groupId, {
      image: canvasBuffer,
      caption,
    }, sendOptions);

    // 3. Kirim Audio Adzan sebagai Voice Note (VN) via @sairidev/baileys-new
    await sendPrayerAudioVN(naze, groupId, prayerName, sendOptions);

    return true;
  } catch (err) {
    console.error(`[SHOLAT] Gagal kirim notifikasi ke ${groupId}:`, err.message);
    return false;
  }
}

// In-memory tracker agar tidak kirim dobel dalam menit yang sama
let lastSentPrayer = {};

/**
 * Scheduler waktu sholat realtime (sampai kapan pun)
 */
export function startSholatScheduler(naze, globalDb) {
  if (global.sholatIntervalInstance) {
    clearInterval(global.sholatIntervalInstance);
  }

  console.log('[SHOLAT] Scheduler otomatis waktu sholat realtime telah dimulai.');

  global.sholatIntervalInstance = setInterval(async () => {
    try {
      if (!naze || !naze.user) return; // Bot belum terhubung

      const config = getSholatConfig();
      const tz = config.timezone || 'Asia/Jakarta';
      const now = moment().tz(tz);
      const currentTime = now.format('HH:mm');
      const todayDate = now.format('YYYY-MM-DD');

      // Selalu dapatkan jadwal realtime untuk tanggal hari ini
      const schedule = await getRealtimePrayerSchedule(config.regionId || 'jakarta', now.toDate());

      // Prune old tracker keys from previous days
      for (const k of Object.keys(lastSentPrayer)) {
        if (!k.includes(todayDate)) delete lastSentPrayer[k];
      }

      // Perbarui schedule di config jika belum disinkronkan hari ini
      if (!config.schedule || config.lastSyncedDate !== todayDate) {
        config.schedule = schedule;
        config.lastSyncedDate = todayDate;
        saveSholatConfig(config);
      }

      // Cari apakah waktu saat ini cocok dengan salah satu waktu sholat fardhu / imsak
      for (const [prayerName, targetTime] of Object.entries(schedule)) {
        if (['Imsak', 'Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].includes(prayerName)) {
          if (currentTime === targetTime) {
            const trackerKey = `${prayerName}_${todayDate}_${currentTime}`;
            if (lastSentPrayer[trackerKey]) continue; // Sudah dikirim

            lastSentPrayer[trackerKey] = true;
            console.log(
              `[SHOLAT] Waktu sholat ${prayerName} (${currentTime} ${config.tzLabel}) tercapai! Mengirim notifikasi + audio adzan...`
            );

            // Cari grup yang mengaktifkan fitur ini
            const targetGroupIds = new Set();

            if (config.enabledGroups) {
              for (const [gid, enabled] of Object.entries(config.enabledGroups)) {
                if (enabled) targetGroupIds.add(gid);
              }
            }

            if (globalDb?.groups) {
              for (const [gid, gdata] of Object.entries(globalDb.groups)) {
                if (gdata && gdata.waktusholat) {
                  targetGroupIds.add(gid);
                }
              }
            }

            if (targetGroupIds.size === 0) {
              console.log('[SHOLAT] Tidak ada grup yang mengaktifkan fitur sholat saat ini.');
              continue;
            }

            // Kirim ke seluruh grup target
            for (const gid of targetGroupIds) {
              await sendPrayerNotification(naze, gid, prayerName, targetTime, config);
            }
          }
        }
      }
    } catch (err) {
      console.error('[SHOLAT ERROR in scheduler]:', err.message);
    }
  }, 30000); // Cek setiap 30 detik
  if (global.sholatIntervalInstance?.unref) {
    global.sholatIntervalInstance.unref();
  }
}
