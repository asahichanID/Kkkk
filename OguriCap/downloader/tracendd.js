import { pickRandom, getUmaQuote } from '../lib/helperquotes.js'
import { getYtmp4Thumb } from '../lib/mediahelper.js'

import {
  apiYoutubeDownload,
  apiTiktokDownload,
  apiTiktokScrapDownload,
  apiSpotifySearch,
  apiSpotifyDownload,
  apiInstagramDownload
} from '../apiGlobal/index.js'
// ==============================================
// YTMP3 - Unduh Audio YouTube
// ==============================================
export const ytmp3 = async (naze, m, text) => {
  if (!text) {
    return m.reply(
`Contoh:
.ytmp3 https://youtu.be/xxxx`
    )
  }

  m.react('⏳')

  try {
    const { result } = await apiYoutubeDownload(text, 'mp3')

    if (!result?.download) {
      return m.reply('❌ Audio tidak ditemukan')
    }

    await naze.sendMessage(m.chat, {
      audio: { url: result.download },
      mimetype: 'audio/mpeg',
      fileName: `${result.title || 'audio'}.mp3`
    }, { quoted: m })

    console.log('🎧 YTMP3')
  } catch (err) {
    console.log('❌ YTMP3')
    console.log(err)
    return m.reply('❌ Gagal mengunduh audio')
  }
}

console.log('🎧 YTMP3 LOADED')


// ==============================================
// YTMP4 - Unduh Video YouTube
// ==============================================
const ytmp4Session = {}
export const ytmp4 = async (naze, m, text, isPremium = false) => {

  const qualityList = [
    '360',
    '480',
    '720',
    '1080',
    '1440',
    '2k',
    '4k',
    '8k'
  ]

  const premiumQuality = [
    '1440',
    '2k',
    '4k',
    '8k'
  ]

  // ====================
  // MODE BALAS KUALITAS
  // ====================
  if (!text && m.quoted) {
    const session = ytmp4Session[m.sender]
    if (session && m.quoted.text?.includes('𝐏𝐈𝐋𝐈𝐇 𝐐𝐔𝐀𝐋𝐈𝐓𝐘')) {
      text = `${session.url} ${m.text}`
    }
  }

  if (!text) {
    return m.reply(
`Contoh:
.ytmp4 https://youtu.be/xxxx
Atau
.ytmp4 link 720`
    )
  }

  const args = text.trim().split(/\s+/)
  let url = args[0]
  const quality = (args[1] || '').toLowerCase()

  // ====================
  // NORMALISASI TAUTAN
  // ====================
  if (url.includes('/shorts/')) {
    const id = url.match(/shorts\/([^?&]+)/i)
    if (id) url = `https://www.youtube.com/watch?v=${id[1]}`
  }

  if (url.includes('youtu.be/')) {
    const id = url.match(/youtu\.be\/([^?&]+)/i)
    if (id) url = `https://www.youtube.com/watch?v=${id[1]}`
  }

  // ====================
  // PENENTUAN KUALITAS
  // ====================
  if (!quality) {
    ytmp4Session[m.sender] = { url }

    const ytmp4Thumb = getYtmp4Thumb() ?? ''
    
return naze.sendListMsg(m.chat, {
  title: '',
  image: { url: ytmp4Thumb },
  text: `╭─❖「🎥 𝐓𝐑𝐀𝐂𝐄𝐍 𝐕𝐈𝐃𝐄𝐎 」
│
├ 🔗 Video
│ ❍ ${url}
│
├ 📺 Quality
│ ❍ 8 pilihan tersedia
│
├ 🚄 Status
│ ❍ Menunggu pilihan...
│
╰─────────────❖`,

  footer: 'Tracen Video Stage',
  buttons: [{
    name: 'single_select',
    buttonParamsJson: {
      title: '📺 Pilih Quality',
      sections: [{
        title: '🎥 Daftar Resolusi',
        rows: qualityList.map(q => ({
          header: '🎬',
          title: ['2k','4k','8k'].includes(q)
          ? q.toUpperCase()
          : `${q}p`,
            description: premiumQuality.includes(q)
              ? `💎 Premium • ${q.toUpperCase()}`
              : `Download ${q}p`,
          id: `.ytmp4 ${url} ${q}`
        }))
      }]
    }
  }]
}, { quoted: m })

  }

  if (!qualityList.includes(quality)) {
    return m.reply('❌ Quality hanya 360, 480, 720, 1080')
  }
  if (premiumQuality.includes(quality) && !isPremium) {
  return m.reply(
`💎 𝐓𝐑𝐀𝐂𝐄𝐍 𝐏𝐑𝐄𝐌𝐈𝐔𝐌

Resolusi *${quality.toUpperCase()}* hanya tersedia
untuk Trainer Premium.

📺 Free
• 360p
• 480p
• 720p
• 1080p

✨ Premium
• 1440p
• 2K
• 4K
• 8K`)
}

  m.react('⏳')

  try {
    const uma = getUmaQuote()

    let result
    try {
      const res = await apiYoutubeDownload(url, quality)
      result = res.result
    } catch {
      return m.reply('❌ API gagal dihubungi')
    }

    if (!result?.download) {
      return m.reply('❌ Video tidak ditemukan')
    }

    const title = result.title || 'YouTube Video'
    const channel = result.author || '-'
    const views = result.views || 0
    const released = result.ago || '-'

    // ✅ CAPTION DIPERTAHANKAN PERSIS
    const caption =
`╭─❖「 🎥 𝐓𝐑𝐀𝐂𝐄𝐍 𝐕𝐈𝐃𝐄𝐎 𝐒𝐓𝐀𝐆𝐄 🌸 」
│
├ 🎬 Title
│ ❍ ${title}
│
├ 👒 Channel
│ ❍ ${channel}
│
├ 👀 Views
│ ❍ ${Number(views).toLocaleString('id-ID')}
│
├ 📺 Quality
│ ❍ ${['2k', '4k', '8k'].includes(quality) ? quality.toUpperCase() : `${quality}p`}
│
├ 📜 Released
│ ❍ ${released}
╰─────────────❖

💬 ${uma.name}
"${uma.quote}"`

    await naze.sendMessage(m.chat, {
      video: { url: result.download },
      fileName: `${title}.mp4`,
      caption
    }, { quoted: m })
    
    await m.react('✅')
    
    setTimeout(() => {
    delete ytmp4Session[m.sender]
    }, 300000)
    console.log('🎥 YTMP4')

  } catch (err) {
    console.log('❌ YTMP4')
    console.log(err)
    await m.react('❌')
    return m.reply('❌ Gagal mengirim video')
  }
}

