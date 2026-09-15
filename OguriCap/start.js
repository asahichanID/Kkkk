import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile } from 'fs';
import { sanitizeSairidev } from './scripts/clean-sairidev.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function ensureDependencies() {
	const oguriModules = path.join(__dirname, 'node_modules');
	const rootModules = path.join(rootDir, 'node_modules');

	// Cek apakah modul esensial (seperti axios dan baileys) bisa diakses
	const hasAxiosInOguri = fs.existsSync(path.join(oguriModules, 'axios'));
	const hasAxiosInRoot = fs.existsSync(path.join(rootModules, 'axios'));
	const hasBaileysInOguri = fs.existsSync(path.join(oguriModules, 'baileys')) || fs.existsSync(path.join(oguriModules, '@sairidev', 'baileys-new'));
	const hasBaileysInRoot = fs.existsSync(path.join(rootModules, 'baileys')) || fs.existsSync(path.join(rootModules, '@sairidev', 'baileys-new'));

	const isMissingCrucial = (!hasAxiosInOguri && !hasAxiosInRoot) || (!hasBaileysInOguri && !hasBaileysInRoot);

	// Jika di root ada tapi di OguriCap belum lengkap, sinkronkan ke OguriCap/node_modules
	if ((!hasAxiosInOguri || !hasBaileysInOguri) && hasAxiosInRoot) {
		console.log(chalk.cyan('[BOT-INIT] Menyinkronkan node_modules dari root ke OguriCap/node_modules...'));
		try {
			if (!fs.existsSync(oguriModules)) {
				try {
					fs.symlinkSync(rootModules, oguriModules, 'junction');
					console.log(chalk.green('[BOT-INIT] Symlink dependensi ke OguriCap selesai secara instan.'));
				} catch (symErr) {
					fs.mkdirSync(oguriModules, { recursive: true });
					fs.cpSync(rootModules, oguriModules, { recursive: true, force: false });
					console.log(chalk.green('[BOT-INIT] Sinkronisasi dependensi ke OguriCap selesai.'));
				}
			}
		} catch (err) {
			console.warn(chalk.yellow('[BOT-INIT] Salin modul root gagal, melanjutkan instalasi mandiri:'), err.message);
		}
	}

	// Jika masih belum ada di mana-mana atau axios belum ada di OguriCap
	if (!fs.existsSync(path.join(oguriModules, 'axios')) && !fs.existsSync(path.join(rootModules, 'axios'))) {
		console.log(chalk.yellow('[BOT-INIT] Dependensi belum terinstal (axios tidak ditemukan). Menjalankan npm install di OguriCap/...'));
		try {
			spawnSync('npm', ['install'], {
				cwd: __dirname,
				stdio: 'inherit',
				env: process.env,
			});
			console.log(chalk.green('[BOT-INIT] npm install selesai dengan sukses.'));
		} catch (err) {
			console.error(chalk.red('[BOT-INIT] Gagal menjalankan npm install:'), err.message);
		}
	}
}

function start() {
	// Pastikan dependensi tersedia sebelum memanggil index.js
	ensureDependencies();

	// Jalankan pembersihan auto-follow @sairidev/baileys-new setiap kali bot dimulai
	try {
		sanitizeSairidev();
	} catch (e) {
		console.error('[BAN-GUARD] Gagal membersihkan sairidev:', e?.message || e);
	}

	const oguriModules = path.join(__dirname, 'node_modules');
	const rootModules = path.join(rootDir, 'node_modules');
	const nodePaths = [oguriModules, rootModules].filter(fs.existsSync).join(path.delimiter);

	let args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)];
	let isIntentionalStop = false;

	let p = spawn(process.argv[0], args, {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
		env: {
			...process.env,
			NODE_PATH: nodePaths + (process.env.NODE_PATH ? path.delimiter + process.env.NODE_PATH : ''),
		},
	}).on('message', data => {
		if (data === 'reset') {
			console.log(chalk.yellow.bold('[BOT] Restarting...'))
			p.kill()
			setTimeout(() => {
				start()
			}, 1000);
		} else if (data === 'stop' || data === 'shutdown') {
			console.log(chalk.red.bold('[BOT] Intentional shutdown requested. Terminating supervisor process immediately...'));
			isIntentionalStop = true;
			try {
				p.kill('SIGTERM');
			} catch (e) {}
			process.exit(0);
		} else if (data === 'uptime') {
			p.send(process.uptime())
		}
	}).on('exit', code => {
		if (isIntentionalStop) {
			console.log(chalk.green.bold('[BOT] Supervisor exited cleanly after stop command. Goodbye!'));
			process.exit(0);
			return;
		}
		if (code !== 0) {
			console.error(chalk.red.bold(`[BOT] Exited with code: ${code}`));
			ensureDependencies();
			setTimeout(() => {
				start()
			}, 3000);
		} else {
			console.log(chalk.green.bold('[BOT] Process exited cleanly. Goodbye!'))
			process.exit(0)
		}
	})
}
start()