/**
 * Fox Skills & FX System
 * Menghandle efek visual & logika skill transformasi rubah:
 * - Ekor 4: Cakar Api Merah (3 cakar energi berapi menyayat tanah dengan ledakan api berantai)
 * - Ekor 7: Hujan Bola Roh Biru (7 bola roh biru berputar dan meluncur homing ke musuh)
 * - Ekor 11: Bencana Bijuu Beam Mahadewa (Charging implosion + laser kosmik raksasa membelah layar + kilat emas)
 * - Minimap radar pojok layar
 */

export const FOX_SKILLS_FX_CODE = `
  /* ============ FOX SKILLS & SPECIAL FX ENGINE ============ */

  var clawSlashes = [];
  var foxfireOrbs = [];
  var beamChargeTimer = 0;

  // 1. Skill Ekor 4: Cakar Api Merah (Crimson Fox Claws)
  function triggerFoxClaws(p){
    sfxAttack();
    screenShake = 9;
    var dirX = typeof p.aimDirX === 'number' ? p.aimDirX : (p.facing === 'right' ? 1 : (p.facing === 'left' ? -1 : 0));
    var dirY = typeof p.aimDirY === 'number' ? p.aimDirY : (p.facing === 'down' ? 1 : (p.facing === 'up' ? -1 : 0));
    if(dirX === 0 && dirY === 0) dirY = 1;
    var ang = typeof p.aimAngle === 'number' ? p.aimAngle : Math.atan2(dirY, dirX);

    var cx = p.x + dirX * 48;
    var cy = p.y + dirY * 48;

    // 3 cakar sejajar tegak lurus arah joystick
    var perpX = -dirY;
    var perpY = dirX;
    for(var i=-1; i<=1; i++){
      clawSlashes.push({
        x: cx + perpX * (i * 18),
        y: cy + perpY * (i * 18),
        angle: ang,
        life: 22,
        maxLife: 22
      });
    }

    addAoe(cx, cy, 75, '#ea580c');
    logTicker('⚡ CAKAR API ROH RUBAH EKOR 4 MENYAYAT ARAH BIDIKAN!');

    // Damage ke monster
    for(var k=0; k<monsters.length; k++){
      var mon = monsters[k];
      if(mon.hp <= 0) continue;
      if(Math.hypot(mon.x - cx, mon.y - cy) < 85){
        mon.hp -= 95;
        sfxHit();
        addDamageText(mon.x, mon.y - 12, 'FLAME CLAW -95', '#ea580c');
        if(mon.hp <= 0) spawnSoul(mon.x, mon.y, 40);
      }
    }

    // Damage ke destructibles
    for(var d=0; d<destructibles.length; d++){
      var ds = destructibles[d];
      if(ds.hp <= 0) continue;
      if(Math.hypot(ds.x + ds.w/2 - cx, ds.y + ds.h/2 - cy) < 90){
        ds.hp -= 95;
        if(ds.hp <= 0){ ds.state = 'destroyed'; spawnSoul(ds.x + ds.w/2, ds.y + ds.h/2, 50); }
      }
    }
  }

  // 2. Skill Ekor 7: Hujan Bola Roh Biru (Azure Foxfire Barrage)
  function triggerFoxfireBarrage(p){
    sfxSkill();
    screenShake = 12;
    addAoe(p.x, p.y, 140, '#00e5ff');
    logTicker('🔥 7 BOLA ROH RUBAH BIRU MENGEPUNG & MEMBURU MUSUH!');

    for(var i=0; i<7; i++){
      var ang = (i / 7) * Math.PI * 2;
      foxfireOrbs.push({
        x: p.x + Math.cos(ang) * 35,
        y: p.y + Math.sin(ang) * 35,
        targetAngle: ang,
        orbitTime: 25 + i * 5,
        homing: false,
        targetMonster: null,
        vx: 0,
        vy: 0,
        damage: 130,
        life: 140
      });
    }
  }

  // 3. Skill Ekor 11: Bencana Sinar Bijuu Mahadewa (Celestial Cataclysmic Fox Beam)
  function triggerBijuuBeam(p){
    sfxFoxBeam();
    screenShake = 24;
    var ang = typeof p.aimAngle === 'number' ? p.aimAngle : (p.facing === 'right' ? 0 : (p.facing === 'left' ? Math.PI : (p.facing === 'up' ? -Math.PI/2 : Math.PI/2)));

    megaBeams.push({
      startX: p.x,
      startY: p.y,
      angle: ang,
      length: 950,
      width: 100,
      life: 40,
      maxLife: 40
    });

    logTicker('👑 BIJUU BEAM MAHADEWA EKOR 11 MEMUSNAHKAN JALUR BIDIKAN!');

    // Basmi monster dan destructibles di jalur laser 360 derajat
    var cosA = Math.cos(ang);
    var sinA = Math.sin(ang);
    for(var i=0; i<monsters.length; i++){
      var m = monsters[i];
      if(m.hp <= 0) continue;
      // Proyeksi jarak monster ke garis laser
      var relX = m.x - p.x;
      var relY = m.y - p.y;
      var proj = relX * cosA + relY * sinA;
      var perpDist = Math.abs(-relX * sinA + relY * cosA);

      if(proj >= -20 && proj <= 960 && perpDist <= 70 + m.radius){
        m.hp -= 350;
        sfxHit();
        addDamageText(m.x, m.y - 20, 'BIJUU OBLITERATE -350', '#ffd700');
        if(m.hp <= 0) spawnSoul(m.x, m.y, 80);
      }
    }

    for(var d=0; d<destructibles.length; d++){
      var ds = destructibles[d];
      if(ds.hp <= 0) continue;
      var cx = ds.x + ds.w/2;
      var cy = ds.y + ds.h/2;
      var dRelX = cx - p.x;
      var dRelY = cy - p.y;
      var dProj = dRelX * cosA + dRelY * sinA;
      var dPerpDist = Math.abs(-dRelX * sinA + dRelY * cosA);
      if(dProj >= -20 && dProj <= 960 && dPerpDist <= 75){
        ds.hp -= 350;
        if(ds.hp <= 0){
          ds.state = 'destroyed';
          spawnSoul(cx, cy, 60);
        }
      }
    }
  }

  // Update & Render Fox FX
  function updateAndRenderFoxFx(c, time){
    // 1. Cakar Api Merah
    for(var i=clawSlashes.length-1; i>=0; i--){
      var cs = clawSlashes[i];
      c.save();
      c.translate(cs.x, cs.y);
      c.rotate(cs.angle);
      var alpha = cs.life / cs.maxLife;
      c.strokeStyle = 'rgba(234, 88, 12, ' + alpha + ')';
      c.lineWidth = 6 * alpha;
      c.beginPath();
      c.moveTo(-25, -15);
      c.lineTo(25, 15);
      c.stroke();
      // Kilatan merah menyala
      c.strokeStyle = 'rgba(254, 240, 138, ' + alpha + ')';
      c.lineWidth = 2.5 * alpha;
      c.beginPath();
      c.moveTo(-22, -13);
      c.lineTo(22, 13);
      c.stroke();
      c.restore();

      cs.life--;
      if(cs.life <= 0) clawSlashes.splice(i, 1);
    }

    // 2. Bola Roh Biru Foxfire (Orbit lalu homing)
    for(var o=foxfireOrbs.length-1; o>=0; o--){
      var orb = foxfireOrbs[o];
      if(orb.orbitTime > 0){
        // Masih berputar mengelilingi pemain
        orb.targetAngle += 0.15;
        orb.x = player.x + Math.cos(orb.targetAngle) * 40;
        orb.y = player.y + Math.sin(orb.targetAngle) * 40;
        orb.orbitTime--;
      } else if(!orb.homing){
        // Cari monster terdekat
        var closest = null;
        var minD = 500;
        for(var m=0; m<monsters.length; m++){
          var mob = monsters[m];
          if(mob.hp <= 0) continue;
          var d = Math.hypot(mob.x - orb.x, mob.y - orb.y);
          if(d < minD){ minD = d; closest = mob; }
        }
        orb.homing = true;
        orb.targetMonster = closest;
        if(!closest){
          var dirX = player.facing === 'right' ? 1 : (player.facing === 'left' ? -1 : 0);
          var dirY = player.facing === 'down' ? 1 : (player.facing === 'up' ? -1 : 0);
          orb.vx = (dirX || 1) * 9;
          orb.vy = (dirY || 0) * 9;
        }
      } else {
        // Melesat homing
        if(orb.targetMonster && orb.targetMonster.hp > 0){
          var tX = orb.targetMonster.x;
          var tY = orb.targetMonster.y;
          var angle = Math.atan2(tY - orb.y, tX - orb.x);
          orb.vx = Math.cos(angle) * 10;
          orb.vy = Math.sin(angle) * 10;
          if(Math.hypot(tX - orb.x, tY - orb.y) < 22){
            orb.targetMonster.hp -= orb.damage;
            sfxHit();
            addDamageText(tX, tY - 14, 'AZURE -' + orb.damage, '#00e5ff');
            addAoe(tX, tY, 40, '#00e5ff');
            if(orb.targetMonster.hp <= 0) spawnSoul(tX, tY, 45);
            foxfireOrbs.splice(o, 1);
            continue;
          }
        }
        orb.x += orb.vx;
        orb.y += orb.vy;
      }

      // Render Bola Api Roh Biru
      c.fillStyle = 'rgba(0, 229, 255, 0.4)';
      c.beginPath(); c.arc(orb.x, orb.y, 10, 0, Math.PI*2); c.fill();
      c.fillStyle = '#00e5ff';
      c.beginPath(); c.arc(orb.x, orb.y, 6, 0, Math.PI*2); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(orb.x, orb.y, 3, 0, Math.PI*2); c.fill();

      orb.life--;
      if(orb.life <= 0) foxfireOrbs.splice(o, 1);
    }

    // 3. Mega Bijuu Beam Sinar Kosmis
    for(var mb=megaBeams.length-1; mb>=0; mb--){
      var bm = megaBeams[mb];
      c.save();
      c.translate(bm.startX, bm.startY);
      c.rotate(bm.angle);
      var alpha = bm.life / bm.maxLife;

      // Selubung Plasma Emas Luar
      c.fillStyle = 'rgba(255, 215, 0, ' + (alpha * 0.75) + ')';
      c.fillRect(0, -bm.width/2, bm.length, bm.width);

      // Inti Sinar Putih Menyilaukan
      c.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.95) + ')';
      c.fillRect(0, -bm.width/4, bm.length, bm.width/2);

      // Kilat Petir Kosmik Menyambar
      c.strokeStyle = '#fef08a';
      c.lineWidth = 2.5;
      c.beginPath();
      for(var k=0; k<bm.length; k+=40){
        var offY = (Math.random() * bm.width - bm.width/2) * 0.6;
        if(k === 0) c.moveTo(k, offY);
        else c.lineTo(k, offY);
      }
      c.stroke();

      c.restore();
      bm.life--;
      if(bm.life <= 0) megaBeams.splice(mb, 1);
    }
  }

  // 4. Minimap Radar Pojok Layar
  function renderMinimap(c, player, map, npcs, monsters, portals){
    var mw = 76, mh = 54;
    var mx = W - mw - 6, my = 6;
    c.fillStyle = 'rgba(15, 23, 42, 0.88)';
    c.fillRect(mx, my, mw, mh);
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 1;
    c.strokeRect(mx, my, mw, mh);

    // Skala posisi
    var scX = mw / map.width;
    var scY = mh / map.height;

    // Titik Portal (Cyan / Magenta)
    if(portals && portals.length){
      for(var pt=0; pt<portals.length; pt++){
        c.fillStyle = portals[pt].color || '#06b6d4';
        c.fillRect(mx + portals[pt].x * scX - 1.5, my + portals[pt].y * scY - 1.5, 3.5, 3.5);
      }
    }

    // Titik NPC (Ungu)
    c.fillStyle = '#c084fc';
    for(var n=0; n<npcs.length; n++){
      c.fillRect(mx + npcs[n].x * scX - 1, my + npcs[n].y * scY - 1, 3, 3);
    }

    // Titik Monster (Merah)
    c.fillStyle = '#ef4444';
    for(var m=0; m<monsters.length; m++){
      if(monsters[m].hp > 0){
        c.fillRect(mx + monsters[m].x * scX - 1, my + monsters[m].y * scY - 1, 2, 2);
      }
    }

    // Titik Player (Hijau / Emas)
    c.fillStyle = player.foxTier >= 11 ? '#ffd700' : '#4ade80';
    c.fillRect(mx + player.x * scX - 2, my + player.y * scY - 2, 4, 4);
  }
`;
