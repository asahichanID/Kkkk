import React from 'react';
import { ShieldCheck, Clock, Cpu, Hash, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { BotState, SystemStats } from '../types';

interface StatusBannerProps {
  state: BotState;
  systemStats: SystemStats | null;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ state, systemStats }) => {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}j ${m}m ${s}d`;
    if (m > 0) return `${m}m ${s}d`;
    return `${s}d`;
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'connected':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'pairing_ready':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'waiting_code':
      case 'starting':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'error':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusLabel = () => {
    switch (state.status) {
      case 'connected':
        return 'Bot Aktif & Terhubung ke WhatsApp';
      case 'pairing_ready':
        return 'Kode Pairing Siap Dimasukkan';
      case 'waiting_code':
        return 'Meminta Kode Pairing dari WhatsApp...';
      case 'starting':
        return 'Sedang Menyiapkan Bot...';
      case 'reconnecting':
        return 'Mencoba Menghubungkan Kembali...';
      case 'error':
        return 'Terjadi Kesalahan pada Bot';
      case 'stopped':
      default:
        return 'Bot Sedang Berhenti (Offline)';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${getStatusColor()} transition-all shadow-xs`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Main Status Text */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-xs shrink-0">
            {state.status === 'connected' ? (
              <Wifi className="w-5 h-5 text-emerald-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">
                {getStatusLabel()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs opacity-80 mt-0.5">
              <span>Baileys Multi-Device (MD)</span>
              <span>•</span>
              <span>
                {state.hasSession ? 'Sesi Login Tersimpan' : 'Sesi Belum Tertaut'}
              </span>
              {state.botNumber && (
                <>
                  <span>•</span>
                  <span>+{state.botNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {state.pid && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/70 rounded-lg border border-current/10 font-mono">
              <Hash className="w-3.5 h-3.5 opacity-60" />
              <span>PID: {state.pid}</span>
            </div>
          )}

          {systemStats && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/70 rounded-lg border border-current/10">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>Uptime: {formatUptime(systemStats.uptime)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/70 rounded-lg border border-current/10 font-mono">
                <Cpu className="w-3.5 h-3.5 opacity-60" />
                <span>RAM: {systemStats.rss} MB</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
