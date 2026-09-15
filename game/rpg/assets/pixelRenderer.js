/**
 * Pixel Renderer Script for RPG
 * Mengandung seluruh fungsi Procedural 16-Bit & 8-Bit Canvas Engine:
 * - 16-bit Character Sprites (Knight, Archer, Mage) dengan 4 arah, walk cycle, tebasan pedang, panah, bola sihir
 * - Transformasi Rubah (Ekor 4, 7, 11) lengkap dengan Telinga Rubah, Mata Menyala, Kumis, Aura Roh, Mandala Mahadewa, dan Ekor Fisika Dinamis (Swaying Tails)
 * - Efek Skill Rubah: Cakar Api (Ekor 4), Bola Roh Biru (Ekor 7), Bijuu Beam Kosmis (Ekor 11)
 * - Lingkungan 8-bit & 16-bit: Rumput berpola, jalan batu cobblestone, sungai berombak shimmer, pohon rimbun, rumah genteng, cerobong asap, lentera jalan, air mancur
 * - NPC 16-bit: Raja Mahkota Jubah Beludru, Alkemis Topi Sihir & Flask Berbusa, Pandai Besi Paron Berapi
 * - Monster 16-bit: Slime berdenyut, Goblin liar, Dark Knight Boss berapi ungu
 */

