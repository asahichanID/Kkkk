/**
 * apiGlobal/core/logger.js
 * -----------------------------------------------------------------------
 * Logger Terpusat, Informatif & Otomatis Ter-Reset Tiap 3 Menit.
 *
 * Fitur Utama:
 *   - Menampilkan Provider, Aksi, Layanan, Status, dan Durasi (ms) secara jelas.
 *   - Auto-Reset Log & Metrik setiap 3 menit (180.000 ms) agar log tidak menumpuk & RAM tetap bersih.
 *   - Buffer sirkular in-memory yang dibersihkan otomatis per siklus 3 menit.
 *   - Aman 100%: Tidak pernah melempar error (throw).
 */

const DEBUG = String(process.env.APIGLOBAL_DEBUG || '').toLowerCase() === 'true';

// Buffer in-memory untuk menyimpan history log aktif dalam 1 siklus
const MAX_LOG_BUFFER = 200;
let logBuffer = [];

// Metrik aktivitas dalam 1 siklus 3 menit
let cycleStats = {
  cycleStartedAt: Date.now(),
  totalOperations: 0,
  cacheHits: 0,
  successes: 0,
  warnings: 0,
  errors: 0,
  providerUsage: {}
};

/**
 * Format timestamp ringkas (HH:mm:ss)
 */
