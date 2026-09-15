import '../settings.js';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';
import { getUmaQuote } from './helperquotes.js';

const oguriMenuThumb = fs.readFileSync('./src/media/ogurimenu.jpeg');
const oguriCapAudio = fs.readFileSync('./src/media/oguricap.mp3');
const __filename = fileURLToPath(import.meta.url);

function getTopMenu(db, prefix, setv) {
  let total = Object.entries(db.hit || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.min(7, Object.keys(db.hit || {}).length))
    .filter(([command]) => command !== 'totalcmd' && command !== 'todaycmd')
    .slice(0, 5);

  let text = `╭──❍「 *TOP MENU* 」❍\n`;

  if (total.length >= 5) {
    total.forEach(([command, hit]) => {
      text += `│${setv} ${prefix}${command}: ${hit} hits\n`;
    });
    text += '╰──────❍';
  } else {
    text += `│${setv} ${prefix}ai
│${setv} ${prefix}brat
│${setv} ${prefix}tiktok
│${setv} ${prefix}cekmati
│${setv} ${prefix}susunkata
╰──────❍`;
  }

  return text;
}

function getMenuSections(prefix) {
  return [
    {
      title: '🌟 SEMUA FITUR (ALL MENU)',
      rows: [
        {
          header: '📚',
          title: 'All Menu',
          description: 'Tampilkan seluruh daftar perintah & fitur bot lengkap',
          id: `${prefix}allmenu`
        }
      ]
    },
    {
      title: '🤖 SISTEM & UTILITAS',
      rows: [
        {
          header: '⚡',
          title: 'Bot Menu',
          description: 'Status bot, ping, speed & informasi sistem',
          id: `${prefix}botmenu`
        },
        {
          header: '🛠️',
          title: 'Tools Menu',
          description: 'Alat utilitas, konversi, kalkulator, HD gambar, dll',
          id: `${prefix}toolsmenu`
        },
        {
          header: '🔎',
          title: 'Search Menu',
          description: 'Pencarian internet, gambar, lirik & fakta',
          id: `${prefix}searchmenu`
        },
        {
          header: '🧠',
          title: 'AI Menu',
          description: 'Gemini AI, Grok, Claude & chatbot cerdas',
          id: `${prefix}aimenu`
        }
      ]
    },
    {
      title: '👥 GRUP & SOSIAL',
      rows: [
        {
          header: '👥',
          title: 'Group Menu',
          description: 'Administrasi grup, antilink, welcome, setting',
          id: `${prefix}groupmenu`
        },
        {
          header: '🕵️',
          title: 'Stalker Menu',
          description: 'Pengecekan profil medsos & e-wallet',
          id: `${prefix}stalkermenu`
        },
        {
          header: '💬',
          title: 'Quotes Menu',
          description: 'Kutipan kata mutiara, motivasi & anime quotes',
          id: `${prefix}quotesmenu`
        },
        {
          header: '🕌',
          title: 'Jadwal Sholat',
          description: 'Jadwal sholat otomatis & adzan di grup',
          id: `${prefix}sholat`
        }
      ]
    },
    {
      title: '📥 MEDIA & DOWNLOADER',
      rows: [
        {
          header: '⬇️',
          title: 'Download Menu',
          description: 'Download video TikTok, YouTube, IG, FB, dll',
          id: `${prefix}downloadmenu`
        },
        {
          header: '🌸',
          title: 'Anime Menu',
          description: 'Info anime, waifu, wallpaper & manga',
          id: `${prefix}animemenu`
        }
      ]
    },
    {
      title: '🎮 HIBURAN & GAMES',
      rows: [
        {
          header: '🎮',
          title: 'Game Menu',
          description: 'Mini games seru, tebak-tebakan, RPG, kuis',
          id: `${prefix}gamemenu`
        },
        {
          header: '😂',
          title: 'Fun Menu',
          description: 'Fitur seru, jokes, cek kecocokan & hiburan',
          id: `${prefix}funmenu`
        },
        {
          header: '🎁',
          title: 'Random Menu',
          description: 'Fakta unik, cerita acak & generator teks',
          id: `${prefix}randommenu`
        }
      ]
    },
    {
      title: '🏆 TRACEN ACADEMY & OWNER',
      rows: [
        {
          header: '🏇',
          title: 'Tracen Menu',
          description: 'Fitur spesial Uma Musume Pretty Derby',
          id: `${prefix}tracenmenu`
        },
        {
          header: '👑',
          title: 'Owner Menu',
          description: 'Menu kontrol khusus Trainer / Owner bot',
          id: `${prefix}ownermenu`
        }
      ]
    }
  ];
}

function getMenuRows(prefix) {
  return getMenuSections(prefix).flatMap(section => section.rows);
}

function getNativeMenuButton(prefix) {
  const sections = getMenuSections(prefix);
  const params = {
    title: 'TRACEN MENU',
    sections: sections
  };

  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify(params),
    buttonId: 'tracen_menu',
    buttonText: {
      displayText: 'TRACEN MENU'
    },
    nativeFlowInfo: {
      name: 'single_select',
      paramsJson: JSON.stringify(params)
    },
    type: 2
  };
}

