import React, { useState, useRef } from 'react';
import { Bomb, Sparkles, RefreshCw, ExternalLink, Trophy, Copy, Check, Flame, ShieldCheck } from 'lucide-react';

export const TebakBomTab: React.FC = () => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('.tebakbom');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-5 border border-sky-500/20 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md ring-4 ring-sky-500/20">
            <Bomb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Tebak Bom Arcade
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full">
                3x3 (9 Pilihan)
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                Audio Asli Bom Renyah
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-0.5">
              Fitur interaktif Minesweeper dengan logo awan garis-garis, suara asli bom yang renyah, rasio 1:1, dan 3 mode kesulitan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="tebakbom-copy-cmd-btn"
            onClick={handleCopyCommand}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCmd ? 'Tersalin!' : 'Salin .tebakbom'}</span>
          </button>
          <button
            id="tebakbom-refresh-btn"
            onClick={handleRefresh}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            title="Reload Game Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            id="tebakbom-open-window-btn"
            href="/tebakbom"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Tab Baru</span>
          </a>
        </div>
      </div>

      {/* Main Content Grid: Left Live Interactive Preview, Right Feature Highlights & Mode Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Interactive Preview Container (1:1 Aspect Ratio) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="w-full max-w-[430px] aspect-square relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-sky-500/20 bg-transparent flex items-center justify-center">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src="/tebakbom"
              title="Tebak Bom Game Preview"
              className="w-full h-full border-0 bg-transparent"
              allow="autoplay"
            />
          </div>
          <p className="text-xs text-slate-400 text-center mt-3">
            ✨ <span className="font-semibold text-sky-400">Rasio 1:1 Fluid</span> — Tampilan responsif tanpa terpotong &amp; latar luar transparan saat dikirim di WhatsApp.
          </p>
        </div>

        {/* Game Rules & Feature Guide */}
        <div className="lg:col-span-5 space-y-4">
          {/* Difficulty Modes Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Pilihan Mode Kesulitan (Di Bagian Atas)
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Mode Easy (1 Bom)
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    8 kartu aman &amp; 1 bom tersembunyi. Cocok untuk mengumpulkan poin konsisten.
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md">
                  1 💣
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Mode Normal (2 Bom)
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    7 kartu aman &amp; 2 bom tersembunyi. Hadiah poin lebih tinggi &amp; bonus jackpot.
                  </p>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-2 py-1 rounded-md">
                  2 💣
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Mode Ekstrem (4 Bom)
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    5 kartu aman &amp; 4 bom mematikan! Resiko tinggi dengan mega multiplier skor.
                  </p>
                </div>
                <span className="text-xs font-black text-rose-800 bg-rose-100/80 px-2 py-1 rounded-md">
                  4 💣
                </span>
              </div>
            </div>
          </div>

          {/* Upgraded Features Specs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Fitur Utama Tebak Bom
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">✓</span>
                <span>
                  <strong>Logo Awan Garis-Garis:</strong> Punggung kartu dihiasi motif awan bergaris presisi sebelum dibuka.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">✓</span>
                <span>
                  <strong>Suara Asli Bom Renyah:</strong> Akustik ledakan supersonic shockwave, sub-bass sweep, dan fragment crunch nyata saat terkena bom.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">✓</span>
                <span>
                  <strong>Anti Delay &amp; Zero Lag:</strong> Menggunakan interaksi <em>pointerdown</em> instan tanpa 300ms mobile touch delay dan audio pra-pemanasan (0ms latency).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">✓</span>
                <span>
                  <strong>Palet Warna Elegan:</strong> Menggunakan nuansa obsidian midnight slate, aksen sky cyan, emas hangat, dan ruby yang harmonis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">✓</span>
                <span>
                  <strong>Panel Melayang Pas Menang:</strong> Kode klaim hanya muncul dalam panel melayang kompak saat seluruh kartu aman terbuka untuk mencegah spam kode.
                </span>
              </li>
            </ul>
          </div>

          {/* WhatsApp Claim Guide Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200/80 shadow-sm space-y-2.5">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              Cara Main &amp; Klaim Hadiah di WhatsApp
            </h3>
            <div className="text-xs text-blue-800 space-y-1.5 leading-relaxed">
              <p>
                1. Ketik <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-900 font-mono font-bold">.tebakbom</code> di chat pribadi atau grup WhatsApp bot.
              </p>
              <p>
                2. Pilih mode (Easy / Normal / Ekstrem), lalu buka kartu untuk mengumpulkan diamond dan poin.
              </p>
              <p>
                3. Buka seluruh kartu aman hingga menang untuk memunculkan panel melayang klaim kode signature <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-900 font-mono">TB-xxx-xxxx</code>.
              </p>
              <p>
                4. Kirim <code className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-900 font-mono font-bold">.claimr &lt;kode&gt;</code> ke WhatsApp bot untuk menerima carats, EXP, dan masuk ke papan peringkat nyata!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