function getTimestamp() {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

function recordLog(level, message, meta = {}) {
  const entry = {
    time: getTimestamp(),
    timestamp: Date.now(),
    level,
    message,
    meta
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift();
  }
}

/**
 * Reset otomatis log dan metrik setiap 3 menit
 */
const RESET_INTERVAL_MS = 3 * 60 * 1000; // 3 menit

function executeCycleReset() {
  try {
    const elapsedMinutes = Math.round((Date.now() - cycleStats.cycleStartedAt) / 60000);
    const topProviders = Object.entries(cycleStats.providerUsage)
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ') || 'none';

    // Cetak banner reset bersih
    console.log(
      `\x1b[36m[apiGlobal:reset]\x1b[0m 🔄 \x1b[1mLog buffer & metrik otomatis di-reset (Siklus 3 Menit)\x1b[0m\n` +
      `  ├─ Ringkasan: \x1b[32m${cycleStats.successes} sukses\x1b[0m | \x1b[33m${cycleStats.warnings} warning\x1b[0m | \x1b[31m${cycleStats.errors} error\x1b[0m | \x1b[35m${cycleStats.cacheHits} cache-hits\x1b[0m (Total: ${cycleStats.totalOperations} ops)\n` +
      `  └─ Provider aktif: [${topProviders}]`
    );

    // Kosongkan buffer log
    logBuffer = [];

    // Reset metrik untuk siklus berikutnya
    cycleStats = {
      cycleStartedAt: Date.now(),
      totalOperations: 0,
      cacheHits: 0,
      successes: 0,
      warnings: 0,
      errors: 0,
      providerUsage: {}
    };
  } catch {
    /* noop */
  }
}

// Jalankan timer reset berkala (unref agar tidak mengunci proses exit)
const resetTimer = setInterval(executeCycleReset, RESET_INTERVAL_MS);
if (typeof resetTimer?.unref === 'function') {
  resetTimer.unref();
}

const tag = (level) => `[apiGlobal:${level}]`;

export const logger = {
  debug(...args) {
    if (!DEBUG) return;
    try {
      console.log(`\x1b[90m${tag('debug')}\x1b[0m`, ...args);
      recordLog('debug', args.join(' '));
    } catch { /* noop */ }
  },

  info(...args) {
    try {
      console.log(`\x1b[34m${tag('info')}\x1b[0m`, ...args);
      recordLog('info', args.join(' '));
    } catch { /* noop */ }
  },

  warn(...args) {
    try {
      cycleStats.warnings++;
      console.warn(`\x1b[33m${tag('warn')}\x1b[0m`, ...args);
      recordLog('warn', args.join(' '));
    } catch { /* noop */ }
  },

  error(...args) {
    try {
      cycleStats.errors++;
      console.error(`\x1b[31m${tag('error')}\x1b[0m`, ...args);
      recordLog('error', args.join(' '));
    } catch { /* noop */ }
  },

  /**
   * Log Aksi Operasi (mis. "Mencari video", "Resolving stream audio")
   */
  action(serviceName, actionName, details = '') {
    try {
      cycleStats.totalOperations++;
      const timeStr = getTimestamp();
      console.log(`\x1b[36m[apiGlobal]\x1b[0m \x1b[33m[${timeStr}]\x1b[0m ⚡ \x1b[1m[${serviceName.toUpperCase()}]\x1b[0m ${actionName}${details ? ' :: ' + details : ''}`);
      recordLog('action', `[${serviceName}] ${actionName} ${details}`);
    } catch { /* noop */ }
  },

  /**
   * Log Berhasil dengan detail provider & durasi eksekusi
   */
  success(serviceName, providerName, details = '', durationMs = 0) {
    try {
      cycleStats.successes++;
      cycleStats.totalOperations++;
      cycleStats.providerUsage[providerName] = (cycleStats.providerUsage[providerName] || 0) + 1;
      const dur = durationMs > 0 ? ` \x1b[90m(${durationMs}ms)\x1b[0m` : '';
      console.log(`\x1b[32m[apiGlobal:ok]\x1b[0m ✅ \x1b[1m[${serviceName}]\x1b[0m Provider: \x1b[32m${providerName}\x1b[0m${details ? ' │ ' + details : ''}${dur}`);
      recordLog('success', `[${serviceName}] ${providerName}: ${details} (${durationMs}ms)`);
    } catch { /* noop */ }
  },

  /**
   * Log Cache Hit (respons instan 0ms)
   */
  cacheHit(serviceName, key = '') {
    try {
      cycleStats.cacheHits++;
      cycleStats.totalOperations++;
      console.log(`\x1b[35m[apiGlobal:cache]\x1b[0m ⚡ \x1b[1m[${serviceName}]\x1b[0m Cache-Hit (Instant 0ms) :: ${key}`);
      recordLog('cache', `[${serviceName}] Cache-hit: ${key}`);
    } catch { /* noop */ }
  },

  /**
   * Log Fallback Antar Provider
   */
  fallback(serviceName, fromProvider, toProvider, reason = '') {
    try {
      cycleStats.warnings++;
      console.warn(`\x1b[33m[apiGlobal:fallback]\x1b[0m 🔄 \x1b[1m[${serviceName}]\x1b[0m \x1b[31m${fromProvider}\x1b[0m ➔ \x1b[32m${toProvider}\x1b[0m ${reason ? ':: ' + reason : ''}`);
      recordLog('fallback', `[${serviceName}] ${fromProvider} -> ${toProvider}: ${reason}`);
    } catch { /* noop */ }
  },

  /**
   * Log ringkas 1 baris untuk percobaan provider
   */
  attempt(serviceName, providerName, ok, extra = '', durationMs = 0) {
    try {
      const icon = ok ? '✅' : '⚠️';
      const dur = durationMs > 0 ? ` (${durationMs}ms)` : '';
      if (ok) {
        cycleStats.successes++;
        cycleStats.providerUsage[providerName] = (cycleStats.providerUsage[providerName] || 0) + 1;
        this.info(`${icon} ${serviceName} → \x1b[32m${providerName}\x1b[0m${extra ? ' :: ' + extra : ''}${dur}`);
      } else {
        cycleStats.warnings++;
        this.warn(`${icon} ${serviceName} → \x1b[31m${providerName}\x1b[0m${extra ? ' :: ' + extra : ''}${dur}`);
      }
    } catch { /* noop */ }
  },

  /**
   * Ambil statistik siklus aktif saat ini
   */
  getStats() {
    return { ...cycleStats, bufferSize: logBuffer.length };
  },

  /**
   * Ambil buffer history log saat ini
   */
  getHistory() {
    return [...logBuffer];
  },

  /**
   * Paksa reset log buffer secara manual
   */
  resetCycle() {
    executeCycleReset();
  }
};

export default logger;

