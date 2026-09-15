import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { sanitizeSairidev } from './clean-sairidev.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OGURI_DIR = path.join(ROOT_DIR, 'OguriCap');
const MODE_FILE = path.join(ROOT_DIR, '.deploy-mode');

// ANSI Colors untuk console Pterodactyl
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';

function printBanner() {
  console.log(`
${CYAN}================================================================${RESET}
${BOLD}${MAGENTA}       🌸 OGURICAP DEPLOYMENT WIZARD (PTERODACTYL / VPS) 🌸     ${RESET}
${CYAN}================================================================${RESET}
${BOLD}Sistem mendeteksi lingkungan server baru / Pterodactyl Panel.${RESET}
Silakan pilih mode operasi yang ingin Anda jalankan:

  ${BOLD}${GREEN}[1] WEB APP${RESET}
      - Full-stack Dashboard Web di Port 3000 (Vite + React)
      - Terintegrasi Manajemen Bot WA, Realtime Live Logs, & Sholat Reminder
      - Cocok jika port 3000 dialokasikan di Pterodactyl

  ${BOLD}${YELLOW}[2] BOT WA SAJA (STANDALONE OGURICAP)${RESET}
      - Menjalankan bot WhatsApp secara mandiri di dalam folder OguriCap/
      - Sangat hemat RAM & CPU untuk panel hosting
      - ${BOLD}Fleksibel:${RESET} Otomatis memindahkan / memasang node_modules ke OguriCap/

${CYAN}----------------------------------------------------------------${RESET}
  Ketik ${BOLD}${GREEN}1${RESET} (atau ${BOLD}webapp${RESET}) untuk Mode Web App
  Ketik ${BOLD}${YELLOW}2${RESET} (atau ${BOLD}bot${RESET}) untuk Mode Bot WA Saja
${CYAN}================================================================${RESET}
`);
}

/**
 * Menyimpan mode pilihan user
 */
function saveMode(mode) {
  try {
    fs.writeFileSync(MODE_FILE, mode.trim().toLowerCase(), 'utf-8');
  } catch (err) {
    console.error(`${YELLOW}[WARNING] Gagal menyimpan file .deploy-mode:${RESET}`, err.message);
  }
}

/**
 * Membaca mode yang tersimpan sebelumnya
 */
