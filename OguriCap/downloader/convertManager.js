import fs from 'fs'
import os from 'os'
import path from 'path'
import axios from 'axios'
import crypto from 'crypto'
import { promisify } from 'util'
import { exec } from 'child_process'
import { getBuffer } from '../lib/function.js'

const execAsync = promisify(exec)

const CACHE_DIR = path.join(
    process.cwd(),
    'database',
    'cache',
    'mp3'
)

if (!fs.existsSync(CACHE_DIR))
    fs.mkdirSync(CACHE_DIR, {
        recursive: true
    })

const CACHE_TIME = 1000 * 60 * 30 

function detectExt(url = '') {

    const clean = url
        .split('?')[0]
        .toLowerCase()

    if (clean.endsWith('.mp3')) return 'mp3'
    if (clean.endsWith('.m4a')) return 'm4a'
    if (clean.endsWith('.aac')) return 'aac'
    if (clean.endsWith('.ogg')) return 'ogg'
    if (clean.endsWith('.webm')) return 'webm'
    if (clean.endsWith('.mov')) return 'mov'
    if (clean.endsWith('.mkv')) return 'mkv'

    return 'mp4'

}

function hash(url) {
    return crypto
        .createHash('md5')
        .update(url)
        .digest('hex')
}

function cleanupCache() {

    const now = Date.now()

    for (const file of fs.readdirSync(CACHE_DIR)) {

        const lokasi = path.join(
            CACHE_DIR,
            file
        )

        const stat = fs.statSync(lokasi)

        if (
            now - stat.mtimeMs >
            CACHE_TIME
        ) {

            fs.unlinkSync(lokasi)

        }

    }

}


// Bersihkan cache saat startup
cleanupCache()

// Bersihkan setiap 10 menit
const cacheTimer = setInterval(() => {
    try {
        cleanupCache()
    } catch (e) {
        console.error('❌ Cleanup MP3 Cache:', e)
    }
}, 10 * 60 * 1000)
if (typeof cacheTimer?.unref === 'function') {
    cacheTimer.unref()
}


export async function convertToMp3(
    url,
    filename = 'Audio.mp3'
) {
    const id = hash(url)
    const cacheFile = path.join(
        CACHE_DIR,
        `${id}.mp3`
    )

    if (fs.existsSync(cacheFile)) {
        return {
            buffer: fs.readFileSync(cacheFile),
            filename: filename.replace(/\.\w+$/i, '.mp3')
        }
    }

    const tmp = fs.mkdtempSync(
        path.join(os.tmpdir(), 'convert-')
    )

    const output = path.join(
        tmp,
        'output.mp3'
    )

    try {
        // Coba download buffer secara langsung dengan fast keep-alive stream
        try {
            const buffer = await getBuffer(url)
            if (buffer && Buffer.isBuffer(buffer) && buffer.length > 5000) {
                const isId3 = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33
                const isMp3Sync = buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0
                const isAac = buffer[0] === 0xFF && (buffer[1] & 0xF6) === 0xF0
                const isOgg = buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53
                const isM4a = buffer.subarray(4, 8).toString() === 'ftyp'
                const isAudioName = filename.toLowerCase().endsWith('.mp3') || filename.toLowerCase().endsWith('.m4a')

                // Jika sudah merupakan audio stream yang valid, kirim langsung tanpa re-encode
                if (isId3 || isMp3Sync || isAac || isOgg || isM4a || isAudioName) {
                    fs.writeFileSync(cacheFile, buffer)
                    return {
                        buffer,
                        filename: filename.replace(/\.\w+$/i, '.mp3')
                    }
                }
            }
        } catch (_) {
            /* Lanjut ke FFmpeg fallback */
        }

        // Jika memerlukan transcoding / stream kompleks, gunakan FFmpeg
        await execAsync(
            `ffmpeg -hide_banner -loglevel error -y \
-user_agent "Mozilla/5.0" \
-thread_queue_size 512 \
-fflags +discardcorrupt \
-i "${url}" \
-vn \
-c:a libmp3lame \
-b:a 128k \
"${output}"`
        )

        if (!fs.existsSync(output))
            throw new Error('FFmpeg gagal.')

        fs.copyFileSync(output, cacheFile)
        fs.unlinkSync(output)

        return {
            buffer: fs.readFileSync(cacheFile),
            filename: filename.replace(/\.\w+$/i, '.mp3')
        }

    } finally {
        try {
            if (fs.existsSync(tmp))
                fs.rmSync(tmp, {
                    recursive: true,
                    force: true
                })
        } catch {}
    }
}
/**
 * Convert Animated WebP Sticker menjadi MP4.
 *
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */

export async function convertWebpToMp4(inputData) {

    const tmp = fs.mkdtempSync(
        path.join(os.tmpdir(), 'webp-')
    )

    const input = path.join(tmp, 'input.webp')
    const output = path.join(tmp, 'output.mp4')

    try {

        if (Buffer.isBuffer(inputData)) {

            fs.writeFileSync(input, inputData)
            const cek = fs.readFileSync(input)

console.log({
    sama: Buffer.compare(cek, inputData) === 0,
    sizeInput: inputData.length,
    sizeFile: cek.length
})

        } else if (
            typeof inputData === 'string' &&
            fs.existsSync(inputData)
        ) {

            fs.copyFileSync(inputData, input)

        } else {

            throw new Error('Input harus Buffer atau path file.')

        }

        console.log({
            mime: 'image/webp',
            size: fs.statSync(input).size,
            header: fs.readFileSync(input).subarray(0,16).toString('hex')
        })

        try {

            const { stdout } = await execAsync(
                `file "${input}"`
            )

            console.log(stdout.trim())

        } catch {}

        await execAsync(
            `ffmpeg -hide_banner -loglevel error -y -i "${input}" -movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30" -c:v libx264 "${output}"`
        )

        if (!fs.existsSync(output))
            throw new Error('FFmpeg gagal membuat MP4.')

        return fs.readFileSync(output)

    } finally {

        try {
            fs.rmSync(tmp,{
                recursive:true,
                force:true
            })
        } catch {}

    }

}
export default {
    convertToMp3,
    convertWebpToMp4
}