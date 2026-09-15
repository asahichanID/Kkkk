import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { sanitizeSairidev } from './scripts/clean-sairidev.js';
import { initRpgServer, getRpgHtml } from './game/rpg/index.js';
import { initUlarTanggaWs, UlarTanggaManager } from './OguriCap/game/ulartanggaWs.js';
import { getUlarTanggaHtml } from './OguriCap/game/ulartangga.js';
import { CaturManager } from './OguriCap/game/caturWs.js';
import {
  getSholatConfig,
  saveSholatConfig,
  updateSholatGroupState,
  generateRamadanPrayerCanvas,
  getRealtimePrayerSchedule,
  INDONESIA_REGIONS,
  ADZAN_REGULAR_PATH,
  ADZAN_SUBUH_PATH,
} from './OguriCap/lib/sholat.js';
import sharp from 'sharp';
import { ZipArchive } from 'archiver';

const app = express();
const PORT = 3000;
const ROOT_DIR = process.cwd();
const OGURI_DIR = path.join(ROOT_DIR, 'OguriCap');

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Interface for Bot state
interface BotState {
  status: 'stopped' | 'starting' | 'waiting_code' | 'pairing_ready' | 'connected' | 'reconnecting' | 'error';
  pairingCode: string | null;
  botNumber: string | null;
  customCode: string | null;
  connectedUser: any | null;
  startedAt: number | null;
  pid: number | null;
  hasSession: boolean;
  lastError: string | null;
}

interface LogEntry {
  id: number;
  time: string;
  type: 'stdout' | 'stderr' | 'system';
  message: string;
}

let botProcess: ChildProcess | null = null;
let logIdCounter = 1;
const logHistory: LogEntry[] = [];
const MAX_LOGS = 1000;

// Connected SSE clients
const sseClients = new Set<express.Response>();

const botState: BotState = {
  status: 'stopped',
  pairingCode: null,
  botNumber: null,
  customCode: null,
  connectedUser: null,
  startedAt: null,
  pid: null,
  hasSession: false,
  lastError: null,
};

function checkHasSession(): boolean {
  try {
    const credsPath = path.join(OGURI_DIR, 'nazedev', 'creds.json');
    if (!fs.existsSync(credsPath)) return false;
    const raw = fs.readFileSync(credsPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.registered === true && parsed.me?.id);
  } catch {
    return false;
  }
}

botState.hasSession = checkHasSession();

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function addLog(type: 'stdout' | 'stderr' | 'system', rawMessage: string) {
  const clean = stripAnsi(rawMessage).trimEnd();
  if (!clean) return;

  const lines = clean.split('\n');
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });

  for (const line of lines) {
    if (!line.trim()) continue;
    const entry: LogEntry = {
      id: logIdCounter++,
      time: timeStr,
      type,
      message: line,
    };

    logHistory.push(entry);
    if (logHistory.length > MAX_LOGS) {
      logHistory.shift();
    }

    broadcastEvent('log', entry);

    // Parse specific events from logs
    parseLogForState(line);
  }
}

function parseLogForState(line: string) {
  // Check for pairing code pattern
  // Example: "Your Pairing Code : LYNZ - OFFC" or "Your Pairing Code : ABCD - EFGH"
  const pairingMatch = line.match(/Your Pairing Code\s*:\s*([A-Z0-9\s-]+)/i);
  if (pairingMatch && pairingMatch[1]) {
    const code = pairingMatch[1].trim();
    botState.pairingCode = code;
    botState.status = 'pairing_ready';
    broadcastEvent('status', botState);
  }

  // Check for "Requesting Pairing Code..."
  if (line.includes('Requesting Pairing Code')) {
    botState.status = 'waiting_code';
    broadcastEvent('status', botState);
  }

  // Check for connected pattern
  if (line.includes('Connected to :')) {
    botState.status = 'connected';
    botState.pairingCode = null;
    botState.hasSession = true;
    try {
      const jsonStart = line.indexOf('{');
      if (jsonStart !== -1) {
        botState.connectedUser = JSON.parse(line.slice(jsonStart));
      }
    } catch {
      // Ignore JSON parse error from log line
    }
    broadcastEvent('status', botState);
  }

  // Check for connection closed/reconnecting
  if (
    line.includes('Connection to Server Lost') ||
    line.includes('Connection closed') ||
    line.includes('Restart Required') ||
    line.includes('Connection Timed Out')
  ) {
    botState.status = 'reconnecting';
    broadcastEvent('status', botState);
  }

  // Check for logged out / forbidden
  if (line.includes('Scan again') || line.includes('Delete Session')) {
    botState.hasSession = false;
    botState.status = 'stopped';
    broadcastEvent('status', botState);
  }
}