console.log('🎥 YTMP4 V1.5 LOADED')

// ==============================================
// TIKTOK - Unduh Video TikTok
// ==============================================
export const tiktok = async (naze, m, text) => {
  if (!text)
    return m.reply(`Contoh:\n.tt https://vt.tiktok.com/xxxx`)

  try {
    m.react('⏳')

    const uma = getUmaQuote()
    const { result } = await apiTiktokScrapDownload(text, { withMetadata: true })
    
    if (!result)
      return m.reply('❌ Video tidak ditemukan')
   
    const images =
  result.images ||
  result.image ||
  result.photos ||
  result.photo ||
  result.download?.images ||
  result.download?.image ||
  []

const photoList = Array.isArray(images)
  ? images
      .map(v =>
        typeof v === 'string'
          ? v
          : v?.url ||
            v?.image ||
            v?.src
      )
      .filter(Boolean)
  : []

    const title =
      result.desc ||
      result.title ||
      result.caption ||
      'Tanpa Judul'

    const authorNickname = (result.author?.nickname || result.author?.name || '').trim()
    const authorUniqueId = (result.author?.uniqueId || result.author?.unique_id || '').replace(/^@/, '').trim()
    let authorName = '-'
    if (authorNickname && authorUniqueId) {
      if (authorNickname.toLowerCase() === authorUniqueId.toLowerCase()) {
        authorName = `@${authorUniqueId}`
      } else {
        authorName = `${authorNickname} (@${authorUniqueId})`
      }
    } else if (authorNickname) {
      authorName = authorNickname
    } else if (authorUniqueId) {
      authorName = `@${authorUniqueId}`
    }

    const parseStat = (val) => {
      if (val === undefined || val === null || val === '') return 0
      if (typeof val === 'number') return isNaN(val) ? 0 : val
      const str = String(val).trim()
      if (/^\d+$/.test(str)) return parseInt(str, 10)
      const match = str.match(/^([\d.,]+)\s*([kKmMbB])?$/)
      if (match) {
        let num = parseFloat(match[1].replace(/,/g, '.'))
        const unit = (match[2] || '').toUpperCase()
        if (unit === 'K') num *= 1000
        else if (unit === 'M') num *= 1000000
        else if (unit === 'B') num *= 1000000000
        return Math.round(num)
      }
      const parsed = parseFloat(str)
      return isNaN(parsed) ? 0 : parsed
    }

    const stats =
      result.stats ??
      result.statistics ??
      result.statistic ??
      result.statsV2 ??
      result.authorStats ??
      result ??
      {}

    const views = parseStat(
      stats.playCount ??
      stats.play_count ??
      stats.views ??
      stats.plays ??
      stats.play ??
      result.playCount ??
      result.views ??
      0
    )

    const likes = parseStat(
      stats.diggCount ??
      stats.digg_count ??
      stats.likes ??
      stats.like ??
      stats.heart ??
      stats.hearts ??
      result.diggCount ??
      result.likes ??
      0
    )

    const comments = parseStat(
      stats.commentCount ??
      stats.comment_count ??
      stats.comments ??
      stats.comment ??
      result.commentCount ??
      result.comments ??
      0
    )

    const shares = parseStat(
      stats.shareCount ??
      stats.share_count ??
      stats.shares ??
      stats.share ??
      result.shareCount ??
      result.shares ??
      0
    )

    const saved = parseStat(
      stats.collectCount ??
      stats.collect_count ??
      stats.saved ??
      stats.save ??
      stats.favorites ??
      stats.favorite ??
      stats.downloads ??
      stats.downloadCount ??
      result.collectCount ??
      result.saved ??
      0
    )

    const formatNumber = value => {
      const num = typeof value === 'number' ? value : parseStat(value)
      if (num <= 0) return '0'
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
      }
      return Number(num).toLocaleString('id-ID')
    }

    const videoUrl =
      result.download?.video?.nowm_hd ||
      result.download?.video?.nowm ||
      result.download?.video?.wm

    const isPhoto =
      photoList.length > 0

    if (!isPhoto && !videoUrl)
      return m.reply(
        '❌ Video tidak ditemukan'
      )

    const caption =
`🎬 *${title}*
👤 *Author:* ${authorName}

📊 *Statistik:*
• 👁️ Views: ${formatNumber(views)}
• ❤️ Likes: ${formatNumber(likes)}
• 💬 Comments: ${formatNumber(comments)}
• 🔄 Shares: ${formatNumber(shares)}
• ⭐ Saved: ${formatNumber(saved)}`

    if (isPhoto) {
      if (photoList.length === 1) {
        try {
          await naze.sendListMsg(
            m.chat,
            {
              text: caption,
              footer: `🛡️ Tiktok • ${global.botname}`,
              image: {
                url: photoList[0]
              },
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '🎵 Download Audio',
                    id: `.ttmp3 ${text}`
                  })
                }
              ]
            },
            {
              quoted: m
            }
          )
        } catch (e) {
          await naze.sendMessage(
            m.chat,
            {
              image: { url: photoList[0] },
              caption: `${caption}\n\n_Ketik *.ttmp3 ${text}* untuk unduh audio._`
            },
            { quoted: m }
          )
        }
      } else {
        await naze.sendCarouselMsg(
          m.chat,
          caption,
          `🛡️ Oguri Cap • ${global.botname}`,
          photoList.map((url, i) => ({
            url,
            body: `📸 Foto ${i + 1} / ${photoList.length}\n\n🎬 ${title}`,
            footer: global.botname,
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎵 Download Audio',
                  id: `.ttmp3 ${text}`
                })
              }
            ]
          })),
          {
            quoted: m
          }
        )
      }
    } else {
      try {
        await naze.sendListMsg(
          m.chat,
          {
            text: caption,
            footer: `🛡️ Oguri Cap • ${global.botname}`,
            video: {
              url: videoUrl
            },
            fileName: `${result.author?.nickname || 'tiktok'}.mp4`,
            mimetype: 'video/mp4',
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎵 Download Audio',
                  id: `.ttmp3 ${text}`
                })
              }
            ]
          },
          {
            quoted: m
          }
        )
      } catch (e) {
        await naze.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            caption: `${caption}\n\n_Ketik *.ttmp3 ${text}* untuk unduh audio._`,
            mimetype: 'video/mp4'
          },
          { quoted: m }
        )
      }
    }

    await m.react('✅')

    console.log({
      provider: 'TikTok',
      creator: authorName,
      photo: photoList.length,
      video: !!videoUrl,
      likes,
      comments,
      shares,
      views,
      saved
    })

    console.log('🎭 TikTok Success')

  } catch (err) {
    console.error('❌ TT →', err)

    await m.react('❌')

    m.reply('❌ Gagal mengunduh video TikTok')
  }
}