function getSavedMode() {
  try {
    if (process.env.DEPLOY_MODE) {
      return process.env.DEPLOY_MODE.trim().toLowerCase();
    }
    if (fs.existsSync(MODE_FILE)) {
      return fs.readFileSync(MODE_FILE, 'utf-8').trim().toLowerCase();
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Memastikan node_modules berada di dalam folder OguriCap/
 * Jika sudah ada di root (karena npm install sebelumnya), salin/sinkronkan ke OguriCap/node_modules
 */
async function ensureOguriDependencies() {
  const rootModules = path.join(ROOT_DIR, 'node_modules');
  const oguriModules = path.join(OGURI_DIR, 'node_modules');

  console.log(`${CYAN}[OGURI-SETUP] Memeriksa kelengkapan dependensi di dalam folder OguriCap/...${RESET}`);

  // Cek apakah modul esensial terpasang lengkap di OguriCap
  const crucialModules = ['axios', 'pino', 'chalk', 'qrcode', 'baileys'];
  const isOguriComplete = crucialModules.every(pkg => {
    return fs.existsSync(path.join(oguriModules, pkg)) ||
           (pkg === 'baileys' && (fs.existsSync(path.join(oguriModules, '@sairidev', 'baileys-new')) || fs.existsSync(path.join(oguriModules, 'baileys'))));
  });

  const rootHasAxios = fs.existsSync(path.join(rootModules, 'axios'));

  if (!isOguriComplete && rootHasAxios) {
    console.log(`${YELLOW}[OGURI-SETUP] Menyinkronkan node_modules dari root ke OguriCap/node_modules...${RESET}`);
    try {
      if (!fs.existsSync(oguriModules)) {
        try {
          fs.symlinkSync(rootModules, oguriModules, 'junction');
          console.log(`${GREEN}[OGURI-SETUP] Symlink node_modules berhasil dibuat secara instan!${RESET}`);
        } catch (symErr) {
          fs.mkdirSync(oguriModules, { recursive: true });
          fs.cpSync(rootModules, oguriModules, { recursive: true, force: false });
          console.log(`${GREEN}[OGURI-SETUP] Berhasil menyalin dependensi ke dalam OguriCap/!${RESET}`);
        }
      }
    } catch (copyErr) {
      console.warn(`${YELLOW}[OGURI-SETUP] Sinkronisasi salin gagal (${copyErr.message}), beralih ke instalasi langsung...${RESET}`);
    }
  }

  // Jika setelah dicoba salin tetap belum ada axios di OguriCap
  const stillMissing = !fs.existsSync(path.join(oguriModules, 'axios'));
  if (stillMissing) {
    console.log(`${CYAN}[OGURI-SETUP] Menginstal dependensi langsung di dalam folder OguriCap/...${RESET}`);
    await runCommand('npm', ['install'], OGURI_DIR);
    console.log(`${GREEN}[OGURI-SETUP] Instalasi dependensi OguriCap selesai!${RESET}`);
  } else {
    console.log(`${GREEN}[OGURI-SETUP] Dependensi OguriCap/node_modules siap dan lengkap!${RESET}`);
  }

  // Jalankan proteksi anti-ban sairidev pada dependensi OguriCap
  try {
    sanitizeSairidev();
  } catch (e) {
    console.warn(`${YELLOW}[BAN-GUARD] Warning sanitasi sairidev:${RESET}`, e?.message || e);
  }
}

/**
 * Menjalankan command child_process secara async
 */
function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`${BLUE}[EXEC] (${cwd}) ${cmd} ${args.join(' ')}${RESET}`);
    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command ${cmd} exited with code ${code}`));
    });

    proc.on('error', (err) => reject(err));
  });
}

/**
 * Jalankan Bot WA Saja (Standalone OguriCap)
 */
export async function startBotOnly() {
  console.log(`\n${GREEN}${BOLD}====================================================${RESET}`);
  console.log(`${GREEN}${BOLD}🚀 MEMULAI OGURICAP DALAM MODE BOT WA SAJA (STANDALONE)${RESET}`);
  console.log(`${GREEN}${BOLD}====================================================${RESET}\n`);

  saveMode('bot');
  await ensureOguriDependencies();

  console.log(`${CYAN}[OGURI] Beralih sepenuhnya ke direktori OguriCap/ dan menjalankan bot...${RESET}\n`);

  // Jalankan bot dengan node start.js di dalam OguriCap
  const oguriModules = path.join(OGURI_DIR, 'node_modules');
  const rootModules = path.join(ROOT_DIR, 'node_modules');
  const nodePaths = [oguriModules, rootModules].filter(fs.existsSync).join(path.delimiter);

  const botProc = spawn('node', ['start.js'], {
    cwd: OGURI_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_PATH: nodePaths + (process.env.NODE_PATH ? path.delimiter + process.env.NODE_PATH : ''),
      PORT: process.env.PORT || '3000',
    },
  });

  botProc.on('close', (code) => {
    console.log(`${YELLOW}[OGURI] Bot process exited with code ${code}.${RESET}`);
    process.exit(code || 0);
  });
}

/**
 * Jalankan Web App
 */
export async function startWebApp() {
  console.log(`\n${CYAN}${BOLD}====================================================${RESET}`);
  console.log(`${CYAN}${BOLD}🌐 MEMULAI MODE WEB APP (DASHBOARD + BOT MANAGER)   ${RESET}`);
  console.log(`${CYAN}${BOLD}====================================================${RESET}\n`);

  saveMode('webapp');

  const rootModules = path.join(ROOT_DIR, 'node_modules');
  const oguriModules = path.join(OGURI_DIR, 'node_modules');
  const hasExpressAndAxios = fs.existsSync(path.join(rootModules, 'express')) && fs.existsSync(path.join(rootModules, 'axios'));

  if (!hasExpressAndAxios) {
    console.log(`${CYAN}[WEB-SETUP] Dependensi belum lengkap di root, menjalankan npm install...${RESET}`);
    await runCommand('npm', ['install'], ROOT_DIR);
  }

  // Sanitasi Baileys anti-ban
  try {
    sanitizeSairidev();
  } catch (e) {
    console.warn(`${YELLOW}[BAN-GUARD] Warning sanitasi sairidev:${RESET}`, e?.message || e);
  }

  const nodePaths = [rootModules, oguriModules].filter(fs.existsSync).join(path.delimiter);
  const webEnv = {
    ...process.env,
    NODE_PATH: nodePaths + (process.env.NODE_PATH ? path.delimiter + process.env.NODE_PATH : ''),
  };

  // Cek apakah dist/server.cjs sudah ada atau perlu tsx
  const distServer = path.join(ROOT_DIR, 'dist', 'server.cjs');
  if (fs.existsSync(distServer) && process.env.NODE_ENV === 'production') {
    console.log(`${CYAN}[WEB-APP] Menjalankan server produksi dist/server.cjs...${RESET}`);
    const proc = spawn('node', ['dist/server.cjs'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: webEnv,
    });
    proc.on('close', (code) => process.exit(code || 0));
  } else {
    console.log(`${CYAN}[WEB-APP] Menjalankan server melalui tsx server.ts...${RESET}`);
    const proc = spawn('npx', ['tsx', 'server.ts'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: webEnv,
    });
    proc.on('close', (code) => process.exit(code || 0));
  }
}

/**
 * Prompt interaktif selector
 */
export async function promptSelection() {
  // Cek argumen CLI langsung
  const args = process.argv.slice(2);
  if (args.includes('--bot') || args.includes('bot') || args.includes('2')) {
    return startBotOnly();
  }
  if (args.includes('--webapp') || args.includes('webapp') || args.includes('1')) {
    return startWebApp();
  }
  if (args.includes('--reset')) {
    try {
      if (fs.existsSync(MODE_FILE)) fs.unlinkSync(MODE_FILE);
      console.log(`${GREEN}[INFO] Konfigurasi mode sebelumnya berhasil direset.${RESET}`);
    } catch (e) {}
  }

  const savedMode = getSavedMode();

  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let answered = false;
  let countdownTimer = null;
  const timeoutSeconds = 15;

  if (savedMode) {
    console.log(`${YELLOW}⚡ Mode tersimpan sebelumnya terdeteksi: ${BOLD}${savedMode.toUpperCase()}${RESET}`);
    console.log(`Menunggu input (atau otomatis melanjutkan dalam ${timeoutSeconds} detik)...`);
  } else {
    console.log(`Ketik angka 1 atau 2 pada Console Pterodactyl sekarang:`);
  }

  // Countdown auto-fallback jika tidak ada input atau di non-interactive environment
  countdownTimer = setTimeout(() => {
    if (!answered) {
      answered = true;
      rl.close();
      const finalMode = savedMode || 'webapp';
      console.log(`\n${YELLOW}[AUTO-SELECT] Waktu habis / non-interaktif. Menggunakan mode: ${BOLD}${finalMode.toUpperCase()}${RESET}\n`);
      if (finalMode === 'bot') {
        startBotOnly();
      } else {
        startWebApp();
      }
    }
  }, timeoutSeconds * 1000);

  rl.question(`${BOLD}${MAGENTA}Pilihan Anda [1: Web App / 2: Bot WA]: ${RESET}`, (answer) => {
    if (answered) return;
    answered = true;
    clearTimeout(countdownTimer);
    rl.close();

    const normalized = (answer || '').trim().toLowerCase();

    if (normalized === '2' || normalized === 'bot' || normalized === 'bot wa' || normalized === 'oguri') {
      startBotOnly();
    } else if (normalized === '1' || normalized === 'web' || normalized === 'webapp' || normalized === 'web app') {
      startWebApp();
    } else {
      console.log(`${YELLOW}[NOTICE] Input tidak dikenali ('${answer}'). Menggunakan mode default (Web App)...${RESET}`);
      startWebApp();
    }
  });
}

// Eksekusi jika dijalankan secara langsung via CLI
if (process.argv[1] === __filename) {
  promptSelection().catch((err) => {
    console.error(`${RED}[ERROR] Gagal menjalankan Pterodactyl selector:${RESET}`, err);
    process.exit(1);
  });
}

export default promptSelection;
