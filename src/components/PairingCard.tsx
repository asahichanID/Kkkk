import React, { useState } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  Play,
  Square,
  RotateCw,
  Trash2,
  Phone,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { BotState } from '../types';

interface PairingCardProps {
  state: BotState;
  onStart: (botNumber: string, customCode: string) => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: (botNumber: string, customCode: string) => Promise<void>;
  onResetSession: () => Promise<void>;
  isActionLoading: boolean;
}

export const PairingCard: React.FC<PairingCardProps> = ({
  state,
  onStart,
  onStop,
  onRestart,
  onResetSession,
  isActionLoading,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(state.botNumber || '');
  const [useCustomCode, setUseCustomCode] = useState(Boolean(state.customCode));
  const [customCode, setCustomCode] = useState(state.customCode || '');
  const [hasCopied, setHasCopied] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleCopy = () => {
    if (!state.pairingCode) return;
    navigator.clipboard.writeText(state.pairingCode.replace(/\s+/g, ''));
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const isRunning = state.status !== 'stopped' && state.status !== 'error';

  // Check if custom code has disallowed characters (0, O, I, L, U are excluded from WhatsApp Base32)
  const hasInvalidChars = /[0OILU]/i.test(customCode);

  const handleStartSubmit = () => {
    onStart(phoneNumber, useCustomCode ? customCode : '');
  };

  const handleRestartSubmit = () => {
    onRestart(phoneNumber, useCustomCode ? customCode : '');
  };

  return (
    <div className="space-y-6">
      {/* Active Pairing Code Banner if ready */}
      {state.pairingCode && (
        <div
          id="pairing-code-banner"
          className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg border border-blue-600 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  Kode Pairing WhatsApp Aktif
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Tautkan WhatsApp Melalui HP
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Buka WhatsApp di ponsel Anda &gt; <strong>Perangkat Tertaut</strong> &gt; pilih opsi <strong>Tautkan dengan nomor telepon saja</strong> di bagian bawah, lalu masukkan kode berikut:
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="bg-white text-blue-950 px-5 py-3.5 rounded-2xl font-mono text-2xl sm:text-3xl font-black tracking-widest shadow-lg flex items-center gap-3 justify-center border-2 border-blue-100">
                  <span>{state.pairingCode}</span>
                  <button
                    id="copy-pairing-code-btn"
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-blue-50 rounded-xl text-blue-600 active:scale-95 transition-all"
                    title="Salin Kode Pairing"
                  >
                    {hasCopied ? <Check className="w-6 h-6 text-emerald-600" /> : <Copy className="w-6 h-6" />}
                  </button>
                </div>
                {hasCopied ? (
                  <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                    ✓ Kode berhasil disalin ke clipboard!
                  </span>
                ) : (
                  <span className="text-[11px] text-blue-200">
                    Klik ikon salin untuk copy instan
                  </span>
                )}
              </div>
            </div>

            {/* Quick step guide bar */}
            <div className="mt-5 pt-4 border-t border-blue-400/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-100">
              <div className="flex items-start gap-2 bg-blue-950/20 p-2.5 rounded-xl border border-blue-400/20">
                <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center shrink-0 text-white">
                  1
                </span>
                <span>Buka WhatsApp di HP &gt; Menu (⋮) atau Pengaturan</span>
              </div>
              <div className="flex items-start gap-2 bg-blue-950/20 p-2.5 rounded-xl border border-blue-400/20">
                <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center shrink-0 text-white">
                  2
                </span>
                <span>Pilih <strong>Perangkat Tertaut</strong> &gt; <strong>Tautkan dengan nomor telepon saja</strong></span>
              </div>
              <div className="flex items-start gap-2 bg-blue-950/20 p-2.5 rounded-xl border border-blue-400/20">
                <span className="w-5 h-5 rounded-full bg-white/20 font-bold flex items-center justify-center shrink-0 text-white">
                  3
                </span>
                <span>Masukkan 8 karakter kode di atas untuk menghubungkan bot</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Success Card */}
      {state.status === 'connected' && (
        <div
          id="connected-status-card"
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-emerald-950">
                  WhatsApp Berhasil Terhubung!
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-200 text-emerald-800">
                  Sesi Aktif
                </span>
              </div>
              <p className="text-sm text-emerald-800 mt-1">
                Bot OguriCap saat ini aktif merespons pesan WhatsApp secara otomatis menggunakan nomor Anda.
              </p>
              {state.connectedUser && (
                <div className="mt-3 bg-white/80 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-emerald-700">Akun: </span>
                    {state.connectedUser.name || 'Bot User'}
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-700">JID / ID: </span>
                    {state.connectedUser.id || '-'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bot Control Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kontrol Bot &amp; Pengaturan Pairing
              </h2>
              <p className="text-xs text-slate-500">
                Tautkan nomor WhatsApp Anda dengan kode pairing tanpa perlu scan QR
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                state.hasSession
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {state.hasSession ? 'Sesi Tersimpan (Auto-Login)' : 'Belum Ada Sesi'}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Phone Number Input */}
          <div>
            <label
              htmlFor="bot-phone-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Nomor WhatsApp Bot
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="bot-phone-input"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="628123456789 (format 628xxx atau 08xxx)"
                disabled={isRunning}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Masukkan nomor HP WhatsApp. Jika diawali <code>08...</code>, sistem akan otomatis mengonversi ke kode negara <code>628...</code>.
            </p>
          </div>

          {/* Pairing Mode Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Mode Kode Pairing
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {useCustomCode
                    ? 'Kustom 8 karakter (Eksperimental)'
                    : 'Kode Resmi WhatsApp Standar (Rekomendasi Utama — 100% Berhasil)'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomCode}
                  onChange={(e) => setUseCustomCode(e.target.checked)}
                  disabled={isRunning}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-xs font-medium text-slate-700">Custom Code</span>
              </label>
            </div>

            {useCustomCode && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <label
                  htmlFor="bot-custom-code-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Custom Pairing Code (Tepat 8 Karakter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="bot-custom-code-input"
                    type="text"
                    maxLength={8}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="Contoh: 8K7W2M9P"
                    disabled={isRunning}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase tracking-wider font-mono font-bold disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {hasInvalidChars && (
                  <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Perhatian: Karakter 0, O, I, L, U tidak didukung WhatsApp Base32 dan dapat menyebabkan pairing gagal. Sistem akan otomatis beralih ke kode standar jika ditolak.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <button
                id="start-bot-btn"
                onClick={handleStartSubmit}
                disabled={isActionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                Hubungkan &amp; Mulai Bot
              </button>
            ) : (
              <>
                <button
                  id="stop-bot-btn"
                  onClick={onStop}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Hentikan Bot
                </button>
                <button
                  id="restart-bot-btn"
                  onClick={handleRestartSubmit}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <RotateCw className="w-4 h-4" />
                  Restart Bot
                </button>
              </>
            )}
          </div>

          <div>
            <button
              id="reset-session-btn"
              onClick={() => setShowResetModal(true)}
              disabled={isActionLoading}
              title="Hapus sesi login saat ini untuk pairing dengan nomor baru"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Sesi WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Linking Guide Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Panduan Lengkap Menghubungkan WhatsApp Bot Tanpa QR
        </div>
        <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside">
          <li className="pl-1">
            Masukkan <strong>Nomor WhatsApp</strong> Anda pada kolom di atas (cth: <code>628xxx</code> atau <code>08xxx</code>).
          </li>
          <li className="pl-1">
            Biarkan opsi <strong>Kode Resmi WhatsApp Standar</strong> aktif untuk tingkat keberhasilan tertinggi (100% kompatibel di Android &amp; iOS).
          </li>
          <li className="pl-1">
            Klik tombol <strong>Hubungkan &amp; Mulai Bot</strong>.
          </li>
          <li className="pl-1">
            Tunggu beberapa detik hingga kotak biru <strong>Kode Pairing</strong> muncul di layar atas.
          </li>
          <li className="pl-1">
            Buka aplikasi WhatsApp di HP Anda &gt; buka <strong>Perangkat Tertaut</strong> &gt; pilih{' '}
            <strong>Tautkan dengan nomor telepon saja</strong>.
          </li>
          <li className="pl-1">
            Ketikkan 8 karakter kode pairing yang tertera pada layar web ini.
          </li>
          <li className="pl-1">
            Setelah terhubung, bot akan otomatis aktif dan siap menerima pesan/perintah seperti{' '}
            <code>.menu</code>, <code>.ping</code>, atau <code>.sticker</code>.
          </li>
        </ol>
      </div>

      {/* Reset Session Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Konfirmasi Reset Sesi WhatsApp?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Tindakan ini akan menghapus file kredensial sesi lokal di folder <code>nazedev/</code>. Bot akan terputus dari akun WhatsApp saat ini dan Anda harus memasukkan kode pairing baru untuk menghubungkannya kembali.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                id="confirm-reset-session-btn"
                onClick={async () => {
                  setShowResetModal(false);
                  await onResetSession();
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Ya, Reset Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