// ==============================================
// TTMP3 - Unduh Audio TikTok
// ==============================================
export const ttmp3 = async (naze, m, text) => {
  if (!text) {
    return m.reply(
`Contoh:
.ttmp3 https://vt.tiktok.com/xxxx`
    )
  }

  m.react('⏳')

  try {
    const { result } = await apiTiktokScrapDownload(text, { withMetadata: false })
    const audioUrl = result?.download?.music || result?.download?.audio || result?.music?.playUrl || result?.audio

    if (!audioUrl) {
      return m.reply('❌ Audio tidak ditemukan')
    }

    await naze.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${result?.download?.music_info?.title || result?.music?.title || 'TikTok Audio'}.mp3`
    }, { quoted: m })

    console.log('🎵 TTMP3')
  } catch (err) {
    console.log('❌ TTMP3')
    console.log(err)
    return m.reply('❌ Gagal mengirim audio')
  }
}

console.log('🎵 TTMP3 LOADED')

// ==============================================
// IG- Instagram Downloader 
// ==============================================
const MAX_LIST_MEDIA = 12
export const instagram = async (naze, m, text) => {
    if (!text) return m.reply('Contoh:\n.ig https://www.instagram.com/...')
    if (!/instagram\.com/i.test(text)) return m.reply('❌ URL Instagram tidak valid.')
        
    try {
        await m.react('⏳')
        const mulai = Date.now()
        const uma = getUmaQuote()
        const { result, provider } = await apiInstagramDownload(text)
        const medias = result?.urls || []

        if (!medias.length) return m.reply('❌ Postingan tidak tersedia atau privat!')
        const igCaption = result.caption || '-'
        const speed = Date.now() - mulai

        const caption =
`╭─❖「 📸 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 🌸 」
│
├ ✅ Download berhasil
├ 📦 ${medias.length} media
├ ⚡ ${provider || '-'} • ${speed}ms
╰─────────────❖

💬 ${uma.name}
"${uma.quote}"`

        const videos = medias.filter(v => v.is_video)
        const images = medias.filter(v => !v.is_video)

        // === 1 MEDIA SAJA ===
        if (medias.length === 1) {
            const media = medias[0]
            await naze.sendMessage(
                m.chat,
                media.is_video
                    ? { video: { url: media.url }, mimetype: 'video/mp4', caption }
                    : { image: { url: media.url }, caption },
                { quoted: m }
            )
        }

      // === SEMUA GAMBAR ===
        else if (!videos.length) {
            await naze.sendCarouselMsg(
                m.chat,
                caption,
                '🛡️ Oguri Cap Instagram',
                images
                    .slice(0, MAX_LIST_MEDIA)
                    .map((img, i) => ({
                        type: 'image',
                        url: img.url,
                        body: `📸 Foto ${i + 1}/${images.length}`,
                        footer: `Provider : ${provider || '-'}`,
                        buttons: []
                    })),
                { quoted: m }
            )
        }
        
        // === SEMUA VIDEO ===
        else if (!images.length) {
            await naze.sendCarouselMsg(
                m.chat,
                caption,
                '🛡️ Oguri Cap Instagram',
                videos
                    .slice(0, MAX_LIST_MEDIA)
                    .map((vid, i) => ({
                        type: 'video',
                        url: vid.url,
                        body: `🎥 Video ${i + 1}/${videos.length}`,
                        footer: `Provider : ${provider || '-'}`,
                        buttons: []
                    })),
                { quoted: m }
            )
        }

        // === CAMPURAN VIDEO + GAMBAR ===
        else {
            const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 15)
            global.instagramSession ??= new Map()
            global.instagramSession.set(sessionId, {
                provider,
                caption,
                videos,
                images,
                created: Date.now()
            })

            const rowsVideo = [
            {
                title: '🎥 Ambil Semua Video',
                description: `${videos.length} Video`,
                id: `.igvideoall ${sessionId}`
            },
            ...videos.slice(0, MAX_LIST_MEDIA).map((v, i) => ({
                title: `🎥 Video ${i + 1}`,
                description: 'Kirim video ini',
                id: `.igvideo ${sessionId} ${i}`
            }))
        ]
        
        if (videos.length > MAX_LIST_MEDIA) {
            rowsVideo.push({
                title: '➡️ Lihat Selengkapnya',
                description: `${videos.length - MAX_LIST_MEDIA} video lainnya`,
                id: `.igvideolist ${sessionId} ${MAX_LIST_MEDIA}`
            })
        }
        
        const rowsImage = [
            {
                title: '🖼️ Ambil Semua Gambar',
                description: `${images.length} Gambar`,
                id: `.igimageall ${sessionId}`
            },
            ...images.slice(0, MAX_LIST_MEDIA).map((v, i) => ({
                title: `🖼️ Gambar ${i + 1}`,
                description: 'Kirim gambar ini',
                id: `.igimage ${sessionId} ${i}`
            }))
        ]
        
        if (images.length > MAX_LIST_MEDIA) {
            rowsImage.push({
                title: '➡️ Lihat Selengkapnya',
                description: `${images.length - MAX_LIST_MEDIA} gambar lainnya`,
                id: `.igimagelist ${sessionId} ${MAX_LIST_MEDIA}`
            })
        }
        
            await naze.sendListMsg(
                m.chat,
                {
                    title: '📸 Instagram Downloader',
                    text: caption,
                    footer: '🛡️ Oguri Cap Instagram',
                    buttonText: '📂 Pilih Media',
                    sections: [
                        { title: `🎥 Video (${videos.length})`, rows: rowsVideo },
                        { title: `🖼️ Gambar (${images.length})`, rows: rowsImage }
                    ]
                },
                { quoted: m }
            )
        }

        await m.react('✅')
        console.log(`📸 IG OK (${provider})`)
    } catch (error) {
        console.error('❌ IG →', error)
        await m.react('❌')
        m.reply(global.mess.fail)
    }
}

// ============================================================
// ✅ FUNGSI UTAMA PENCARIAN SPOTIFY — DIPANGGIL OLEH NAZE
// ============================================================
export const cariSpotify = async (conn, m, text) => {
  if (!text) return m.reply(`🎵 Contoh: .spotify yoasobi idol`)

  try {
    let hasilAkhir = []
    let sumberDipakai = ''

    try {
      const res = await apiSpotifySearch(text)
      hasilAkhir = res.result
      sumberDipakai = res.provider || ''
      console.log(`🎵 SPOTIFY: Berhasil lewat ${sumberDipakai}`)
    } catch {
      // Seluruh provider gagal / tidak menemukan hasil yang cukup —
      // pesan spesifik ini dipertahankan persis seperti sebelum migrasi.
      return m.reply('❌ Oguri tidak menemukan lagu tersebut! Coba ganti kata kunci ya~')
    }

    // Susun Tombol List
    console.log(hasilAkhir)
    console.log(hasilAkhir[0])
    const rows = hasilAkhir.map((lagu, urut) => {
    const title =
        String(
            lagu.title ??
            lagu.name ??
            lagu.track ??
            lagu.song ??
            'Tanpa Judul'
        ).trim()

    const info =
    String(
        lagu.artist ??
        lagu.artists?.map(v => v.name).join(', ') ??
        lagu.artists?.[0]?.name ??
        lagu.author ??
        lagu.uploader ??
        lagu.channel ??
        lagu.channelTitle ??
        lagu.duration ??
        lagu.duration_ms ??
        'Tidak diketahui'
    ).trim()

    const url =
        lagu.url ??
        lagu.link ??
        lagu.uri ??
        ''
    
    return {
        header: `🎵 #${urut + 1}`,
        title: title.length > 40
            ? `${title.slice(0, 37)}...`
            : title,
        description: `${
            lagu.artist ||
            lagu.artists?.length ||
            lagu.author ||
            lagu.uploader ||
            lagu.channel ||
            lagu.channelTitle
                ? '🎤'
                : '⏱️'
        } ${
            info.length > 50
                ? `${info.slice(0, 47)}...`
                : info
        }`,
        id: `.spotify_pilih ${url}`
    }
})

    // Teks Tampilan Utama Tema Uma Musume
  const shortTitle = (title, max = 42) =>
  title?.length > max
    ? title.slice(0, max) + '…'
    : (title || '-')

