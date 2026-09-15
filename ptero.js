#!/usr/bin/env node
/**
 * OguriCap Pterodactyl Entrypoint Launcher
 * Memungkinkan pemilihan interaktif Web App vs Bot WA langsung dari Console Panel Pterodactyl.
 */
import promptSelection from './scripts/ptero-selector.js';

promptSelection().catch((err) => {
  console.error('[ERROR] Gagal menjalankan Pterodactyl launcher:', err);
  process.exit(1);
});
