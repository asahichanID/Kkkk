import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { createCanvas } from '@napi-rs/canvas'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, '../database/tebakbom.json')
const SECRET_KEY = 'OGURI_TEBAK_BOM_SECRET_SALT_2026'

// Inisialisasi data storage lokal aman
let data = {
	leaderboard: {}, // { [jid]: { id: jid, name: string, score: number, lastUpdated: number } }
	claimedCodes: {}, // { [code]: { jid: string, score: number, claimedAt: number } }
	activeCodes: {} // { [code]: { score: number, createdAt: number, expiresAt: number, used: boolean } }
}

function loadDB() {
	try {
		if (fs.existsSync(DB_FILE)) {
			const raw = fs.readFileSync(DB_FILE, 'utf8')
			const parsed = JSON.parse(raw)
			data = {
				leaderboard: parsed.leaderboard || {},
				claimedCodes: parsed.claimedCodes || {},
				activeCodes: parsed.activeCodes || {}
			}
		} else {
			saveDB()
		}
	} catch (e) {
		console.error('[TEBAKBOM] Error load DB:', e.message)
	}
}

function saveDB() {
	try {
		const dir = path.dirname(DB_FILE)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
		fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
	} catch (e) {
		console.error('[TEBAKBOM] Error save DB:', e.message)
	}
}

loadDB()

/**
 * Menghasilkan kode claim yang memiliki signature anti-cheat
 */
export function generateClaimCode(score) {
	const sanitizedScore = Math.max(10, Math.floor(Number(score) || 0))
	const randomNonce = crypto.randomBytes(3).toString('hex').toUpperCase()
	const timestamp = Math.floor(Date.now() / 1000)
	
	// Hash checksum skor + nonce + secret
	const payload = `${sanitizedScore}-${randomNonce}-${timestamp}`
	const hash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex').slice(0, 4).toUpperCase()
	
	const code = `TB-${sanitizedScore}-${randomNonce}${hash}`
	
	// Simpan juga ke cache active codes selama 24 jam
	data.activeCodes[code] = {
		score: sanitizedScore,
		createdAt: Date.now(),
		expiresAt: Date.now() + 24 * 60 * 60 * 1000,
		used: false
	}
	saveDB()
	
	return {
		code,
		score: sanitizedScore
	}
}

/**
 * Verifikasi dan klaim kode reward
 */
export function verifyAndClaimCode(codeStr, jid, userName = 'Player') {
	if (!codeStr || typeof codeStr !== 'string') {
		return { success: false, message: 'Format kode tidak valid.' }
	}

	const cleanCode = codeStr.trim().toUpperCase()

	// Cek apakah sudah pernah diklaim
	if (data.claimedCodes[cleanCode]) {
		return {
			success: false,
			message: `Kode *${cleanCode}* sudah pernah diklaim sebelumnya oleh @${data.claimedCodes[cleanCode].jid.split('@')[0]}!`
		}
	}

	// Cek apakah ada di active codes
	let scoreToAward = 0
	if (data.activeCodes[cleanCode]) {
		const record = data.activeCodes[cleanCode]
		if (record.used) {
			return { success: false, message: `Kode *${cleanCode}* sudah digunakan!` }
		}
		if (Date.now() > record.expiresAt) {
			return { success: false, message: `Kode *${cleanCode}* telah kedaluwarsa!` }
		}
		scoreToAward = record.score
		record.used = true
	} else {
		// Verifikasi dengan format regex TB-<SCORE>-<NONCE><HASH>
		const match = cleanCode.match(/^TB-(\d+)-([A-F0-9]{6})([A-F0-9]{4})$/)
		if (!match) {
			return { success: false, message: 'Kode tidak valid atau format salah! Contoh: *TB-500-A1B2C3D4*' }
		}
		const [ , scoreStr, , ] = match
		scoreToAward = parseInt(scoreStr, 10)
		if (isNaN(scoreToAward) || scoreToAward <= 0) {
			return { success: false, message: 'Nilai skor pada kode tidak valid!' }
		}
	}

	// Catat claim
	data.claimedCodes[cleanCode] = {
		jid,
		score: scoreToAward,
		claimedAt: Date.now()
	}

	// Update Leaderboard Nyata
	if (!data.leaderboard[jid]) {
		data.leaderboard[jid] = {
			id: jid,
			name: userName,
			score: 0,
			gamesCount: 0,
			lastUpdated: Date.now()
		}
	}

	data.leaderboard[jid].score += scoreToAward
	data.leaderboard[jid].gamesCount = (data.leaderboard[jid].gamesCount || 0) + 1
	data.leaderboard[jid].name = userName || data.leaderboard[jid].name
	data.leaderboard[jid].lastUpdated = Date.now()

	saveDB()

	// Hitung posisi ranking user
	const sorted = getTopLeaderboard(100)
	const rankIndex = sorted.findIndex(u => u.id === jid)
	const currentRank = rankIndex !== -1 ? rankIndex + 1 : sorted.length

	return {
		success: true,
		score: scoreToAward,
		totalScore: data.leaderboard[jid].score,
		rank: currentRank,
		code: cleanCode
	}
}