const teks = [
  `🎶 𝗦𝗘𝗔𝗥𝗖𝗛 𝗦𝗣𝗢𝗧𝗜𝗙𝗬 — 𝗢𝗚𝗨𝗥𝗜 𝗖𝗔𝗣`,
  `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  `🔎 Pencarian : ${text}`,
  `📊 Ditemukan : ${hasilAkhir.length} lagu`,
  `📡 Provider    : ${sumberDipakai || 'Cadangan'}`,
  ``,
  `💡 Lagu #1 dikirim otomatis. Pilih nomor lain lewat tombol di bawah.`
].join('\n')

    const thumb = hasilAkhir[0]?.thumbnail || hasilAkhir[0]?.image || 'https://telegra.ph/file/95670d63378f7f4210f03.png'
    const linkLaguPertama = hasilAkhir[0]?.url || hasilAkhir[0]?.link || ''

    // Kirim Teks + Tombol Dulu
    await conn.sendListMsg(m.chat, {
      text: teks,
      image: { url: thumb },
      footer: `🛡️ Oguri Cap Music System • ${global.botname}`,
      buttons: [{
        name: 'single_select',
        buttonParamsJson: {
          title: '🎵 PILIH LAGU DISINI',
          sections: [{
            title: '📋 Hasil Pencarian',
            highlight_label: 'TERBARU',
            rows: rows
          }]
        }
      }]
    }, { quoted: m })

    // Kirim Audio Lagu Pertama Di Latar Belakang
    /*
    if (linkLaguPertama) {
      setTimeout(async () => {
        await unduhSpotify(conn, m, linkLaguPertama)
      }, 500)
    }
*/
  } catch (e) {
    console.error('💥 ERROR CARI SPOTIFY →', e)
    m.reply('❌ Maaf Oguri sedang kesulitan mengambil data~')
  }
}

