import { randomUUID } from 'crypto'
import { getTopLeaderboard, generateClaimCode, recordWinScore } from './tebakbomData.js'

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

export function buildTebakBomHTML(top3Players = []) {
	let lbSummaryText = 'Belum ada juara'
	if (top3Players && top3Players.length > 0) {
		const topUser = top3Players[0]
		const cleanPhone = (topUser.id || '').split('@')[0]
		const name = topUser.name && topUser.name !== 'Player' && topUser.name !== cleanPhone ? topUser.name : cleanPhone
		const pts = Number(topUser.score || 0).toLocaleString('id-ID')
		lbSummaryText = `👑 #1 ${name} (${pts} PTS)`
	}

	return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>Tebak Bom</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;min-height:100%;background:transparent;color:#f8fafc;overflow-x:hidden;overflow-y:auto}
body{padding:10px 8px 30px;display:flex;justify-content:center;align-items:flex-start}

/* Outer Container - matches ulartangga and sonic frame styling */
#app-container{
  width:100%;
  max-width:420px;
  background:radial-gradient(ellipse at 50% 15%,#1e293b 0%,#0f172a 75%,#020617 100%);
  border:2.5px solid #38bdf8;
  border-radius:22px;
  padding:12px 10px;
  box-shadow:0 18px 45px rgba(0,0,0,0.8),0 0 20px rgba(56,189,248,0.3),inset 0 1px 2px rgba(255,255,255,0.25);
  position:relative;
  display:flex;
  flex-direction:column;
  gap:8px;
  box-sizing:border-box;
}

/* Header Bar */
.hdr{display:flex;justify-content:space-between;align-items:center;padding:4px 6px;background:linear-gradient(135deg,#0369a1,#0f172a);border-radius:12px;border:1.5px solid #38bdf8;gap:6px}
.brand{display:flex;align-items:center;gap:6px}
.brand-icon{font-size:18px;filter:drop-shadow(0 0 6px rgba(244,63,94,0.6));line-height:1}
.brand-text h1{font-size:13px;font-weight:900;letter-spacing:0.4px;color:#38bdf8;text-shadow:0 0 8px rgba(56,189,248,0.5);line-height:1}
.brand-text .sub{font-size:7.5px;font-weight:700;letter-spacing:0.8px;color:#94a3b8;text-transform:uppercase}

.hdr-right{display:flex;align-items:center;gap:5px}
.score-badge{background:rgba(2,6,23,0.75);border:1px solid rgba(251,191,36,0.5);border-radius:7px;padding:2px 7px;display:flex;align-items:center;gap:4px;box-shadow:inset 0 0 6px rgba(251,191,36,0.15)}
.score-badge span{font-size:7px;color:#94a3b8;font-weight:800;letter-spacing:0.5px}
.score-badge b{font-size:12px;color:#fbbf24;font-weight:900;text-shadow:0 0 6px rgba(251,191,36,0.5);font-variant-numeric:tabular-nums}
.mbtn{width:28px;height:28px;border:1.2px solid #38bdf8;border-radius:8px;background:#082f49;color:#7dd3fc;font-size:12px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;transition:transform 0.1s}
.mbtn:active{transform:scale(0.92)}

/* Mode Selector Pills: (easy) (normal) (ekstrem) */
.mode-bar{display:flex;background:rgba(2,6,23,0.65);padding:3px;border-radius:10px;border:1.5px solid rgba(56,189,248,0.25);gap:4px}
.mode-btn{flex:1;height:28px;border:none;border-radius:7px;background:transparent;color:#94a3b8;font-size:10px;font-weight:800;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.16s ease;text-transform:uppercase;letter-spacing:0.3px}
.mode-btn .badge{font-size:8px;padding:1px 4px;border-radius:4px;background:rgba(255,255,255,0.1)}
.mode-btn.active{color:#ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.5)}
.mode-btn.easy.active{background:linear-gradient(135deg,#059669,#10b981);color:#ecfdf5;box-shadow:0 0 8px rgba(16,185,129,0.5)}
.mode-btn.normal.active{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fffbeb;box-shadow:0 0 8px rgba(245,158,11,0.5)}
.mode-btn.ekstrem.active{background:linear-gradient(135deg,#dc2626,#f43f5e);color:#fff1f2;box-shadow:0 0 10px rgba(244,63,94,0.6)}

/* Live Status Message */
.status-bar{background:radial-gradient(ellipse at 50% 50%,#1e293b,#090d16);border:1.5px solid #fbbf24;border-radius:10px;padding:6px 10px;font-size:10.5px;font-weight:700;color:#cbd5e1;text-align:center;min-height:24px;display:flex;align-items:center;justify-content:center;line-height:1.2;transition:all 0.2s ease}
.status-bar.win{color:#34d399;border-color:#10b981;background:rgba(6,78,59,0.6);text-shadow:0 0 6px rgba(52,211,153,0.5)}
.status-bar.bomb{color:#fda4af;border-color:#f43f5e;background:rgba(136,19,55,0.65);text-shadow:0 0 6px rgba(253,164,175,0.5)}

/* 3x3 Card Grid (9 choices) */
.deck-3d{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin:2px 0;perspective:850px}
.card-item{position:relative;width:100%;aspect-ratio:1/1;min-height:85px;border:none;background:transparent;padding:0;cursor:pointer;touch-action:manipulation;transform-style:preserve-3d;transition:transform 0.42s cubic-bezier(0.34,1.56,0.64,1)}
.card-item:active{transform:scale3d(0.96,0.96,0.96)}
.card-item.flipped{transform:rotateY(180deg)}

/* Card Faces */
.card-face{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.6),inset 0 1px 1px rgba(255,255,255,0.18);box-sizing:border-box;overflow:hidden}

/* Card Back: Striped Cloud Logo */
.card-back{
  background:linear-gradient(155deg,#1e293b 0%,#0f172a 65%,#090d16 100%);
  border:1.8px solid rgba(56,189,248,0.45);
  box-shadow:0 4px 0 #070c18, 0 8px 16px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.22);
  padding:4px;
  position:relative;
}
.card-back:hover,.card-item:hover .card-back{border-color:#38bdf8;box-shadow:0 4px 0 #070c18,0 0 12px rgba(56,189,248,0.45)}

/* Card Back Index Tag */
.card-idx{position:absolute;top:4px;left:6px;font-size:9px;font-weight:900;color:rgba(148,163,184,0.85);letter-spacing:0.5px}

/* Striped Cloud Logo Emblem */
.cloud-logo{width:clamp(34px,8.5vw,46px);height:auto;filter:drop-shadow(0 2px 5px rgba(56,189,248,0.45));margin-top:2px}

.card-back-label{font-size:8px;font-weight:900;letter-spacing:0.8px;color:#7dd3fc;text-transform:uppercase;margin-top:2px;text-shadow:0 0 4px rgba(125,211,252,0.4)}

/* Card Front: Safe vs Bomb */
.card-front{transform:rotateY(180deg)}
.card-front.safe{
  background:radial-gradient(circle at 50% 25%,#059669 0%,#064e3b 75%,#022c22 100%);
  border:2px solid #34d399;
  box-shadow:0 4px 0 #022c22,0 0 14px rgba(52,211,153,0.55),inset 0 1px 1px rgba(255,255,255,0.3);
}
.card-front.bomb{
  background:radial-gradient(circle at 50% 25%,#dc2626 0%,#881337 75%,#450a0a 100%);
  border:2px solid #f43f5e;
  box-shadow:0 4px 0 #450a0a,0 0 16px rgba(244,63,94,0.65),inset 0 1px 1px rgba(255,255,255,0.3);
}
.front-icon{font-size:clamp(20px,5vw,28px);line-height:1;margin-bottom:2px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))}
.front-val{font-size:clamp(9px,2.5vw,11px);font-weight:900;letter-spacing:0.4px}
.card-front.safe .front-val{color:#a7f3d0;text-shadow:0 0 6px rgba(167,243,208,0.6)}
.card-front.bomb .front-val{color:#fecdd3;text-shadow:0 0 6px rgba(254,205,211,0.6)}

/* Action Footer */
.action-row{display:flex;margin:2px 0}
.btn{width:100%;height:32px;border-radius:9px;font-size:11.5px;font-weight:900;cursor:pointer;border:none;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.12s ease;padding:0 8px;white-space:nowrap;box-sizing:border-box}
.btn:active{transform:translateY(1px)}
.btn-new{background:linear-gradient(135deg,#334155,#1e293b);border:1.5px solid rgba(148,163,184,0.4);color:#f1f5f9;box-shadow:0 3px 0 #0f172a}

/* Leaderboard Mini Ticker */
.lb-bar{display:flex;justify-content:space-between;align-items:center;background:rgba(2,6,23,0.65);border:1.2px solid rgba(56,189,248,0.22);border-radius:8px;padding:4px 8px;font-size:9px;color:#94a3b8}
.lb-bar span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:65%}
.lb-bar b{color:#38bdf8;white-space:nowrap}

/* Floating Victory Reward Panel */
.modal{
  position:absolute;
  inset:0;
  background:rgba(2,6,23,0.72);
  backdrop-filter:blur(4px);
  display:none;
  align-items:center;
  justify-content:center;
  padding:10px;
  z-index:50;
  border-radius:20px;
}
.modal.show{display:flex;animation:popIn 0.22s cubic-bezier(0.16,1,0.3,1)}
@keyframes popIn{0%{opacity:0;transform:scale(0.9)}100%{opacity:1;transform:scale(1)}}

.floating-panel{
  background:linear-gradient(145deg,#0f172a 0%,#090d16 100%);
  border:1.5px solid rgba(56,189,248,0.45);
  border-radius:14px;
  box-shadow:0 12px 30px rgba(0,0,0,0.85),0 0 16px rgba(56,189,248,0.22);
  padding:10px 14px;
  width:88%;
  max-width:280px;
  text-align:center;
  display:flex;
  flex-direction:column;
  gap:8px;
  box-sizing:border-box;
}
.panel-head{display:flex;align-items:center;justify-content:center;gap:4px;font-size:12px;font-weight:900;color:#fbbf24;letter-spacing:0.3px}
.panel-sub{font-size:9px;color:#94a3b8;line-height:1.2}
.code-box{
  background:#040812;
  border:1px dashed rgba(56,189,248,0.5);
  border-radius:8px;
  padding:6px 8px;
  font:900 12px monospace;
  color:#38bdf8;
  letter-spacing:0.8px;
  word-break:break-all;
  user-select:all;
  -webkit-user-select:all;
}
.code-input{position:absolute;opacity:0;pointer-events:none}
#copy-status{font-size:8px;font-weight:800;color:#34d399;min-height:12px;line-height:1}
.panel-actions{display:flex;gap:6px;width:100%;margin-top:2px}
.panel-btn{flex:1;height:28px;border-radius:7px;font-size:10px;font-weight:900;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:3px;border:none;transition:transform 0.1s}
.panel-btn:active{transform:scale(0.95)}
.panel-btn-back{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#cbd5e1}
.panel-btn-copy{background:linear-gradient(135deg,#0284c7,#0369a1);color:#ffffff;box-shadow:0 0 8px rgba(2,132,199,0.4)}

/* Canvas FX Layer for Explosions & Shockwaves */
#fx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:20}

/* Violent Shake Animation on Bomb Detonation */
.shake-3d{animation:shake3dAnim 0.45s cubic-bezier(.36,.07,.19,.97) both}
@keyframes shake3dAnim{
  10%,90%{transform:translate3d(-3px,-1px,0) rotateZ(-0.8deg)}
  20%,80%{transform:translate3d(4px,2px,0) rotateZ(1deg)}
  30%,50%,70%{transform:translate3d(-5px,-2px,0) rotateZ(-1.2deg)}
  40%,60%{transform:translate3d(5px,1px,0) rotateZ(1.2deg)}
}

/* Red Vignette Flash on Explosion */
.flash-bomb{position:absolute;inset:0;background:radial-gradient(circle at center,rgba(244,63,94,0.45) 0%,rgba(220,38,38,0.2) 60%,transparent 100%);pointer-events:none;opacity:0;transition:opacity 0.08s ease;z-index:15}
.flash-bomb.active{opacity:1}
</style>
</head>
<body>

<div id="app-container">
  <canvas id="fx-canvas"></canvas>
  <div class="flash-bomb" id="flash-overlay"></div>

  <!-- Header -->
  <div class="hdr">
    <div class="brand">
      <span class="brand-icon">💣</span>
      <div class="brand-text">
        <h1>TEBAK BOM</h1>
        <span class="sub">✦ MINESWEEPER ARCADE ✦</span>
      </div>
    </div>
    <div class="hdr-right">
      <div class="score-badge">
        <span>SKOR</span>
        <b id="sc-val">0</b>
      </div>
      <button type="button" class="mbtn" id="mute-btn" onclick="toggleMute()" title="Suara">🔊</button>
    </div>
  </div>

  <!-- Mode Selector: (easy) (normal) (ekstrem) -->
  <div class="mode-bar">
    <button type="button" class="mode-btn easy active" id="btn-mode-easy" onclick="switchMode('easy')">
      <span>Easy</span>
      <span class="badge">1 💣</span>
    </button>
    <button type="button" class="mode-btn normal" id="btn-mode-normal" onclick="switchMode('normal')">
      <span>Normal</span>
      <span class="badge">2 💣</span>
    </button>
    <button type="button" class="mode-btn ekstrem" id="btn-mode-ekstrem" onclick="switchMode('ekstrem')">
      <span>Ekstrem</span>
      <span class="badge">4 💣</span>
    </button>
  </div>

  <!-- Live Status Bar -->
  <div class="status-bar" id="status-msg">👉 Pilih kartu! Hindari 1 bom tersembunyi</div>

  <!-- 3x3 Card Deck (9 Choices) -->
  <div class="deck-3d" id="card-deck">
    <!-- 9 Cards populated with striped-cloud logo backs -->
  </div>

  <!-- Action Row -->
  <div class="action-row">
    <button type="button" class="btn btn-new" id="btn-reset" onclick="initGame()">🔄 Ronde Baru</button>
  </div>

  <!-- Leaderboard Mini Bar -->
  <div class="lb-bar">
    <span>${lbSummaryText}</span>
    <b>.claimr &lt;kode&gt;</b>
  </div>

  <!-- Floating Reward Panel (Hanya Muncul Saat Menang / Clear) -->
  <div class="modal" id="claim-modal">
    <div class="floating-panel">
      <div class="panel-head">
        <span>🏆</span>
        <span id="modal-title">KAMU MENANG!</span>
      </div>
      <div class="panel-sub" id="modal-desc">Semua kartu aman terbuka! Salin kode &amp; klaim ke WA:</div>
      <div class="code-box" id="modal-code">TB-0-XXXX</div>
      <input type="text" id="modal-input" class="code-input" readonly value="">
      <div id="copy-status"></div>
      <div class="panel-actions">
        <button type="button" class="panel-btn panel-btn-back" onclick="closeClaimModal()">⬅ Kembali</button>
        <button type="button" class="panel-btn panel-btn-copy" id="btn-copy-code" onclick="copyCode()">📋 Salin Kode</button>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
  // SVG Template Striped Cloud Logo (Logo Awan Garis-Garis)
  var STRIPED_CLOUD_SVG = '<svg class="cloud-logo" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#38bdf8"/>' +
        '<stop offset="100%" stop-color="#818cf8"/>' +
      '</linearGradient>' +
      '<clipPath id="cloudShape">' +
        '<path d="M26 56 C16 56 9 48 9 39 C9 30 16 23 24 22 C26 12 36 5 48 5 C59 5 68 11 71 20 C73 20 75 19 77 19 C87 19 95 27 95 37 C95 47 87 55 77 56 L26 56 Z"/>' +
      '</clipPath>' +
    '</defs>' +
    '<g clip-path="url(#cloudShape)">' +
      '<rect width="100" height="70" fill="url(#cloudGrad)"/>' +
      '<rect y="8" width="100" height="3" fill="#ffffff" opacity="0.4"/>' +
      '<rect y="16" width="100" height="3.5" fill="#ffffff" opacity="0.55"/>' +
      '<rect y="25" width="100" height="4" fill="#ffffff" opacity="0.75"/>' +
      '<rect y="34" width="100" height="4" fill="#ffffff" opacity="0.75"/>' +
      '<rect y="43" width="100" height="3.5" fill="#ffffff" opacity="0.55"/>' +
      '<rect y="51" width="100" height="3" fill="#ffffff" opacity="0.4"/>' +
    '</g>' +
    '<path d="M26 56 C16 56 9 48 9 39 C9 30 16 23 24 22 C26 12 36 5 48 5 C59 5 68 11 71 20 C73 20 75 19 77 19 C87 19 95 27 95 37 C95 47 87 55 77 56 L26 56 Z" stroke="#e0f2fe" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

  // Mode Configuration: easy (1 bomb), normal (2 bombs), ekstrem (4 bombs)
  var MODES = {
    easy: { bombs: 1, name: 'Easy', ptsMin: 120, ptsMax: 300, bombLabel: '1 bom' },
    normal: { bombs: 2, name: 'Normal', ptsMin: 250, ptsMax: 650, bombLabel: '2 bom' },
    ekstrem: { bombs: 4, name: 'Ekstrem', ptsMin: 600, ptsMax: 1800, bombLabel: '4 bom' }
  };

  var currentMode = 'easy';
  var currentScore = 0;
  var safeFound = 0;
  var totalSafe = 8;
  var gameOver = false;
  var cards = [];
  var generatedCode = '';
  var audioCtx = null;
  var muted = false;

  try { muted = localStorage.getItem('tebakbom_mute') === '1'; } catch(e) {}

  // Web Audio Context (Ultra Low Latency)
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

  // Pre-warm audio on user touch
  function warmAudio() {
    getAC();
    document.removeEventListener('pointerdown', warmAudio);
    document.removeEventListener('touchstart', warmAudio);
  }
  document.addEventListener('pointerdown', warmAudio);
  document.addEventListener('touchstart', warmAudio);

  // Sound: Suara Asli Bom (Authentic High-Explosive Detonation, Crunchy Shockwave & Debris)
  function playCrispExplosionSound() {
    if (muted) return;
    var a = getAC();
    if (!a) return;
    try {
      var t = a.currentTime;
      var sampleRate = a.sampleRate || 44100;
      var dur = 1.45;

      // Master dynamics compressor & limiter for punchy visceral blast
      var comp = a.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-14, t);
      comp.knee.setValueAtTime(3, t);
      comp.ratio.setValueAtTime(14, t);
      comp.attack.setValueAtTime(0.001, t);
      comp.release.setValueAtTime(0.22, t);
      comp.connect(a.destination);

      // Layer 1: Supersonic Detonation Crack (High-velocity sharp transient snap)
      var crackLen = Math.floor(sampleRate * 0.045);
      var crackBuf = a.createBuffer(1, crackLen, sampleRate);
      var cd = crackBuf.getChannelData(0);
      for (var ci = 0; ci < crackLen; ci++) {
        var ct = ci / sampleRate;
        var snap = (Math.random() * 2 - 1);
        var cEnv = Math.exp(-ct * 90);
        cd[ci] = snap * cEnv * 1.7;
      }
      var crackSource = a.createBufferSource();
      crackSource.buffer = crackBuf;
      var crackFilter = a.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(750, t);
      var crackGain = a.createGain();
      crackGain.gain.setValueAtTime(0.95, t);
      crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(comp);
      crackSource.start(t);

      // Layer 2: Authentic Combustion Body, Shockwave Crunch & Debris Shrapnel Buffer
      var bodyLen = Math.floor(sampleRate * dur);
      var bodyBuf = a.createBuffer(1, bodyLen, sampleRate);
      var bd = bodyBuf.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0;
      for (var bi = 0; bi < bodyLen; bi++) {
        var bt = bi / sampleRate;
        // Pink noise filtering
        var white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.15;
        b2 = 0.85 * b2 + white * 0.25;
        var pink = (b0 + b1 + b2) * 0.8;

        // Crunchy debris & shrapnel clicks (crisp scattered fragments)
        var debris = 0;
        if (bt < 0.65 && Math.random() < 0.18) {
          debris = (Math.random() * 2 - 1) * Math.exp(-bt * 3.5) * 1.1;
        }

        // Envelope
        var attack = bt < 0.002 ? bt / 0.002 : 1;
        var decay = Math.exp(-bt * 2.2);
        var rumble = Math.exp(-bt * 1.2) * 0.7;

        // Non-linear distortion to simulate real explosive pressure wave
        var raw = (pink * (decay + rumble) + debris);
        bd[bi] = Math.tanh(raw * 2.5) * attack;
      }
      var bodySource = a.createBufferSource();
      bodySource.buffer = bodyBuf;

      var bodyFilter = a.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(3400, t);
      bodyFilter.frequency.exponentialRampToValueAtTime(75, t + dur);
      bodyFilter.Q.setValueAtTime(2.2, t);

      var bodyGain = a.createGain();
      bodyGain.gain.setValueAtTime(1.1, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      bodySource.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(comp);
      bodySource.start(t);

      // Layer 3: Deep Visceral Sub Punch (Low sweep 165Hz -> 25Hz)
      var subOsc = a.createOscillator();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(165, t);
      subOsc.frequency.exponentialRampToValueAtTime(24, t + 0.45);

      var subFilter = a.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(180, t);
      subFilter.frequency.exponentialRampToValueAtTime(50, t + 0.6);

      var subGain = a.createGain();
      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(comp);
      subOsc.start(t);
      subOsc.stop(t + 0.7);

      // Layer 4: Heavy Rolling Sub Rumble (Ground shock rumble decaying over 1.4s)
      var rumOsc = a.createOscillator();
      rumOsc.type = 'sine';
      rumOsc.frequency.setValueAtTime(42, t);
      rumOsc.frequency.exponentialRampToValueAtTime(28, t + 1.2);

      var rumGain = a.createGain();
      rumGain.gain.setValueAtTime(0.65, t);
      rumGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      rumOsc.connect(rumGain);
      rumGain.connect(comp);
      rumOsc.start(t);
      rumOsc.stop(t + 1.45);
    } catch(e) {}
  }

  // Sound: Safe Gem Chime (Crisp Chime Arpeggio)
  function playCrispSafeSound(step) {
    if (muted) return;
    var a = getAC();
    if (!a) return;
    try {
      var t = a.currentTime;
      var scales = [
        [523.25, 659.25], // C5, E5
        [587.33, 739.99], // D5, F#5
        [659.25, 830.61], // E5, G#5
        [698.46, 880.00], // F5, A5
        [783.99, 987.77], // G5, B5
        [880.00, 1108.7], // A5, C#6
        [987.77, 1244.5], // B5, D#6
        [1046.5, 1318.5]  // C6, E6
      ];
      var chord = scales[Math.min(step - 1, scales.length - 1)] || [659, 880];

      chord.forEach(function(freq, idx) {
        var osc = a.createOscillator();
        var g = a.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        g.gain.setValueAtTime(0.2, t + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.22);
        osc.connect(g);
        g.connect(a.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.25);
      });
    } catch(e) {}
  }

  // Sound: Jackpot Win Fanfare
  function playWinSound() {
    if (muted) return;
    var a = getAC();
    if (!a) return;
    try {
      var notes = [523, 659, 784, 1046, 1318, 1568];
      var t = a.currentTime;
      notes.forEach(function(f, i) {
        var osc = a.createOscillator();
        var g = a.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.07);
        g.gain.setValueAtTime(0.22, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.32);
        osc.connect(g);
        g.connect(a.destination);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.35);
      });
    } catch(e) {}
  }

  // Visual Particle Explosion Engine on Canvas
  var fxCanvas = document.getElementById('fx-canvas');
  var fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
  var particles = [];
  var shockwaves = [];
  var animFrameId = null;

  function resizeFxCanvas() {
    if (!fxCanvas) return;
    var rect = fxCanvas.getBoundingClientRect();
    fxCanvas.width = rect.width;
    fxCanvas.height = rect.height;
  }
  window.addEventListener('resize', resizeFxCanvas);

  function triggerExplosionFx(x, y) {
    resizeFxCanvas();
    if (!fxCtx) return;

    // Shockwave ring
    shockwaves.push({
      x: x,
      y: y,
      r: 6,
      maxR: 90,
      opacity: 0.9,
      color: '#f43f5e'
    });

    // 26 Explosive fire sparks
    for (var i = 0; i < 26; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 6.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3.5,
        color: ['#f43f5e', '#fbbf24', '#ffffff', '#ea580c', '#fda4af'][Math.floor(Math.random() * 5)],
        life: 1,
        decay: 0.03 + Math.random() * 0.04
      });
    }

    if (!animFrameId) {
      loopFx();
    }
  }

  function loopFx() {
    if (!fxCtx || !fxCanvas) return;
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

    // Render Shockwaves
    for (var i = shockwaves.length - 1; i >= 0; i--) {
      var sw = shockwaves[i];
      sw.r += 4.5;
      sw.opacity -= 0.05;
      if (sw.opacity <= 0 || sw.r >= sw.maxR) {
        shockwaves.splice(i, 1);
        continue;
      }
      fxCtx.save();
      fxCtx.beginPath();
      fxCtx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      fxCtx.strokeStyle = 'rgba(244,63,94,' + sw.opacity.toFixed(2) + ')';
      fxCtx.lineWidth = 3.5;
      fxCtx.shadowColor = '#f43f5e';
      fxCtx.shadowBlur = 10;
      fxCtx.stroke();
      fxCtx.restore();
    }

    // Render Particles
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.vx *= 0.96; // friction
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(j, 1);
        continue;
      }
      fxCtx.save();
      fxCtx.globalAlpha = p.life;
      fxCtx.fillStyle = p.color;
      fxCtx.shadowColor = p.color;
      fxCtx.shadowBlur = 6;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();
    }

    if (shockwaves.length > 0 || particles.length > 0) {
      animFrameId = requestAnimationFrame(loopFx);
    } else {
      animFrameId = null;
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    }
  }

  function setStatus(text, type) {
    var el = document.getElementById('status-msg');
    if (!el) return;
    el.textContent = text;
    el.className = 'status-bar' + (type ? ' ' + type : '');
  }

  window.toggleMute = function() {
    muted = !muted;
    try { localStorage.setItem('tebakbom_mute', muted ? '1' : '0'); } catch(e) {}
    var btn = document.getElementById('mute-btn');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  };

  // Switch Mode: (easy) (normal) (ekstrem)
  window.switchMode = function(modeKey) {
    if (!MODES[modeKey]) return;
    currentMode = modeKey;
    ['easy', 'normal', 'ekstrem'].forEach(function(k) {
      var b = document.getElementById('btn-mode-' + k);
      if (b) {
        if (k === modeKey) b.classList.add('active');
        else b.classList.remove('active');
      }
    });
    initGame();
  };

  // Hex claim code generation to match ^TB-(\\d+)-([A-F0-9]{6})([A-F0-9]{4})$
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

  // Initialize Game Board
  function initGame() {
    gameOver = false;
    safeFound = 0;
    var conf = MODES[currentMode] || MODES.easy;
    var bombCount = conf.bombs;
    totalSafe = 9 - bombCount;

    setStatus('👉 Pilih kartu! Hindari ' + conf.bombLabel + ' tersembunyi', '');

    var mBtn = document.getElementById('mute-btn');
    if (mBtn) mBtn.textContent = muted ? '🔇' : '🔊';

    // Generate 9 cards
    var cardPool = [];
    for (var b = 0; b < bombCount; b++) {
      cardPool.push({ isBomb: true, pts: 0 });
    }
    for (var s = 0; s < totalSafe; s++) {
      var stepPts = Math.round(conf.ptsMin + ((conf.ptsMax - conf.ptsMin) / Math.max(1, totalSafe - 1)) * s);
      cardPool.push({ isBomb: false, pts: stepPts });
    }

    // Shuffle pool
    for (var i = cardPool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cardPool[i];
      cardPool[i] = cardPool[j];
      cardPool[j] = temp;
    }

    cards = cardPool.map(function(item, idx) {
      return {
        id: idx,
        isBomb: item.isBomb,
        pts: item.pts,
        flipped: false
      };
    });

    // Render 9 3D Cards
    var deckContainer = document.getElementById('card-deck');
    if (!deckContainer) return;
    deckContainer.innerHTML = '';

    cards.forEach(function(c, idx) {
      var cardBtn = document.createElement('button');
      cardBtn.type = 'button';
      cardBtn.className = 'card-item';
      cardBtn.id = 'card-' + idx;

      // Card Back (Logo Awan Garis-Garis)
      var backFace = document.createElement('div');
      backFace.className = 'card-face card-back';
      backFace.innerHTML = '<span class="card-idx">#' + (idx + 1) + '</span>' +
        STRIPED_CLOUD_SVG +
        '<span class="card-back-label">BUKA</span>';

      // Card Front (Safe vs Bomb)
      var frontFace = document.createElement('div');
      frontFace.className = 'card-face card-front ' + (c.isBomb ? 'bomb' : 'safe');
      frontFace.innerHTML = c.isBomb
        ? '<div class="front-icon">💣</div><div class="front-val">BOM!</div>'
        : '<div class="front-icon">💎</div><div class="front-val">+' + c.pts + '</div>';

      cardBtn.appendChild(backFace);
      cardBtn.appendChild(frontFace);

      // Fast pointerdown event (Anti-delay 0ms response)
      cardBtn.addEventListener('pointerdown', function(e) {
        if (e && e.preventDefault) e.preventDefault();
        pickCard(idx, cardBtn);
      });

      deckContainer.appendChild(cardBtn);
    });

    updateUI();
  }

  // Card Pick Handler
  function pickCard(idx, btnElem) {
    if (gameOver || !cards[idx] || cards[idx].flipped) return;
    getAC();
    cards[idx].flipped = true;

    var el = btnElem || document.getElementById('card-' + idx);
    if (el) el.classList.add('flipped');

    var c = cards[idx];
    if (c.isBomb) {
      // Authentic Real Bomb Explosion Audio & Visual Effects
      playCrispExplosionSound();

      // Screen Violent Shake
      var app = document.getElementById('app-container');
      if (app) {
        app.classList.remove('shake-3d');
        void app.offsetWidth;
        app.classList.add('shake-3d');
      }

      // Red Flash Vignette
      var flash = document.getElementById('flash-overlay');
      if (flash) {
        flash.classList.add('active');
        setTimeout(function() { flash.classList.remove('active'); }, 220);
      }

      // Canvas Particle & Shockwave FX from Card Position
      if (el) {
        var rect = el.getBoundingClientRect();
        var appRect = app ? app.getBoundingClientRect() : { left: 0, top: 0 };
        var cx = rect.left + rect.width / 2 - appRect.left;
        var cy = rect.top + rect.height / 2 - appRect.top;
        triggerExplosionFx(cx, cy);
      }

      gameOver = true;
      currentScore = 0;
      updateUI();
      setStatus('💥 KENA BOM! Game over. Klik Ronde Baru untuk coba lagi!', 'bomb');
      revealAll();
    } else {
      safeFound++;
      currentScore += c.pts;
      playCrispSafeSound(safeFound);
      updateUI();

      if (safeFound >= totalSafe) {
        gameOver = true;
        playWinSound();
        var jackpotBonus = currentMode === 'ekstrem' ? 1500 : (currentMode === 'normal' ? 800 : 400);
        currentScore += jackpotBonus;
        updateUI();
        setStatus('🎉 MENANG ALL CLEAR (' + totalSafe + '/' + totalSafe + ')! Skor +' + currentScore + ' PTS!', 'win');
        revealAll();
        setTimeout(function() {
          openClaimModal();
        }, 550);
      } else {
        setStatus('💎 Aman! +' + c.pts + ' PTS (' + safeFound + '/' + totalSafe + '). Buka semua kartu aman!', 'win');
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

  // Floating Victory Claim Modal (Hanya muncul pas menang untuk hindari spam kode)
  window.openClaimModal = function() {
    if (!gameOver || safeFound < totalSafe || currentScore <= 0) return;
    generatedCode = makeClaimCode(currentScore);
    var mTitle = document.getElementById('modal-title');
    var mDesc = document.getElementById('modal-desc');
    var mCode = document.getElementById('modal-code');
    var mInput = document.getElementById('modal-input');
    var st = document.getElementById('copy-status');
    if (st) st.textContent = '';

    if (mTitle) mTitle.textContent = 'KAMU MENANG (' + currentMode.toUpperCase() + ')!';
    if (mDesc) mDesc.textContent = 'Semua kartu aman terbuka (' + currentScore + ' PTS). Salin & klaim:';
    if (mCode) mCode.textContent = generatedCode;
    if (mInput) mInput.value = '.claimr ' + generatedCode;

    var modal = document.getElementById('claim-modal');
    if (modal) modal.classList.add('show');
  };

  window.closeClaimModal = function() {
    var modal = document.getElementById('claim-modal');
    if (modal) modal.classList.remove('show');
    initGame();
  };

  window.copyCode = function() {
    if (!generatedCode) return;
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

  // Auto boot
  try {
    initGame();
  } catch(e) {}
})();
</script>
</body>
</html>`
}

function getBaseUrl() {
	return process.env.APP_URL
		|| (process.env.AIS_DEV_URL || 'https://ais-dev-kcauebbsitlbk5dbpssykq-698964539797.asia-southeast1.run.app');
}

const NUM_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

/**
 * Render tampilan visual papan kotak 3x3 untuk WhatsApp chat
 */
export function renderBoard(session, state = 'playing', hitIndex = -1) {
	let rows = [];
	for (let r = 0; r < 3; r++) {
		let row = [];
		for (let c = 0; c < 3; c++) {
			const idx = r * 3 + c;
			if (state === 'playing') {
				if (session.opened.includes(idx)) {
					row.push('💎');
				} else {
					row.push(NUM_EMOJIS[idx]);
				}
			} else if (state === 'win') {
				if (session.bombs.includes(idx)) {
					row.push('💣');
				} else {
					row.push('💎');
				}
			} else if (state === 'boom') {
				if (idx === hitIndex) {
					row.push('💥');
				} else if (session.bombs.includes(idx)) {
					row.push('💣');
				} else if (session.opened.includes(idx)) {
					row.push('💎');
				} else {
					row.push('⬜');
				}
			} else if (state === 'surrender') {
				if (session.bombs.includes(idx)) {
					row.push('💣');
				} else if (session.opened.includes(idx)) {
					row.push('💎');
				} else {
					row.push('⬜');
				}
			}
		}
		rows.push(`│   [ ${row[0]} ]   [ ${row[1]} ]   [ ${row[2]} ]`);
	}
	return rows.join('\n');
}

const TEBAKBOM_HTML = buildTebakBomHTML([]);

function getTebakBomHtml(playerName = 'Player') {
	const top3 = getTopLeaderboard(3);
	return buildTebakBomHTML(top3);
}

export async function kirimTebakBom(conn, chatId, senderJid = '', pushName = 'Player') {
	const htmlPayload = getTebakBomHtml(pushName);

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
	})).toString('base64');

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
	}, {});
}

const pluginConfig = {
	name: "tebakbom",
	alias: ['minesweeper', 'bom', 'bomb', 'tb'],
	category: "game",
	description: "3D Rich Response Card Minesweeper Game",
	usage: ".tebakbom",
	example: ".tebakbom",
	isOwner: false,
	isPremium: false,
	isGroup: false,
	isPrivate: false,
	cooldown: 1,
	energi: 0,
	isEnabled: true,
};

async function handler(m, options = {}) {
	const sock = options?.sock || options?.conn || options?.naze || options;
	const chatId = m?.chat || m?.key?.remoteJid;
	const pushName = m?.pushName || 'Player';
	try {
		await kirimTebakBom(sock, chatId, m?.sender, pushName);
	} catch (e) {
		console.error("[TEBAKBOM]", e?.message || e);
		if (m?.reply) await m.reply("❌ Gagal mengirim game tebak bom: " + (e?.message || e));
	}
}

export { TEBAKBOM_HTML, getTebakBomHtml, pluginConfig as config, handler };
export default handler;
