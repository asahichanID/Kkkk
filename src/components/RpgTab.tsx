import React, { useState } from 'react';
import { Swords, Zap, Shield, Flame, ExternalLink, RefreshCw, Trophy, Crown, Compass, Users } from 'lucide-react';

export const RpgTab: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-black tracking-wider uppercase">
                Multiplayer WebSocket
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                Authoritative Server
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-amber-400" />
              PIXEL FANTASY RPG
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dunia fantasi open-world multiplayer pixel art. Kalahkan monster, hancurkan reruntuhan kuno, dan bangkitkan kekuatan mistis <strong>Roh Rubah Ekor 11</strong>!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
              title="Muat ulang canvas game"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart Game</span>
            </button>
            <a
              href="/rpg"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Tab Penuh</span>
            </a>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Open World</div>
            <div className="text-xs font-bold text-slate-800">5 Wilayah &amp; Portal</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Multiplayer</div>
            <div className="text-xs font-bold text-slate-800">Realtime WebSocket</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Fox Spirit</div>
            <div className="text-xs font-bold text-slate-800">Ekor 4, 7 &amp; 11</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Owner Privilege</div>
            <div className="text-xs font-bold text-slate-800">Auto Ekor 11 Mahadewa</div>
          </div>
        </div>
      </div>

      {/* Embedded Game Canvas Window */}
      <div className={`bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[620px]'}`}>
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 backdrop-blur-sm"
          >
            {isFullscreen ? 'Tutup Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        <iframe
          key={iframeKey}
          src="/rpg"
          title="RPG Pixel Fantasy Game"
          className="w-full h-full border-none"
          allow="autoplay"
        />
      </div>

      {/* Guide & Controls Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          Panduan Kontrol &amp; Penggunaan di WhatsApp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-800 text-xs">📱 Di WhatsApp / Layar Sentuh HP:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Kirim pesan perintah <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-900">.rpg</code> ke bot di WhatsApp.</li>
              <li>Gunakan <strong>D-Pad di kiri bawah</strong> untuk bergerak.</li>
              <li>Gunakan tombol <strong>⚔️ ATK</strong>, <strong>🌀 SKILL</strong>, <strong>💨 DODGE</strong>, dan <strong>🦊 FOX</strong> di kanan bawah.</li>
              <li>Gunakan tombol <strong>💬 Bicara</strong> untuk berinteraksi dengan NPC terdekat (Raja, Alkemis, Pandai Besi).</li>
            </ul>
          </div>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-800 text-xs">💻 Di Komputer / Keyboard:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>W, A, S, D</strong> atau Panah: Berjalan.</li>
              <li><strong>Spasi / J</strong>: Serangan Dasar (Pedang / Panah / Bola Sihir).</li>
              <li><strong>K</strong>: Jurus Spesial Kelas (Whirlwind, Hujan Panah, Meteor Arcane).</li>
              <li><strong>L</strong>: Tangkisan &amp; Dodge Roll kilat (kebal sementara).</li>
              <li><strong>F</strong>: Jurus Roh Rubah (Ekor 4, 7, atau Sinar Bencana Ekor 11).</li>
              <li><strong>E</strong>: Berbicara dengan NPC terdekat.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