function startBot(options?: { botNumber?: string; customCode?: string }) {
  if (botProcess && !botProcess.killed) {
    addLog('system', '[MANAGER] Bot sudah berjalan (PID: ' + botProcess.pid + ')');
    return { success: false, message: 'Bot process is already running' };
  }

  let botNumber = (options?.botNumber || botState.botNumber || '').replace(/[^0-9]/g, '');
  if (botNumber.startsWith('08')) {
    botNumber = '628' + botNumber.slice(2);
  }
  const customCode = options?.customCode ? options.customCode.toUpperCase().replace(/[^A-Z0-9]/g, '').trim() : '';

  botState.botNumber = botNumber || null;
  botState.customCode = customCode || null;
  botState.status = 'starting';
  botState.startedAt = Date.now();
  botState.hasSession = checkHasSession();
  botState.lastError = null;

  // Jika botNumber diisi dan sesi di nazedev belum terdaftar (belum login sukses),
  // bersihkan file sementara agar Baileys membuat kunci baru yang sinkron dengan WhatsApp server
  const credsPath = path.join(OGURI_DIR, 'nazedev', 'creds.json');
  if (botNumber && fs.existsSync(credsPath)) {
    try {
      const credsData = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
      if (!credsData || credsData.registered !== true) {
        const sessionDir = path.join(OGURI_DIR, 'nazedev');
        if (fs.existsSync(sessionDir)) {
          const files = fs.readdirSync(sessionDir);
          for (const file of files) {
            try {
              fs.unlinkSync(path.join(sessionDir, file));
            } catch {
              // ignore
            }
          }
          addLog('system', '[MANAGER] Membersihkan kunci pairing sementara sebelumnya untuk handshake baru.');
        }
      }
    } catch {
      // ignore
    }
  }

  addLog('system', `[MANAGER] Memulai OguriCap Bot (Nomor: ${botNumber || 'Auto/Session'}, Mode: ${customCode ? `Custom (${customCode})` : 'Standar Resmi WhatsApp'})...`);
  broadcastEvent('status', botState);

  const oguriModules = path.join(OGURI_DIR, 'node_modules');
  const rootModules = path.join(ROOT_DIR, 'node_modules');
  const nodePaths = [oguriModules, rootModules].filter(fs.existsSync).join(path.delimiter);

  // Environment variables for OguriCap subprocess
  const subEnv: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_PATH: nodePaths + (process.env.NODE_PATH ? path.delimiter + process.env.NODE_PATH : ''),
    PORT: '3099',
    SERVER_PORT: '3099',
    ...(botNumber ? { BOT_NUMBER: botNumber } : {}),
    ...(customCode ? { CUSTOM_PAIRING_CODE: customCode } : {}),
  };

  try {
    // Jalankan pembersihan auto-follow @sairidev/baileys-new untuk proteksi akun
    try {
      sanitizeSairidev();
    } catch (e: any) {
      addLog('system', `[BAN-GUARD] Warning pembersihan sairidev: ${e?.message || e}`);
    }

    botProcess = spawn('node', ['index.js'], {
      cwd: OGURI_DIR,
      env: subEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    botState.pid = botProcess.pid || null;
    broadcastEvent('status', botState);

    botProcess.stdout?.on('data', (chunk) => {
      addLog('stdout', chunk.toString('utf-8'));
    });

    botProcess.stderr?.on('data', (chunk) => {
      addLog('stderr', chunk.toString('utf-8'));
    });

    botProcess.on('error', (err) => {
      addLog('system', `[MANAGER ERROR] Gagal spawn proses: ${err.message}`);
      botState.status = 'error';
      botState.lastError = err.message;
      broadcastEvent('status', botState);
    });

    botProcess.on('exit', (code, signal) => {
      addLog('system', `[MANAGER] Proses bot berhenti (code: ${code}, signal: ${signal})`);
      botProcess = null;
      botState.status = 'stopped';
      botState.pid = null;
      botState.startedAt = null;
      botState.hasSession = checkHasSession();
      broadcastEvent('status', botState);
    });

    return { success: true, message: 'Bot started', pid: botProcess.pid };
  } catch (err: any) {
    botState.status = 'error';
    botState.lastError = err.message;
    addLog('system', `[MANAGER ERROR] ${err.message}`);
    broadcastEvent('status', botState);
    return { success: false, message: err.message };
  }
}

function stopBot() {
  if (!botProcess || botProcess.killed) {
    botState.status = 'stopped';
    botState.pid = null;
    broadcastEvent('status', botState);
    return { success: true, message: 'Bot was not running' };
  }

  addLog('system', '[MANAGER] Menghentikan bot...');
  try {
    botProcess.kill('SIGTERM');
    setTimeout(() => {
      if (botProcess && !botProcess.killed) {
        botProcess.kill('SIGKILL');
      }
    }, 3000);

    return { success: true, message: 'Stop signal sent' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// REST APIs
app.get('/api/bot/status', (req, res) => {
  botState.hasSession = checkHasSession();
  res.json(botState);
});

app.post('/api/bot/start', (req, res) => {
  const { botNumber, customCode } = req.body || {};
  const result = startBot({ botNumber, customCode });
  res.json(result);
});

app.post('/api/bot/stop', (req, res) => {
  const result = stopBot();
  res.json(result);
});

app.post('/api/bot/restart', (req, res) => {
  addLog('system', '[MANAGER] Me-restart bot...');
  stopBot();
  setTimeout(() => {
    const result = startBot({
      botNumber: req.body?.botNumber || botState.botNumber || undefined,
      customCode: req.body?.customCode || botState.customCode || undefined,
    });
    res.json(result);
  }, 2000);
});

app.post('/api/bot/reset-session', (req, res) => {
  stopBot();
  const sessionDir = path.join(OGURI_DIR, 'nazedev');
  try {
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        fs.unlinkSync(path.join(sessionDir, file));
      }
    }
    botState.hasSession = false;
    botState.pairingCode = null;
    botState.connectedUser = null;
    addLog('system', '[MANAGER] Sesi WhatsApp (nazedev/) berhasil di-reset.');
    broadcastEvent('status', botState);
    res.json({ success: true, message: 'Session reset successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bot/logs', (req, res) => {
  const limit = parseInt(req.query.limit as string, 10) || 200;
  res.json(logHistory.slice(-limit));
});

// SSE Live Events (status & logs)
app.get('/api/bot/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state & recent logs
  res.write(`event: status\ndata: ${JSON.stringify(botState)}\n\n`);
  for (const log of logHistory.slice(-50)) {
    res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
  }

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Settings / Config API
app.get('/api/bot/config', (req, res) => {
  try {
    const settingsPath = path.join(OGURI_DIR, 'settings.js');
    const content = fs.readFileSync(settingsPath, 'utf-8');

    // Parse important values using regex
    const botnameMatch = content.match(/global\.botname\s*=\s*['"]([^'"]+)['"]/);
    const authorMatch = content.match(/global\.author\s*=\s*['"]([^'"]+)['"]/);
    const packnameMatch = content.match(/global\.packname\s*=\s*['"]([^'"]+)['"]/);
    const timezoneMatch = content.match(/global\.timezone\s*=\s*['"]([^'"]+)['"]/);
    const numberBotMatch = content.match(/global\.number_bot\s*=\s*['"]([^'"]*)['"]/);
    const customPairingMatch = content.match(/global\.custom_pairing_code\s*=\s*['"]([^'"]*)['"]/);
    const ownerMatch = content.match(/global\.owner\s*=\s*\[([^\]]+)\]/);
    const prefixMatch = content.match(/global\.listprefix\s*=\s*\[([^\]]+)\]/);

    const owners = ownerMatch
      ? ownerMatch[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
      : [];
    const prefixes = prefixMatch
      ? prefixMatch[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
      : [];

    res.json({
      botname: botnameMatch ? botnameMatch[1] : 'Oguri Cap',
      author: authorMatch ? authorMatch[1] : 'Shiro',
      packname: packnameMatch ? packnameMatch[1] : '✦ 𝐎𝐠𝐮𝐫𝐢 𝐂𝐚𝐩',
      timezone: timezoneMatch ? timezoneMatch[1] : 'Asia/Jakarta',
      number_bot: numberBotMatch ? numberBotMatch[1] : '',
      custom_pairing_code: customPairingMatch ? customPairingMatch[1] : 'OGURICAP',
      owners,
      prefixes,
      rawContent: content,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bot/config', (req, res) => {
  try {
    const settingsPath = path.join(OGURI_DIR, 'settings.js');
    let content = fs.readFileSync(settingsPath, 'utf-8');

    const { botname, author, packname, timezone, number_bot, custom_pairing_code, owners, prefixes, rawContent } = req.body || {};

    if (rawContent && typeof rawContent === 'string') {
      fs.writeFileSync(settingsPath, rawContent, 'utf-8');
      addLog('system', '[MANAGER] Konfigurasi settings.js diperbarui (raw mode).');
      return res.json({ success: true, message: 'Config updated' });
    }

    if (botname !== undefined) {
      content = content.replace(/global\.botname\s*=\s*['"][^'"]*['"]/, `global.botname = '${botname.replace(/'/g, "\\'")}'`);
    }
    if (author !== undefined) {
      content = content.replace(/global\.author\s*=\s*['"][^'"]*['"]/, `global.author = '${author.replace(/'/g, "\\'")}'`);
    }
    if (packname !== undefined) {
      content = content.replace(/global\.packname\s*=\s*['"][^'"]*['"]/, `global.packname = '${packname.replace(/'/g, "\\'")}'`);
    }
    if (timezone !== undefined) {
      content = content.replace(/global\.timezone\s*=\s*['"][^'"]*['"]/, `global.timezone = '${timezone.replace(/'/g, "\\'")}'`);
    }
    if (number_bot !== undefined) {
      content = content.replace(/global\.number_bot\s*=\s*['"][^'"]*['"]/, `global.number_bot = '${number_bot.replace(/'/g, "\\'")}'`);
    }
    if (custom_pairing_code !== undefined) {
      content = content.replace(/global\.custom_pairing_code\s*=\s*['"][^'"]*['"]/, `global.custom_pairing_code = '${custom_pairing_code.replace(/'/g, "\\'")}'`);
    }
    if (Array.isArray(owners)) {
      const formatted = owners.map((o) => `'${o.replace(/'/g, '')}'`).join(', ');
      content = content.replace(/global\.owner\s*=\s*\[[^\]]*\]/, `global.owner = [${formatted}]`);
    }
    if (Array.isArray(prefixes)) {
      const formatted = prefixes.map((p) => `'${p.replace(/'/g, '')}'`).join(', ');
      content = content.replace(/global\.listprefix\s*=\s*\[[^\]]*\]/, `global.listprefix = [${formatted}]`);
    }

    fs.writeFileSync(settingsPath, content, 'utf-8');
    addLog('system', '[MANAGER] Konfigurasi settings.js diperbarui.');
    res.json({ success: true, message: 'Config updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== SHOLAT & RAMADAN API =====================

// Get Sholat Config & Groups
app.get('/api/sholat/config', async (req, res) => {
  try {
    const config = getSholatConfig();

    // Pastikan schedule terisi waktu realtime hari ini
    if (!config.schedule) {
      config.schedule = await getRealtimePrayerSchedule(config.regionId || 'jakarta');
    }

    // Read detected groups from database.json if available
    const dbPath = path.join(OGURI_DIR, 'database/database.json');
    let dbGroups: Record<string, any> = {};
    if (fs.existsSync(dbPath)) {
      try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        dbGroups = parsed.groups || {};
      } catch {}
    }

    // Merge group lists
    const groupMap = new Map<string, { id: string; name: string; waktusholat: boolean }>();

    // From config.enabledGroups
    if (config.enabledGroups) {
      for (const [gid, enabled] of Object.entries(config.enabledGroups)) {
        groupMap.set(gid, {
          id: gid,
          name: dbGroups[gid]?.subject || gid.replace(/@.+/, ''),
          waktusholat: !!enabled,
        });
      }
    }

    // From dbGroups
    for (const [gid, gdata] of Object.entries(dbGroups)) {
      const existing = groupMap.get(gid);
      groupMap.set(gid, {
        id: gid,
        name: gdata?.subject || gid.replace(/@.+/, ''),
        waktusholat: existing ? existing.waktusholat : !!gdata?.waktusholat,
      });
    }

    const groupsList = Array.from(groupMap.values());

    res.json({
      config,
      availableRegions: INDONESIA_REGIONS,
      groups: groupsList,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save Sholat Config & Auto Recalculate Realtime Schedule
app.post('/api/sholat/config', async (req, res) => {
  try {
    const { region, regionId, timezone, tzLabel, schedule } = req.body || {};
    const current = getSholatConfig();

    const targetRegionId = regionId || current.regionId || 'jakarta';
    // Jika tidak ada schedule custom yang dikirim, hitung otomatis secara realtime
    const realtimeSchedule = schedule || (await getRealtimePrayerSchedule(targetRegionId));

    const updated = {
      ...current,
      region: region || current.region,
      regionId: targetRegionId,
      timezone: timezone || current.timezone,
      tzLabel: tzLabel || current.tzLabel,
      schedule: realtimeSchedule,
      updatedAt: Date.now(),
    };

    saveSholatConfig(updated);
    addLog('system', `[SHOLAT] Wilayah diubah ke: ${updated.region} (${updated.tzLabel}). Jadwal realtime diperbarui.`);
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Paksa Sinkronisasi Waktu Realtime Hari Ini
app.post('/api/sholat/sync-realtime', async (req, res) => {
  try {
    const config = getSholatConfig();
    const realtimeSchedule = await getRealtimePrayerSchedule(config.regionId || 'jakarta', new Date());
    config.schedule = realtimeSchedule;
    config.updatedAt = Date.now();
    saveSholatConfig(config);

    addLog('system', `[SHOLAT] Jadwal sholat realtime wilayah ${config.region} berhasil disinkronkan.`);
    res.json({ success: true, config, schedule: realtimeSchedule });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audio streaming endpoints for Web Dashboard Adzan Preview
app.get('/api/sholat/audio/adzan', (req, res) => {
  if (fs.existsSync(ADZAN_REGULAR_PATH)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(ADZAN_REGULAR_PATH);
  } else {
    res.status(404).send('Audio Adzan file not found');
  }
});

app.get('/api/sholat/audio/adzan-subuh', (req, res) => {
  if (fs.existsSync(ADZAN_SUBUH_PATH)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(ADZAN_SUBUH_PATH);
  } else {
    res.status(404).send('Audio Adzan Subuh file not found');
  }
});

// Toggle Group Sholat Status
app.post('/api/sholat/toggle-group', async (req, res) => {
  try {
    const { groupId, enabled } = req.body || {};
    if (!groupId) {
      return res.status(400).json({ error: 'groupId diperlukan' });
    }

    await updateSholatGroupState(groupId, !!enabled);

    // Also update database.json if exists
    const dbPath = path.join(OGURI_DIR, 'database/database.json');
    if (fs.existsSync(dbPath)) {
      try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.groups) parsed.groups = {};
        if (!parsed.groups[groupId]) parsed.groups[groupId] = {};
        parsed.groups[groupId].waktusholat = !!enabled;
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch {}
    }

    addLog(
      'system',
      `[SHOLAT] Grup ${groupId} diubah ke: ${enabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}.`
    );

    res.json({ success: true, groupId, enabled: !!enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add custom Group ID to list
app.post('/api/sholat/add-group', async (req, res) => {
  try {
    const { groupId, name, enabled } = req.body || {};
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID diperlukan' });
    }

    const formattedId = groupId.includes('@') ? groupId.trim() : `${groupId.trim()}@g.us`;
    await updateSholatGroupState(formattedId, enabled !== undefined ? !!enabled : true);

    addLog('system', `[SHOLAT] Grup baru ditambahkan ke daftar: ${formattedId}`);
    res.json({ success: true, groupId: formattedId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Canvas Preview Endpoint
app.get('/api/sholat/preview-canvas', async (req, res) => {
  try {
    const prayerName = (req.query.prayerName as string) || 'MAGHRIB';
    const config = getSholatConfig();
    const schedule = config.schedule || (await getRealtimePrayerSchedule(config.regionId || 'jakarta'));

    const buffer = await generateRamadanPrayerCanvas({
      prayerName,
      prayerTime: schedule[prayerName] || schedule['Maghrib'] || '18:10',
      region: config.region,
      tzLabel: config.tzLabel,
      schedule: schedule,
      isStatusInfo: false,
    });

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper format rasio string
function getAspectRatioLabel(w: number, h: number): { label: string; ratio: number } {
  const ratio = w / h;
  if (Math.abs(ratio - 9 / 16) < 0.02) return { label: '9:16 (Portrait Mobile/Story)', ratio };
  if (Math.abs(ratio - 16 / 9) < 0.02) return { label: '16:9 (Landscape HD)', ratio };
  if (Math.abs(ratio - 1) < 0.02) return { label: '1:1 (Persegi/Square)', ratio };
  if (Math.abs(ratio - 4 / 5) < 0.02) return { label: '4:5 (Portrait Feed)', ratio };
  if (Math.abs(ratio - 3 / 4) < 0.02) return { label: '3:4 (Portrait Standar)', ratio };
  if (Math.abs(ratio - 4 / 3) < 0.02) return { label: '4:3 (Landscape Standar)', ratio };
  return { label: `${w}:${h} (${ratio.toFixed(3)})`, ratio };
}

// Helper bikin test card SVG jika menggunakan preset
async function generateTestCard(type: '9:16' | '16:9' | '1:1' | '4:5'): Promise<Buffer> {
  let w = 360;
  let h = 640;
  let title = '9:16 MOBILE STORY';

  if (type === '16:9') {
    w = 640;
    h = 360;
    title = '16:9 LANDSCAPE';
  } else if (type === '1:1') {
    w = 400;
    h = 400;
    title = '1:1 SQUARE';
  } else if (type === '4:5') {
    w = 480;
    h = 600;
    title = '4:5 PORTRAIT';
  }

  const cx = Math.round(w / 2);
  const cy = Math.round(h / 2);
  const rOuter = Math.round(Math.min(w, h) * 0.35);
  const rInner = Math.round(rOuter * 0.5);

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <line x1="${cx}" y1="0" x2="${cx}" y2="${h}" stroke="#334155" stroke-width="2" stroke-dasharray="6,6"/>
      <line x1="0" y1="${cy}" x2="${w}" y2="${cy}" stroke="#334155" stroke-width="2" stroke-dasharray="6,6"/>
      <circle cx="${cx}" cy="${cy}" r="${rOuter}" stroke="#38bdf8" stroke-width="5" fill="none"/>
      <circle cx="${cx}" cy="${cy}" r="${rInner}" stroke="#f43f5e" stroke-width="3" fill="#1e1b4b" fill-opacity="0.6"/>
      <circle cx="${cx}" cy="${cy}" r="6" fill="#fbbf24"/>
      <rect x="${cx - 110}" y="${cy - 90}" width="220" height="36" rx="6" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="${cx}" y="${cy - 66}" fill="#38bdf8" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="1">UJI RASIO ASPEK</text>
      <text x="${cx}" y="${cy + 75}" fill="#f8fafc" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">${title}</text>
      <text x="${cx}" y="${cy + 100}" fill="#94a3b8" font-size="13" font-family="sans-serif" text-anchor="middle">${w} × ${h} px (Anti-Gepeng Test)</text>
      <text x="${cx}" y="${cy + rOuter + 25}" fill="#34d399" font-size="11" font-family="sans-serif" text-anchor="middle">Lingkaran wajib bulat sempurna</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Live HD / Upscale Aspect Ratio Test Endpoint
app.post('/api/tools/hd-test', async (req, res) => {
  let tempInputPath = '';
  let tempResultPath = '';
  try {
    const { sampleType = '9:16', customImageBase64, forcedProvider = 'auto' } = req.body || {};

    let inputBuffer: Buffer;
    if (sampleType === 'custom' && customImageBase64) {
      const cleanBase64 = customImageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
      inputBuffer = Buffer.from(cleanBase64, 'base64');
    } else {
      const type = (['9:16', '16:9', '1:1', '4:5'].includes(sampleType) ? sampleType : '9:16') as any;
      inputBuffer = await generateTestCard(type);
    }

    const metaIn = await sharp(inputBuffer).metadata();
    const origW = metaIn.width || 512;
    const origH = metaIn.height || 512;
    const inRatioInfo = getAspectRatioLabel(origW, origH);

    const tempDir = path.join(process.cwd(), 'database', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    tempInputPath = path.join(tempDir, `test_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.png`);
    fs.writeFileSync(tempInputPath, inputBuffer);

    const startTime = Date.now();
    let usedProvider = '';

    if (forcedProvider === 'sharpLanczos') {
      const { sharpHdProvider } = await import('./OguriCap/apiGlobal/providers/sharpHd.provider.js');
      const p = sharpHdProvider(tempInputPath, 4, 15000);
      tempResultPath = await p.run();
      usedProvider = 'sharpLanczos (Lokal Offline)';
    } else if (forcedProvider === 'ffmpegLanczos') {
      const { ffmpegHdProvider } = await import('./OguriCap/apiGlobal/providers/ffmpegHd.provider.js');
      const p = ffmpegHdProvider(tempInputPath, 4, 15000);
      tempResultPath = await p.run();
      usedProvider = 'ffmpegLanczos (Subprocess FFmpeg)';
    } else if (forcedProvider === 'upscalepics') {
      const { upscalepicsProvider } = await import('./OguriCap/apiGlobal/providers/upscalepics.provider.js');
      const p = upscalepicsProvider(tempInputPath, 30000);
      tempResultPath = await p.run();
      usedProvider = 'upscalepics (AI Cloud)';
    } else {
      // Auto chain (UpscalePics -> Remaker -> Sharp -> FFmpeg)
      const { apiRemini } = await import('./OguriCap/apiGlobal/services/tools/remini.js');
      const result = await apiRemini(tempInputPath);
      tempResultPath = result.result;
      usedProvider = result.provider;
    }

    const durationMs = Date.now() - startTime;
    const metaOut = await sharp(tempResultPath).metadata();
    const outW = metaOut.width || origW;
    const outH = metaOut.height || origH;
    const outRatioInfo = getAspectRatioLabel(outW, outH);

    const origRatio = origW / origH;
    const outRatio = outW / outH;
    const ratioDiffPct = (Math.abs(origRatio - outRatio) / origRatio) * 100;
    const isRatioPreserved = ratioDiffPct < 0.2; // Toleransi pembulatan piksel genap < 0.2%

    const resultBuffer = fs.readFileSync(tempResultPath);
    const outMime = metaOut.format === 'png' ? 'image/png' : 'image/jpeg';
    const inMime = metaIn.format === 'png' ? 'image/png' : 'image/jpeg';

    const base64Enhanced = `data:${outMime};base64,${resultBuffer.toString('base64')}`;
    const base64Original = `data:${inMime};base64,${inputBuffer.toString('base64')}`;

    res.json({
      success: true,
      provider: usedProvider,
      durationMs,
      isRatioPreserved,
      ratioDiffPct: Number(ratioDiffPct.toFixed(3)),
      original: {
        width: origW,
        height: origH,
        aspectRatio: inRatioInfo.label,
        decimalRatio: Number(origRatio.toFixed(4)),
        dataUrl: base64Original,
        fileSizeKb: Math.round(inputBuffer.length / 1024),
      },
      enhanced: {
        width: outW,
        height: outH,
        aspectRatio: outRatioInfo.label,
        decimalRatio: Number(outRatio.toFixed(4)),
        dataUrl: base64Enhanced,
        fileSizeKb: Math.round(resultBuffer.length / 1024),
      },
      scaleFactor: Number((outW / origW).toFixed(2)),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal memproses uji HD' });
  } finally {
    if (tempInputPath && fs.existsSync(tempInputPath)) {
      try { fs.unlinkSync(tempInputPath); } catch {}
    }
    if (tempResultPath && fs.existsSync(tempResultPath)) {
      try { fs.unlinkSync(tempResultPath); } catch {}
    }
  }
});

// Helper untuk filter eksklusi file ZIP (menolak node_modules, .git, cache, log, dan file sampah)
function shouldExcludeFileOrDir(relPath: string, isDirectory: boolean): boolean {
  const p = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = p.split('/');

  // Exclude node_modules di root maupun di dalam subfolder apapun
  if (segments.includes('node_modules')) return true;

  // Exclude .git (database git internal)
  if (segments.includes('.git')) return true;

  // Exclude direktori build output dan cache
  if (segments[0] === 'dist') return true;
  if (segments.includes('.vite')) return true;
  if (segments.includes('.cache')) return true;

  const basename = segments[segments.length - 1];

  // Exclude sampah OS
  if (basename === '.DS_Store' || basename === 'Thumbs.db' || basename === 'desktop.ini') return true;

  // Exclude file log dan dump sementara
  if (basename.endsWith('.log')) return true;

  // Exclude temporary runtime media junk di database/temp (tetap sertakan .gitkeep)
  if (p.startsWith('OguriCap/database/temp/') && !isDirectory && basename !== '.gitkeep') {
    return true;
  }

  return false;
}

function scanProjectFiles(): { fullPath: string; relPath: string; size: number }[] {
  const results: { fullPath: string; relPath: string; size: number }[] = [];

  function walk(dir: string) {
    let list: string[];
    try {
      list = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const item of list) {
      const fullPath = path.join(dir, item);
      const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');

      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (shouldExcludeFileOrDir(relPath, true)) {
          continue;
        }
        walk(fullPath);
      } else if (stat.isFile()) {
        if (shouldExcludeFileOrDir(relPath, false)) {
          continue;
        }
        results.push({ fullPath, relPath, size: stat.size });
      }
    }
  }

  walk(ROOT_DIR);
  return results;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Info statistik ZIP export
app.get('/api/project/export-info', (req, res) => {
  try {
    const files = scanProjectFiles();
    const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

    const oguriFiles = files.filter((f) => f.relPath.startsWith('OguriCap/'));
    const srcFiles = files.filter((f) => f.relPath.startsWith('src/'));
    const scriptFiles = files.filter((f) => f.relPath.startsWith('scripts/'));
    const rootFiles = files.filter((f) => !f.relPath.includes('/'));
    const otherFilesCount = files.length - (oguriFiles.length + srcFiles.length + scriptFiles.length + rootFiles.length);

    res.json({
      totalFiles: files.length,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
      timestamp: new Date().toISOString(),
      includedCategories: [
        {
          name: 'OguriCap WhatsApp Bot (Baileys MD)',
          description: 'Kode inti bot, index.js, settings.js, lib/, database/, plugins/, musume/, dll.',
          fileCount: oguriFiles.length,
        },
        {
          name: 'Web Dashboard Frontend (React 19)',
          description: 'Seluruh UI Dashboard, components, Tailwind styling, icons, types',
          fileCount: srcFiles.length,
        },
        {
          name: 'Cloud Deployment Configs (Railway, Docker, Ptero)',
          description: 'railway.json, nixpacks.toml, Procfile, Dockerfile, ptero.js, server.ts, package.json',
          fileCount: rootFiles.length,
        },
        {
          name: 'Security & Automation Scripts',
          description: 'Anti-auto follow guard (clean-sairidev.js) & Pterodactyl selector',
          fileCount: scriptFiles.length,
        },
        {
          name: 'Public Assets & Panduan',
          description: 'Public icons, assets, dan dokumentasi proyek',
          fileCount: Math.max(0, otherFilesCount),
        },
      ],
      excludedItems: [
        'node_modules/ (bebas bloatware dari root & subfolder)',
        '.git/ (folder git internal)',
        'dist/ (output build sementara)',
        '.vite/ & .cache/ (cache sementara dev server)',
        '*.log (file log runtime)',
        '.DS_Store, Thumbs.db (junk metadata OS)',
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengambil info export' });
  }
});

// Endpoint download arsip ZIP proyek lengkap
app.get('/api/project/download-zip', (req, res) => {
  try {
    const archive = new ZipArchive({
      zlib: { level: 9 }, // Rasio kompresi maksimal
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `oguricap-bot-source-${timestamp}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[ZIP WARNING]', err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      console.error('[ZIP ARCHIVER ERROR]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Gagal membuat arsip ZIP: ' + err.message });
      }
    });

    archive.pipe(res);

    // Ambil daftar file bersih (tanpa node_modules dan file sampah)
    const files = scanProjectFiles();
    for (const f of files) {
      archive.file(f.fullPath, { name: f.relPath });
    }

    // Pastikan folder temp dan nazedev tetap ada saat diekstrak dengan .gitkeep
    archive.append('', { name: 'OguriCap/database/temp/.gitkeep' });
    archive.append('', { name: 'OguriCap/nazedev/.gitkeep' });

    archive.finalize();
  } catch (err: any) {
    console.error('[ZIP DOWNLOAD ERROR]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Gagal download ZIP' });
    }
  }
});

// System telemetry API
app.get('/api/system/stats', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    rss: Math.round(mem.rss / 1024 / 1024),
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    botRunning: botProcess !== null && !botProcess.killed,
    botPid: botProcess?.pid || null,
  });
});

// RPG HTML Web Client endpoint
app.get('/rpg', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(getRpgHtml());
});

// 3D Ular Tangga HTML Web Client endpoint
app.get(['/ulartangga', '/ut', '/snakeladder'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const name = String(req.query.name || 'Trainer');
  res.send(getUlarTanggaHtml(name));
});

// Ular Tangga Multiplayer API fallback endpoints
app.get('/api/ut/rooms', (req, res) => {
  res.json({ rooms: UlarTanggaManager.listRooms() });
});

app.get('/api/ut/rooms/:code', (req, res) => {
  const room = UlarTanggaManager.getRoom(req.params.code);
  if (!room) return res.status(404).json({ success: false, message: 'Room tidak ditemukan' });
  res.json({ success: true, room });
});

// ==========================================
// API & ROUTING CATUR 3D REALTIME
// ==========================================
app.post('/api/catur/create-room', (req, res) => {
  try {
    const { name } = req.body || {};
    const room = CaturManager.createRoomDirect(name || 'Player 1');
    res.json({ success: true, ...room });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || err });
  }
});

app.get('/api/catur/room/:code', (req, res) => {
  try {
    const info = CaturManager.getRoomInfo(req.params.code);
    if (!info) {
      return res.status(404).json({ success: false, message: 'Room tidak ditemukan' });
    }
    res.json({ success: true, room: info });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || err });
  }
});

app.get('/catur', (req, res) => {
  const room = req.query.room ? `&room=${req.query.room}` : '';
  res.redirect(`/?tab=catur${room}`);
});

async function startServer() {
  const httpServer = http.createServer(app);
  const rpgServer = initRpgServer(httpServer);
  const utWss = initUlarTanggaWs(httpServer);
  const caturWss = CaturManager.init(httpServer);

  // Centralized WebSocket Upgrade Dispatcher
  httpServer.on('upgrade', (req, socket, head) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;
      if (pathname === '/ws/catur') {
        caturWss.handleUpgrade(req, socket, head, (ws: any) => {
          caturWss.emit('connection', ws, req);
        });
      } else if (pathname === '/ws/ulartangga') {
        utWss.handleUpgrade(req, socket, head, (ws: any) => {
          utWss.emit('connection', ws, req);
        });
      } else if (pathname === '/ws/rpg') {
        rpgServer.wss.handleUpgrade(req, socket, head, (ws: any) => {
          rpgServer.wss.emit('connection', ws, req);
        });
      }
    } catch (err) {
      console.error('[WS UPGRADE ROUTING ERROR]', err);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`OguriCap Bot Manager Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
