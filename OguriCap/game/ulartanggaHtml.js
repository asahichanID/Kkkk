/**
 * 3D Ular Tangga (Snake and Ladder) HTML5 Interactive Board Game
 * Features:
 * - Transparent background outside container
 * - 3D Rounded Board Frame & Realistic Canvas
 * - 3D Animated Tumbling Cube Dice
 * - Smooth Hopping Step-by-Step Footstep Pawn Animation
 * - Realistic Web Audio Synthesizer: Dice rattle, footstep hops, ladder climb, snake hiss & slide down, win fanfare
 * - Modes: [🤖 Lawan Bot] (1-3 Bots) & [👥 Multiplayer Room] (Max 4 Players via Native WebSocket)
 * - Auto-claim reward for winner in WhatsApp
 */

export function buildUlarTanggaHtml(playerName = 'Player') {
  const safeName = String(playerName || 'Player').replace(/["'<>]/g, '');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>3D Ular Tangga Royal - OguriCap</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;min-height:100%;background:transparent;color:#f8fafc;overflow-x:hidden;overflow-y:auto}
body{padding:10px 8px 30px;display:flex;justify-content:center;align-items:flex-start}

#game-card{width:100%;max-width:420px;background:radial-gradient(ellipse at 50% 15%,#1e293b 0%,#0f172a 75%,#020617 100%);border:2.5px solid #38bdf8;border-radius:22px;padding:12px 10px;box-shadow:0 18px 45px rgba(0,0,0,0.8),0 0 20px rgba(56,189,248,0.3),inset 0 1px 2px rgba(255,255,255,0.25);position:relative}

/* Header */
.top-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:4px 6px;background:linear-gradient(135deg,#0369a1,#0f172a);border-radius:12px;border:1.5px solid #38bdf8}
.game-title{font-size:15px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:5px;text-shadow:0 0 10px rgba(56,189,248,0.7)}
.sound-toggle{padding:4px 8px;border-radius:8px;border:1.2px solid #38bdf8;background:#082f49;color:#7dd3fc;font-size:10.5px;font-weight:800;cursor:pointer}

/* Main Mode Tabs */
.nav-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px}
.nav-btn{padding:8px 6px;border-radius:10px;border:1.5px solid #334155;background:linear-gradient(180deg,#1e293b,#0f172a);color:#94a3b8;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.15s;box-shadow:0 3px 6px rgba(0,0,0,0.5)}
.nav-btn.active{border:2px solid #38bdf8;background:linear-gradient(180deg,#0284c7,#0369a1);color:#fff;box-shadow:0 0 12px rgba(56,189,248,0.6),inset 0 1px 2px #bae6fd}

/* Status & Turn Banner */
.turn-banner{background:radial-gradient(ellipse at 50% 50%,#1e293b,#090d16);border:1.8px solid #fbbf24;border-radius:10px;padding:7px 10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,0.6)}
.turn-player{font-size:12px;font-weight:900;color:#fde047;display:flex;align-items:center;gap:6px}
.turn-badge{width:12px;height:12px;border-radius:50%;display:inline-block;box-shadow:0 0 6px currentColor}
.game-msg{font-size:10px;font-weight:700;color:#cbd5e1;text-align:right;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* 3D Board Stage */
.board-container{width:100%;aspect-ratio:1/1;max-width:396px;margin:0 auto;position:relative;background:#020617;border:3px solid #f59e0b;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,0.9),inset 0 0 20px rgba(0,0,0,0.9),0 0 15px rgba(245,158,11,0.25);overflow:hidden}
.board-grid{display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(10,1fr);width:100%;height:100%;position:absolute;inset:0}
.cell{display:flex;flex-direction:column;justify-content:space-between;padding:2px;font-size:8px;font-weight:900;color:#e2e8f0;position:relative;border:0.5px solid rgba(255,255,255,0.06);box-sizing:border-box}
.cell-100{background:linear-gradient(135deg,#b45309,#f59e0b)!important;color:#000!important;font-weight:900}
.cell-start{background:linear-gradient(135deg,#065f46,#10b981)!important}

/* Overlay Canvas for Snakes & Ladders */
#board-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5}

/* 3D Pawns */
.pawn-container{position:absolute;inset:0;pointer-events:none;z-index:10}
.pawn{width:22px;height:22px;position:absolute;transform:translate(-50%,-50%);transition:left 0.22s cubic-bezier(0.34,1.56,0.64,1),top 0.22s cubic-bezier(0.34,1.56,0.64,1),transform 0.15s ease;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.9))}
.pawn-inner{width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px currentColor;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#fff}
.pawn.hopping{animation:pawnHop 0.22s ease-out forwards}
@keyframes pawnHop{
  0%{transform:translate(-50%,-50%) scale(1)}
  50%{transform:translate(-50%,-80%) scale(1.35)}
  100%{transform:translate(-50%,-50%) scale(1)}
}

/* Control Stage & 3D Animated Dice */
.control-panel{margin-top:10px;background:rgba(15,23,42,0.85);border:1.8px solid #334155;border-radius:14px;padding:10px 8px;display:flex;justify-content:space-between;align-items:center;gap:8px}

/* 3D Dice Wrapper */
.dice-scene{width:60px;height:60px;perspective:400px;display:flex;align-items:center;justify-content:center}
.cube-dice{width:46px;height:46px;position:relative;transform-style:preserve-3d;transform:rotateX(-20deg) rotateY(-25deg);transition:transform 0.9s cubic-bezier(0.2,0.8,0.3,1);cursor:pointer}
.cube-face{position:absolute;width:46px;height:46px;background:linear-gradient(145deg,#ffffff,#e2e8f0);border:1.5px solid #cbd5e1;border-radius:8px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:5px;box-shadow:inset 0 0 6px rgba(0,0,0,0.2),0 4px 8px rgba(0,0,0,0.4);box-sizing:border-box}
.pip{width:7px;height:7px;background:#ef4444;border-radius:50%;margin:auto;box-shadow:inset 0 1px 2px #7f1d1d}
.pip.black{background:#0f172a;box-shadow:inset 0 1px 2px #000}

/* Dice 3D Positions */
.face-1{transform:translateZ(23px)}
.face-6{transform:rotateY(180deg) translateZ(23px)}
.face-2{transform:rotateY(-90deg) translateZ(23px)}
.face-5{transform:rotateY(90deg) translateZ(23px)}
.face-3{transform:rotateX(90deg) translateZ(23px)}
.face-4{transform:rotateX(-90deg) translateZ(23px)}

/* Action Buttons */
.btn-roll{flex:1;background:linear-gradient(180deg,#fbbf24 0%,#d97706 60%,#92400e 100%);border:1.5px solid #fef08a;border-radius:10px;padding:12px;font-size:13px;font-weight:900;color:#1c1002;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.6),inset 0 1px 2px #fff;display:flex;align-items:center;justify-content:center;gap:6px;text-shadow:0 1px 0 rgba(255,255,255,0.4)}
.btn-roll:active{transform:scale(0.96)}
.btn-roll:disabled{opacity:0.4;cursor:not-allowed;transform:none}

.btn-secondary{background:linear-gradient(180deg,#1e293b,#0f172a);border:1.5px solid #334155;border-radius:10px;padding:10px 8px;color:#cbd5e1;font-size:11px;font-weight:800;cursor:pointer}
.btn-secondary:active{transform:scale(0.96)}

/* Multiplayer View Styles */
.mp-view{margin-top:8px;background:rgba(15,23,42,0.9);border:2px solid #38bdf8;border-radius:14px;padding:12px 10px;box-shadow:0 8px 24px rgba(0,0,0,0.7)}
.room-code-box{background:radial-gradient(circle at 50% 50%,#082f49,#021a2c);border:2px dashed #38bdf8;border-radius:10px;padding:10px;text-align:center;margin:8px 0}
.code-val{font:900 32px 'Arial Black',sans-serif;letter-spacing:6px;color:#38bdf8;text-shadow:0 0 12px rgba(56,189,248,0.8)}
.input-text{width:100%;padding:9px 11px;border-radius:8px;border:1.8px solid #0284c7;background:#031d33;color:#fff;font-size:12px;font-weight:700;margin-bottom:8px;outline:none}
.input-text:focus{border-color:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,0.5)}
.player-slot-list{display:flex;flex-direction:column;gap:5px;margin:8px 0}
.slot-row{display:flex;justify-content:space-between;align-items:center;background:#0f172a;border:1px solid #1e293b;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700}

/* Winner Modal */
.modal-win{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;z-index:999;padding:15px}
.modal-win-card{background:radial-gradient(ellipse at 50% 30%,#1e293b 0%,#0f172a 70%,#020617 100%);border:2.5px solid #fbbf24;border-radius:18px;padding:16px 14px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.9),0 0 25px rgba(251,191,36,0.5)}
.win-title{font:900 20px 'Arial Black',sans-serif;color:#fde047;letter-spacing:1px;margin-bottom:6px;text-shadow:0 0 15px rgba(251,191,36,0.8)}
.claim-btn{background:linear-gradient(180deg,#fbbf24,#d97706);border:1.5px solid #fef08a;border-radius:10px;padding:11px 16px;color:#1c1002;font-weight:900;font-size:13px;width:100%;margin-top:10px;cursor:pointer}
.claim-code-display{font:900 13px monospace;color:#86efac;background:#064e3b;border:1px solid #10b981;border-radius:6px;padding:6px;margin:8px 0}
</style>
</head>
<body>

<div id="game-card">
  <!-- Top Header -->
  <div class="top-header">
    <div class="game-title">🐍🪜 ULAR TANGGA 3D</div>
    <button class="sound-toggle" id="btn-sound" onclick="toggleAudio()">🔊 Suara: ON</button>
  </div>

  <!-- Nav Tabs -->
  <div class="nav-tabs">
    <button class="nav-btn active" id="tab-bot" onclick="switchMode('bot')">🤖 Lawan Bot</button>
    <button class="nav-btn" id="tab-mp" onclick="switchMode('mp')">👥 Multiplayer (4P)</button>
  </div>

  <!-- Bot Selector (Only in Bot Mode) -->
  <div id="bot-count-bar" style="display:flex;gap:5px;margin-bottom:8px;align-items:center;background:#0f172a;padding:5px 8px;border-radius:8px;border:1px solid #334155">
    <span style="font-size:10px;font-weight:700;color:#94a3b8">Jumlah Bot:</span>
    <button class="btn-secondary" style="padding:3px 8px;font-size:10px" id="b-1" onclick="setBotCount(1)">1 Bot</button>
    <button class="btn-secondary" style="padding:3px 8px;font-size:10px" id="b-2" onclick="setBotCount(2)">2 Bot</button>
    <button class="btn-secondary" style="padding:3px 8px;font-size:10px;background:#0284c7;color:#fff;border-color:#38bdf8" id="b-3" onclick="setBotCount(3)">3 Bot</button>
  </div>

  <!-- Status & Turn Banner -->
  <div class="turn-banner">
    <div class="turn-player">
      <span class="turn-badge" id="turn-badge" style="background:#ef4444;color:#ef4444"></span>
      <span id="turn-name">Giliran: ${safeName} (🔴)</span>
    </div>
    <div class="game-msg" id="game-msg">Lempar dadu untuk memulai!</div>
  </div>

  <!-- 3D Board Canvas Container -->
  <div class="board-container" id="board-box">
    <div class="board-grid" id="board-grid"></div>
    <canvas id="board-canvas" width="400" height="400"></canvas>
    <div class="pawn-container" id="pawn-layer"></div>
  </div>

  <!-- Bottom Control Panel: 3D Dice & Roll Button -->
  <div class="control-panel" id="bot-controls">
    <div class="dice-scene" onclick="onPlayerRollClick()">
      <div class="cube-dice" id="cube-dice">
        <!-- Face 1 -->
        <div class="cube-face face-1">
          <div></div><div></div><div></div><div></div><div class="pip"></div><div></div><div></div><div></div><div></div>
        </div>
        <!-- Face 2 -->
        <div class="cube-face face-2">
          <div class="pip black"></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div class="pip black"></div>
        </div>
        <!-- Face 3 -->
        <div class="cube-face face-3">
          <div class="pip black"></div><div></div><div></div><div></div><div class="pip black"></div><div></div><div></div><div></div><div class="pip black"></div>
        </div>
        <!-- Face 4 -->
        <div class="cube-face face-4">
          <div class="pip black"></div><div></div><div class="pip black"></div><div></div><div></div><div></div><div class="pip black"></div><div></div><div class="pip black"></div>
        </div>
        <!-- Face 5 -->
        <div class="cube-face face-5">
          <div class="pip black"></div><div></div><div class="pip black"></div><div></div><div class="pip"></div><div></div><div class="pip black"></div><div></div><div class="pip black"></div>
        </div>
        <!-- Face 6 -->
        <div class="cube-face face-6">
          <div class="pip black"></div><div></div><div class="pip black"></div><div class="pip black"></div><div></div><div class="pip black"></div><div class="pip black"></div><div></div><div class="pip black"></div>
        </div>
      </div>
    </div>

    <button class="btn-roll" id="btn-roll" onclick="onPlayerRollClick()">🎲 LEMPAR DADU</button>
    <button class="btn-secondary" onclick="resetGame()">🔄 Reset</button>
  </div>

  <!-- Multiplayer View (Dedicated) -->
  <div class="mp-view" id="mp-view" style="display:none">
    <div style="font-size:13px;font-weight:900;color:#38bdf8;text-align:center;margin-bottom:8px">👥 MULTIPLAYER ROOM (MAKS 4 PEMAIN)</div>
    
    <div id="mp-create-join-section">
      <input type="text" id="mp-player-name" class="input-text" placeholder="Nama Kamu" value="${safeName}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <button class="btn-roll" style="font-size:11px;padding:9px" onclick="createMpRoom()">✨ Buat Room 4P</button>
        <button class="btn-secondary" style="font-size:11px;padding:9px" onclick="toggleJoinBox()">🔑 Gabung Room</button>
      </div>
      
      <div id="mp-join-box" style="display:none;margin-top:6px">
        <input type="text" id="mp-join-code" class="input-text" placeholder="Masukkan 4-Digit Kode (contoh: 4821)" maxlength="4" style="text-align:center;font-size:16px;letter-spacing:4px">
        <button class="btn-roll" style="width:100%;font-size:11px;padding:9px" onclick="joinMpRoom()">🚪 Masuk ke Room</button>
      </div>
    </div>

    <!-- Active Room Lobby -->
    <div id="mp-active-room" style="display:none">
      <div class="room-code-box">
        <div style="font-size:10px;color:#94a3b8;font-weight:700">KODE ROOM MULTIPLAYER:</div>
        <div class="code-val" id="mp-room-code-disp">----</div>
        <button class="btn-secondary" style="font-size:9.5px;padding:4px 8px;margin:0 auto" onclick="copyMpRoomCode()">📋 Salin Kode</button>
      </div>
      <div style="font-size:11px;font-weight:800;color:#7dd3fc;margin:6px 0">Pemain Bergabung:</div>
      <div class="player-slot-list" id="mp-player-list"></div>
      
      <button class="btn-roll" id="btn-start-mp" style="width:100%;margin-top:8px" onclick="startMpGame()">🚀 Mulai Permainan</button>
      <button class="btn-secondary" style="width:100%;margin-top:6px" onclick="leaveMpRoom()">Keluar Room</button>
    </div>
  </div>

</div>

<!-- Winner Modal -->
<div class="modal-win" id="modal-win">
  <div class="modal-win-card">
    <div style="font-size:36px;margin-bottom:4px">🏆</div>
    <div class="win-title" id="win-name">SELAMAT! KAMU MENANG!</div>
    <div style="font-size:11px;color:#cbd5e1;font-weight:600" id="win-desc">Berhasil mencapai petak 100 dan menaklukkan Ular Tangga!</div>
    
    <div class="claim-code-display" id="win-code-box">UT-WIN-7482-1928</div>
    <div style="font-size:9.5px;color:#fde047;font-weight:700">Ketik di WhatsApp: .claimr &lt;kode&gt;</div>
    
    <button class="claim-btn" onclick="copyWinCode()">📋 Salin Kode Klaim WhatsApp</button>
    <button class="btn-secondary" style="width:100%;margin-top:6px" onclick="closeWinModal()">Main Lagi</button>
  </div>
</div>

<script>
(function(){
  // --- AUDIO SYNTHESIZER ---
  var audioCtx = null;
  var soundEnabled = true;

  function initAudio(){
    if(!audioCtx){
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if(AudioContext) audioCtx = new AudioContext();
    }
    if(audioCtx && audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
  }

  window.toggleAudio = function(){
    soundEnabled = !soundEnabled;
    document.getElementById('btn-sound').textContent = soundEnabled ? '🔊 Suara: ON' : '🔇 Suara: OFF';
  };

  // 1. Dice Roll Sound (Rattling tumble)
  function sDice(){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    for(var i = 0; i < 4; i++){
      (function(idx){
        setTimeout(function(){
          try{
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140 + Math.random()*80, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
          }catch(e){}
        }, idx * 60);
      })(i);
    }
  }

  // 2. Footstep Hop Sound (Soft wooden pop)
  function sHop(){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    try{
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    }catch(e){}
  }

  // 3. Ladder Ascending Sound (Upward arpeggio chirp)
  function sLadder(){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach(function(freq, idx){
      setTimeout(function(){
        try{
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        }catch(e){}
      }, idx * 75);
    });
  }

  // 4. Snake Hiss & Slide Down Sound
  function sSnake(){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    try{
      // Noise buffer for hiss
      var bufferSize = audioCtx.sampleRate * 0.25;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for(var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      var noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.25);

      var gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
      noise.stop(audioCtx.currentTime + 0.25);
    }catch(e){}
  }

  // 5. Victory Fanfare
  function sWin(){
    if(!soundEnabled) return;
    initAudio();
    if(!audioCtx) return;
    var melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    melody.forEach(function(f, idx){
      setTimeout(function(){
        try{
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        }catch(e){}
      }, idx * 100);
    });
  }

  // --- GAME DEFINITIONS ---
  var LADDERS = { 4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 63:81, 71:91, 80:99 };
  var SNAKES = { 17:7, 54:34, 62:19, 64:60, 87:36, 93:73, 95:75, 98:79 };
  var COLORS = [
    { name: 'Merah', hex: '#ef4444', icon: '🔴', light: '#fca5a5' },
    { name: 'Biru', hex: '#3b82f6', icon: '🔵', light: '#93c5fd' },
    { name: 'Kuning', hex: '#eab308', icon: '🟡', light: '#fde047' },
    { name: 'Hijau', hex: '#22c55e', icon: '🟢', light: '#86efac' }
  ];

  var myName = '${safeName}';
  var mainMode = 'bot'; // 'bot' | 'mp'
  var botCount = 3; // 1, 2, 3
  var isRolling = false;

  // Single player state
  var players = [];
  var turnIdx = 0;

  // Multiplayer WS state
  var ws = null;
  var currentRoom = null;
  var myPlayerId = 'p_' + Math.random().toString(36).substring(2,8);

  function getCellCoords(num){
    // Row 1 (1..10) is bottom, row 10 (91..100) is top
    var rowFromBottom = Math.floor((num - 1) / 10);
    var colInRow = (num - 1) % 10;
    var col = (rowFromBottom % 2 === 0) ? colInRow : (9 - colInRow);
    var row = 9 - rowFromBottom; // 0 is top row
    return { row: row, col: col };
  }

  function getCellPercent(num){
    var c = getCellCoords(num);
    return {
      x: (c.col + 0.5) * 10,
      y: (c.row + 0.5) * 10
    };
  }

  // --- BUILD 10x10 BOARD ---
  function buildBoardGrid(){
    var grid = document.getElementById('board-grid');
    grid.innerHTML = '';
    var colors = ['#0f172a','#1e293b','#0b3320','#182e44','#2d1838','#332111'];

    for(var row = 0; row < 10; row++){
      var rowFromBottom = 9 - row;
      for(var col = 0; col < 10; col++){
        var colInRow = (rowFromBottom % 2 === 0) ? col : (9 - col);
        var num = rowFromBottom * 10 + colInRow + 1;

        var cell = document.createElement('div');
        cell.className = 'cell' + (num === 100 ? ' cell-100' : (num === 1 ? ' cell-start' : ''));
        cell.style.background = (num === 100) ? '' : colors[(row + col) % colors.length];

        var topLabel = document.createElement('div');
        topLabel.style.display = 'flex';
        topLabel.style.justifyContent = 'space-between';
        topLabel.innerHTML = '<span>' + num + '</span>';

        if(LADDERS[num]){
          topLabel.innerHTML += '<span style="color:#fbbf24">🪜' + LADDERS[num] + '</span>';
        } else if(SNAKES[num]){
          topLabel.innerHTML += '<span style="color:#ef4444">🐍' + SNAKES[num] + '</span>';
        }

        cell.appendChild(topLabel);
        grid.appendChild(cell);
      }
    }
  }

  // --- DRAW SNAKES & LADDERS OVERLAY ---
  function drawBoardOverlay(){
    var canvas = document.getElementById('board-canvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = 400;
    var h = canvas.height = 400;
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Ladders
    for(var start in LADDERS){
      var end = LADDERS[start];
      var p1 = getCellPercent(parseInt(start));
      var p2 = getCellPercent(end);
      var x1 = (p1.x / 100) * w, y1 = (p1.y / 100) * h;
      var x2 = (p2.x / 100) * w, y2 = (p2.y / 100) * h;
      drawLadder(ctx, x1, y1, x2, y2);
    }

    // 2. Draw Snakes
    for(var head in SNAKES){
      var tail = SNAKES[head];
      var p1 = getCellPercent(parseInt(head));
      var p2 = getCellPercent(tail);
      var x1 = (p1.x / 100) * w, y1 = (p1.y / 100) * h;
      var x2 = (p2.x / 100) * w, y2 = (p2.y / 100) * h;
      drawSnake(ctx, x1, y1, x2, y2);
    }
  }

  function drawLadder(ctx, x1, y1, x2, y2){
    var dx = x2 - x1, dy = y2 - y1;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var nx = -dy / dist * 6;
    var ny = dx / dist * 6;

    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Left rail
    ctx.beginPath();
    ctx.moveTo(x1 + nx, y1 + ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.stroke();

    // Right rail
    ctx.beginPath();
    ctx.moveTo(x1 - nx, y1 - ny);
    ctx.lineTo(x2 - nx, y2 - ny);
    ctx.stroke();

    // Rungs
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    var steps = Math.floor(dist / 14);
    for(var i = 1; i < steps; i++){
      var t = i / steps;
      var rx = x1 + dx * t;
      var ry = y1 + dy * t;
      ctx.beginPath();
      ctx.moveTo(rx + nx, ry + ny);
      ctx.lineTo(rx - nx, ry - ny);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSnake(ctx, x1, y1, x2, y2){
    var dx = x2 - x1, dy = y2 - y1;
    var cx1 = x1 + dx * 0.35 + (dy > 0 ? 25 : -25);
    var cy1 = y1 + dy * 0.35;
    var cx2 = x1 + dx * 0.65 - (dy > 0 ? 25 : -25);
    var cy2 = y1 + dy * 0.65;

    ctx.save();
    // Shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x1+2, y1+4);
    ctx.bezierCurveTo(cx1+2, cy1+4, cx2+2, cy2+4, x2+2, y2+4);
    ctx.stroke();

    // Body
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.stroke();

    // Pattern stripes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Snake Head
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x1, y1, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x1 - 2, y1 - 2, 1.8, 0, Math.PI*2);
    ctx.arc(x1 + 2, y1 - 2, 1.8, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // --- INIT PAWNS ---
  function initPawns(){
    var layer = document.getElementById('pawn-layer');
    layer.innerHTML = '';

    players.forEach(function(p, idx){
      var el = document.createElement('div');
      el.className = 'pawn';
      el.id = 'pawn-' + p.id;
      
      var inner = document.createElement('div');
      inner.className = 'pawn-inner';
      inner.style.background = p.color.hex;
      inner.style.borderColor = p.color.light;
      inner.textContent = (idx + 1);

      el.appendChild(inner);
      layer.appendChild(el);
      updatePawnPosition(p.id, p.pos, false);
    });
  }

  function updatePawnPosition(playerId, cellNum, hopping){
    var el = document.getElementById('pawn-' + playerId);
    if(!el) return;
    var p = getCellPercent(cellNum);
    
    // Offset slightly for multiple pawns on same tile
    var playerIdx = players.findIndex(function(pl){ return pl.id === playerId; });
    var ox = (playerIdx % 2 === 0 ? -4 : 4);
    var oy = (playerIdx < 2 ? -4 : 4);

    el.style.left = (p.x + (ox/400)*100) + '%';
    el.style.top = (p.y + (oy/400)*100) + '%';

    if(hopping){
      el.classList.remove('hopping');
      void el.offsetWidth; // trigger reflow
      el.classList.add('hopping');
      sHop();
    }
  }

  // --- 3D DICE ANIMATION ---
  var diceRotations = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 90 },
    3: { x: -90, y: 0 },
    4: { x: 90, y: 0 },
    5: { x: 0, y: -90 },
    6: { x: 0, y: 180 }
  };

  function roll3dDice(targetVal, callback){
    var dice = document.getElementById('cube-dice');
    if(!dice) return callback && callback();
    sDice();

    var extraX = 720 + (Math.floor(Math.random()*2) * 360);
    var extraY = 720 + (Math.floor(Math.random()*2) * 360);
    var rot = diceRotations[targetVal] || diceRotations[1];

    var finalX = rot.x + extraX;
    var finalY = rot.y + extraY;

    dice.style.transform = 'rotateX(' + finalX + 'deg) rotateY(' + finalY + 'deg) scale(1.15)';
    setTimeout(function(){
      dice.style.transform = 'rotateX(' + rot.x + 'deg) rotateY(' + rot.y + 'deg) scale(1)';
      if(callback) callback();
    }, 850);
  }

  // --- HOPPING STEP ANIMATION ---
  function animateHoppingPath(playerId, stepPath, finalCallback){
    if(!stepPath || stepPath.length === 0){
      return finalCallback && finalCallback();
    }
    var stepIndex = 0;
    function nextHop(){
      if(stepIndex >= stepPath.length){
        return finalCallback && finalCallback();
      }
      var targetCell = stepPath[stepIndex];
      updatePawnPosition(playerId, targetCell, true);
      stepIndex++;
      setTimeout(nextHop, 230);
    }
    nextHop();
  }

  // --- SINGLE PLAYER / BOT ENGINE ---
  function setupSinglePlayer(){
    players = [];
    players.push({ id: 'p_user', name: myName, color: COLORS[0], pos: 1, isBot: false });
    
    var botNames = ['Bot Oguri', 'Bot Speed', 'Bot Lucky'];
    for(var i = 1; i <= botCount; i++){
      players.push({
        id: 'bot_' + i,
        name: botNames[i-1],
        color: COLORS[i],
        pos: 1,
        isBot: true
      });
    }

    turnIdx = 0;
    initPawns();
    updateTurnDisplay();
    setMsg('Permainan Siap! Giliranmu melempar dadu.');
  }

  window.setBotCount = function(cnt){
    if(isRolling) return;
    botCount = cnt;
    [1,2,3].forEach(function(n){
      var btn = document.getElementById('b-' + n);
      if(btn){
        if(n === cnt){
          btn.style.background = '#0284c7';
          btn.style.borderColor = '#38bdf8';
          btn.style.color = '#fff';
        } else {
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }
      }
    });
    setupSinglePlayer();
  };

  function updateTurnDisplay(){
    var cur = (mainMode === 'bot') ? players[turnIdx] : (currentRoom?.currentTurnPlayer || players[0]);
    if(!cur) return;

    var badge = document.getElementById('turn-badge');
    var nameEl = document.getElementById('turn-name');
    var btnRoll = document.getElementById('btn-roll');

    badge.style.background = cur.color.hex;
    badge.style.color = cur.color.hex;
    nameEl.textContent = 'Giliran: ' + cur.name + ' (' + cur.color.icon + ')';

    if(mainMode === 'bot'){
      btnRoll.disabled = isRolling || cur.isBot;
    } else {
      var isMyTurn = currentRoom?.currentTurnPlayer?.id === myPlayerId;
      btnRoll.disabled = isRolling || !isMyTurn || !currentRoom?.started;
    }
  }

  function setMsg(txt){
    var el = document.getElementById('game-msg');
    if(el) el.textContent = txt;
  }

  window.onPlayerRollClick = function(){
    if(isRolling) return;
    if(mainMode === 'bot'){
      if(players[turnIdx].isBot) return;
      handleBotGameRoll(players[turnIdx]);
    } else {
      handleMpRoll();
    }
  };

  function handleBotGameRoll(player){
    isRolling = true;
    updateTurnDisplay();
    var diceVal = Math.floor(Math.random() * 6) + 1;

    roll3dDice(diceVal, function(){
      var oldPos = player.pos;
      var targetPos = oldPos + diceVal;
      if(targetPos > 100) targetPos = 100 - (targetPos - 100);

      var path = [];
      if(targetPos >= oldPos){
        for(var s = oldPos + 1; s <= targetPos; s++) path.push(s);
      } else {
        for(var s = oldPos + 1; s <= 100; s++) path.push(s);
        for(var s = 99; s >= targetPos; s--) path.push(s);
      }

      setMsg(player.name + ' melempar 🎲 ' + diceVal);

      animateHoppingPath(player.id, path, function(){
        player.pos = targetPos;

        // Check Ladder or Snake
        if(LADDERS[targetPos]){
          var climbTo = LADDERS[targetPos];
          setTimeout(function(){
            sLadder();
            setMsg('🪜 ' + player.name + ' naik tangga ke ' + climbTo + '!');
            player.pos = climbTo;
            updatePawnPosition(player.id, climbTo, false);
            finishBotTurn(player, diceVal);
          }, 350);
        } else if(SNAKES[targetPos]){
          var slideTo = SNAKES[targetPos];
          setTimeout(function(){
            sSnake();
            setMsg('🐍 ' + player.name + ' tergelincir ular ke ' + slideTo + '!');
            player.pos = slideTo;
            updatePawnPosition(player.id, slideTo, false);
            finishBotTurn(player, diceVal);
          }, 350);
        } else {
          finishBotTurn(player, diceVal);
        }
      });
    });
  }

  function finishBotTurn(player, diceVal){
    if(player.pos === 100){
      isRolling = false;
      showWinModal(player.name, player.isBot);
      return;
    }

    var extraTurn = (diceVal === 6);
    if(extraTurn){
      setMsg(player.name + ' dapat dadu 6: Giliran Tambahan!');
    } else {
      turnIdx = (turnIdx + 1) % players.length;
    }

    isRolling = false;
    updateTurnDisplay();

    // If next player is bot, auto-roll
    if(players[turnIdx].isBot){
      setTimeout(function(){
        if(mainMode === 'bot' && !isRolling){
          handleBotGameRoll(players[turnIdx]);
        }
      }, 800);
    }
  }

  window.resetGame = function(){
    isRolling = false;
    setupSinglePlayer();
  };

  // --- MULTIPLAYER WEBSOCKET SYSTEM ---
  function connectWs(){
    if(ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    var url = proto + '//' + window.location.host + '/ws/ulartangga';
    
    try{
      ws = new WebSocket(url);
      ws.onopen = function(){
        console.log('WS Connected to Ular Tangga Server');
      };
      ws.onmessage = function(ev){
        try{
          var data = JSON.parse(ev.data);
          handleWsEvent(data);
        }catch(e){}
      };
      ws.onerror = function(){};
      ws.onclose = function(){
        setTimeout(function(){ if(mainMode === 'mp') connectWs(); }, 3000);
      };
    }catch(e){}
  }

  function handleWsEvent(data){
    switch(data.type){
      case 'room_created':
      case 'player_joined':
      case 'player_left':
        currentRoom = data.room;
        renderMpLobby();
        break;

      case 'game_started':
        currentRoom = data.room;
        players = currentRoom.players;
        initPawns();
        updateTurnDisplay();
        setMsg('Permainan Dimulai! Giliran ' + currentRoom.currentTurnPlayer.name);
        break;

      case 'dice_rolled':
        isRolling = true;
        currentRoom = data.room;
        var rolledPlayer = players.find(function(p){ return p.id === data.playerId; }) || { name: 'Player' };
        
        roll3dDice(data.dice, function(){
          animateHoppingPath(data.playerId, data.stepPath, function(){
            var pl = players.find(function(p){ return p.id === data.playerId; });
            if(pl) pl.pos = data.targetPos;

            if(data.specialAction?.type === 'ladder'){
              setTimeout(function(){
                sLadder();
                if(pl) pl.pos = data.finalPos;
                updatePawnPosition(data.playerId, data.finalPos, false);
                postRollMpFinish(data);
              }, 350);
            } else if(data.specialAction?.type === 'snake'){
              setTimeout(function(){
                sSnake();
                if(pl) pl.pos = data.finalPos;
                updatePawnPosition(data.playerId, data.finalPos, false);
                postRollMpFinish(data);
              }, 350);
            } else {
              postRollMpFinish(data);
            }
          });
        });
        break;

      case 'error':
        alert(data.message || 'Terjadi kesalahan!');
        break;
    }
  }

  function postRollMpFinish(data){
    isRolling = false;
    if(data.winner){
      showWinModal(data.winner.name, data.winner.id !== myPlayerId);
      return;
    }
    updateTurnDisplay();
    setMsg(data.room.lastEvent || 'Giliran berganti.');
  }

  function sendWs(payload){
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify(payload));
    }
  }

  window.createMpRoom = function(){
    var nameInput = document.getElementById('mp-player-name');
    var pName = (nameInput?.value || myName).trim();
    myName = pName;
    connectWs();
    setTimeout(function(){
      sendWs({
        type: 'create_room',
        playerName: pName,
        playerId: myPlayerId
      });
    }, 200);
  };

  window.toggleJoinBox = function(){
    var box = document.getElementById('mp-join-box');
    if(box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
  };

  window.joinMpRoom = function(){
    var code = (document.getElementById('mp-join-code')?.value || '').trim();
    if(!code){ alert('Masukkan 4-digit kode room!'); return; }
    var nameInput = document.getElementById('mp-player-name');
    var pName = (nameInput?.value || myName).trim();
    myName = pName;
    connectWs();
    setTimeout(function(){
      sendWs({
        type: 'join_room',
        roomCode: code,
        playerName: pName,
        playerId: myPlayerId
      });
    }, 200);
  };

  window.startMpGame = function(){
    if(!currentRoom) return;
    sendWs({
      type: 'start_game',
      roomCode: currentRoom.code
    });
  };

  window.leaveMpRoom = function(){
    if(!currentRoom) return;
    sendWs({
      type: 'leave_room',
      roomCode: currentRoom.code,
      playerId: myPlayerId
    });
    currentRoom = null;
    document.getElementById('mp-create-join-section').style.display = 'block';
    document.getElementById('mp-active-room').style.display = 'none';
  };

  function handleMpRoll(){
    if(!currentRoom) return;
    sendWs({
      type: 'roll_dice',
      roomCode: currentRoom.code,
      playerId: myPlayerId
    });
  }

  function renderMpLobby(){
    if(!currentRoom) return;
    document.getElementById('mp-create-join-section').style.display = 'none';
    document.getElementById('mp-active-room').style.display = 'block';
    document.getElementById('mp-room-code-disp').textContent = currentRoom.code;

    var listEl = document.getElementById('mp-player-list');
    listEl.innerHTML = '';

    currentRoom.players.forEach(function(p, i){
      var row = document.createElement('div');
      row.className = 'slot-row';
      row.innerHTML = '<span>' + p.color.icon + ' <b>' + p.name + '</b></span>' +
        '<span style="color:#fde047;font-size:10px">' + (p.isHost ? '👑 HOST' : 'Pemain ' + (i+1)) + '</span>';
      listEl.appendChild(row);
    });

    var startBtn = document.getElementById('btn-start-mp');
    if(startBtn){
      startBtn.style.display = (currentRoom.hostId === myPlayerId && !currentRoom.started) ? 'block' : 'none';
    }
  }

  window.copyMpRoomCode = function(){
    if(!currentRoom) return;
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(currentRoom.code).then(function(){
        alert('📋 Kode Room ' + currentRoom.code + ' Disalin!');
      }).catch(function(){});
    }
  };

  // --- MODE SWITCHER ---
  window.switchMode = function(mode){
    mainMode = mode;
    document.getElementById('tab-bot').className = mode === 'bot' ? 'nav-btn active' : 'nav-btn';
    document.getElementById('tab-mp').className = mode === 'mp' ? 'nav-btn active' : 'nav-btn';

    var botBar = document.getElementById('bot-count-bar');
    var mpView = document.getElementById('mp-view');

    if(mode === 'bot'){
      botBar.style.display = 'flex';
      mpView.style.display = 'none';
      setupSinglePlayer();
    } else {
      botBar.style.display = 'none';
      mpView.style.display = 'block';
      connectWs();
    }
  };

  // --- WINNER MODAL & REWARD CLAIM ---
  var currentWinCode = '';
  function showWinModal(winnerName, isOther){
    sWin();
    var modal = document.getElementById('modal-win');
    var title = document.getElementById('win-name');
    var desc = document.getElementById('win-desc');
    var codeBox = document.getElementById('win-code-box');

    currentWinCode = 'UT-WIN-' + Math.floor(1000 + Math.random()*9000) + '-' + Math.floor(1000 + Math.random()*9000);
    codeBox.textContent = currentWinCode;

    if(!isOther){
      title.textContent = '🏆 KAMU JUARA 1!';
      desc.textContent = 'Hebat! Kamu berhasil menaklukkan Ular Tangga dan mendapatkan hadiah Carats & EXP!';
    } else {
      title.textContent = '🎉 ' + winnerName.toUpperCase() + ' MENANG!';
      desc.textContent = winnerName + ' berhasil mencapai petak 100 lebih dulu!';
    }

    modal.style.display = 'flex';
  }

  window.copyWinCode = function(){
    if(!currentWinCode) return;
    var txt = '.claimr ' + currentWinCode;
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(txt).then(function(){
        alert('📋 Perintah .claimr ' + currentWinCode + ' Disalin ke Clipboard!');
      }).catch(function(){});
    } else {
      alert('Ketik di WhatsApp: .claimr ' + currentWinCode);
    }
  };

  window.closeWinModal = function(){
    document.getElementById('modal-win').style.display = 'none';
    if(mainMode === 'bot') setupSinglePlayer();
  };

  // Init on load
  buildBoardGrid();
  drawBoardOverlay();
  setupSinglePlayer();

  window.addEventListener('resize', drawBoardOverlay);
})();
</script>
</body>
</html>`;
}
