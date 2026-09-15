import { randomUUID } from 'crypto'
import { getTopLeaderboard, generateClaimCode } from './tebakbomData.js'

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

function buildTebakBomHTML(top3Players = []) {
	let lbSummaryText = 'Belum ada juara'
	if (top3Players && top3Players.length > 0) {
		const topUser = top3Players[0]
		const cleanPhone = (topUser.id || '').split('@')[0]
		const name = topUser.name && topUser.name !== 'Player' && topUser.name !== cleanPhone ? topUser.name : cleanPhone
		const pts = Number(topUser.score || 0).toLocaleString('id-ID')
		lbSummaryText = `👑 #1 ${name} (${pts} PTS)`
	}

	return `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Roboto,-apple-system,Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;margin:0;padding:0;background:#060d1d;color:#f1f5f9;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
body{padding:4px 6px;box-sizing:border-box}
#app-container{width:100%;max-width:360px;margin:0 auto;background:linear-gradient(165deg,#0e223d,#0a172c 55%,#040a16);border:1.5px solid #00d9ff;border-radius:12px;box-shadow:0 0 14px rgba(0,217,255,0.3);padding:6px 8px;position:relative;box-sizing:border-box}

.hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:4px;border-bottom:1px solid rgba(0,217,255,0.2);margin-bottom:4px}
.title-box{display:flex;align-items:center;gap:5px}
.title-box h1{font-size:12.5px;font-weight:900;color:#00d9ff;text-shadow:0 0 8px rgba(0,217,255,0.6);line-height:1;letter-spacing:0.3px}
.title-badge{font-size:7.5px;font-weight:800;letter-spacing:0.5px;color:#38bdf8;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);border-radius:4px;padding:1px 4px;text-transform:uppercase}
.hdr-right{display:flex;align-items:center;gap:4px}
.score-pill{background:rgba(0,0,0,0.55);border:1px solid #00d9ff;border-radius:6px;padding:1.5px 6px;display:flex;align-items:center;gap:4px}
.score-pill span{font-size:7px;color:#94a3b8;font-weight:800;letter-spacing:0.5px}
.score-pill b{font-size:11.5px;color:#ffd700;font-weight:900;text-shadow:0 0 6px rgba(255,215,0,0.5);font-variant-numeric:tabular-nums}
.mbtn{width:24px;height:24px;border:1px solid rgba(0,217,255,0.4);border-radius:6px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center}
.mbtn:active{filter:brightness(1.5)}

.status-box{background:rgba(0,0,0,0.5);border:1px solid rgba(0,217,255,0.2);border-radius:6px;padding:2px 6px;font-size:9.5px;font-weight:700;color:#cbd5e1;text-align:center;margin-bottom:4px;min-height:18px;display:flex;align-items:center;justify-content:center;line-height:1.2}
.status-box.win{color:#4ade80;border-color:#22c55e;background:rgba(5,46,22,0.6);text-shadow:0 0 6px rgba(74,222,128,0.5)}
.status-box.bomb{color:#f87171;border-color:#ef4444;background:rgba(69,10,10,0.6);text-shadow:0 0 6px rgba(248,113,113,0.5)}

.deck-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:100%;margin-bottom:4px}
.card{width:100%;height:46px;border-radius:7px;border:none;padding:0;background:transparent;cursor:pointer;touch-action:manipulation;outline:none;position:relative}
.card:active{transform:scale(0.96)}
.card-face{position:absolute;inset:0;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.45);transition:all 0.15s ease}
.card-back{background:linear-gradient(145deg,#1d4ed8,#0f244a 70%,#081427);border:1.5px solid #38bdf8;box-shadow:0 2px 6px rgba(0,0,0,0.5),inset 0 0 8px rgba(56,189,248,0.25)}
.card-back:hover,.card-back:active{border-color:#00d9ff;box-shadow:0 0 10px rgba(0,217,255,0.6)}
.card-front{display:none}
.card.flipped .card-back{display:none}
.card.flipped .card-front{display:flex}
.card-front.safe{background:radial-gradient(circle at center,#16a34a,#064e3b 85%);border:1.5px solid #22c55e;box-shadow:0 0 10px rgba(34,197,94,0.6)}
.card-front.bomb{background:radial-gradient(circle at center,#dc2626,#450a0a 85%);border:1.5px solid #ef4444;box-shadow:0 0 12px rgba(239,68,68,0.7)}
.card-icon{font-size:17px;line-height:1;margin-bottom:1px}
.card-val{font-size:8.5px;font-weight:900;letter-spacing:0.3px}
.card-back .card-val{color:#7dd3fc;text-shadow:0 0 5px rgba(125,211,252,0.5)}
.card-front.safe .card-val{color:#86efac;text-shadow:0 0 5px rgba(134,239,172,0.6)}
.card-front.bomb .card-val{color:#fca5a5;text-shadow:0 0 5px rgba(252,165,165,0.6)}

.action-bar{display:flex;gap:4px;margin-bottom:4px}
.btn{flex:1;height:28px;border-radius:6px;font-size:10px;font-weight:900;cursor:pointer;border:none;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:3px;transition:all 0.12s ease;padding:0 6px;white-space:nowrap}
.btn:active{transform:translateY(1px)}
.btn-reset{background:linear-gradient(#1e293b,#0f172a);border:1px solid rgba(255,255,255,0.2);color:#e2e8f0;box-shadow:0 2px 0 rgba(0,0,0,0.5)}
.btn-claim{background:linear-gradient(135deg,#eab308,#ca8a04 70%,#a16207);color:#1e1b4b;box-shadow:0 0 8px rgba(234,179,8,0.4),0 2px 0 #713f12}
.btn-claim:active{filter:brightness(1.2)}

.lb-strip{display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.4);border:1px solid rgba(0,217,255,0.18);border-radius:5px;padding:2px 6px;font-size:8px;color:#94a3b8;gap:4px}
.lb-strip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:65%}
.lb-strip b{color:#38bdf8;white-space:nowrap}

.modal{position:absolute;inset:0;background:rgba(3,8,20,0.97);backdrop-filter:blur(5px);display:none;flex-direction:column;align-items:center;justify-content:center;padding:8px 10px;text-align:center;z-index:30;border-radius:12px}
.modal.show{display:flex}
.modal h2{font-size:12.5px;color:#ffd700;margin-bottom:2px;font-weight:900;text-shadow:0 0 6px rgba(255,215,0,0.6)}
.modal p{font-size:8.5px;color:#94a3b8;line-height:1.2;margin-bottom:4px}
.code-box{background:#0b1528;border:1px dashed #00d9ff;border-radius:6px;padding:4px 8px;font:900 11.5px monospace;color:#00d9ff;letter-spacing:1px;margin-bottom:4px;width:100%;word-break:break-all}
.code-input{position:absolute;opacity:0;pointer-events:none}
.btn-copy{width:100%;height:28px;margin-bottom:3px;background:linear-gradient(135deg,#00d9ff,#0284c7);color:#021124;font-size:10px;font-weight:900;box-shadow:0 0 8px rgba(0,217,255,0.4)}
.btn-close{width:100%;height:24px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#cbd5e1;font-size:9.5px}
#copy-status{font-size:8px;font-weight:800;color:#4ade80;margin-bottom:3px;min-height:12px}

.shake{animation:shakeAnim 0.4s cubic-bezier(.36,.07,.19,.97) both}
@keyframes shakeAnim{10%,90%{transform:translate3d(-2px,0,0)}20%,80%{transform:translate3d(3px,0,0)}30%,50%,70%{transform:translate3d(-4px,0,0)}40%,60%{transform:translate3d(4px,0,0)}}
</style>

<div id="app-container">
  <div class="hdr">
    <div class="title-box">
      <h1>💣 TEBAK BOM</h1>
      <span class="title-badge">4💎 2💣</span>
    </div>
    <div class="hdr-right">
      <div class="score-pill">
        <span>SKOR</span>
        <b id="sc-val">0</b>
      </div>
      <button type="button" class="mbtn" id="mute-btn" onclick="toggleMute()">🔊</button>
    </div>
  </div>

  <div class="status-box" id="status-msg">👉 Pilih salah satu kartu! Hindari 2 bom</div>
  
  <div class="deck-grid" id="card-deck">
    <button type="button" class="card" id="card-0"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front safe"><div class="card-icon">💎</div><div class="card-val">+100</div></div></button>
    <button type="button" class="card" id="card-1"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front safe"><div class="card-icon">💎</div><div class="card-val">+250</div></div></button>
    <button type="button" class="card" id="card-2"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front safe"><div class="card-icon">💎</div><div class="card-val">+500</div></div></button>
    <button type="button" class="card" id="card-3"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front safe"><div class="card-icon">💎</div><div class="card-val">+1000</div></div></button>
    <button type="button" class="card" id="card-4"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front bomb"><div class="card-icon">💣</div><div class="card-val">BOM!</div></div></button>
    <button type="button" class="card" id="card-5"><div class="card-face card-back"><div class="card-icon">❓</div><div class="card-val">TEBAK</div></div><div class="card-face card-front bomb"><div class="card-icon">💣</div><div class="card-val">BOM!</div></div></button>
  </div>
  
  <div class="action-bar">
    <button type="button" class="btn btn-reset" id="btn-reset" onclick="initGame()">🔄 Ronde Baru</button>
    <button type="button" class="btn btn-claim" id="claim-btn" onclick="openClaimModal()">🎁 KLAIM REWARD</button>
  </div>
  
  <div class="lb-strip">
    <span>${lbSummaryText}</span>
    <b>.claimr &lt;kode&gt;</b>
  </div>

  <div class="modal" id="claim-modal">
    <h2 id="modal-title">🏆 KLAIM KODE REWARD</h2>
    <p id="modal-desc">Salin kode lalu kirimkan ke chat WhatsApp:</p>
    <div class="code-box" id="modal-code">TB-0-XXXX</div>
    <input type="text" id="modal-input" class="code-input" readonly value="">
    <div id="copy-status"></div>
    <button type="button" class="btn btn-copy" id="btn-copy-code" onclick="copyCode()">📋 Salin Perintah (.claimr)</button>
    <button type="button" class="btn btn-close" onclick="closeClaimModal()">✖ Tutup &amp; Main Lagi</button>
  </div>
</div>

<script>
window.onerror = function(m, s, l) {
  var el = document.getElementById('status-msg');
  if (el) { el.textContent = '⚠ ' + m; el.className = 'status-box bomb'; }
};
(function(){
  var currentScore = 0;
  var safeFound = 0;
  var gameOver = false;
  var cards = [];
  var generatedCode = '';
  var audioCtx = null;
  var muted = false;
  try { muted = localStorage.getItem('tebakbom_mute') === '1'; } catch(e) {}

  function getAC() {
    if (!audioCtx) {
      try {
        var C = window.AudioContext || window.webkitAudioContext;
        if (C) audioCtx = new C();
      } catch(e) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      try { audioCtx.resume(); } catch(e) {}
    }
    return audioCtx;
  }

  function playTone(freq, dur, type, gain, start, slide) {
    if (muted) return;
    var a = getAC();
    if (!a) return;
    try {
      var t = a.currentTime + (start || 0);
      var osc = a.createOscillator();
      var g = a.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(gain || 0.1, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(a.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch(e) {}
  }

  function playExplosionSound() {
    if (muted) return;
    var a = getAC();
    if (!a) return;
    try {
      var t = a.currentTime;
      var dur = 0.55;
      var len = Math.floor(a.sampleRate * dur);
      var buf = a.createBuffer(1, len, a.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var noise = a.createBufferSource();
      noise.buffer = buf;
      var filter = a.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(40, t + dur);
      var g = a.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(filter);
      filter.connect(g);
      g.connect(a.destination);
      noise.start(t);
      noise.stop(t + dur);
      playTone(130, 0.45, 'sawtooth', 0.25, 0, 30);
    } catch(e) {}
  }

  function playSafeSound(step) {
    var freqs = [440, 554, 659, 880, 1108];
    var f = freqs[Math.min(step, freqs.length - 1)];
    playTone(f, 0.12, 'triangle', 0.12, 0, f * 1.3);
  }

  function playWinSound() {
    [523, 659, 784, 1046, 1318].forEach(function(f, i) {
      playTone(f, 0.15, 'sine', 0.12, i * 0.08);
    });
  }

  function setStatus(text, type) {
    var el = document.getElementById('status-msg');
    if (!el) return;
    el.textContent = text;
    el.className = 'status-box' + (type ? ' ' + type : '');
  }

  window.toggleMute = function() {
    muted = !muted;
    try { localStorage.setItem('tebakbom_mute', muted ? '1' : '0'); } catch(e) {}
    var btn = document.getElementById('mute-btn');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  };

  /* Hex Generator to match regex: ^TB-(\d+)-([A-F0-9]{6})([A-F0-9]{4})$ */
  function makeHex(len) {
    var s = '';
    var chars = '0123456789ABCDEF';
    for (var i = 0; i < len; i++) {
      s += chars.charAt(Math.floor(Math.random() * 16));
    }
    return s;
  }

  function makeClaimCode(score) {
    var safeScore = Math.max(10, Math.floor(score) || 10);
    return 'TB-' + safeScore + '-' + makeHex(6) + makeHex(4);
  }

  function initGame() {
    gameOver = false;
    safeFound = 0;
    setStatus('👉 Pilih salah satu kartu! Hindari 2 bom tersembunyi', '');
    
    var mBtn = document.getElementById('mute-btn');
    if (mBtn) mBtn.textContent = muted ? '🔇' : '🔊';

    cards = [
      { id: 0, isBomb: false, pts: 100, flipped: false },
      { id: 1, isBomb: false, pts: 250, flipped: false },
      { id: 2, isBomb: false, pts: 500, flipped: false },
      { id: 3, isBomb: false, pts: 1000, flipped: false },
      { id: 4, isBomb: true, pts: 0, flipped: false },
      { id: 5, isBomb: true, pts: 0, flipped: false }
    ];

    // Shuffle cards
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }

    cards.forEach(function(c, idx) {
      var cardDiv = document.getElementById('card-' + idx);
      if (!cardDiv) return;
      cardDiv.className = 'card';
      var front = cardDiv.querySelector('.card-front');
      if (front) {
        front.className = 'card-face card-front ' + (c.isBomb ? 'bomb' : 'safe');
        front.innerHTML = c.isBomb 
          ? '<div class="card-icon">💣</div><div class="card-val">BOM!</div>' 
          : '<div class="card-icon">💎</div><div class="card-val">+' + c.pts + '</div>';
      }
      cardDiv.onclick = function(e) {
        if (e && e.preventDefault) e.preventDefault();
        pickCard(idx);
      };
    });

    updateUI();
  }

  function pickCard(idx) {
    if (gameOver || !cards[idx] || cards[idx].flipped) return;
    getAC();
    cards[idx].flipped = true;

    var el = document.getElementById('card-' + idx);
    if (el) el.classList.add('flipped');

    var c = cards[idx];
    if (c.isBomb) {
      playExplosionSound();
      var app = document.getElementById('app-container');
      if (app) {
        app.classList.remove('shake');
        void app.offsetWidth;
        app.classList.add('shake');
      }
      currentScore = Math.floor(currentScore / 2);
      updateUI();
      setStatus('💥 Kena Bom! Skor turun 50%. Klik Ronde Baru untuk coba lagi', 'bomb');
      revealAll();
    } else {
      safeFound++;
      currentScore += c.pts;
      playSafeSound(safeFound);
      updateUI();

      if (safeFound >= 4) {
        gameOver = true;
        playWinSound();
        setStatus('🎉 JACKPOT! Semua 4 kartu aman berhasil ditemukan!', 'win');
        revealAll();
        setTimeout(function() {
          openClaimModal(true);
        }, 500);
      } else {
        setStatus('💎 Aman! +' + c.pts + ' PTS (' + safeFound + '/4). Lanjut atau Klaim?', 'win');
      }
    }
  }

  function revealAll() {
    cards.forEach(function(c, idx) {
      var el = document.getElementById('card-' + idx);
      if (el && !c.flipped) {
        c.flipped = true;
        el.classList.add('flipped');
      }
    });
  }

  function updateUI() {
    var scEl = document.getElementById('sc-val');
    if (scEl) scEl.textContent = Number(currentScore).toLocaleString('id-ID');
  }

  window.openClaimModal = function(isJackpot) {
    if (currentScore <= 0) {
      setStatus('⚠️ Kumpulkan skor dulu dengan membuka kartu aman!', 'bomb');
      return;
    }
    generatedCode = makeClaimCode(currentScore);
    var mTitle = document.getElementById('modal-title');
    var mDesc = document.getElementById('modal-desc');
    var mCode = document.getElementById('modal-code');
    var mInput = document.getElementById('modal-input');
    var st = document.getElementById('copy-status');
    if (st) st.textContent = '';

    if (mTitle) mTitle.textContent = isJackpot ? '🏆 JACKPOT 4/4 SELESAI!' : '💰 CASHOUT SCORE';
    if (mDesc) mDesc.textContent = 'Total Skor: ' + currentScore + ' PTS. Salin dan kirimkan ke chat WhatsApp:';
    if (mCode) mCode.textContent = generatedCode;
    if (mInput) mInput.value = '.claimr ' + generatedCode;

    var modal = document.getElementById('claim-modal');
    if (modal) modal.classList.add('show');
  };

  window.closeClaimModal = function() {
    var modal = document.getElementById('claim-modal');
    if (modal) modal.classList.remove('show');
  };

  window.copyCode = function() {
    var cmd = '.claimr ' + generatedCode;
    var statusEl = document.getElementById('copy-status');
    var mInput = document.getElementById('modal-input');

    var copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(function() {
        if (statusEl) statusEl.textContent = '✅ Berhasil disalin! Kirim: ' + cmd;
      }).catch(function() {
        fallbackCopy();
      });
      copied = true;
    }

    function fallbackCopy() {
      try {
        if (mInput) {
          mInput.style.opacity = '1';
          mInput.select();
          mInput.setSelectionRange(0, 99999);
          document.execCommand('copy');
          mInput.style.opacity = '0';
          if (statusEl) statusEl.textContent = '✅ Berhasil disalin! Kirim: ' + cmd;
        }
      } catch(e) {
        if (statusEl) statusEl.textContent = '📋 Kode: ' + cmd;
      }
    }

    if (!copied) fallbackCopy();
  };

  window.initGame = initGame;
  
  try {
    initGame();
  } catch(e) {}
})();
</script>`
}