// ============================================================
// ✅ FUNGSI PENGUNDUH & TAMPILKAN HASIL PILIHAN
// ============================================================
export const unduhSpotify = async (conn, m, urlLagu) => {
  try {
    const mulai = Date.now()

    let data
    let provider = 'Unknown'

    try {
      const res = await apiSpotifyDownload(urlLagu)
      data = res.result
      provider = res.provider || 'Unknown'
      console.log(`🎵 SPOTIFY DL: Berhasil lewat ${provider}`)
    } catch {
      return m.reply('❌ Oguri gagal mengambil audio lagu ini, coba lagi nanti ya~')
    }

    if (!data?.url) {
      return m.reply('❌ Oguri gagal mengambil audio lagu ini, coba lagi nanti ya~')
    }

      const meta = data.metadata || data

      const artist =
      meta.artist?.map(v => v.name).join(', ') ||
      meta.artists?.map(v => v.name).join(', ') ||
      'Masih Misteri'
  
    const duration = meta.duration_ms
      ? (() => {
          const sec = Math.floor(meta.duration_ms / 1000)
          const m = String(Math.floor(sec / 60)).padStart(2, '0')
          const s = String(sec % 60).padStart(2, '0')
          return `${m}:${s}`
        })()
      : 'Tidak tersedia'

    const speed = `${Date.now() - mulai}ms`

    const caption = [
    '🎵 *𝗦𝗣𝗢𝗧𝗜𝗙𝗬 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗*',
    '━━━━━━━━━━━━━━━━━━━━━━',
    `🎶 *Judul*`,
    `➜ ${meta.name || 'Tidak diketahui'}`,
    `🎤 *Artist*`,
    `➜ ${artist}`,
    `⏱️ *Durasi*`,
    `➜ ${duration}`,
    `📡 *Provider*`,
    `➜ ${provider} • ${speed}`,
    `🔗 *Source URL*`,
    `➜ ${meta.url || meta.external_urls?.spotify || urlLagu}`
].join('\n')

    // Thumbnail + Caption
    await conn.sendButtonMsg(
  m.chat,
  {
    image: {
      url: meta.album?.images?.[0]?.url || 'https://telegra.ph/file/95670d63378f7f4210f03.png'
    },
    text: caption,
    footer: `🎵 Spotify Downloader • ${global.botname}`,
    buttons: [
      {
        name: 'quick_reply',
        buttonParamsJson: {
          display_text: '🗿 Jangan Dipencet',
          id: '.iseng_spotify'
        }
      }
    ]
  },
  { quoted: m }
)


    // Audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.download || data.url },
        mimetype: 'audio/mpeg',
        fileName: `${meta.name || 'Spotify'}.mp3`,
        ptt: false
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('💥 ERROR UNDUH SPOTIFY →', e)
    m.reply('❌ Gagal mengunduh lagu, coba link lain ya~')
  }
}
