export const profile = async (
  naze,
  m,
  db,
  premium,
  checkStatus
) => {
  try {
    let target;
    if (m.mentionedJid?.[0]) {
      target = m.mentionedJid[0];
    } else if (m.quoted) {
      target = m.quoted.sender;
    } else {
      target = m.sender;
    }

    const infoUser = db.users[target];
    if (!infoUser) return m.reply('❌ User tidak ditemukan.');

    const isOwner = (global.owner || [])
      .map(v => String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .includes(target) || m?.key?.fromMe;

    const isPremium = checkStatus ? checkStatus(target, premium) : false;

    let role = '👤 Member';
    if (isOwner) role = '👑 Bot Owner';
    else if (isPremium) role = '⭐ Premium User';
    else if (infoUser.vip) role = '💎 VIP User';

    const level = Math.floor(Math.sqrt((infoUser.exp || 0) / 100)) || 1;
    const name = infoUser.name || m.pushName || 'User';

    const caption = `╭─❖「 👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 👤 」
│
│ 🏷️ *Nama:* ${name}
│ 📱 *Tag:* @${target.split('@')[0]}
│ 🎖️ *Status:* ${role}
│ ⚡ *Level:* ${level}
│ 🔮 *EXP:* ${(infoUser.exp || 0).toLocaleString('id-ID')}
│ 💰 *Carats/Uang:* ${(infoUser.money || 0).toLocaleString('id-ID')}
│ 🎫 *Sisa Limit:* ${infoUser.limit ?? 0}
│
╰───────────────────────────❖`;

    return await naze.sendMessage(m.chat, {
      text: caption,
      mentions: [target]
    }, { quoted: m });
  } catch (err) {
    console.error('[PROFILE]', err);
    return m.reply('❌ Gagal memuat profil user.');
  }
};

export const leaderboard = async (naze, m, db, owner) => {
  try {
    let users = Object.entries(db.users || {})
      .map(([id, user]) => {
        const level = Math.floor(Math.sqrt((user.exp || 0) / 100)) || 1;
        return {
          id,
          money: user.money || 0,
          limit: user.limit || 0,
          level
        };
      })
      .sort((a, b) => b.money - a.money)
      .slice(0, 10);

    let teks = `╭─❖「 🏆 𝐓𝐎𝐏 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 🏆 」
│
│ 💰 *Top 10 Pengguna Terkaya*
│
`;

    for (let i = 0; i < users.length; i++) {
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
      let tag = `@${users[i].id.split('@')[0]}`;
      teks += `│ ${medal} *#${i + 1}* ${tag}\n`;
      teks += `│   💰 ${(users[i].money).toLocaleString('id-ID')} Carats | Level ${users[i].level}\n`;
    }

    teks += `│\n╰───────────────────────────❖`;

    return await naze.sendMessage(m.chat, {
      text: teks,
      mentions: users.map(u => u.id)
    }, { quoted: m });
  } catch (err) {
    console.error('[LEADERBOARD]', err);
    return m.reply('❌ Gagal memuat leaderboard.');
  }
};
