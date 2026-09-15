/**
 * RPG Client HTML Payload Generator
 * Self-contained, robust HTML/CSS/JS Pixel Fantasy RPG.
 * Didesain khusus agar tampil responsif, tidak hitam/blank di WebView WhatsApp maupun web browser.
 */

import { PIXEL_RENDERER_CODE } from './pixelRenderer.js';
import { FOX_SKILLS_FX_CODE } from './foxSkillsFx.js';

export function getRpgHtml(wsHostUrl = '') {
	return `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none!important;user-select:none!important;-webkit-user-select:none!important;-webkit-user-drag:none!important}
html,body{width:100%;touch-action:none}
body{background:#060b17;padding:8px 6px;color:#e2e8f0;overflow-y:auto;-webkit-touch-callout:none!important;user-select:none!important}

#rpg-app{max-width:420px;margin:0 auto;position:relative;-webkit-touch-callout:none!important;user-select:none!important}

/* HEADER BAR */
.rpg-header{background:linear-gradient(90deg,#0f172a,#1e1b4b,#0f172a);border:1px solid #1e293b;border-radius:12px;padding:6px 10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.rpg-title-group{display:flex;flex-direction:column}
.rpg-title{font-size:13px;font-weight:900;color:#f8fafc;letter-spacing:0.5px;display:flex;align-items:center;gap:4px}
.rpg-title span{color:#facc15}
.rpg-subtitle{font-size:8.5px;color:#94a3b8;font-weight:600}
.rpg-meta-tools{display:flex;align-items:center;gap:6px}
.badge-owner{background:#eab308;color:#000;font-size:8.5px;font-weight:900;padding:2px 5px;border-radius:4px;display:none}
.sound-btn{background:rgba(255,255,255,0.08);border:1px solid #475569;color:#e2e8f0;width:28px;height:28px;border-radius:8px;font-size:13px;display:flex;align-items:center;justify-content:center;cursor:pointer}

/* HUD STATS */
.rpg-hud{padding:6px 8px;background:#090e1f;border:1px solid #1e293b;border-radius:12px;display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}
.hud-bar-box{display:flex;flex-direction:column;gap:2px}
.hud-bar-title{font-size:8.5px;font-weight:800;color:#94a3b8;display:flex;justify-content:space-between}
.hud-bar-track{width:100%;height:6px;background:#1e293b;border-radius:3px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}
.bar-hp{height:100%;background:linear-gradient(90deg,#ef4444,#22c55e);width:100%;transition:width .2s}
.bar-mp{height:100%;background:linear-gradient(90deg,#3b82f6,#06b6d4);width:100%;transition:width .2s}
.bar-fox{height:100%;background:linear-gradient(90deg,#ea580c,#facc15);width:0%;transition:width .2s}

.hud-info-box{display:flex;align-items:center;justify-content:flex-end;gap:5px}
.map-badge{background:#312e81;color:#c7d2fe;font-size:9px;font-weight:800;padding:3px 7px;border-radius:6px;border:1px solid #4338ca}
.fox-badge{background:linear-gradient(90deg,#ea580c,#ca8a04);color:#fff;font-size:8.5px;font-weight:900;padding:3px 6px;border-radius:6px;box-shadow:0 0 8px rgba(234,88,12,0.5);white-space:nowrap}

/* CANVAS GAME WINDOW */
.gw{position:relative;width:100%;border:2px solid rgba(56,189,248,0.4);border-radius:14px;overflow:hidden;background:#070d1d;box-shadow:0 0 16px rgba(56,189,248,0.2);margin-bottom:6px}
#gameCanvas{display:block;width:100%;height:auto;aspect-ratio:400/250;image-rendering:pixelated;touch-action:none}

/* OVERLAY TICKER & DIALOGUE */
.game-ticker{position:absolute;top:6px;left:8px;right:8px;pointer-events:none;z-index:15;display:flex;justify-content:space-between}
.ticker-log{background:rgba(0,0,0,0.65);padding:2px 8px;border-radius:6px;font-size:9px;color:#f8fafc;backdrop-filter:blur(2px);max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ticker-online{background:rgba(15,23,42,0.8);border:1px solid #3b82f6;color:#38bdf8;padding:2px 6px;border-radius:6px;font-size:8.5px;font-weight:800}

/* NPC DIALOGUE POPUP */
.npc-dialogue{position:absolute;left:8px;right:8px;bottom:8px;background:#0f172a;border:2px solid #a855f7;border-radius:12px;padding:8px 10px;z-index:30;box-shadow:0 6px 20px rgba(0,0,0,0.85);display:none}
.npc-dialogue.active{display:block}
.npc-dialogue-head{font-size:11px;font-weight:900;color:#c084fc;margin-bottom:2px;display:flex;justify-content:space-between}
.npc-dialogue-body{font-size:10px;color:#cbd5e1;line-height:1.3;margin-bottom:6px}
.npc-dialogue-actions{display:flex;gap:6px;justify-content:flex-end}
.npc-btn{padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;border:0;cursor:pointer}
.npc-btn-act{background:#a855f7;color:#fff}
.npc-btn-close{background:#334155;color:#94a3b8}

/* MOBILE CONTROLS PAD */
.controls-panel{padding:8px 6px;background:#090e1f;border:1px solid #1e293b;border-radius:14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}

/* 8-DIRECTIONAL CIRCULAR WHEEL D-PAD */
.dpad-wheel{position:relative;width:116px;height:116px;background:radial-gradient(circle at 50% 50%,#1e293b 15%,#090e1f 85%);border-radius:50%;border:2px solid #38bdf8;box-shadow:0 0 16px rgba(56,189,248,0.35),inset 0 0 12px rgba(0,0,0,0.85);flex-shrink:0;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.dpad-btn{position:absolute;background:linear-gradient(135deg,#1e293b,#0f172a);border:1.5px solid #475569;display:flex;align-items:center;justify-content:center;color:#f8fafc;box-shadow:0 2px 5px rgba(0,0,0,0.6);cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;outline:none}
.dpad-btn:active,.dpad-btn.pressed{background:#38bdf8!important;color:#000!important;border-color:#bae6fd!important;box-shadow:0 0 12px #38bdf8!important;transform:scale(0.92)}

/* 4 Cardinal Buttons */
.dp-cardinal{font-size:13px;font-weight:900}
.dp-up{top:2px;left:41px;width:34px;height:32px;border-radius:10px 10px 4px 4px}
.dp-down{bottom:2px;left:41px;width:34px;height:32px;border-radius:4px 4px 10px 10px}
.dp-left{top:41px;left:2px;width:32px;height:34px;border-radius:10px 4px 4px 10px}
.dp-right{top:41px;right:2px;width:32px;height:34px;border-radius:4px 10px 10px 4px}

/* 4 Diagonal Corner Buttons (Membentuk Lingkaran Luar Fleksibel) */
.dp-diag{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1e293b,#0b1329);border-color:#38bdf8;font-size:11px;font-weight:900;color:#38bdf8}
.dp-diag:active,.dp-diag.pressed{background:#06b6d4!important;color:#000!important;border-color:#a5f3fc!important;box-shadow:0 0 10px #06b6d4!important}
.dp-ul{top:8px;left:8px}
.dp-ur{top:8px;right:8px}
.dp-dl{bottom:8px;left:8px}
.dp-dr{bottom:8px;right:8px}

.dp-center{position:absolute;top:42px;left:42px;width:32px;height:32px;border-radius:50%;background:#090e1f;border:1.5px solid #38bdf8;font-size:10px;color:#38bdf8;display:flex;align-items:center;justify-content:center;pointer-events:none;box-shadow:inset 0 0 6px rgba(56,189,248,0.5)}

/* CENTER INTERACT */
.center-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.btn-talk{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#4c1d95);border:2px solid #c084fc;color:#fff;font-size:17px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(124,58,237,0.4);cursor:pointer;touch-action:none}
.btn-talk span{font-size:7.5px;font-weight:800}
.btn-talk:active,.btn-talk.pressed{transform:scale(0.92);filter:brightness(1.3)}
.btn-class-change{background:transparent;border:0;color:#94a3b8;font-size:8.5px;font-weight:700;cursor:pointer;padding:2px 4px}

/* ACTION BUTTONS */
.action-grid{display:grid;grid-template-columns:48px 48px;grid-template-rows:48px 48px;gap:6px;flex-shrink:0}
.act-btn{width:48px;height:48px;border-radius:14px;border:2px solid rgba(255,255,255,0.25);color:#fff;font-weight:900;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.5);cursor:pointer;touch-action:none}
.act-btn span{font-size:7.5px;margin-top:1px;font-weight:800}
.act-btn:active,.act-btn.pressed{transform:scale(0.92);filter:brightness(1.4)}

.btn-atk{background:linear-gradient(135deg,#dc2626,#7f1d1d);border-color:#f87171}
.btn-skl{background:linear-gradient(135deg,#2563eb,#1e3a8a);border-color:#60a5fa}
.btn-ddg{background:linear-gradient(135deg,#059669,#064e3b);border-color:#34d399}
.btn-fox{background:linear-gradient(135deg,#d97706,#78350f);border-color:#fde047}

/* TELEPORT BUTTON & MODAL */
.teleport-btn{background:linear-gradient(135deg,#06b6d4,#6366f1);border:1px solid #38bdf8;color:#fff;font-size:9.5px;font-weight:900;padding:3px 8px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:3px;box-shadow:0 0 10px rgba(6,182,212,0.4);white-space:nowrap}
.teleport-btn:active{transform:scale(0.95)}
.teleport-modal{position:absolute;top:6px;left:6px;right:6px;bottom:6px;background:#090d1f;border:2px solid #38bdf8;border-radius:14px;padding:10px;z-index:60;box-shadow:0 10px 35px rgba(0,0,0,0.95);display:none;flex-direction:column;overflow-y:auto}
.teleport-modal.active{display:flex}
.tp-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid #1e293b;padding-bottom:6px}
.tp-title{font-size:12px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:5px}
.tp-close{background:#1e293b;border:1px solid #475569;color:#cbd5e1;width:24px;height:24px;border-radius:6px;font-size:11px;font-weight:900;cursor:pointer}
.tp-modal-sub{font-size:9px;color:#94a3b8;margin-bottom:8px}
.tp-grid{display:flex;flex-direction:column;gap:6px}
.tp-card{background:#0f172a;border:1.5px solid #334155;border-radius:10px;padding:7px 9px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:all .15s}
.tp-card:active{transform:scale(0.97);border-color:#38bdf8;background:#1e293b}
.tp-card.current{border-color:#22c55e;background:#052e16}
.tp-info{display:flex;flex-direction:column;gap:2px}
.tp-name{font-size:10.5px;font-weight:900;color:#f8fafc;display:flex;align-items:center;gap:5px}
.tp-tag{font-size:7.5px;font-weight:800;padding:1px 5px;border-radius:4px;color:#fff}
.tp-desc{font-size:8px;color:#94a3b8}
.tp-go-btn{background:#38bdf8;color:#090d1f;border:0;padding:4px 9px;border-radius:6px;font-size:9px;font-weight:900;cursor:pointer;white-space:nowrap}
.tp-card.current .tp-go-btn{background:#22c55e;color:#fff}

/* FOOTER HINT */
.rpg-footer{padding:3px 8px 6px;text-align:center;font-size:8px;color:#64748b}
</style>

<div id="rpg-app">
  <!-- HEADER -->
  <div class="rpg-header">
    <div class="rpg-title-group">
      <div class="rpg-title">⚔️ PIXEL FANTASY <span>RPG</span></div>
      <div class="rpg-subtitle" id="rpgCharInfo">Ksatria [Knight] • LV.1</div>
    </div>
    <div class="rpg-meta-tools">
      <button class="teleport-btn" id="btnTeleportModal" title="Peta Dunia & Teleportasi">🌀 PETA</button>
      <span class="badge-owner" id="badgeOwner">👑 OWNER</span>
      <button class="sound-btn" id="btnSound" title="Toggle Suara">🔊</button>
    </div>
  </div>

  <!-- HUD STATUS BARS -->
  <div class="rpg-hud">
    <div class="hud-bar-box">
      <div class="hud-bar-title"><span>HP</span><span id="txtHp">100/100</span></div>
      <div class="hud-bar-track"><div class="bar-hp" id="barHp"></div></div>
      <div class="hud-bar-title" style="margin-top:2px"><span>MP</span><span id="txtMp">50/50</span></div>
      <div class="hud-bar-track"><div class="bar-mp" id="barMp"></div></div>
    </div>

    <div class="hud-bar-box">
      <div class="hud-bar-title"><span>FOX SOUL</span><span id="txtFox">0/500</span></div>
      <div class="hud-bar-track"><div class="bar-fox" id="barFox"></div></div>
      <div class="hud-info-box" style="margin-top:4px">
        <span class="map-badge" id="hudMapName">Valoria City</span>
        <span class="fox-badge" id="hudFoxBadge">🦊 Ekor 0</span>
      </div>
    </div>
  </div>

  <!-- CANVAS DISPLAY -->
  <div class="gw" id="canvasWrap">
    <canvas id="gameCanvas" width="400" height="250"></canvas>

    <!-- FLOATING TICKER -->
    <div class="game-ticker">
      <div class="ticker-log" id="tickerLog">Selamat datang di Dunia Pixel Fantasy!</div>
      <div class="ticker-online" id="tickerOnline">🟢 Solo/Sync</div>
    </div>

    <!-- NPC DIALOGUE POPUP -->
    <div class="npc-dialogue" id="npcBox">
      <div class="npc-dialogue-head">
        <span id="npcTitle">Raja Valoria</span>
        <span id="npcRole">[Penguasa Kota]</span>
      </div>
      <div class="npc-dialogue-body" id="npcMsg">Bawalah kedamaian ke negeri ini! Kalahkan monster di Hutan Berbisik.</div>
      <div class="npc-dialogue-actions">
        <button class="npc-btn npc-btn-close" id="btnNpcClose">Tutup</button>
        <button class="npc-btn npc-btn-act" id="btnNpcAct">Terima Berkah (+HP/MP)</button>
      </div>
    </div>
  </div>

  <!-- TELEPORT MODAL (FAST TRAVEL 5 REGIONS) -->
  <div class="teleport-modal" id="teleportModal">
    <div class="tp-modal-head">
      <div class="tp-title">🌀 GERBANG TELEPORTASI DUNIA</div>
      <button class="tp-close" id="btnTpClose">✕</button>
    </div>
    <div class="tp-modal-sub">Pilih wilayah tujuan petualangan & farming monster:</div>
    <div class="tp-grid" id="tpGrid"></div>
  </div>

  <!-- VIRTUAL CONTROLS -->
  <div class="controls-panel" oncontextmenu="return false;">
    <!-- 8-DIRECTIONAL CIRCULAR WHEEL D-PAD -->
    <div class="dpad-wheel" id="dpadWheel" oncontextmenu="return false;">
      <button class="dpad-btn dp-cardinal dp-up" id="dpUp" title="Atas" oncontextmenu="return false;">▲</button>
      <button class="dpad-btn dp-diag dp-ur" id="dpUr" title="Kanan Atas" oncontextmenu="return false;">↗</button>
      <button class="dpad-btn dp-cardinal dp-right" id="dpRight" title="Kanan" oncontextmenu="return false;">▶</button>
      <button class="dpad-btn dp-diag dp-dr" id="dpDr" title="Kanan Bawah" oncontextmenu="return false;">↘</button>
      <button class="dpad-btn dp-cardinal dp-down" id="dpDown" title="Bawah" oncontextmenu="return false;">▼</button>
      <button class="dpad-btn dp-diag dp-dl" id="dpDl" title="Kiri Bawah" oncontextmenu="return false;">↙</button>
      <button class="dpad-btn dp-cardinal dp-left" id="dpLeft" title="Kiri" oncontextmenu="return false;">◀</button>
      <button class="dpad-btn dp-diag dp-ul" id="dpUl" title="Kiri Atas" oncontextmenu="return false;">↖</button>
      <div class="dp-center" id="dpCenter">●</div>
    </div>

    <!-- CENTER TALK & CLASS -->
    <div class="center-panel">
      <button class="btn-talk" id="btnTalk" oncontextmenu="return false;">💬<span>BICARA</span></button>
      <button class="btn-class-change" id="btnClassToggle">Ganti Kelas</button>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="action-grid" oncontextmenu="return false;">
      <button class="act-btn btn-atk" id="btnAtk" oncontextmenu="return false;">⚔️<span>ATK</span></button>
      <button class="act-btn btn-skl" id="btnSkl" oncontextmenu="return false;">🌀<span>SKILL</span></button>
      <button class="act-btn btn-ddg" id="btnDdg" oncontextmenu="return false;">💨<span>DODGE</span></button>
      <button class="act-btn btn-fox" id="btnFox" oncontextmenu="return false;">🦊<span>FOX</span></button>
    </div>
  </div>

  <!-- FOOTER INSTRUCTION -->
  <div class="rpg-footer">
    🕹️ 8-Arah Fleksibel Pad Lingkaran • Multi-Touch Serang Sambil Bergerak Bebas!
  </div>
</div>

<script>
window.onerror = function(msg, src, line){
  var log = document.getElementById('tickerLog');
  if(log){
    log.textContent = '⚠ ' + msg;
    log.style.color = '#f87171';
  }
};

(function(){
  /* ============ AUDIO SYNTHESIZER (ZERO ASSET) ============ */
  var AC = null;
  var isMuted = false;
  try {
    isMuted = localStorage.getItem('rpg_muted') === '1';
  } catch(e){}

  function getAudioCtx(){
    if(!AC){
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if(Ctx) AC = new Ctx();
      } catch(e){}
    }
    if(AC && AC.state === 'suspended'){
      try { AC.resume(); } catch(e){}
    }
    return AC;
  }

  function playTone(freq, dur, type, gain, slideFreq){
    if(isMuted) return;
    var ac = getAudioCtx();
    if(!ac) return;
    try {
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var g = ac.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      if(slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, t + dur);
      g.gain.setValueAtTime(gain || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch(e){}
  }

  function playNoise(dur, gain, cutoff){
    if(isMuted) return;
    var ac = getAudioCtx();
    if(!ac) return;
    try {
      var t = ac.currentTime;
      var bufferSize = Math.max(1, Math.floor(ac.sampleRate * dur));
      var buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      var data = buffer.getChannelData(0);
      for(var i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;

      var noise = ac.createBufferSource();
      noise.buffer = buffer;
      var filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff || 1000;
      var g = ac.createGain();
      g.gain.setValueAtTime(gain || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(g);
      g.connect(ac.destination);
      noise.start(t);
      noise.stop(t + dur + 0.02);
    } catch(e){}
  }

  function sfxAttack(){ playTone(380, 0.09, 'sawtooth', 0.08, 120); }
  function sfxSkill(){ playNoise(0.2, 0.15, 1400); playTone(650, 0.18, 'sine', 0.1, 220); }
  function sfxDodge(){ playTone(440, 0.12, 'sine', 0.06, 880); }
  function sfxHit(){ playNoise(0.12, 0.18, 800); playTone(180, 0.1, 'square', 0.09, 60); }
  function sfxSoul(){ playTone(784, 0.06, 'triangle', 0.1); playTone(1046, 0.14, 'sine', 0.12); }
  function sfxFoxBeam(){ playNoise(0.6, 0.25, 400); playTone(110, 0.5, 'sawtooth', 0.2, 880); }
  function sfxHeal(){ [523, 659, 784, 1046].forEach(function(f, i){ setTimeout(function(){ playTone(f, 0.12, 'triangle', 0.07); }, i * 60); }); }
  function sfxPortal(){
    playTone(260, 0.35, 'sine', 0.15, 880);
    setTimeout(function(){ playTone(520, 0.25, 'triangle', 0.12, 1040); }, 80);
  }

  // Sound Button Toggle
  var btnSound = document.getElementById('btnSound');
  if(btnSound){
    btnSound.textContent = isMuted ? '🔇' : '🔊';
    btnSound.onclick = function(){
      isMuted = !isMuted;
      btnSound.textContent = isMuted ? '🔇' : '🔊';
      try { localStorage.setItem('rpg_muted', isMuted ? '1' : '0'); } catch(e){}
      if(!isMuted) sfxSoul();
    };
  }

  /* ============ CANVAS & RESIZING ============ */
  var cv = document.getElementById('gameCanvas');
  var ctx = cv.getContext('2d');
  var W = 400, H = 250;
  cv.width = W;
  cv.height = H;

  /* ============ GAME STATE & ENGINE ============ */
  var classes = ['knight', 'archer', 'mage'];
  var classIdx = 0;

  var player = {
    x: 620,
    y: 460,
    vx: 0,
    vy: 0,
    speed: 3.8,
    facing: 'down',
    aimAngle: Math.PI / 2,
    aimDirX: 0,
    aimDirY: 1,
    classType: 'knight',
    name: 'Ksatria',
    level: 1,
    exp: 0,
    nextExp: 100,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    foxSoul: 0,
    foxTier: 0,
    foxActive: false,
    isOwner: false,
    invincibleTimer: 0,
    dodgeRollTimer: 0,
    attackTimer: 0,
    walkFrame: 0
  };

  /* ============ 8-DIRECTIONAL CIRCULAR WHEEL D-PAD STATE ============ */
  var dpad = {
    active: false,
    pointerId: null,
    x: 0,
    y: 0,
    activeBtn: null
  };

  /* ============ 5 WILAYAH DUNIA BESAR (MULTI-MAP & TELEPORTASI) ============ */
  var MAP_REGIONS = {
    valoria_city: {
      id: 'valoria_city',
      name: 'Kota Valoria [Pusat Kerajaan]',
      shortName: 'Kota Valoria',
      badge: 'PUSAT KOTA',
      badgeColor: '#3b82f6',
      desc: 'Alun-alun megah, kastil raja, toko ramuan Elena & bengkel Torin.',
      width: 1800,
      height: 1300,
      portals: [
        { id: 'p1', name: '🌲 Ke Hutan Purba', targetMap: 'whispering_forest', targetX: 1600, targetY: 1220, x: 360, y: 340, color: '#16a34a', runeColor: '#4ade80' },
        { id: 'p2', name: '🔥 Ke Lembah Ekstrem (Farming)', targetMap: 'crimson_abyss', targetX: 1600, targetY: 1220, x: 880, y: 340, color: '#dc2626', runeColor: '#f97316' },
        { id: 'p3', name: '❄️ Ke Salju Frostfang', targetMap: 'frostfang_tundra', targetX: 1300, targetY: 1020, x: 360, y: 620, color: '#0284c7', runeColor: '#7dd3fc' },
        { id: 'p4', name: '🦊 Ke Kuil Rubah Surgawi', targetMap: 'celestial_shrine', targetX: 1200, targetY: 920, x: 880, y: 620, color: '#a855f7', runeColor: '#eab308' }
      ],
      trees: [
        { x: 100, y: 150 }, { x: 220, y: 120 }, { x: 340, y: 140 },
        { x: 800, y: 140 }, { x: 920, y: 120 }, { x: 1060, y: 150 },
        { x: 1200, y: 130 }, { x: 1450, y: 160 }, { x: 1650, y: 140 },
        { x: 80, y: 620 }, { x: 180, y: 650 }, { x: 1600, y: 640 },
        { x: 1720, y: 620 }, { x: 140, y: 920 }, { x: 260, y: 1040 },
        { x: 420, y: 1180 }, { x: 840, y: 1160 }, { x: 1120, y: 1080 }
      ],
      lanterns: [
        { x: 380, y: 380 }, { x: 380, y: 580 },
        { x: 860, y: 380 }, { x: 860, y: 580 },
        { x: 570, y: 720 }, { x: 670, y: 720 }
      ],
      npcs: [
        { id: 'npc_king', name: 'Raja Arthurian IV', title: 'Penguasa Valoria', x: 620, y: 240, avatar: '👑', dialogue: 'Bawalah kedamaian ke Valoria! Masuki portal untuk menjelajahi 4 wilayah dunia!' },
        { id: 'npc_pot', name: 'Alkemis Elena', title: 'Pedagang Potion', x: 240, y: 490, avatar: '🧪', dialogue: 'Minum ramuan padang rumput ini untuk memulihkan seluruh HP & MP-mu!' },
        { id: 'npc_smith', name: 'Pandai Besi Torin', title: 'Master Senjata', x: 960, y: 490, avatar: '🔨', dialogue: 'Pergilah ke Lembah Ekstrem untuk farming monster dan melatih jurus Ekor 4 hingga 11!' }
      ],
      destructibles: [
        { id: 'pillar_1', name: 'Pilar Marmer', x: 440, y: 340, w: 36, h: 65, hp: 60, maxHp: 60, state: 'normal' },
        { id: 'pillar_2', name: 'Pilar Marmer', x: 800, y: 340, w: 36, h: 65, hp: 60, maxHp: 60, state: 'normal' },
        { id: 'crate_1', name: 'Peti Emas', x: 360, y: 520, w: 34, h: 34, hp: 40, maxHp: 40, state: 'normal' },
        { id: 'gate_1', name: 'Pagar Kayu', x: 550, y: 830, w: 140, h: 26, hp: 90, maxHp: 90, state: 'normal' }
      ],
      spawnPool: [
        { name: 'Slime Pelatihan', type: 'slime', hp: 45, atk: 5, radius: 15, color: '#22c55e', speed: 1.5, soulVal: 20 },
        { name: 'Goblin Pengintai', type: 'goblin', hp: 65, atk: 9, radius: 17, color: '#ef4444', speed: 2.0, soulVal: 30 }
      ],
      maxMonsters: 8
    },

    whispering_forest: {
      id: 'whispering_forest',
      name: 'Hutan Rimba Roh Purba [Wilayah Sangat Luas]',
      shortName: 'Hutan Rimba Purba',
      badge: 'HUTAN SANGAT LUAS',
      badgeColor: '#16a34a',
      desc: 'Peta super luas 3200x2400. Rimba lebat, serigala buas & treant kuno.',
      width: 3200,
      height: 2400,
      portals: [
        { id: 'p_forest_home', name: '🏰 Kembali ke Valoria', targetMap: 'valoria_city', targetX: 620, targetY: 460, x: 1600, y: 1140, color: '#38bdf8', runeColor: '#ffffff' }
      ],
      trees: [
        { x: 300, y: 300 }, { x: 500, y: 250 }, { x: 800, y: 400 }, { x: 1100, y: 200 }, { x: 1400, y: 350 },
        { x: 1800, y: 300 }, { x: 2200, y: 400 }, { x: 2600, y: 250 }, { x: 2900, y: 350 }, { x: 400, y: 800 },
        { x: 850, y: 750 }, { x: 1300, y: 850 }, { x: 1900, y: 800 }, { x: 2350, y: 750 }, { x: 2800, y: 850 },
        { x: 350, y: 1300 }, { x: 750, y: 1250 }, { x: 1200, y: 1350 }, { x: 2000, y: 1300 }, { x: 2500, y: 1250 },
        { x: 2950, y: 1350 }, { x: 450, y: 1800 }, { x: 900, y: 1750 }, { x: 1400, y: 1850 }, { x: 1850, y: 1800 },
        { x: 2300, y: 1750 }, { x: 2750, y: 1850 }, { x: 3000, y: 1900 }, { x: 600, y: 2150 }, { x: 1200, y: 2100 },
        { x: 1700, y: 2200 }, { x: 2200, y: 2150 }, { x: 2700, y: 2250 }
      ],
      lanterns: [],
      npcs: [],
      destructibles: [
        { id: 'f_cryst_1', name: 'Kristal Roh Hutan', x: 1400, y: 1100, w: 40, h: 56, hp: 120, maxHp: 120, state: 'normal' },
        { id: 'f_cryst_2', name: 'Kristal Roh Hutan', x: 1800, y: 1100, w: 40, h: 56, hp: 120, maxHp: 120, state: 'normal' },
        { id: 'f_stone_1', name: 'Batu Lumut Purba', x: 1600, y: 1320, w: 45, h: 45, hp: 100, maxHp: 100, state: 'normal' }
      ],
      spawnPool: [
        { name: 'Slime Rimba', type: 'slime', hp: 65, atk: 8, radius: 16, color: '#22c55e', speed: 1.7, soulVal: 35 },
        { name: 'Goblin Rimba', type: 'goblin', hp: 95, atk: 14, radius: 18, color: '#16a34a', speed: 2.3, soulVal: 50 },
        { name: 'Serigala Rimba Purba', type: 'wolf', hp: 140, atk: 18, radius: 20, color: '#475569', speed: 2.7, soulVal: 70 },
        { name: 'Treant Kuno (Mini Boss)', type: 'golem', hp: 380, atk: 30, radius: 26, color: '#15803d', speed: 1.3, isBoss: true, soulVal: 160 }
      ],
      maxMonsters: 35
    },

    crimson_abyss: {
      id: 'crimson_abyss',
      name: 'Lembah Neraka Ekstrem [Farming Leveling]',
      shortName: 'Lembah Ekstrem (Farming)',
      badge: 'FARMING EKSTREM',
      badgeColor: '#dc2626',
      desc: 'Zona farming monster paling ekstrem! Banyak monster lemah s/d Boss Naga berdarah tebal!',
      width: 3200,
      height: 2400,
      portals: [
        { id: 'p_abyss_home', name: '🏰 Kembali ke Valoria', targetMap: 'valoria_city', targetX: 620, targetY: 460, x: 1600, y: 1140, color: '#38bdf8', runeColor: '#ffffff' }
      ],
      trees: [],
      lanterns: [],
      npcs: [],
      destructibles: [
        { id: 'a_cryst_1', name: 'Pilar Magma Berapi', x: 1420, y: 1100, w: 42, h: 65, hp: 160, maxHp: 160, state: 'normal' },
        { id: 'a_cryst_2', name: 'Pilar Magma Berapi', x: 1780, y: 1100, w: 42, h: 65, hp: 160, maxHp: 160, state: 'normal' },
        { id: 'a_skull_1', name: 'Batu Obsidian Neraka', x: 1600, y: 1300, w: 45, h: 45, hp: 140, maxHp: 140, state: 'normal' }
      ],
      spawnPool: [
        // Lemah
        { name: 'Slime Magma (Lemah)', type: 'slime', hp: 55, atk: 8, radius: 16, color: '#ef4444', speed: 1.8, soulVal: 40 },
        { name: 'Imp Api Kecil (Lemah)', type: 'imp', hp: 85, atk: 12, radius: 17, color: '#dc2626', speed: 2.4, soulVal: 55 },
        // Sedang
        { name: 'Anjing Neraka (Sedang)', type: 'hound', hp: 170, atk: 22, radius: 20, color: '#991b1b', speed: 2.8, soulVal: 95 },
        { name: 'Berserker Lahar (Sedang)', type: 'goblin', hp: 260, atk: 32, radius: 22, color: '#b91c1c', speed: 2.3, soulVal: 135 },
        // Kuat
        { name: 'Golem Magma Raksasa (Kuat)', type: 'golem', hp: 550, atk: 45, radius: 28, color: '#ea580c', speed: 1.4, soulVal: 260 },
        // Boss Ekstrem
        { name: 'Infernal Dragon Lord (BOSS)', type: 'dragon', hp: 1100, atk: 65, radius: 34, color: '#ef4444', speed: 2.0, isBoss: true, soulVal: 600 }
      ],
      maxMonsters: 38
    },

    frostfang_tundra: {
      id: 'frostfang_tundra',
      name: 'Puncak Salju Frostfang [Dataran Es]',
      shortName: 'Salju Frostfang',
      badge: 'WILAYAH ES',
      badgeColor: '#0284c7',
      desc: 'Wilayah es abadi, serigala salju, raksasa Yeti & Blizzard Drake berkekuatan dingin.',
      width: 2600,
      height: 2000,
      portals: [
        { id: 'p_tundra_home', name: '🏰 Kembali ke Valoria', targetMap: 'valoria_city', targetX: 620, targetY: 460, x: 1300, y: 940, color: '#38bdf8', runeColor: '#ffffff' }
      ],
      trees: [],
      lanterns: [],
      npcs: [],
      destructibles: [
        { id: 't_ice_1', name: 'Kristal Es Abadi', x: 1150, y: 900, w: 40, h: 60, hp: 140, maxHp: 140, state: 'normal' },
        { id: 't_ice_2', name: 'Kristal Es Abadi', x: 1450, y: 900, w: 40, h: 60, hp: 140, maxHp: 140, state: 'normal' }
      ],
      spawnPool: [
        { name: 'Slime Es', type: 'slime', hp: 65, atk: 9, radius: 16, color: '#38bdf8', speed: 1.6, soulVal: 40 },
        { name: 'Serigala Frostfang', type: 'wolf', hp: 145, atk: 20, radius: 20, color: '#94a3b8', speed: 2.7, soulVal: 80 },
        { name: 'Snow Yeti (Kuat)', type: 'yeti', hp: 380, atk: 36, radius: 26, color: '#f1f5f9', speed: 1.5, soulVal: 190 },
        { name: 'Blizzard Drake (BOSS)', type: 'dragon', hp: 800, atk: 52, radius: 32, color: '#38bdf8', speed: 2.2, isBoss: true, soulVal: 400 }
      ],
      maxMonsters: 28
    },

    celestial_shrine: {
      id: 'celestial_shrine',
      name: 'Kuil Rubah Surgawi [Kuil Mahadewa]',
      shortName: 'Kuil Rubah Surgawi',
      badge: 'KUIL MAHADEWA',
      badgeColor: '#a855f7',
      desc: 'Altar marmer keramat & teratai sakura. Mengalahkan roh di sini memberi DOUBLE Fox Soul!',
      width: 2400,
      height: 1800,
      portals: [
        { id: 'p_shrine_home', name: '🏰 Kembali ke Valoria', targetMap: 'valoria_city', targetX: 620, targetY: 460, x: 1200, y: 840, color: '#38bdf8', runeColor: '#ffffff' }
      ],
      trees: [],
      lanterns: [],
      npcs: [],
      destructibles: [
        { id: 's_altar_1', name: 'Lentera Emas Suci', x: 1060, y: 800, w: 38, h: 60, hp: 150, maxHp: 150, state: 'normal' },
        { id: 's_altar_2', name: 'Lentera Emas Suci', x: 1340, y: 800, w: 38, h: 60, hp: 150, maxHp: 150, state: 'normal' }
      ],
      spawnPool: [
        { name: 'Roh Wisp Suci', type: 'fox_spirit', hp: 70, atk: 10, radius: 16, color: '#ffffff', speed: 2.0, soulVal: 80 },
        { name: 'Penjaga Kitsune Emas', type: 'fox_spirit', hp: 190, atk: 25, radius: 22, color: '#facc15', speed: 2.5, soulVal: 180 },
        { name: 'Avatar Rubah Ilahi (BOSS)', type: 'fox_spirit', hp: 520, atk: 50, radius: 28, color: '#eab308', speed: 2.3, isBoss: true, soulVal: 450 }
      ],
      maxMonsters: 24
    }
  };

  // Active Map Pointer
  var map = {
    id: 'valoria_city',
    name: MAP_REGIONS.valoria_city.name,
    width: MAP_REGIONS.valoria_city.width,
    height: MAP_REGIONS.valoria_city.height
  };

  var portals = MAP_REGIONS.valoria_city.portals.slice();
  var trees = MAP_REGIONS.valoria_city.trees.slice();
  var lanterns = MAP_REGIONS.valoria_city.lanterns.slice();
  var npcs = MAP_REGIONS.valoria_city.npcs.slice();
  var destructibles = MAP_REGIONS.valoria_city.destructibles.slice();

  // Active Monsters
  var monsters = [
    { id: 'm1', name: 'Slime Pelatihan', type: 'slime', x: 420, y: 920, hp: 45, maxHp: 45, atk: 5, radius: 16, color: '#22c55e', speed: 1.5, soulVal: 20 },
    { id: 'm2', name: 'Slime Pelatihan', type: 'slime', x: 520, y: 980, hp: 45, maxHp: 45, atk: 5, radius: 16, color: '#22c55e', speed: 1.5, soulVal: 20 },
    { id: 'm3', name: 'Goblin Pengintai', type: 'goblin', x: 920, y: 980, hp: 65, maxHp: 65, atk: 9, radius: 18, color: '#ef4444', speed: 2.0, soulVal: 30 },
    { id: 'm4', name: 'Goblin Pengintai', type: 'goblin', x: 1100, y: 940, hp: 65, maxHp: 65, atk: 9, radius: 18, color: '#ef4444', speed: 2.0, soulVal: 30 }
  ];

  // Spawning & Teleport State
  var spawnTimer = 0;
  var lastSpawnTimestamp = Date.now();
  var teleportCooldown = 0;

  /* ============ SISTEM TELEPORTASI & FAST TRAVEL ============ */
  function switchMap(targetMapId, targetX, targetY){
    if(!MAP_REGIONS[targetMapId]) return;
    var targetRegion = MAP_REGIONS[targetMapId];

    sfxPortal();
    screenShake = 14;

    map.id = targetRegion.id;
    map.name = targetRegion.name;
    map.width = targetRegion.width;
    map.height = targetRegion.height;

    player.x = targetX !== undefined ? targetX : Math.floor(targetRegion.width / 2);
    player.y = targetY !== undefined ? targetY : Math.floor(targetRegion.height / 2);
    player.vx = 0;
    player.vy = 0;
    teleportCooldown = 60; // 1-1.5 detik cooldown gerbang

    // Pasang elemen peta target
    trees = targetRegion.trees ? targetRegion.trees.slice() : [];
    lanterns = targetRegion.lanterns ? targetRegion.lanterns.slice() : [];
    npcs = targetRegion.npcs ? targetRegion.npcs.slice() : [];
    destructibles = targetRegion.destructibles ? targetRegion.destructibles.slice() : [];
    portals = targetRegion.portals ? targetRegion.portals.slice() : [];

    // Reset medan pertempuran lokal
    monsters = [];
    souls = [];
    projectiles = [];
    aoeEffects = [];
    damageTexts = [];

    // Spawn gelombang awal monster agar langsung hidup
    var initWaves = Math.min(4, Math.floor(targetRegion.maxMonsters / 4));
    for(var w=0; w<initWaves; w++){
      spawnRandomWave();
    }

    var hudMapEl = document.getElementById('hudMapName');
    if(hudMapEl) hudMapEl.textContent = targetRegion.shortName || targetRegion.name;

    populateTeleportModal();
    logTicker('🌀 Tiba di ' + targetRegion.name + '!');
  }

  /* ============ SISTEM SPAWN MONSTER DINAMIS (3 DETIK: 1, 3, ATAU 4 MONSTER) ============ */
  function updateMonsterSpawning(deltaMs){
    spawnTimer += deltaMs;
    // Tepat setiap 3 detik (3000 ms)
    if(spawnTimer >= 3000){
      spawnTimer = 0;
      spawnRandomWave();
    }
  }

  function spawnRandomWave(){
    var currentRegion = MAP_REGIONS[map.id] || MAP_REGIONS.valoria_city;
    var pool = currentRegion.spawnPool;
    if(!pool || pool.length === 0) return;

    // Hitung monster hidup
    var aliveCount = 0;
    for(var i=0; i<monsters.length; i++){
      if(monsters[i].hp > 0) aliveCount++;
    }
    var maxCap = currentRegion.maxMonsters || 30;
    if(aliveCount >= maxCap) return;

    // Sesuai permintaan pengguna: muncul random 4, kadang 3, kadang 1
    var possibleBatches = [1, 3, 4];
    var countToSpawn = possibleBatches[Math.floor(Math.random() * possibleBatches.length)];
    countToSpawn = Math.min(countToSpawn, maxCap - aliveCount);

    for(var s=0; s<countToSpawn; s++){
      var tpl = pool[Math.floor(Math.random() * pool.length)];
      // Spawn dalam jarak acak di sekitar pemain (radius 260 - 680 px)
      var ang = Math.random() * Math.PI * 2;
      var dist = 260 + Math.random() * 420;
      var mx = player.x + Math.cos(ang) * dist;
      var my = player.y + Math.sin(ang) * dist;

      // Batasi dalam batas aman peta
      mx = Math.max(80, Math.min(map.width - 80, mx));
      my = Math.max(80, Math.min(map.height - 80, my));

      var mId = 'mob_' + Date.now() + '_' + Math.floor(Math.random()*10000);
      monsters.push({
        id: mId,
        name: tpl.name,
        type: tpl.type || 'slime',
        x: mx,
        y: my,
        hp: tpl.hp,
        maxHp: tpl.hp,
        atk: tpl.atk,
        radius: tpl.radius || 18,
        color: tpl.color || '#ef4444',
        speed: tpl.speed || 1.8,
        isBoss: !!tpl.isBoss,
        soulVal: tpl.soulVal || 35
      });

      // Efek visual lingkaran sihir summon
      addAoe(mx, my, 22, tpl.color || '#f97316');
    }
  }

  // Isi data modal teleportasi
  function populateTeleportModal(){
    var grid = document.getElementById('tpGrid');
    if(!grid) return;
    grid.innerHTML = '';

    var regionKeys = Object.keys(MAP_REGIONS);
    regionKeys.forEach(function(key){
      var reg = MAP_REGIONS[key];
      var isCur = reg.id === map.id;

      var card = document.createElement('div');
      card.className = 'tp-card' + (isCur ? ' current' : '');
      card.innerHTML =
        '<div class="tp-info">' +
          '<div class="tp-name">' +
            reg.name +
            '<span class="tp-tag" style="background:' + reg.badgeColor + '">' + reg.badge + '</span>' +
          '</div>' +
          '<div class="tp-desc">' + reg.desc + '</div>' +
        '</div>' +
        '<button class="tp-go-btn">' + (isCur ? '✓ Di Sini' : 'Teleport') + '</button>';

      card.onclick = function(){
        if(!isCur){
          switchMap(reg.id);
        }
        document.getElementById('teleportModal').classList.remove('active');
      };
      grid.appendChild(card);
    });
  }

  // Entities & FX
  var souls = [];
  var projectiles = [];
  var damageTexts = [];
  var aoeEffects = [];
  var megaBeams = [];
  var screenShake = 0;
  var otherPlayers = [];

  ${PIXEL_RENDERER_CODE}
  ${FOX_SKILLS_FX_CODE}

  /* ============ INPUT STATES ============ */
  var keys = { up: false, down: false, left: false, right: false };

  function logTicker(msg){
    var el = document.getElementById('tickerLog');
    if(el) el.textContent = msg;
  }

  /* ============ WEBSOCKET CLIENT (RESILIENT) ============ */
  var ws = null;
  var isWsConnected = false;

  function initWebSocket(){
    // Hanya coba jika di browser dengan host valid
    var host = "${wsHostUrl}" || '';
    if(!host && typeof location !== 'undefined' && location.host && location.host.length > 2 && location.protocol.indexOf('http') === 0){
      host = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
    }
    if(!host) return;

    try {
      ws = new WebSocket(host + '/ws/rpg');
      ws.onopen = function(){
        isWsConnected = true;
        document.getElementById('tickerOnline').textContent = '🟢 Online Sync';
        ws.send(JSON.stringify({
          type: 'join',
          name: player.name,
          preferredClass: player.classType
        }));
      };
      ws.onmessage = function(ev){
        try {
          var data = JSON.parse(ev.data);
          if(data.type === 'init'){
            if(data.player && data.player.isOwner){
              player.isOwner = true;
              player.foxTier = 11;
              player.foxActive = true;
              document.getElementById('badgeOwner').style.display = 'inline-block';
            }
          } else if(data.type === 'state'){
            otherPlayers = (data.players || []).filter(function(p){ return p.name !== player.name; });
          }
        } catch(e){}
      };
      ws.onclose = function(){
        isWsConnected = false;
        document.getElementById('tickerOnline').textContent = '🟡 Mode Lokal';
      };
    } catch(e){
      isWsConnected = false;
    }
  }
  initWebSocket();

  /* ============ COMBAT & SKILLS ============ */
  function addDamageText(x, y, text, color){
    damageTexts.push({ x: x, y: y, text: text, color: color || '#ef4444', life: 35 });
  }

  function addAoe(x, y, radius, color){
    aoeEffects.push({ x: x, y: y, radius: radius, color: color || '#38bdf8', life: 20, maxLife: 20 });
  }

  function spawnSoul(x, y, val){
    souls.push({ x: x, y: y, val: val || 25, life: 600, t: Math.random()*Math.PI*2 });
  }

  function triggerAttack(){
    sfxAttack();
    player.attackTimer = 14;
    var reach = 65;
    var atkPower = player.classType === 'knight' ? 28 : (player.classType === 'archer' ? 22 : 32);
    if(player.foxTier >= 11) atkPower *= 2.5;

    var dirX = typeof player.aimDirX === 'number' ? player.aimDirX : (player.facing === 'right' ? 1 : (player.facing === 'left' ? -1 : 0));
    var dirY = typeof player.aimDirY === 'number' ? player.aimDirY : (player.facing === 'down' ? 1 : (player.facing === 'up' ? -1 : 0));
    if(dirX === 0 && dirY === 0) dirY = 1;

    var hitBox = {
      x: player.x + dirX * reach,
      y: player.y + dirY * reach,
      radius: 46
    };
    addAoe(hitBox.x, hitBox.y, 38, '#f87171');

    // Archer shooting arrow projectile in 360 joystick direction
    if(player.classType === 'archer'){
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: dirX * 9.5,
        vy: dirY * 9.5,
        radius: 6,
        color: '#facc15',
        damage: atkPower,
        life: 48
      });
      return;
    }

    // Mage shooting arcane sphere in 360 joystick direction
    if(player.classType === 'mage'){
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: dirX * 7.5,
        vy: dirY * 7.5,
        radius: 12,
        color: '#c084fc',
        damage: atkPower,
        life: 58
      });
      return;
    }

    // Knight melee attack check
    checkMeleeHit(hitBox.x, hitBox.y, hitBox.radius, atkPower);
  }

  function checkMeleeHit(hx, hy, hRad, dmg){
    // Hit Monsters
    for(var i=0; i<monsters.length; i++){
      var m = monsters[i];
      if(m.hp <= 0) continue;
      var d = Math.hypot(m.x - hx, m.y - hy);
      if(d < hRad + m.radius){
        m.hp -= dmg;
        sfxHit();
        addDamageText(m.x, m.y - 12, '-' + Math.round(dmg), '#ef4444');
        if(m.hp <= 0){
          m.deadTime = Date.now();
          logTicker('Ksatria mengalahkan ' + m.name + '!');
          var soulMult = map.id === 'celestial_shrine' ? 2 : 1;
          spawnSoul(m.x, m.y, (m.soulVal || 35) * soulMult);
          gainExp(m.isBoss ? 160 : Math.max(25, Math.round(m.maxHp * 0.45)));
        }
      }
    }

    // Hit Destructibles
    for(var j=0; j<destructibles.length; j++){
      var ds = destructibles[j];
      if(ds.hp <= 0) continue;
      var cx = ds.x + ds.w/2;
      var cy = ds.y + ds.h/2;
      if(Math.hypot(cx - hx, cy - hy) < hRad + ds.w/2){
        ds.hp -= dmg;
        sfxHit();
        screenShake = 6;
        addDamageText(cx, cy, '-' + Math.round(dmg), '#f59e0b');
        if(ds.hp <= 0){
          ds.state = 'destroyed';
          logTicker('Reruntuhan hancur berantakan!');
          spawnSoul(cx, cy, 50);
          addAoe(cx, cy, 50, '#94a3b8');
        } else if(ds.hp < ds.maxHp * 0.5){
          ds.state = 'cracked';
        }
      }
    }
  }

  function triggerSkill(){
    if(player.mp < 15){
      logTicker('MP tidak cukup!');
      return;
    }
    player.mp -= 15;
    sfxSkill();
    screenShake = 8;

    // Whirlwind / Barrage / Nova
    addAoe(player.x, player.y, 110, '#38bdf8');
    var skillDmg = player.classType === 'knight' ? 55 : (player.classType === 'archer' ? 48 : 65);
    if(player.foxTier >= 11) skillDmg *= 2.5;

    // Hit all monsters in radius
    for(var i=0; i<monsters.length; i++){
      var m = monsters[i];
      if(m.hp <= 0) continue;
      if(Math.hypot(m.x - player.x, m.y - player.y) < 110 + m.radius){
        m.hp -= skillDmg;
        sfxHit();
        addDamageText(m.x, m.y - 15, 'CRIT -' + Math.round(skillDmg), '#38bdf8');
        if(m.hp <= 0){
          m.deadTime = Date.now();
          var soulMult = map.id === 'celestial_shrine' ? 2 : 1;
          spawnSoul(m.x, m.y, (m.soulVal || 40) * soulMult);
          gainExp(m.isBoss ? 180 : Math.max(30, Math.round(m.maxHp * 0.5)));
        }
      }
    }

    // Hit nearby destructibles
    for(var j=0; j<destructibles.length; j++){
      var ds = destructibles[j];
      if(ds.hp <= 0) continue;
      if(Math.hypot(ds.x + ds.w/2 - player.x, ds.y + ds.h/2 - player.y) < 120){
        ds.hp -= skillDmg;
        if(ds.hp <= 0){
          ds.state = 'destroyed';
          spawnSoul(ds.x + ds.w/2, ds.y + ds.h/2, 50);
        }
      }
    }
    updateHud();
  }

  function triggerDodge(){
    if(player.dodgeRollTimer > 0) return;
    sfxDodge();
    player.dodgeRollTimer = 18;
    player.invincibleTimer = 22;
    var dirX = typeof player.aimDirX === 'number' ? player.aimDirX : (player.facing === 'right' ? 1 : (player.facing === 'left' ? -1 : 0));
    var dirY = typeof player.aimDirY === 'number' ? player.aimDirY : (player.facing === 'down' ? 1 : (player.facing === 'up' ? -1 : 0));
    if(dirX === 0 && dirY === 0) dirY = 1;
    player.vx = dirX * 9.5;
    player.vy = dirY * 9.5;
    addAoe(player.x, player.y, 28, '#34d399');
  }

  function triggerFox(){
    if(player.foxTier < 4 && !player.isOwner){
      logTicker('Kumpulkan Fox Soul dari monster untuk membuka Roh Rubah!');
      return;
    }
    player.foxActive = true;

    if(player.foxTier >= 11 || player.isOwner){
      triggerBijuuBeam(player);
    } else if(player.foxTier >= 7){
      triggerFoxfireBarrage(player);
    } else {
      triggerFoxClaws(player);
    }
  }

  function gainExp(amount){
    player.exp += amount;
    if(player.exp >= player.nextExp){
      player.level++;
      player.exp -= player.nextExp;
      player.nextExp = Math.floor(player.nextExp * 1.5);
      player.maxHp += 20;
      player.hp = player.maxHp;
      player.maxMp += 10;
      player.mp = player.maxMp;
      sfxHeal();
      addDamageText(player.x, player.y - 30, 'LEVEL UP! LV.' + player.level, '#facc15');
      logTicker('LEVEL UP! Menjadi Level ' + player.level);
    }
    updateHud();
  }

  function updateHud(){
    document.getElementById('txtHp').textContent = Math.round(player.hp) + '/' + player.maxHp;
    document.getElementById('txtMp').textContent = Math.round(player.mp) + '/' + player.maxMp;
    document.getElementById('txtFox').textContent = player.foxSoul + '/500';

    var hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    var mpPct = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));
    var foxPct = Math.max(0, Math.min(100, (player.foxSoul / 500) * 100));

    document.getElementById('barHp').style.width = hpPct + '%';
    document.getElementById('barMp').style.width = mpPct + '%';
    document.getElementById('barFox').style.width = foxPct + '%';

    var cName = player.classType.toUpperCase();
    document.getElementById('rpgCharInfo').textContent = player.name + ' [' + cName + '] • LV.' + player.level;

    var badgeText = '🦊 Ekor ' + player.foxTier;
    if(player.foxTier >= 11 || player.isOwner) badgeText = '👑 EKOR 11 (MAHADEWA)';
    else if(player.foxTier >= 7) badgeText = '🔥 EKOR 7 (ROH BIRU)';
    else if(player.foxTier >= 4) badgeText = '⚡ EKOR 4 (API MERAH)';
    document.getElementById('hudFoxBadge').textContent = badgeText;
  }

  /* ============ NPC INTERACTION ============ */
  var activeNpc = null;
  function interactNearestNpc(){
    var nearest = null;
    var minD = 120;
    for(var i=0; i<npcs.length; i++){
      var d = Math.hypot(npcs[i].x - player.x, npcs[i].y - player.y);
      if(d < minD){ minD = d; nearest = npcs[i]; }
    }
    if(!nearest){
      logTicker('Dekati NPC (Raja, Alkemis, atau Pandai Besi) untuk bicara!');
      return;
    }

    activeNpc = nearest;
    document.getElementById('npcTitle').textContent = nearest.name;
    document.getElementById('npcRole').textContent = '[' + nearest.title + ']';
    document.getElementById('npcMsg').textContent = nearest.dialogue;

    var btnAct = document.getElementById('btnNpcAct');
    if(nearest.id === 'npc_pot'){
      btnAct.textContent = 'Beli Ramuan (+50 HP/MP)';
    } else if(nearest.id === 'npc_smith'){
      btnAct.textContent = 'Asah Senjata (+20 ATK)';
    } else {
      btnAct.textContent = 'Terima Berkah Kerajaan';
    }
    document.getElementById('npcBox').classList.add('active');
  }

  document.getElementById('btnNpcClose').onclick = function(){
    document.getElementById('npcBox').classList.remove('active');
  };

  document.getElementById('btnNpcAct').onclick = function(){
    if(!activeNpc) return;
    sfxHeal();
    if(activeNpc.id === 'npc_pot'){
      player.hp = Math.min(player.maxHp, player.hp + 50);
      player.mp = Math.min(player.maxMp, player.mp + 50);
      addDamageText(player.x, player.y - 20, '+50 HP/MP', '#22c55e');
      logTicker('Meminum ramuan penyembuh Alkemis!');
    } else if(activeNpc.id === 'npc_smith'){
      player.foxSoul = Math.min(500, player.foxSoul + 100);
      checkFoxUpgrade();
      addDamageText(player.x, player.y - 20, '+100 Fox Soul!', '#facc15');
      logTicker('Pandai Besi mengalirkan energi mistis ke senjatamu!');
    } else {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      gainExp(50);
      addDamageText(player.x, player.y - 20, 'DIBERKAHI RAJA!', '#facc15');
    }
    updateHud();
    document.getElementById('npcBox').classList.remove('active');
  };

  function checkFoxUpgrade(){
    if(player.foxSoul >= 500 && player.foxTier < 11){
      player.foxTier = 11;
      player.foxActive = true;
      sfxFoxBeam();
      screenShake = 15;
      logTicker('👑 KEBANGKITAN EKOR 11! Kamu telah mencapai wujud Mahadewa!');
    } else if(player.foxSoul >= 300 && player.foxTier < 7){
      player.foxTier = 7;
      player.foxActive = true;
      sfxHeal();
      logTicker('🔥 KEBANGKITAN EKOR 7! Roh Rubah Biru terbangun!');
    } else if(player.foxSoul >= 100 && player.foxTier < 4){
      player.foxTier = 4;
      player.foxActive = true;
      sfxHeal();
      logTicker('⚡ KEBANGKITAN EKOR 4! Cakar Api Merah aktif!');
    }
    updateHud();
  }

  /* ============ GLOBAL ANTI CONTEXT MENU & TEXT SELECTION IN WHATSAPP ============ */
  function preventSelection(e){ if(e.cancelable) e.preventDefault(); return false; }
  window.addEventListener('contextmenu', preventSelection, { capture: true, passive: false });
  window.addEventListener('selectstart', preventSelection, { capture: true, passive: false });
  document.addEventListener('contextmenu', preventSelection, { capture: true, passive: false });
  document.addEventListener('selectstart', preventSelection, { capture: true, passive: false });

  /* ============ 8-DIRECTIONAL CIRCULAR WHEEL D-PAD CONTROLS ============ */
  var DIR_MAP = {
    dpUp:    { x: 0,       y: -1,      facing: 'up',    ang: -Math.PI/2 },
    dpUr:    { x: 0.7071,  y: -0.7071, facing: 'right', ang: -Math.PI/4 },
    dpRight: { x: 1,       y: 0,       facing: 'right', ang: 0 },
    dpDr:    { x: 0.7071,  y: 0.7071,  facing: 'right', ang: Math.PI/4 },
    dpDown:  { x: 0,       y: 1,       facing: 'down',  ang: Math.PI/2 },
    dpDl:    { x: -0.7071, y: 0.7071,  facing: 'left',  ang: (3*Math.PI)/4 },
    dpLeft:  { x: -1,      y: 0,       facing: 'left',  ang: Math.PI },
    dpUl:    { x: -0.7071, y: -0.7071, facing: 'left',  ang: -(3*Math.PI)/4 }
  };

  var dpadWheelEl = document.getElementById('dpadWheel');
  var allDpBtns = ['dpUp', 'dpUr', 'dpRight', 'dpDr', 'dpDown', 'dpDl', 'dpLeft', 'dpUl'];

  function clearDpadVisuals(){
    for(var i=0; i<allDpBtns.length; i++){
      var b = document.getElementById(allDpBtns[i]);
      if(b) b.classList.remove('pressed');
    }
  }

  function setDirection(btnId){
    if(!DIR_MAP[btnId]) return;
    var d = DIR_MAP[btnId];
    dpad.active = true;
    dpad.x = d.x;
    dpad.y = d.y;
    dpad.activeBtn = btnId;

    player.aimAngle = d.ang;
    player.aimDirX = d.x;
    player.aimDirY = d.y;
    player.facing = d.facing;

    clearDpadVisuals();
    var b = document.getElementById(btnId);
    if(b) b.classList.add('pressed');
  }

  function releaseDirection(){
    dpad.active = false;
    dpad.x = 0;
    dpad.y = 0;
    dpad.activeBtn = null;
    clearDpadVisuals();
  }

  // Pointer & Touch bindings for the 8 directional buttons
  for(var di=0; di<allDpBtns.length; di++){
    (function(btnId){
      var btnEl = document.getElementById(btnId);
      if(!btnEl) return;

      btnEl.addEventListener('pointerdown', function(e){
        if(e.cancelable) e.preventDefault();
        dpad.pointerId = e.pointerId;
        setDirection(btnId);
      });

      btnEl.addEventListener('touchstart', function(e){
        if(e.cancelable) e.preventDefault();
        setDirection(btnId);
      }, { passive: false });
    })(allDpBtns[di]);
  }

  // Sliding / Gliding over the 8-directional wheel pad
  function resolveWheelTouch(clientX, clientY){
    if(!dpadWheelEl) return;
    var rect = dpadWheelEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = clientX - cx;
    var dy = clientY - cy;
    var dist = Math.hypot(dx, dy);
    if(dist < 8){
      releaseDirection();
      return;
    }
    var angle = Math.atan2(dy, dx);
    var sector = Math.round(angle / (Math.PI / 4));
    if(sector === -2) setDirection('dpUp');
    else if(sector === -1) setDirection('dpUr');
    else if(sector === 0) setDirection('dpRight');
    else if(sector === 1) setDirection('dpDr');
    else if(sector === 2) setDirection('dpDown');
    else if(sector === 3) setDirection('dpDl');
    else if(sector === 4 || sector === -4) setDirection('dpLeft');
    else if(sector === -3) setDirection('dpUl');
  }

  if(dpadWheelEl){
    dpadWheelEl.addEventListener('pointermove', function(e){
      if(dpad.active && (dpad.pointerId === null || e.pointerId === dpad.pointerId)){
        if(e.cancelable) e.preventDefault();
        resolveWheelTouch(e.clientX, e.clientY);
      }
    });
    dpadWheelEl.addEventListener('touchmove', function(e){
      if(dpad.active && e.touches.length > 0){
        if(e.cancelable) e.preventDefault();
        var touch = e.touches[0];
        resolveWheelTouch(touch.clientX, touch.clientY);
      }
    }, { passive: false });
  }

  window.addEventListener('pointerup', function(e){
    if(dpad.active && (dpad.pointerId === null || e.pointerId === dpad.pointerId)){
      releaseDirection();
    }
  });
  window.addEventListener('pointercancel', function(e){
    if(dpad.active) releaseDirection();
  });
  window.addEventListener('touchend', function(e){
    if(dpad.active && e.touches.length === 0){
      releaseDirection();
    }
  });
  window.addEventListener('touchcancel', function(e){
    if(dpad.active) releaseDirection();
  });

  /* ============ MULTI-TOUCH ACTION BUTTONS ============ */
  function bindTouch(btnId, onDown, onUp){
    var el = document.getElementById(btnId);
    if(!el) return;
    function down(e){
      if(e.cancelable) e.preventDefault();
      el.classList.add('pressed');
      onDown();
    }
    function up(e){
      if(e.cancelable) e.preventDefault();
      el.classList.remove('pressed');
      if(onUp) onUp();
    }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up, { passive: false });
    el.addEventListener('touchcancel', up, { passive: false });
  }

  bindTouch('btnAtk', triggerAttack);
  bindTouch('btnSkl', triggerSkill);
  bindTouch('btnDdg', triggerDodge);
  bindTouch('btnFox', triggerFox);
  bindTouch('btnTalk', interactNearestNpc);

  document.getElementById('btnAtk').onclick = triggerAttack;
  document.getElementById('btnSkl').onclick = triggerSkill;
  document.getElementById('btnDdg').onclick = triggerDodge;
  document.getElementById('btnFox').onclick = triggerFox;
  document.getElementById('btnTalk').onclick = interactNearestNpc;

  // Teleport Modal Controls
  var btnTpModal = document.getElementById('btnTeleportModal');
  if(btnTpModal){
    btnTpModal.onclick = function(){
      populateTeleportModal();
      document.getElementById('teleportModal').classList.add('active');
    };
  }
  var btnTpClose = document.getElementById('btnTpClose');
  if(btnTpClose){
    btnTpClose.onclick = function(){
      document.getElementById('teleportModal').classList.remove('active');
    };
  }

  document.getElementById('btnClassToggle').onclick = function(){
    classIdx = (classIdx + 1) % classes.length;
    player.classType = classes[classIdx];
    sfxHeal();
    logTicker('Berganti kelas menjadi ' + player.classType.toUpperCase());
    updateHud();
  };

  // Keyboard Navigation + Auto Aim Sync
  function syncKeyboardAim(){
    var kx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    var ky = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    if(kx !== 0 || ky !== 0){
      var ang = Math.atan2(ky, kx);
      player.aimAngle = ang;
      var len = Math.hypot(kx, ky);
      player.aimDirX = kx / len;
      player.aimDirY = ky / len;
      if(Math.abs(kx) >= Math.abs(ky)){
        player.facing = kx > 0 ? 'right' : 'left';
      } else {
        player.facing = ky > 0 ? 'down' : 'up';
      }
    }
  }

  window.addEventListener('keydown', function(e){
    if(e.code === 'KeyW' || e.code === 'ArrowUp') { keys.up = true; syncKeyboardAim(); }
    if(e.code === 'KeyS' || e.code === 'ArrowDown') { keys.down = true; syncKeyboardAim(); }
    if(e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = true; syncKeyboardAim(); }
    if(e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = true; syncKeyboardAim(); }
    if(e.code === 'Space' || e.code === 'KeyJ') triggerAttack();
    if(e.code === 'KeyK') triggerSkill();
    if(e.code === 'KeyL') triggerDodge();
    if(e.code === 'KeyF') triggerFox();
    if(e.code === 'KeyE') interactNearestNpc();
    if(e.code === 'KeyM') {
      var m = document.getElementById('teleportModal');
      if(m) {
        if(m.classList.contains('active')) m.classList.remove('active');
        else { populateTeleportModal(); m.classList.add('active'); }
      }
    }
  });

  window.addEventListener('keyup', function(e){
    if(e.code === 'KeyW' || e.code === 'ArrowUp') { keys.up = false; syncKeyboardAim(); }
    if(e.code === 'KeyS' || e.code === 'ArrowDown') { keys.down = false; syncKeyboardAim(); }
    if(e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = false; syncKeyboardAim(); }
    if(e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = false; syncKeyboardAim(); }
  });

  /* ============ MAIN GAME TICK & RENDER LOOP ============ */
  function updateGame(){
    var nowTs = Date.now();
    var dt = Math.min(250, nowTs - lastSpawnTimestamp);
    lastSpawnTimestamp = nowTs;

    // 1. Spawning dinamis (setiap 3 detik acak 1, 3, atau 4 monster)
    updateMonsterSpawning(dt);

    // 2. Portal check & teleport cooldown
    if(teleportCooldown > 0) teleportCooldown--;
    if(portals && portals.length && teleportCooldown <= 0){
      for(var pt=0; pt<portals.length; pt++){
        var port = portals[pt];
        var pDist = Math.hypot(player.x - port.x, player.y - port.y);
        if(pDist < 38){
          switchMap(port.targetMap, port.targetX, port.targetY);
          break;
        }
      }
    }

    // 3. Movement Physics (8-Arah Circular D-Pad + Keyboard WASD)
    var mx = 0, my = 0;
    if(dpad.active && (dpad.x !== 0 || dpad.y !== 0)){
      mx = dpad.x;
      my = dpad.y;
    } else {
      var kx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      var ky = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if(kx !== 0 || ky !== 0){
        var kLen = Math.hypot(kx, ky);
        mx = kx / kLen;
        my = ky / kLen;
      }
    }

    if(player.dodgeRollTimer > 0){
      player.x += player.vx;
      player.y += player.vy;
      player.dodgeRollTimer--;
    } else {
      player.x += mx * player.speed;
      player.y += my * player.speed;
      if(mx !== 0 || my !== 0) player.walkFrame += 0.22;
    }

    if(player.invincibleTimer > 0) player.invincibleTimer--;
    if(player.attackTimer > 0) player.attackTimer--;

    // Keep in world bounds
    player.x = Math.max(30, Math.min(map.width - 30, player.x));
    player.y = Math.max(30, Math.min(map.height - 30, player.y));

    // Passive MP regen
    if(player.mp < player.maxMp) player.mp += 0.04;

    // Update Projectiles
    for(var p=projectiles.length-1; p>=0; p--){
      var pr = projectiles[p];
      pr.x += pr.vx;
      pr.y += pr.vy;
      pr.life--;

      // Hit check monsters
      var hit = false;
      for(var m=0; m<monsters.length; m++){
        var mob = monsters[m];
        if(mob.hp <= 0) continue;
        if(Math.hypot(mob.x - pr.x, mob.y - pr.y) < pr.radius + mob.radius){
          mob.hp -= pr.damage;
          sfxHit();
          addDamageText(mob.x, mob.y - 12, '-' + Math.round(pr.damage), '#facc15');
          if(mob.hp <= 0){
            mob.deadTime = nowTs;
            var soulMult = map.id === 'celestial_shrine' ? 2 : 1;
            spawnSoul(mob.x, mob.y, (mob.soulVal || 35) * soulMult);
            gainExp(mob.isBoss ? 150 : Math.max(20, Math.round(mob.maxHp * 0.4)));
          }
          hit = true;
          break;
        }
      }
      if(hit || pr.life <= 0) projectiles.splice(p, 1);
    }

    // Update Souls
    for(var s=souls.length-1; s>=0; s--){
      var sl = souls[s];
      sl.t += 0.08;
      var distToPlayer = Math.hypot(player.x - sl.x, player.y - sl.y);
      if(distToPlayer < 90){
        // Magnet effect
        sl.x += (player.x - sl.x) * 0.15;
        sl.y += (player.y - sl.y) * 0.15;
      }
      if(distToPlayer < 24){
        sfxSoul();
        player.foxSoul = Math.min(500, player.foxSoul + sl.val);
        addDamageText(player.x, player.y - 20, '+' + sl.val + ' Fox Soul', '#facc15');
        checkFoxUpgrade();
        souls.splice(s, 1);
      }
    }

    // Update Monsters AI
    for(var mi=monsters.length-1; mi>=0; mi--){
      var mon = monsters[mi];

      // Bersihkan monster yang sudah lama mati agar spawnwave bisa terus terisi
      if(mon.hp <= 0){
        if(mon.deadTime && nowTs - mon.deadTime > 1500){
          monsters.splice(mi, 1);
        }
        continue;
      }

      var d = Math.hypot(player.x - mon.x, player.y - mon.y);

      // Agro range
      if(d < 280 && d > 28){
        var dx = (player.x - mon.x) / d;
        var dy = (player.y - mon.y) / d;
        mon.x += dx * mon.speed;
        mon.y += dy * mon.speed;
      }

      // Attack player if close
      if(d < 30 && player.invincibleTimer <= 0){
        player.hp = Math.max(0, player.hp - mon.atk);
        player.invincibleTimer = 30;
        sfxHit();
        screenShake = 6;
        addDamageText(player.x, player.y - 15, '-' + mon.atk, '#ef4444');
        updateHud();
        if(player.hp <= 0){
          logTicker('Ksatria tumbang! Mengisi ulang daya...');
          player.hp = player.maxHp;
          player.x = Math.floor(map.width / 2);
          player.y = Math.floor(map.height / 2);
        }
      }
    }
  }

  function renderGame(){
    requestAnimationFrame(renderGame);
    updateGame();

    var W = cv.width;
    var H = cv.height;
    ctx.clearRect(0, 0, W, H);

    // Camera follow player
    var camX = player.x - W/2;
    var camY = player.y - H/2;
    if(screenShake > 0){
      camX += (Math.random()*screenShake - screenShake/2);
      camY += (Math.random()*screenShake - screenShake/2);
      screenShake *= 0.86;
      if(screenShake < 0.5) screenShake = 0;
    }

    ctx.save();
    ctx.translate(-camX, -camY);

    var now = Date.now();

    // 1. Tanah 8-Bit, Rumput, Jalan Cobblestone / Lahar / Es / Marmer Suci
    render8BitGround(ctx, map, now);

    // 2. Ornamen Kota Valoria (Jika di Valoria City)
    if(map.id === 'valoria_city'){
      renderGrandFountain(ctx, 620, 480, now);
      for(var l=0; l<lanterns.length; l++){
        renderStreetLantern(ctx, lanterns[l].x, lanterns[l].y, now);
      }
      render16BitHouse(ctx, 500, 60, 240, 150, 'Kastil Arthurian', '#1e3a8a', true);
      render16BitHouse(ctx, 150, 360, 160, 110, 'Toko Elena', '#065f46', false);
      render16BitHouse(ctx, 900, 360, 160, 110, 'Bengkel Torin', '#7c2d12', false);
      render16BitHouse(ctx, 1140, 360, 150, 110, 'Pondok Petualang', '#b45309', false);
      render16BitHouse(ctx, 1360, 360, 150, 110, 'Gudang Senjata', '#475569', false);
    }

    // 3. Gerbang Portal Teleportasi 16-Bit
    for(var pt=0; pt<portals.length; pt++){
      renderPortalGate(ctx, portals[pt], now);
    }

    // 4. Pepohonan Rimbun 16-Bit
    for(var tr=0; tr<trees.length; tr++){
      render16BitTree(ctx, trees[tr].x, trees[tr].y, now);
    }

    // 5. Destructibles (Pilar, Peti Emas, Gerbang, Kristal)
    for(var d=0; d<destructibles.length; d++){
      var ds = destructibles[d];
      if(ds.state === 'destroyed'){
        ctx.fillStyle = '#475569';
        ctx.fillRect(ds.x, ds.y + ds.h - 14, ds.w, 14);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[RERUNTUHAN]', ds.x + ds.w/2, ds.y + ds.h - 2);
      } else {
        ctx.fillStyle = ds.id.indexOf('crate') !== -1 ? '#854d0e' : (ds.id.indexOf('gate') !== -1 ? '#451a03' : (ds.id.indexOf('crystal') !== -1 ? '#0284c7' : '#64748b'));
        ctx.fillRect(ds.x, ds.y, ds.w, ds.h);
        ctx.strokeStyle = ds.state === 'cracked' ? '#ef4444' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(ds.x, ds.y, ds.w, ds.h);

        // Highlight kilau kristal atau peti
        if(ds.id.indexOf('crystal') !== -1 || ds.id.indexOf('cryst') !== -1 || ds.id.indexOf('altar') !== -1){
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath(); ctx.arc(ds.x + ds.w/2, ds.y + ds.h/2, 10, 0, Math.PI*2); ctx.fill();
        } else if(ds.id.indexOf('crate') !== -1){
          ctx.fillStyle = '#facc15';
          ctx.fillRect(ds.x + ds.w/2 - 3, ds.y + ds.h/2 - 3, 6, 6);
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ds.name, ds.x + ds.w/2, ds.y - 4);
      }
    }

    // 6. NPCs 16-Bit
    for(var n=0; n<npcs.length; n++){
      render16BitNpc(ctx, npcs[n], now);
    }

    // 7. Fox Souls di Tanah
    for(var s=0; s<souls.length; s++){
      var soul = souls[s];
      var sy = soul.y + Math.sin(soul.t) * 4;
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(soul.x, sy, 7, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦊', soul.x, sy - 9);
    }

    // 8. Monsters 16-Bit (Slime, Imp, Wolf, Golem, Yeti, Dragon, Fox Spirit)
    for(var m=0; m<monsters.length; m++){
      render16BitMonster(ctx, monsters[m], now);
    }

    // 9. Other Players (Sync)
    for(var pl=0; pl<otherPlayers.length; pl++){
      render16BitCharacter(ctx, otherPlayers[pl], now);
    }

    // 10. Self Player (16-Bit Sprite + Transformasi Ekor 4-11 + Senjata Ayunan)
    render16BitCharacter(ctx, player, now);

    // 11. Projectiles (Panah Tajam 360° & Bola Sihir Arcane)
    for(var prj=0; prj<projectiles.length; prj++){
      var pj = projectiles[prj];
      var pAngle = Math.atan2(pj.vy, pj.vx);
      ctx.save();
      ctx.translate(pj.x, pj.y);
      ctx.rotate(pAngle);

      if(pj.color === '#facc15'){
        // Panah Kayu Berujung Emas Tajam
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(-10, -1.5, 16, 3); // Batang kayu
        // Mata Panah Emas
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(3, -4); ctx.lineTo(3, 4); ctx.closePath();
        ctx.fill();
        // Bulu Ekor Merah
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -3, 3, 6);
      } else {
        // Bola Sihir Arcane Berpendar
        ctx.fillStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.beginPath(); ctx.arc(0, 0, pj.radius + 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = pj.color;
        ctx.beginPath(); ctx.arc(0, 0, pj.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(2, -2, pj.radius*0.45, 0, Math.PI*2); ctx.fill();
        // Ekor partikel sihir
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.arc(-pj.radius - 3, 0, pj.radius*0.35, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    // 12. Efek Spesial Skill Rubah (Cakar Api Ekor 4, Bola Roh Ekor 7, Bijuu Beam Ekor 11)
    updateAndRenderFoxFx(ctx, now);

    // 13. AOE Effects
    for(var af=aoeEffects.length-1; af>=0; af--){
      var eff = aoeEffects[af];
      var prog = 1 - (eff.life / eff.maxLife);
      ctx.strokeStyle = eff.color;
      ctx.lineWidth = 4 * (1 - prog);
      ctx.beginPath(); ctx.arc(eff.x, eff.y, eff.radius * prog, 0, Math.PI*2); ctx.stroke();
      eff.life--;
      if(eff.life <= 0) aoeEffects.splice(af, 1);
    }

    // 14. Floating Damage Numbers
    for(var dt=damageTexts.length-1; dt>=0; dt--){
      var dTxt = damageTexts[dt];
      ctx.fillStyle = dTxt.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dTxt.text, dTxt.x, dTxt.y);
      dTxt.y -= 0.8;
      dTxt.life--;
      if(dTxt.life <= 0) damageTexts.splice(dt, 1);
    }

    ctx.restore();

    // 15. Minimap Radar Pojok Layar (dengan titik gerbang portal)
    renderMinimap(ctx, player, map, npcs, monsters, portals);
  }

  populateTeleportModal();
  updateHud();
  requestAnimationFrame(renderGame);
})();
</script>`;
}