/**
 * Mengambil daftar leaderboard teratas
 */
export function getTopLeaderboard(limit = 10) {
	loadDB()
	const list = Object.values(data.leaderboard || {})
	list.sort((a, b) => (b.score || 0) - (a.score || 0))
	return list.slice(0, limit)
}

/**
 * Generate Visual Canvas Leaderboard Tebak Bom (Top 10 / Sesuai jumlah pemain yang ada)
 */
export async function renderLeaderboardCanvas() {
	const players = getTopLeaderboard(10)

	// Hitung tinggi canvas dinamis (agar rapi jika 0, 1, 3, atau 10 pemain)
	const rowHeight = 72
	const headerHeight = 180
	const footerHeight = 60
	const totalHeight = players.length === 0 ? 300 : headerHeight + (players.length * rowHeight) + footerHeight
	const width = 800

	const canvas = createCanvas(width, totalHeight)
	const ctx = canvas.getContext('2d')

	// Background Gradient Mewah Cyber Dark
	const bgGradient = ctx.createLinearGradient(0, 0, width, totalHeight)
	bgGradient.addColorStop(0, '#0a0e1a')
	bgGradient.addColorStop(0.5, '#07152b')
	bgGradient.addColorStop(1, '#030814')
	ctx.fillStyle = bgGradient
	ctx.fillRect(0, 0, width, totalHeight)

	// Ambient Glow
	const glowGrad = ctx.createRadialGradient(width / 2, 90, 10, width / 2, 90, 300)
	glowGrad.addColorStop(0, 'rgba(0, 217, 255, 0.25)')
	glowGrad.addColorStop(0.5, 'rgba(255, 77, 77, 0.12)')
	glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
	ctx.fillStyle = glowGrad
	ctx.fillRect(0, 0, width, 300)

	// Outer Border Neon
	ctx.strokeStyle = 'rgba(0, 217, 255, 0.4)'
	ctx.lineWidth = 3
	ctx.strokeRect(8, 8, width - 16, totalHeight - 16)

	// Decorative Grid Lines
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
	ctx.lineWidth = 1
	for (let i = 40; i < width; i += 40) {
		ctx.beginPath()
		ctx.moveTo(i, 0)
		ctx.lineTo(i, totalHeight)
		ctx.stroke()
	}

	// Title Box
	ctx.save()
	ctx.textAlign = 'center'
	
	// Icon & Subtitle
	ctx.font = 'bold 15px sans-serif'
	ctx.fillStyle = '#ff4757'
	ctx.fillText('💣 DANGEROUS CARD MINESWEEPER 💣', width / 2, 50)

	// Main Title
	ctx.font = '900 36px sans-serif'
	ctx.fillStyle = '#00d9ff'
	ctx.shadowColor = 'rgba(0, 217, 255, 0.8)'
	ctx.shadowBlur = 16
	ctx.fillText('TEBAK BOM LEADERBOARD', width / 2, 95)
	ctx.shadowBlur = 0

	// Tagline
	ctx.font = '600 14px sans-serif'
	ctx.fillStyle = '#94a3b8'
	ctx.fillText('Top Survivors & Score Collectors', width / 2, 130)
	ctx.restore()

	// Garis Pemisah Header
	const lineGrad = ctx.createLinearGradient(60, 0, width - 60, 0)
	lineGrad.addColorStop(0, 'rgba(0, 217, 255, 0)')
	lineGrad.addColorStop(0.5, 'rgba(0, 217, 255, 0.8)')
	lineGrad.addColorStop(1, 'rgba(0, 217, 255, 0)')
	ctx.strokeStyle = lineGrad
	ctx.lineWidth = 2
	ctx.beginPath()
	ctx.moveTo(60, 155)
	ctx.lineTo(width - 60, 155)
	ctx.stroke()

	// Jika belum ada pemain
	if (players.length === 0) {
		ctx.save()
		ctx.textAlign = 'center'
		ctx.font = 'italic 18px sans-serif'
		ctx.fillStyle = '#64748b'
		ctx.fillText('Belum ada pemain di leaderboard. Jadilah yang pertama dengan main .tebakbom!', width / 2, 230)
		ctx.restore()
	} else {
		// Render Setiap Baris Pemain
		let startY = 175

		players.forEach((player, idx) => {
			const rowY = startY + (idx * rowHeight)
			const rank = idx + 1

			// Box background per baris
			let rowBg = 'rgba(15, 23, 42, 0.65)'
			let borderClr = 'rgba(255, 255, 255, 0.08)'
			let rankColor = '#94a3b8'
			let badgeText = `#${rank}`

			if (rank === 1) {
				rowBg = 'rgba(234, 179, 8, 0.12)'
				borderClr = 'rgba(234, 179, 8, 0.6)'
				rankColor = '#fbbf24'
				badgeText = '👑 1ST'
			} else if (rank === 2) {
				rowBg = 'rgba(148, 163, 184, 0.12)'
				borderClr = 'rgba(203, 213, 225, 0.5)'
				rankColor = '#e2e8f0'
				badgeText = '🥈 2ND'
			} else if (rank === 3) {
				rowBg = 'rgba(217, 119, 6, 0.12)'
				borderClr = 'rgba(245, 158, 11, 0.5)'
				rankColor = '#f59e0b'
				badgeText = '🥉 3RD'
			}

			// Draw Row Box
			ctx.fillStyle = rowBg
			ctx.strokeStyle = borderClr
			ctx.lineWidth = 1.5
			ctx.beginPath()
			ctx.roundRect(40, rowY, width - 80, 58, 10)
			ctx.fill()
			ctx.stroke()

			// Draw Rank Badge Box
			ctx.fillStyle = rank === 1 ? '#eab308' : (rank === 2 ? '#94a3b8' : (rank === 3 ? '#d97706' : 'rgba(30, 41, 59, 0.8)'))
			ctx.beginPath()
			ctx.roundRect(52, rowY + 9, 68, 40, 8)
			ctx.fill()

			// Badge Text
			ctx.save()
			ctx.font = 'bold 14px sans-serif'
			ctx.fillStyle = rank <= 3 ? '#0f172a' : rankColor
			ctx.textAlign = 'center'
			ctx.fillText(badgeText, 86, rowY + 34)
			ctx.restore()

			// Player Name & Number
			const cleanPhone = player.id.split('@')[0]
			const displayName = (player.name && player.name !== 'Player' && player.name !== cleanPhone) 
				? `${player.name} (${cleanPhone})` 
				: `User @${cleanPhone}`

			ctx.save()
			ctx.font = 'bold 17px sans-serif'
			ctx.fillStyle = rank === 1 ? '#fef08a' : '#f8fafc'
			ctx.textAlign = 'left'
			// Batasi panjang teks nama
			const maxNameWidth = 380
			let truncatedName = displayName
			while (ctx.measureText(truncatedName).width > maxNameWidth && truncatedName.length > 5) {
				truncatedName = truncatedName.slice(0, -4) + '...'
			}
			ctx.fillText(truncatedName, 136, rowY + 35)
			ctx.restore()

			// Player Score Box (Kanan)
			ctx.save()
			ctx.textAlign = 'right'
			
			// Score Value
			ctx.font = '900 22px sans-serif'
			ctx.fillStyle = '#00d9ff'
			ctx.shadowColor = 'rgba(0, 217, 255, 0.6)'
			ctx.shadowBlur = 8
			ctx.fillText(`${Number(player.score || 0).toLocaleString('id-ID')} PTS`, width - 60, rowY + 36)
			ctx.restore()
		})
	}

	// Footer Info
	ctx.save()
	ctx.textAlign = 'center'
	ctx.font = '12px sans-serif'
	ctx.fillStyle = '#64748b'
	ctx.fillText('Mainkan .tebakbom dan klaim skormu dengan .claimr <kode> untuk masuk ke peringkat!', width / 2, totalHeight - 24)
	ctx.restore()

	return canvas.toBuffer('image/png')
}