async function setTemplateMenu(
  naze,
  type,
  m,
  prefix,
  setv,
  db,
  options = {}
) {
  const uma = getUmaQuote();
  const text = getTopMenu(db, prefix, setv);

  const senderNumber = m.sender.split('@')[0];
  const ownerNumber = String(global.owner?.[0] || owner?.[0] || '').replace(/[^0-9]/g, '');
  const botName = db?.set?.[options.botNumber]?.botname || global.botname || 'Oguri Cap';
  const prefixDisplay = db?.set?.[options.botNumber]?.multiprefix
    ? '「 MULTI-PREFIX 」'
    : `*${prefix}*`;
  const userStatus = options.isVip ? 'VIP' : options.isPremium ? 'PREMIUM' : 'FREE';
  const userLimit = options.isVip ? 'UNLIMITED (VIP)' : (db.users?.[m.sender]?.limit ?? 0);
  const userCarats = db.users?.[m.sender]?.money?.toLocaleString('id-ID') || '0';

  const menunya = `
╭──「 *TRAINER STATUS* 」
├ 👤 *Nama* : ${m.pushName || 'Tanpa Nama'}
├ 🆔 *Id* : @${senderNumber}
├ ⭐ *Status* : ${userStatus}
├ 🎫 *Limit* : ${userLimit}
├ 💎 *Carats* : ${userCarats}
╰─┬────────❍
╭─┴─「 *OGURI SYSTEM* 」
├ 🏇 *Nama Bot* : ${botName}
${options.locale_day ? `├ 📅 *Hari* : ${options.locale_day}\n` : ''}${options.date ? `├ 📆 *Tanggal* : ${options.date}\n` : ''}${options.date_time ? `├ ⏰ *Waktu* : ${options.date_time}\n` : ''}├ 📱 *Powered* : @0
├ 🎓 *Trainer* : @${ownerNumber}
├ 🌙 *Mode* : ${naze.public ? 'Public' : 'Self'}
├ ⌨️ *Prefix* : ${prefixDisplay}
╰─┬────────❍
╭─┴─📒「 *UMA TALK* 」📒
💬 ${uma.name}
"${uma.quote}"
╰──────────❍
`;

  // Standard menu buttons list with TRACEN MENU single_select (Sairidev NativeFlow)
  const menuButtons = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '📚 All Menu',
        id: `${prefix}allmenu`
      }),
      buttonId: `${prefix}allmenu`,
      buttonText: {
        displayText: '📚 All Menu'
      },
      type: 1
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '👑 Owner',
        id: `${prefix}owner`
      }),
      buttonId: `${prefix}owner`,
      buttonText: {
        displayText: '👑 Owner'
      },
      type: 1
    },
    getNativeMenuButton(prefix)
  ];

  // ==========================================
  // .menu & .menubutton (NYATU: THUMBNAIL + TEKS + BUTTON DALAM 1 PESAN)
  // ==========================================
  if (
    type === 'menu' ||
    type === 'menubutton' ||
    type === 1 ||
    type === 'buttonMessage' ||
    type === 2 ||
    type === 'listMessage'
  ) {
    const fullCaption =
      `🌸 Halo @${senderNumber}\n\n` +
      menunya +
      '\n' +
      text +
      `\n\n💡 *Tekan tombol TRACEN MENU di bawah untuk membuka daftar kategori menu lengkap:*`;

    const menuFooter = options.ucapanWaktu
      ? `✨ ${options.ucapanWaktu} • OguriCap MD`
      : 'Tracen Academy Navigation • OguriCap MD';

    const mentionsList = [
      m.sender,
      '0@s.whatsapp.net',
      `${ownerNumber}@s.whatsapp.net`
    ];

    try {
      // Kirim 1 PESAN TUNGGAL: Thumbnail (Header) + Teks (Body) + Button (NativeFlow)
      await naze.sendButtonMsg(
        m.chat,
        {
          image: oguriMenuThumb,
          text: fullCaption,
          caption: fullCaption,
          footer: menuFooter,
          mentions: mentionsList,
          buttons: menuButtons
        },
        { quoted: m }
      );
    } catch (btnErr) {
      console.error('[MENU] Gagal mengirim menu interaktif nyatu, fallback ke sendMessage biasa:', btnErr);
      // Fallback jika pengiriman pesan interaktif gagal
      await naze.sendMessage(
        m.chat,
        {
          image: oguriMenuThumb,
          caption: fullCaption,
          mentions: mentionsList
        },
        { quoted: m }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Kirim audio sambutan Oguri Cap
    try {
      await naze.sendMessage(
        m.chat,
        {
          audio: oguriCapAudio,
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      );
    } catch (audioErr) {
      console.error('[MENU] Gagal mengirim audio:', audioErr);
    }

    return;
  }

  // ==========================================
  // FALLBACK
  // ==========================================
  m.reply(
    `${options.ucapanWaktu || ''} @${senderNumber}\n` +
    `Silahkan gunakan ${prefix}menu atau ${prefix}menubutton`
  );
}

export default setTemplateMenu;

fs.watchFile(__filename, async () => {
  fs.unwatchFile(__filename);
  console.log(chalk.yellowBright(`[UPDATE] ${__filename}`));
  await import(`${import.meta.url}?update=${Date.now()}`);
});