/**
 * Mengirimkan game interaktif Tebak Bom HTML ke WhatsApp
 */
export async function kirimTebakBom(conn, chatId, senderJid = '') {
	const top3 = getTopLeaderboard(3)
	const htmlPayload = buildTebakBomHTML(top3)

	const data = Buffer.from(JSON.stringify({
		__typename: 'GenAIUnifiedResponse',
		response_id: randomUUID(),
		sections: [{
			__typename: 'GenAIUnifiedResponseSection',
			view_model: {
				__typename: 'GenAISingleLayoutViewModel',
				primitive: {
					__typename: 'GenAIaeacdsnwHtmlPrimitive',
					payload: htmlPayload,
					trusted_sources: []
				}
			}
		}]
	})).toString('base64')

	return conn.relayMessage(chatId, {
		messageContextInfo: {
			deviceListMetadata: {},
			deviceListMetadataVersion: 2,
			botMetadata: {
				messageDisclaimerText: "",
				botResponseId: randomUUID(),
				verificationMetadata: {
					proofs: [{
						version: 1,
						useCase: 1,
						signature: SIG,
						certificateChain: [CERT1, CERT2]
					}]
				}
			}
		},
		botForwardedMessage: {
			message: {
				richResponseMessage: {
					messageType: 1,
					submessages: [{
						messageType: 2,
						messageText: '💣 TEBAK BOM - DANGEROUS CARD MINESWEEPER'
					}],
					unifiedResponse: { data },
					contextInfo: {
						forwardingScore: 1,
						isForwarded: true,
						forwardedAiBotMessageInfo: {
							botJid: "867051314767696@bot"
						},
						forwardOrigin: 4
					}
				}
			}
		}
	}, {})
}

const pluginConfig = {
	name: "tebakbom",
	alias: ['minesweeper', 'bom', 'bomb'],
	category: "game",
	description: "Inline Dangerous Tebak Bom Card game with Canvas & SFX",
	usage: ".tebakbom",
	example: ".tebakbom",
	isOwner: false,
	isPremium: false,
	isGroup: false,
	isPrivate: false,
	cooldown: 1,
	energi: 0,
	isEnabled: true,
}

async function handler(m, options = {}) {
	const sock = options?.sock || options?.conn || options?.naze || options
	const chatId = m?.chat || m?.key?.remoteJid
	try {
		await kirimTebakBom(sock, chatId, m?.sender)
	} catch (e) {
		console.error("[TEBAKBOM]", e?.message || e)
		if (m?.reply) await m.reply("❌ Gagal mengirim game tebak bom: " + (e?.message || e))
	}
}

export { pluginConfig as config, handler }
export default handler