export const PIXEL_RENDERER_CODE = `
  /* ============ PROCEDURAL 16-BIT / 8-BIT PIXEL ENGINE ============ */

  // Helper untuk menggambar kotak pixel
  function px(c, x, y, w, h, col){
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // Helper lingkaran pixel
  function pxCirc(c, x, y, r, col){
    c.fillStyle = col;
    c.beginPath();
    c.arc(Math.round(x), Math.round(y), r, 0, Math.PI*2);
    c.fill();
  }

  /* 1. MENGGAMBAR KARAKTER 16-BIT */
  function render16BitCharacter(c, char, time){
    c.save();
    var x = char.x;
    var y = char.y;
    var f = char.facing || 'down';
    var isMoving = (keys.up || keys.down || keys.left || keys.right) && char.dodgeRollTimer <= 0;
    var walkCycle = isMoving ? Math.sin((char.walkFrame || 0) * 1.5) : 0;
    var bob = isMoving ? Math.abs(Math.sin((char.walkFrame || 0) * 3)) * 2 : Math.sin(time * 0.003) * 1;
    var cls = char.classType || 'knight';

    // 1.1 Bayangan di tanah
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath();
    c.ellipse(x, y + 15, 13, 5, 0, 0, Math.PI*2);
    c.fill();

    // 1.2 Efek Dodge Roll
    if(char.dodgeRollTimer > 0){
      c.translate(x, y);
      c.rotate((18 - char.dodgeRollTimer) * 0.4);
      c.fillStyle = '#38bdf8';
      c.beginPath(); c.arc(0, 0, 14, 0, Math.PI*2); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      // Trail angin
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.fillRect(-20, -3, 10, 6);
      c.restore();
      return;
    }

    // 1.3 Transformasi Rubah: EKOR FISIKA DINAMIS (Swaying Tails di belakang tubuh)
    if(char.foxActive && char.foxTier >= 4){
      renderFoxTails(c, x, y + 6 - bob, char.foxTier, f, time);
    }

    // 1.4 Kaki & Sepatu Boot 16-bit
    var lLegY = y + 8 + (walkCycle * 2.5);
    var rLegY = y + 8 - (walkCycle * 2.5);
    var bootCol = cls === 'knight' ? '#475569' : (cls === 'archer' ? '#78350f' : '#2e1065');
    var bootDark = cls === 'knight' ? '#1e293b' : (cls === 'archer' ? '#451a03' : '#0f051d');
    var bootHi = cls === 'knight' ? '#94a3b8' : (cls === 'archer' ? '#b45309' : '#581c87');

    if(f === 'left' || f === 'right'){
      var off = f === 'right' ? 1 : -1;
      px(c, x - 3 + off * 2, lLegY, 6, 7, bootCol);
      px(c, x - 3 + off * 2, lLegY + 5, 8 * off, 3, bootDark);
    } else {
      // Kaki Kiri
      px(c, x - 7, lLegY, 5, 7, bootCol);
      px(c, x - 8, lLegY + 5, 6, 3, bootDark);
      px(c, x - 7, lLegY + 2, 2, 2, bootHi);
      // Kaki Kanan
      px(c, x + 2, rLegY, 5, 7, bootCol);
      px(c, x + 2, rLegY + 5, 6, 3, bootDark);
      px(c, x + 3, rLegY + 2, 2, 2, bootHi);
    }

    // 1.5 Badan & Zirah 16-bit
    var by = y - 4 - bob;
    if(cls === 'knight'){
      // Plate Armor Perak
      px(c, x - 8, by, 16, 13, '#64748b'); // Plat utama
      px(c, x - 6, by + 1, 12, 11, '#94a3b8'); // Highlight dada
      px(c, x - 2, by + 2, 4, 9, '#f8fafc'); // Kilau baja
      px(c, x - 8, by + 10, 16, 3, '#d97706'); // Sabuk emas
      px(c, x - 2, by + 10, 4, 3, '#fef08a'); // Gesper sabuk
      // Pauldrons (Bahu)
      px(c, x - 11, by, 4, 6, '#475569');
      px(c, x + 7, by, 4, 6, '#475569');
    } else if(cls === 'archer'){
      // Tunic Hijau Rimba & Selempang Kulit
      px(c, x - 7, by, 14, 13, '#15803d');
      px(c, x - 5, by + 1, 10, 10, '#22c55e');
      px(c, x - 7, by + 2, 14, 3, '#78350f'); // Selempang busur
      px(c, x - 7, by + 10, 14, 3, '#451a03'); // Sabuk
    } else {
      // Jubah Penyihir Violet Runic
      px(c, x - 8, by, 16, 14, '#4c1d95');
      px(c, x - 6, by + 1, 12, 12, '#6d28d9');
      px(c, x - 1, by + 2, 2, 11, '#facc15'); // Garis rune emas tengah
      px(c, x - 8, by + 11, 16, 2, '#f59e0b');
    }

    // 1.6 Kepala, Wajah & Rambut
    var hy = y - 18 - bob;
    // Kulit wajah
    px(c, x - 6, hy + 3, 12, 9, '#fed7aa');
    px(c, x - 5, hy + 9, 10, 2, '#fba76a'); // Bayangan dagu

    // Mata ekspresif
    if(f !== 'up'){
      var eyeOffX = f === 'right' ? 2 : (f === 'left' ? -2 : 0);
      var eyeCol = char.foxActive ? (char.foxTier >= 11 ? '#ffd700' : (char.foxTier >= 7 ? '#00e5ff' : '#ea580c')) : '#0f172a';
      // Mata kiri
      px(c, x - 4 + eyeOffX, hy + 6, 2, 3, eyeCol);
      // Mata kanan
      px(c, x + 2 + eyeOffX, hy + 6, 2, 3, eyeCol);
      if(char.foxActive){
        // Slit pupil shine & whisker marks
        px(c, x - 5, hy + 8, 2, 1, '#f97316');
        px(c, x + 4, hy + 8, 2, 1, '#f97316');
      }
    }

    // Penutup Kepala / Rambut 16-bit
    if(cls === 'knight'){
      // Helm Ksatria Perak dengan Plume Merah
      px(c, x - 7, hy - 2, 14, 6, '#94a3b8');
      px(c, x - 8, hy + 2, 16, 3, '#475569');
      px(c, x - 2, hy - 6, 4, 5, '#ef4444'); // Plume bulu merah
      px(c, x - 1, hy - 8, 2, 3, '#f87171');
    } else if(cls === 'archer'){
      // Tudung Hijau & Bulu Emas
      px(c, x - 8, hy - 3, 16, 6, '#166534');
      px(c, x - 6, hy - 2, 12, 4, '#15803d');
      px(c, x + 4, hy - 6, 3, 5, '#facc15'); // Bulu elang
    } else {
      // Topi Penyihir Kerucut Ungu & Bintang Emas
      px(c, x - 9, hy + 1, 18, 3, '#3b0764');
      px(c, x - 6, hy - 4, 12, 6, '#581c87');
      px(c, x - 4, hy - 9, 8, 6, '#6b21a8');
      px(c, x - 2, hy - 13, 4, 5, '#7e22ce');
      px(c, x - 1, hy - 3, 2, 2, '#fde047'); // Bintang emas
    }

    // 1.7 Transformasi Rubah: Telinga Rubah Kembar di Kepala
    if(char.foxActive && char.foxTier >= 4){
      renderFoxEars(c, x, hy, char.foxTier, time);
    }

    // 1.8 Senjata & Animasi Ayunan 360 Derajat Mengikuti Arah Joystick
    renderCharacterWeapon(c, x, by, cls, f, char.attackTimer || 0, char.aimAngle);

    // 1.9 Transformasi Rubah: Mandala Surgawi di bawah kaki untuk Ekor 11
    if(char.foxActive && char.foxTier >= 11){
      renderDivineMandala(c, x, y + 14, time);
    }

    // 1.10 Panah Bidik Arah Joystick (Aim Direction Indicator)
    if(typeof char.aimAngle === 'number'){
      var aAng = char.aimAngle;
      var retDist = 26;
      var rx = x + Math.cos(aAng) * retDist;
      var ry = y + Math.sin(aAng) * retDist;
      c.save();
      c.translate(rx, ry);
      c.rotate(aAng);
      c.fillStyle = char.foxTier >= 11 ? 'rgba(255, 215, 0, 0.85)' : (char.foxTier >= 7 ? 'rgba(0, 229, 255, 0.85)' : (char.foxTier >= 4 ? 'rgba(249, 115, 22, 0.85)' : 'rgba(56, 189, 248, 0.85)'));
      c.beginPath();
      c.moveTo(5, 0);
      c.lineTo(-4, -4);
      c.lineTo(-1, 0);
      c.lineTo(-4, 4);
      c.closePath();
      c.fill();
      c.restore();
    }

    // 1.11 Pelindung Nama / Plat Status
    c.font = 'bold 9px sans-serif';
    c.textAlign = 'center';
    c.fillStyle = char.isOwner ? '#facc15' : '#ffffff';
    c.fillText((char.isOwner ? '👑 ' : '') + char.name, x, hy - 14);

    c.restore();
  }

  /* 2. TRANSFORMASI RUBAH: EKOR-EKOR FISIKA BERGAYANG (DYNAMIC SWAYING TAILS) */
  function renderFoxTails(c, x, y, tier, facing, time){
    var tailCount = tier >= 11 ? 11 : (tier >= 7 ? 7 : 4);
    var coreColor = tier >= 11 ? '#ffd700' : (tier >= 7 ? '#00e5ff' : '#f97316');
    var midColor  = tier >= 11 ? '#fef08a' : (tier >= 7 ? '#67e8f9' : '#fb923c');
    var tipColor  = tier >= 11 ? '#ffffff' : (tier >= 7 ? '#ecfeff' : '#fff7ed');

    for(var i=0; i<tailCount; i++){
      // Sudut menyebar kipas di belakang
      var spread = (i - (tailCount - 1) / 2) * (0.28);
      var waveSpeed = time * 0.005 + i * 0.7;
      var waveAngle = Math.sin(waveSpeed) * 0.22;
      var angle = Math.PI * 0.5 + spread + waveAngle;

      if(facing === 'up') angle -= Math.PI; // Hadap atas

      var len = tier >= 11 ? 38 : (tier >= 7 ? 32 : 26);
      var rootX = x + (i - (tailCount-1)/2) * 1.5;
      var rootY = y;

      // Segmen kurva ekor
      var midX = rootX + Math.cos(angle) * (len * 0.55) + Math.sin(waveSpeed * 1.3) * 6;
      var midY = rootY - Math.sin(angle) * (len * 0.55);
      var tipX = rootX + Math.cos(angle) * len + Math.sin(waveSpeed * 1.5) * 10;
      var tipY = rootY - Math.sin(angle) * len;

      // Gambar tubuh ekor berbulu
      c.beginPath();
      c.moveTo(rootX, rootY);
      c.quadraticCurveTo(midX, midY, tipX, tipY);
      c.strokeStyle = coreColor;
      c.lineWidth = tier >= 11 ? 6 : 5;
      c.lineCap = 'round';
      c.stroke();

      // Lapisan dalam kilau
      c.beginPath();
      c.moveTo(rootX, rootY);
      c.quadraticCurveTo(midX, midY, tipX, tipY);
      c.strokeStyle = midColor;
      c.lineWidth = 3;
      c.stroke();

      // Ujung ekor berapi putih
      c.fillStyle = tipColor;
      c.beginPath();
      c.arc(tipX, tipY, tier >= 11 ? 4 : 3, 0, Math.PI*2);
      c.fill();
    }
  }

  /* 3. TELINGA RUBAH KEMBAR (FOX EARS) */
  function renderFoxEars(c, x, hy, tier, time){
    var earColor = tier >= 11 ? '#eab308' : (tier >= 7 ? '#06b6d4' : '#ea580c');
    var innerColor = tier >= 11 ? '#ffffff' : (tier >= 7 ? '#bae6fd' : '#fed7aa');
    var tipColor = tier >= 11 ? '#fef08a' : (tier >= 7 ? '#e0f2fe' : '#1e1b4b');
    var twitch = Math.sin(time * 0.008) * 1.5;

    // Telinga Kiri
    c.fillStyle = earColor;
    c.beginPath();
    c.moveTo(x - 9, hy + 1);
    c.lineTo(x - 13, hy - 9 + twitch);
    c.lineTo(x - 4, hy - 4);
    c.fill();
    // Bagian dalam telinga kiri
    c.fillStyle = innerColor;
    c.beginPath();
    c.moveTo(x - 8, hy);
    c.lineTo(x - 11, hy - 7 + twitch);
    c.lineTo(x - 5, hy - 3);
    c.fill();

    // Telinga Kanan
    c.fillStyle = earColor;
    c.beginPath();
    c.moveTo(x + 9, hy + 1);
    c.lineTo(x + 13, hy - 9 - twitch);
    c.lineTo(x + 4, hy - 4);
    c.fill();
    // Bagian dalam telinga kanan
    c.fillStyle = innerColor;
    c.beginPath();
    c.moveTo(x + 8, hy);
    c.lineTo(x + 11, hy - 7 - twitch);
    c.lineTo(x + 5, hy - 3);
    c.fill();
  }

  /* 4. MANDALA DEWA RUBAH (TIER 11 MAHADEWA) */
  function renderDivineMandala(c, x, y, time){
    c.save();
    c.translate(x, y);
    var rot = time * 0.002;
    c.rotate(rot);
    c.strokeStyle = 'rgba(255, 215, 0, 0.55)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(0, 0, 24, 0, Math.PI*2);
    c.stroke();
    // Segitiga heksagram rune
    for(var s=0; s<6; s++){
      var a = (s / 6) * Math.PI * 2;
      var rx = Math.cos(a) * 24;
      var ry = Math.sin(a) * 24;
      px(c, rx - 1.5, ry - 1.5, 3, 3, '#ffd700');
    }
    c.restore();
  }

  /* 5. SENJATA & ANIMASI AYUNAN SERANG */
  function renderCharacterWeapon(c, x, by, cls, facing, atkTimer, aimAngle){
    var ang = typeof aimAngle === 'number' ? aimAngle : (facing === 'right' ? 0 : (facing === 'left' ? Math.PI : (facing === 'up' ? -Math.PI/2 : Math.PI/2)));
    var dirX = Math.cos(ang);
    var dirY = Math.sin(ang);

    var wx = x + (dirX * 10);
    var wy = by + 5 + (dirY * 5);

    if(cls === 'knight'){
      // Pedang Baja & Tebasan Mengikuti Arah Joystick
      c.save();
      c.translate(wx, wy);
      var swingOffset = atkTimer > 0 ? (atkTimer * 0.26 - 1.2) : 0;
      var swordRot = ang + Math.PI/2 + swingOffset;
      c.rotate(swordRot);
      // Gagang & Pegangan
      px(c, -2, 0, 4, 3, '#78350f');
      px(c, -5, -2, 10, 2, '#d97706'); // Crossguard
      // Bilah pedang bersinar
      px(c, -2, -14, 4, 12, '#94a3b8');
      px(c, -1, -14, 2, 12, '#f8fafc');
      px(c, -1, -16, 2, 3, '#ffffff'); // Ujung runcing
      c.restore();

      // Efek Slash Arc (Busur Tebasan Cahaya 360 Derajat Mengikuti Joystick)
      if(atkTimer > 0){
        c.save();
        c.strokeStyle = 'rgba(248, 113, 113, ' + (atkTimer / 10) + ')';
        c.lineWidth = 3.5;
        c.beginPath();
        c.arc(x + dirX * 18, by + dirY * 18, 24, ang - 1.0, ang + 1.0);
        c.stroke();
        // Kilauan tebasan tajam
        c.strokeStyle = 'rgba(254, 240, 138, ' + (atkTimer / 12) + ')';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(x + dirX * 18, by + dirY * 18, 22, ang - 0.7, ang + 0.7);
        c.stroke();
        c.restore();
      }
    } else if(cls === 'archer'){
      // Busur Melengkung Membidik Arah Joystick
      c.save();
      c.translate(wx, wy);
      c.rotate(ang);
      c.strokeStyle = '#854d0e';
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(0, 0, 10, -Math.PI*0.4, Math.PI*0.4);
      c.stroke();
      // Tali busur
      c.strokeStyle = '#e2e8f0';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(Math.cos(-Math.PI*0.4)*10, Math.sin(-Math.PI*0.4)*10);
      c.lineTo(Math.cos(Math.PI*0.4)*10, Math.sin(Math.PI*0.4)*10);
      c.stroke();
      // Panah siap tembak pada busur
      px(c, -3, -1, 14, 2, '#facc15');
      c.restore();
    } else {
      // Tongkat Sihir Kristal Mana Membidik Arah Joystick
      c.save();
      c.translate(wx, wy);
      c.rotate(ang + Math.PI/2);
      px(c, -1, -14, 3, 18, '#854d0e'); // Gagang kayu
      // Kristal Mana Berpendar
      var orbGlow = Math.sin(Date.now() * 0.008) * 2;
      pxCirc(c, 0, -16, 4 + orbGlow*0.5, '#c084fc');
      pxCirc(c, 0, -16, 2, '#ffffff');
      c.restore();
    }
  }

  /* 6. MENGGAMBAR TANAH 8-BIT BERTEKSTUR MULTI-WILAYAH */
  function render8BitGround(c, map, time){
    var mid = map.id || 'valoria_city';

    if(mid === 'whispering_forest'){
      // 1. HUTAN ROH PURBA (LUAS 3200x2400 - SANGAT LEBAT)
      c.fillStyle = '#142c16';
      c.fillRect(0, 0, map.width, map.height);

      // Tekstur lumut & semak hutan lebat
      for(var gy=0; gy<map.height; gy+=40){
        for(var gx=0; gx<map.width; gx+=40){
          if((gx + gy) % 80 === 0){
            px(c, gx + 6, gy + 10, 8, 8, '#1b3f20');
            px(c, gx + 22, gy + 26, 6, 6, '#0f2411');
          }
        }
      }

      // Jalan Setapak Kuno Berlumut Melintasi Hutan
      renderCobbleRect(c, 1520, 0, 160, map.height);
      renderCobbleRect(c, 0, 1120, map.width, 160);

      // Sungai Rimba Berkelok-Kelok
      var riverY = 1420;
      var riverH = 90;
      c.fillStyle = '#0284c7';
      c.fillRect(0, riverY, map.width, riverH);
      var waveShift = (time * 0.03) % 40;
      for(var wx= -40 + waveShift; wx<map.width; wx+=48){
        px(c, wx, riverY + 18, 22, 3, '#7dd3fc');
        px(c, wx + 18, riverY + 44, 18, 3, '#38bdf8');
        px(c, wx + 6, riverY + 68, 24, 3, '#7dd3fc');
      }
      renderBridge(c, 1500, riverY - 8, 200, riverH + 16);

      // Jamur Roh Hutan Menyala (Spirit Mushrooms)
      for(var msh=0; msh<map.width; msh+=260){
        var myP = (msh * 3) % (map.height - 200) + 100;
        px(c, msh + 20, myP, 6, 4, '#c084fc');
        px(c, msh + 22, myP + 4, 2, 3, '#fed7aa');
      }
      return;
    }

    if(mid === 'crimson_abyss'){
      // 2. LEMBAH NERAKA EKSTREM (FARMING INTENSIF - LAHAR & VULKANIK)
      c.fillStyle = '#170a0a';
      c.fillRect(0, 0, map.width, map.height);

      // Retakan Magma Berpijar di Seluruh Kerak Obsidian
      var pulseLava = Math.sin(time * 0.005) * 0.3 + 0.7;
      for(var fy=0; fy<map.height; fy+=60){
        for(var fx=0; fx<map.width; fx+=60){
          if((fx + fy) % 120 === 0){
            px(c, fx + 8, fy + 12, 16, 2, '#dc2626');
            px(c, fx + 12, fy + 14, 8, 2, '#f97316');
            px(c, fx + 14, fy + 15, 4, 1, '#fef08a');
          }
        }
      }

      // Aliran Sungai Magma Lahar Mendidih (Horizontal)
      var magmaY = 1380;
      var magmaH = 110;
      c.fillStyle = '#991b1b';
      c.fillRect(0, magmaY, map.width, magmaH);
      c.fillStyle = '#ea580c';
      c.fillRect(0, magmaY + 12, map.width, magmaH - 24);

      // Gelombang & Gelembung Lahar Panas
      var mWave = (time * 0.05) % 50;
      for(var lx= -50 + mWave; lx<map.width; lx+=54){
        px(c, lx, magmaY + 24, 24, 4, '#f97316');
        px(c, lx + 12, magmaY + 50, 20, 5, '#facc15');
        px(c, lx + 4, magmaY + 76, 26, 4, '#fef08a');
      }

      // Jembatan Batu Obsidian Membelah Lahar
      renderCobbleRect(c, 1500, magmaY - 10, 200, magmaH + 20);

      // Percikan Bara Api Naik Melayang
      for(var spk=0; spk<14; spk++){
        var spkX = (time * 0.1 + spk * 120) % map.width;
        var spkY = magmaY + 50 - ((time * 0.06 + spk * 30) % 180);
        px(c, spkX, spkY, 3, 3, '#facc15');
      }
      return;
    }

    if(mid === 'frostfang_tundra'){
      // 3. PUNCAK SALJU FROSTFANG (SALJU ABADI & KRISTAL ES)
      c.fillStyle = '#e2e8f0';
      c.fillRect(0, 0, map.width, map.height);

      // Lapisan Salju Tekstur
      for(var sy=0; sy<map.height; sy+=40){
        for(var sx=0; sx<map.width; sx+=40){
          if((sx + sy) % 80 === 0){
            px(c, sx + 4, sy + 6, 8, 6, '#f8fafc');
            px(c, sx + 18, sy + 20, 10, 6, '#cbd5e1');
          }
        }
      }

      // Danau Es Kristal Beku
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.ellipse(map.width/2, map.height/2 + 80, 280, 140, 0, 0, Math.PI*2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath();
      c.ellipse(map.width/2 - 40, map.height/2 + 60, 180, 70, -0.2, 0, Math.PI*2);
      c.fill();
      return;
    }

    if(mid === 'celestial_shrine'){
      // 4. KUIL RUBAH SURGAWI (ALTAR SUCI MAHADEWA)
      c.fillStyle = '#f8fafc';
      c.fillRect(0, 0, map.width, map.height);

      // Lantai Ubin Marmer Suci Bergaris Emas
      c.strokeStyle = '#e2e8f0';
      c.lineWidth = 1;
      for(var my=0; my<map.height; my+=48){
        c.beginPath(); c.moveTo(0, my); c.lineTo(map.width, my); c.stroke();
      }
      for(var mx=0; mx<map.width; mx+=48){
        c.beginPath(); c.moveTo(mx, 0); c.lineTo(mx, map.height); c.stroke();
      }

      // Jalan Utama Suci Menuju Altar
      renderCobbleRect(c, map.width/2 - 120, 0, 240, map.height);

      // Kolam Teratai Mistis Suci Ungu
      c.fillStyle = '#581c87';
      c.beginPath();
      c.ellipse(map.width/2 - 320, map.height/2, 160, 90, 0, 0, Math.PI*2);
      c.fill();
      c.beginPath();
      c.ellipse(map.width/2 + 320, map.height/2, 160, 90, 0, 0, Math.PI*2);
      c.fill();

      // Daun Teratai & Bunga Sakura Berjatuhan
      var sTime = time * 0.002;
      for(var p=0; p<20; p++){
        var pxPos = (map.width/2 - 400 + Math.sin(sTime + p)*500 + map.width) % map.width;
        var pyPos = (p * 85 + time * 0.04) % map.height;
        px(c, pxPos, pyPos, 4, 3, '#f472b6');
      }
      return;
    }

    // 5. KOTA VALORIA (DEFAULT)
    c.fillStyle = '#1e3f20';
    c.fillRect(0, 0, map.width, map.height);

    // Tekstur rumput acak berpola
    c.fillStyle = '#264e28';
    for(var gy=0; gy<map.height; gy+=32){
      for(var gx=0; gx<map.width; gx+=32){
        if((gx + gy) % 64 === 0){
          px(c, gx + 4, gy + 8, 4, 6, '#2d5c30');
          px(c, gx + 20, gy + 18, 5, 5, '#19361a');
        }
      }
    }

    // Bunga liar padang rumput
    var flowerCoords = [
      [140, 220, '#ef4444'], [280, 160, '#facc15'], [160, 680, '#38bdf8'],
      [890, 240, '#f43f5e'], [1100, 310, '#facc15'], [1350, 260, '#a855f7'],
      [320, 1050, '#ef4444'], [740, 1120, '#38bdf8'], [1200, 1180, '#facc15']
    ];
    for(var f=0; f<flowerCoords.length; f++){
      var fl = flowerCoords[f];
      px(c, fl[0], fl[1], 4, 4, fl[2]);
      px(c, fl[0]+1, fl[1]+4, 2, 3, '#15803d');
    }

    // Alun-alun & Jalan Utama Cobblestone Batu 8-bit
    renderCobbleRect(c, 340, 260, 560, 420);
    renderCobbleRect(c, 560, 680, 120, 600);
    renderCobbleRect(c, 900, 420, 700, 100);

    // Sungai Air Mengalir (Waterway / River)
    var riverY = 740;
    var riverH = 70;
    c.fillStyle = '#0284c7';
    c.fillRect(0, riverY, map.width, riverH);
    var waveShift = (time * 0.04) % 40;
    c.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for(var wx= -40 + waveShift; wx<map.width; wx+=48){
      px(c, wx, riverY + 14, 18, 3, '#7dd3fc');
      px(c, wx + 20, riverY + 36, 14, 3, '#38bdf8');
      px(c, wx + 8, riverY + 54, 20, 3, '#7dd3fc');
    }

    // Jembatan Kayu-Batu Melintasi Sungai
    renderBridge(c, 550, riverY - 6, 140, riverH + 12);
  }

  function renderCobbleRect(c, rx, ry, rw, rh){
    c.fillStyle = '#334155';
    c.fillRect(rx, ry, rw, rh);
    // Batu-batu individual dengan highlight & mortar
    c.fillStyle = '#475569';
    for(var y=ry+4; y<ry+rh-10; y+=18){
      var rowShift = ((y - ry) % 36 === 0) ? 10 : 0;
      for(var x=rx+4 + rowShift; x<rx+rw-16; x+=24){
        c.fillStyle = '#475569';
        c.fillRect(x, y, 20, 14);
        c.fillStyle = '#64748b'; // Highlight atas
        c.fillRect(x, y, 20, 3);
        c.fillStyle = '#1e293b'; // Bayangan bawah
        c.fillRect(x, y + 12, 20, 2);
      }
    }
  }

  function renderBridge(c, bx, by, bw, bh){
    // Tiang batu penyangga
    c.fillStyle = '#1e293b';
    c.fillRect(bx - 4, by, 8, bh);
    c.fillRect(bx + bw - 4, by, 8, bh);
    // Papan kayu jembatan
    c.fillStyle = '#78350f';
    c.fillRect(bx, by, bw, bh);
    c.fillStyle = '#92400e';
    for(var py=by; py<by+bh; py+=10){
      c.fillRect(bx, py, bw, 8);
    }
    // Reling pagar jembatan
    c.fillStyle = '#451a03';
    c.fillRect(bx, by, bw, 4);
    c.fillRect(bx, by + bh - 4, bw, 4);
  }

  /* 7. POHON RIMBUN & BANGUNAN 16-BIT */
  function render16BitTree(c, tx, ty, time){
    // Bayangan pohon di tanah
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath();
    c.ellipse(tx, ty + 12, 28, 12, 0, 0, Math.PI*2);
    c.fill();

    // Batang Kayu Bertekstur
    px(c, tx - 7, ty - 26, 14, 34, '#542d13');
    px(c, tx - 5, ty - 24, 4, 30, '#783d19'); // Highlight batang
    px(c, tx + 3, ty - 20, 4, 26, '#361b0a'); // Shadow batang

    // Rimbunan Dedaunan 3 Lapis (Swaying pelan)
    var wind = Math.sin(time * 0.002 + tx) * 2;
    // Lapis 1 (Bawah / Gelap)
    c.fillStyle = '#14532d';
    c.beginPath(); c.arc(tx + wind, ty - 38, 30, 0, Math.PI*2); c.fill();
    // Lapis 2 (Tengah / Hijau Subur)
    c.fillStyle = '#16a34a';
    c.beginPath(); c.arc(tx + wind - 6, ty - 46, 24, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(tx + wind + 8, ty - 44, 22, 0, Math.PI*2); c.fill();
    // Lapis 3 (Highlight Sinar Matahari)
    c.fillStyle = '#4ade80';
    c.beginPath(); c.arc(tx + wind - 3, ty - 56, 16, 0, Math.PI*2); c.fill();
  }

  function render16BitHouse(c, hx, hy, hw, hh, title, roofColor, isCastle){
    // Bayangan bangunan
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(hx + 8, hy + hh - 4, hw, 14);

    // Dinding Batu Bata Utama
    c.fillStyle = isCastle ? '#334155' : '#f1f5f9';
    c.fillRect(hx, hy + 38, hw, hh - 38);

    // Pola Balok Kayu / Bata (Tudor Style)
    c.fillStyle = isCastle ? '#1e293b' : '#78350f';
    c.fillRect(hx, hy + 38, 6, hh - 38);
    c.fillRect(hx + hw - 6, hy + 38, 6, hh - 38);
    c.fillRect(hx, hy + 38, hw, 6);

    // Pintu Kayu Masif
    var dw = 24, dh = 34;
    var dx = hx + hw/2 - dw/2;
    var dy = hy + hh - dh;
    c.fillStyle = '#451a03';
    c.fillRect(dx, dy, dw, dh);
    px(c, dx + 2, dy + 2, dw - 4, dh - 4, '#78350f');
    px(c, dx + dw - 6, dy + dh/2, 3, 3, '#facc15'); // Gagang pintu emas

    // Jendela Kaca Hangat Bercahaya
    var jw = 18, jh = 20;
    px(c, hx + 18, hy + 48, jw, jh, '#fef08a');
    px(c, hx + 18 + jw/2 - 1, hy + 48, 2, jh, '#78350f'); // Kisi jendela
    px(c, hx + 18, hy + 48 + jh/2 - 1, jw, 2, '#78350f');

    if(hw > 130){
      px(c, hx + hw - 36, hy + 48, jw, jh, '#fef08a');
      px(c, hx + hw - 36 + jw/2 - 1, hy + 48, 2, jh, '#78350f');
      px(c, hx + hw - 36, hy + 48 + jh/2 - 1, jw, 2, '#78350f');
    }

    // Atap Genteng Bersusun
    c.fillStyle = roofColor || '#991b1b';
    c.beginPath();
    c.moveTo(hx - 10, hy + 40);
    c.lineTo(hx + hw/2, hy - 14);
    c.lineTo(hx + hw + 10, hy + 40);
    c.closePath();
    c.fill();
    // Highlight garis atap
    c.strokeStyle = '#fca5a5';
    c.lineWidth = 2;
    c.stroke();

    // Cerobong Asap & Partikel Asap
    var cx = hx + hw - 24;
    var cy = hy - 4;
    c.fillStyle = '#475569';
    c.fillRect(cx, cy - 18, 14, 22);
    px(c, cx - 2, cy - 20, 18, 4, '#334155');

    // Partikel asap melayang
    var sTime = Date.now() * 0.003;
    for(var s=0; s<3; s++){
      var sx = cx + 6 + Math.sin(sTime + s) * 8;
      var sy = cy - 26 - ((sTime * 14 + s * 14) % 36);
      c.fillStyle = 'rgba(241, 245, 249, 0.45)';
      c.beginPath(); c.arc(sx, sy, 4 + s*1.5, 0, Math.PI*2); c.fill();
    }

    // Label Bangunan
    c.font = 'bold 10px sans-serif';
    c.textAlign = 'center';
    c.fillStyle = '#f8fafc';
    c.fillText(title, hx + hw/2, hy + hh + 14);
  }

  /* 8. AIR MANCUR ALUN-ALUN & LENTERA */
  function renderGrandFountain(c, fx, fy, time){
    // Kolam Batu Bundar Luar
    c.fillStyle = '#475569';
    c.beginPath(); c.arc(fx, fy, 42, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#94a3b8'; c.lineWidth = 3; c.stroke();

    // Air Kolam
    c.fillStyle = '#0284c7';
    c.beginPath(); c.arc(fx, fy, 38, 0, Math.PI*2); c.fill();

    // Pilar Air Mancur
    c.fillStyle = '#cbd5e1';
    c.beginPath(); c.arc(fx, fy, 16, 0, Math.PI*2); c.fill();
    c.fillStyle = '#64748b';
    c.fillRect(fx - 6, fy - 22, 12, 22);

    // Semburan Air Mancur Dinamis
    var sTime = time * 0.01;
    c.fillStyle = 'rgba(224, 242, 254, 0.8)';
    for(var a=0; a<8; a++){
      var spAng = (a / 8) * Math.PI * 2 + sTime * 0.4;
      var dist = 18 + Math.sin(sTime + a) * 8;
      var pxPos = fx + Math.cos(spAng) * dist;
      var pyPos = fy + Math.sin(spAng) * dist;
      c.beginPath(); c.arc(pxPos, pyPos, 3, 0, Math.PI*2); c.fill();
    }
  }

  function renderStreetLantern(c, lx, ly, time){
    // Tiang Besi Hitam
    c.fillStyle = '#0f172a';
    c.fillRect(lx - 2, ly - 26, 4, 26);
    c.fillRect(lx - 5, ly - 2, 10, 3);
    // Lentera Gantung & Cahaya Pendar
    c.fillStyle = '#f59e0b';
    c.fillRect(lx - 5, ly - 28, 10, 10);
    // Lingkaran Halo Cahaya
    c.fillStyle = 'rgba(251, 191, 36, 0.15)';
    c.beginPath(); c.arc(lx, ly, 36, 0, Math.PI*2); c.fill();
  }

  /* 8.1 PORTAL TELEPORTASI 16-BIT BERPUTAR */
  function renderPortalGate(c, p, time){
    var px = p.x;
    var py = p.y;
    var col = p.color || '#a855f7';
    var runeCol = p.runeColor || '#c084fc';
    var pulse = Math.sin(time * 0.005 + px) * 3;

    // Landasan Altar Batu Lingkaran di Tanah
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath(); c.ellipse(px, py + 18, 38, 16, 0, 0, Math.PI*2); c.fill();

    c.strokeStyle = col;
    c.lineWidth = 3;
    c.beginPath(); c.ellipse(px, py + 14, 34, 14, 0, 0, Math.PI*2); c.stroke();

    // Lingkaran Rune Berputar di Lantai
    var rot = time * 0.002;
    c.save();
    c.translate(px, py + 14);
    c.scale(1, 0.45);
    c.rotate(rot);
    for(var r=0; r<6; r++){
      var ra = (r/6)*Math.PI*2;
      c.fillStyle = runeCol;
      c.fillRect(Math.cos(ra)*26 - 2, Math.sin(ra)*26 - 2, 4, 4);
    }
    c.restore();

    // Dua Pilar Obelisk Kuno di Kiri & Kanan
    // Pilar Kiri
    c.fillStyle = '#334155';
    c.fillRect(px - 34, py - 40, 10, 52);
    c.fillStyle = '#475569';
    c.fillRect(px - 33, py - 38, 4, 48);
    c.fillStyle = col;
    c.beginPath(); c.arc(px - 29, py - 46, 5 + pulse*0.3, 0, Math.PI*2); c.fill();

    // Pilar Kanan
    c.fillStyle = '#334155';
    c.fillRect(px + 24, py - 40, 10, 52);
    c.fillStyle = '#475569';
    c.fillRect(px + 25, py - 38, 4, 48);
    c.fillStyle = col;
    c.beginPath(); c.arc(px + 29, py - 46, 5 + pulse*0.3, 0, Math.PI*2); c.fill();

    // Pusaran Energi Portal Vertikal
    var vortexGrad = c.createRadialGradient(px, py - 16, 4, px, py - 16, 26 + pulse);
    vortexGrad.addColorStop(0, '#ffffff');
    vortexGrad.addColorStop(0.4, col);
    vortexGrad.addColorStop(0.8, runeCol);
    vortexGrad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = vortexGrad;
    c.beginPath();
    c.ellipse(px, py - 16, 22 + pulse*0.5, 34 + pulse, 0, 0, Math.PI*2);
    c.fill();

    // Partikel Bintang Naik ke Atas
    for(var sp=0; sp<4; sp++){
      var sy = (time * 0.05 + sp * 24) % 60;
      var sx = px + Math.sin(time*0.006 + sp*2) * 14;
      c.fillStyle = '#ffffff';
      c.fillRect(sx, py + 10 - sy, 2.5, 2.5);
    }

    // Papan Label Nama Portal
    c.fillStyle = 'rgba(15, 23, 42, 0.9)';
    c.strokeStyle = col;
    c.lineWidth = 1.5;
    var bannerW = Math.max(90, p.name.length * 6.5);
    c.fillRect(px - bannerW/2, py - 66, bannerW, 16);
    c.strokeRect(px - bannerW/2, py - 66, bannerW, 16);

    c.font = 'bold 9px sans-serif';
    c.fillStyle = '#f8fafc';
    c.textAlign = 'center';
    c.fillText(p.name, px, py - 54);
  }

  /* 9. NPC 16-BIT DETAIL */
  function render16BitNpc(c, npc, time){
    var x = npc.x;
    var y = npc.y;
    var bob = Math.sin(time * 0.003 + x) * 1.5;

    // Bayangan NPC
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath(); c.ellipse(x, y + 13, 12, 5, 0, 0, Math.PI*2); c.fill();

    if(npc.id === 'npc_king'){
      // RAJA VALORIA (Mahkota Emas, Jubah Merah Beludru, Kerah Bulu Putih)
      // Jubah Merah
      c.fillStyle = '#991b1b';
      c.fillRect(x - 9, y - 5 - bob, 18, 17);
      // Kerah Bulu Putih Kerajaan (Ermine Fur)
      c.fillStyle = '#f8fafc';
      c.fillRect(x - 10, y - 8 - bob, 20, 6);
      px(c, x - 7, y - 6 - bob, 2, 2, '#0f172a');
      px(c, x + 5, y - 6 - bob, 2, 2, '#0f172a');
      // Kepala & Janggut
      px(c, x - 6, y - 17 - bob, 12, 10, '#fed7aa');
      px(c, x - 6, y - 10 - bob, 12, 5, '#e2e8f0'); // Janggut putih bangsawan
      // Mahkota Emas Permata Tiga Puncak
      c.fillStyle = '#eab308';
      c.fillRect(x - 7, y - 22 - bob, 14, 5);
      px(c, x - 6, y - 25 - bob, 3, 4, '#eab308');
      px(c, x - 1, y - 27 - bob, 3, 6, '#eab308');
      px(c, x + 4, y - 25 - bob, 3, 4, '#eab308');
      px(c, x, y - 21 - bob, 2, 2, '#ef4444'); // Permata rubi
      // Tongkat Kerajaan
      px(c, x + 9, y - 16 - bob, 3, 24, '#d97706');
      pxCirc(c, x + 10, y - 18 - bob, 4, '#38bdf8');
    } else if(npc.id === 'npc_pot'){
      // ALKEMIS ELENA (Topi Penyihir Ungu, Tabung Ramuan Hijau Berbusa)
      // Gaun Alkemis
      c.fillStyle = '#581c87';
      c.fillRect(x - 8, y - 5 - bob, 16, 17);
      px(c, x - 5, y - 3 - bob, 10, 13, '#10b981'); // Celemek hijau
      // Wajah
      px(c, x - 5, y - 16 - bob, 10, 9, '#fed7aa');
      // Topi Kerucut Alkemis
      c.fillStyle = '#6b21a8';
      c.beginPath();
      c.moveTo(x - 10, y - 15 - bob);
      c.lineTo(x + 12, y - 30 - bob);
      c.lineTo(x + 10, y - 15 - bob);
      c.closePath();
      c.fill();
      // Tabung Ramuan di Tangan (Bergelembung)
      px(c, x + 7, y - 3 - bob, 8, 9, '#059669');
      pxCirc(c, x + 11, y + 5 - bob, 6, '#34d399');
      pxCirc(c, x + 11, y + 3 - bob, 2, '#ffffff');
    } else {
      // PANDAI BESI TORIN (Celemek Kulit, Palu Besi, Paron & Bara Api)
      // Badan Kekar & Celemek
      c.fillStyle = '#fed7aa'; // Lengan berotot
      c.fillRect(x - 10, y - 5 - bob, 20, 15);
      c.fillStyle = '#78350f'; // Celemek kulit
      c.fillRect(x - 7, y - 4 - bob, 14, 16);
      // Wajah & Bandana
      px(c, x - 6, y - 16 - bob, 12, 10, '#fed7aa');
      px(c, x - 7, y - 17 - bob, 14, 4, '#dc2626'); // Bandana merah
      // Palu Godam Tempa
      px(c, x + 8, y - 18 - bob, 3, 20, '#451a03');
      px(c, x + 5, y - 20 - bob, 9, 6, '#64748b');
      // Paron Besi (Anvil) di Samping
      px(c, x - 18, y + 2, 12, 10, '#334155');
      px(c, x - 20, y + 2, 16, 4, '#475569');
      // Percikan api dari paron sesekali
      if(Math.sin(time * 0.006) > 0.7){
        px(c, x - 15 + Math.random()*6, y - 2 - Math.random()*8, 2, 2, '#facc15');
      }
    }

    // Nama & Balon Bicara
    c.font = 'bold 9px sans-serif';
    c.textAlign = 'center';
    c.fillStyle = '#f8fafc';
    c.fillText(npc.name, x, y - 26 - bob);
    c.fillStyle = '#facc15';
    c.font = '8px sans-serif';
    c.fillText('💬 Bicara', x, y - 16 - bob);
  }

  /* 10. MONSTER 16-BIT */
  function render16BitMonster(c, m, time){
    var x = m.x;
    var y = m.y;
    var pulse = Math.sin(time * 0.006 + x) * 2;
    var type = m.type || 'slime';
    var col = m.color || '#22c55e';

    // Bayangan
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.ellipse(x, y + m.radius - 2, m.radius * 0.9, 5, 0, 0, Math.PI*2); c.fill();

    if(type === 'slime'){
      // Slime Gelatin (Hijau Hutan / Merah Lahar / Biru Es)
      var sy = y + pulse;
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(x, sy, m.radius, m.radius * 0.75 + pulse*0.5, 0, 0, Math.PI*2);
      c.fill();
      // Highlight kilau jeli
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.ellipse(x - 4, sy - 5, 4, 2, -0.3, 0, Math.PI*2); c.fill();
      // Mata bulat
      px(c, x - 5, sy - 1, 3, 3, '#0f172a');
      px(c, x + 3, sy - 1, 3, 3, '#0f172a');
    } else if(type === 'goblin'){
      // Goblin Bertaring
      c.fillStyle = '#15803d';
      c.fillRect(x - 7, y - 10, 14, 18);
      c.fillStyle = '#78350f';
      c.fillRect(x - 8, y - 14, 16, 5);
      px(c, x - 10, y - 16, 3, 4, '#f8fafc');
      px(c, x + 7, y - 16, 3, 4, '#f8fafc');
      px(c, x - 4, y - 7, 2, 2, '#ef4444');
      px(c, x + 2, y - 7, 2, 2, '#ef4444');
      px(c, x + 8, y - 4, 2, 10, '#94a3b8');
    } else if(type === 'wolf' || type === 'hound'){
      // Serigala Hutan / Lava Hound / Frost Wolf
      var wCol = m.color || '#475569';
      // Tubuh serigala berkaki empat
      c.fillStyle = wCol;
      c.fillRect(x - 14, y - 7, 26, 12);
      // Kaki depan & belakang
      px(c, x - 12, y + 5, 4, 8, '#1e293b');
      px(c, x - 6, y + 5, 4, 8, '#1e293b');
      px(c, x + 3, y + 5, 4, 8, '#1e293b');
      px(c, x + 8, y + 5, 4, 8, '#1e293b');
      // Kepala serigala bertaring & telinga tegak
      px(c, x + 10, y - 12, 10, 9, wCol);
      px(c, x + 11, y - 16, 3, 4, '#0f172a'); // Telinga
      px(c, x + 16, y - 16, 3, 4, '#0f172a');
      // Moncong & taring
      px(c, x + 18, y - 8, 5, 4, '#0f172a');
      px(c, x + 19, y - 4, 2, 2, '#ffffff');
      // Mata menyala
      px(c, x + 13, y - 10, 2, 2, m.color === '#ef4444' ? '#facc15' : '#ef4444');
      // Ekor lebat
      px(c, x - 18, y - 10, 5, 7, wCol);
    } else if(type === 'imp'){
      // Imp Api / Iblis Kecil Bersayap
      var iy = y - 4 + pulse;
      c.fillStyle = '#dc2626';
      c.fillRect(x - 6, iy, 12, 14);
      // Sayap kelelawar
      c.fillStyle = '#7f1d1d';
      c.beginPath();
      c.moveTo(x - 6, iy + 2); c.lineTo(x - 16, iy - 6); c.lineTo(x - 8, iy + 8);
      c.moveTo(x + 6, iy + 2); c.lineTo(x + 16, iy - 6); c.lineTo(x + 8, iy + 8);
      c.fill();
      // Tanduk kecil & mata api
      px(c, x - 5, iy - 4, 2, 4, '#facc15');
      px(c, x + 3, iy - 4, 2, 4, '#facc15');
      px(c, x - 3, iy + 3, 2, 2, '#fef08a');
      px(c, x + 1, iy + 3, 2, 2, '#fef08a');
      // Trisula api
      px(c, x + 8, iy - 8, 2, 18, '#78350f');
      px(c, x + 6, iy - 10, 6, 3, '#f97316');
    } else if(type === 'golem'){
      // Golem Magma / Treant Pelindung Batu
      c.fillStyle = '#292524';
      c.fillRect(x - 14, y - 18, 28, 30);
      // Bahu batu tebal
      px(c, x - 18, y - 20, 6, 12, '#44403c');
      px(c, x + 12, y - 20, 6, 12, '#44403c');
      // Inti batu menyala di dada (Lava Core / Moss Core)
      px(c, x - 4, y - 8, 8, 8, m.color || '#ea580c');
      px(c, x - 2, y - 6, 4, 4, '#fef08a');
      // Mata batu
      px(c, x - 6, y - 14, 3, 2, '#facc15');
      px(c, x + 3, y - 14, 3, 2, '#facc15');
    } else if(type === 'dragon' || type === 'boss'){
      // NAGA IBLIS LAHAR / BLIZZARD DRAKE
      // Aura Bos
      c.strokeStyle = m.color || 'rgba(239, 68, 68, 0.5)';
      c.lineWidth = 4;
      c.beginPath(); c.arc(x, y, m.radius + 8 + pulse, 0, Math.PI*2); c.stroke();
      // Tubuh naga bersisik
      c.fillStyle = '#7f1d1d';
      c.fillRect(x - 18, y - 12, 36, 26);
      // Sayap raksasa terbentang
      c.fillStyle = '#991b1b';
      c.beginPath();
      c.moveTo(x - 14, y - 6); c.lineTo(x - 36, y - 28 + pulse); c.lineTo(x - 12, y + 4);
      c.moveTo(x + 14, y - 6); c.lineTo(x + 36, y - 28 + pulse); c.lineTo(x + 12, y + 4);
      c.fill();
      // Kepala naga bertanduk
      px(c, x - 10, y - 24, 20, 14, '#450a0a');
      px(c, x - 12, y - 30, 4, 8, '#f97316'); // Tanduk kiri
      px(c, x + 8, y - 30, 4, 8, '#f97316'); // Tanduk kanan
      // Mata menyala
      px(c, x - 6, y - 20, 4, 3, '#facc15');
      px(c, x + 2, y - 20, 4, 3, '#facc15');
      // Hawa api / es keluar dari hidung
      px(c, x - 2, y - 12, 4, 3, '#ea580c');
    } else if(type === 'yeti'){
      // YETI SALJU PUTIH
      c.fillStyle = '#f1f5f9';
      c.fillRect(x - 14, y - 16, 28, 28);
      // Lengan berotot
      px(c, x - 18, y - 10, 6, 20, '#e2e8f0');
      px(c, x + 12, y - 10, 6, 20, '#e2e8f0');
      // Mata biru es & taring es
      px(c, x - 6, y - 10, 3, 3, '#0284c7');
      px(c, x + 3, y - 10, 3, 3, '#0284c7');
      px(c, x - 4, y - 4, 2, 3, '#bae6fd');
      px(c, x + 2, y - 4, 2, 3, '#bae6fd');
    } else if(type === 'fox_spirit'){
      // ROH RUBAH KUIL SURGAWI
      var fy = y + pulse;
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(x, fy, 14, 0, Math.PI*2); c.fill();
      c.strokeStyle = '#eab308'; c.lineWidth = 2; c.stroke();
      // Telinga rubah
      px(c, x - 8, fy - 18, 5, 6, '#eab308');
      px(c, x + 3, fy - 18, 5, 6, '#eab308');
      // Mata rubah slit emas
      px(c, x - 5, fy - 3, 3, 2, '#ca8a04');
      px(c, x + 2, fy - 3, 3, 2, '#ca8a04');
    } else {
      // DARK KNIGHT BOSS (DEFAULT KNIGHT)
      c.strokeStyle = 'rgba(147, 51, 234, 0.4)';
      c.lineWidth = 4;
      c.beginPath(); c.arc(x, y, m.radius + 6 + pulse, 0, Math.PI*2); c.stroke();
      c.fillStyle = '#1e1b4b';
      c.fillRect(x - 12, y - 14, 24, 26);
      px(c, x - 10, y - 24, 20, 12, '#312e81');
      px(c, x - 6, y - 18, 4, 2, '#ef4444');
      px(c, x + 2, y - 18, 4, 2, '#ef4444');
      px(c, x + 14, y - 26, 5, 34, '#581c87');
      px(c, x + 15, y - 28, 3, 34, '#c084fc');
    }

    // HP Bar
    var hpPct = Math.max(0, m.hp / m.maxHp);
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.fillRect(x - 22, y - m.radius - 12, 44, 5);
    c.fillStyle = m.isBoss ? '#f59e0b' : '#ef4444';
    c.fillRect(x - 22, y - m.radius - 12, 44 * hpPct, 5);

    c.font = 'bold 8.5px sans-serif';
    c.fillStyle = '#f8fafc';
    c.textAlign = 'center';
    c.fillText(m.name, x, y - m.radius - 14);
  }
`;
