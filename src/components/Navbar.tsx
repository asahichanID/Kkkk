import React from 'react';
import { Bot, RefreshCw, Settings, ShieldCheck, Terminal, Smartphone, Moon, Sparkles, Download, Swords, Bomb } from 'lucide-react';
import { BotState } from '../types';

interface NavbarProps {
  state: BotState;
  activeTab: 'control' | 'logs' | 'config' | 'sholat' | 'hdTest' | 'rpg' | 'catur' | 'tebakbom' | 'guide';
  setActiveTab: (tab: 'control' | 'logs' | 'config' | 'sholat' | 'hdTest' | 'rpg' | 'catur' | 'tebakbom' | 'guide') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenDownloadZip,
}) => {
  const getStatusBadge = () => {
    switch (state.status) {
      case 'connected':
        return (
          <span
            id="status-badge-connected"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Terhubung (Online)
          </span>
        );
      case 'pairing_ready':
        return (
          <span
            id="status-badge-pairing"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Kode Pairing Siap
          </span>
        );
      case 'waiting_code':
      case 'starting':
        return (
          <span
            id="status-badge-starting"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-spin" />
            {state.status === 'waiting_code' ? 'Meminta Kode...' : 'Memulai Bot...'}
          </span>
        );
      case 'reconnecting':
        return (
          <span
            id="status-badge-reconnecting"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Menghubungkan Ulang...
          </span>
        );
      case 'error':
        return (
          <span
            id="status-badge-error"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Error
          </span>
        );
      case 'stopped':
      default:
        return (
          <span
            id="status-badge-stopped"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Berhenti (Offline)
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  OguriCap Bot
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-800 rounded-md">
                  Baileys Multi-Device
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Web Control Panel & Custom Pairing Manager
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            <button
              id="tab-control-btn"
              onClick={() => setActiveTab('control')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'control'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Kontrol Bot
            </button>
            <button
              id="tab-logs-btn"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Live Logs
            </button>
            <button
              id="tab-config-btn"
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'config'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Konfigurasi
            </button>
            <button
              id="tab-sholat-btn"
              onClick={() => setActiveTab('sholat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'sholat'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-500" />
              Jadwal Sholat &amp; Ramadan
            </button>
            <button
              id="tab-hdtest-btn"
              onClick={() => setActiveTab('hdTest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'hdTest'
                  ? 'bg-white text-cyan-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              Uji HD &amp; Rasio (9:16)
            </button>
            <button
              id="tab-rpg-btn"
              onClick={() => setActiveTab('rpg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'rpg'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-amber-500" />
              RPG Pixel
            </button>
            <button
              id="tab-catur-btn"
              onClick={() => setActiveTab('catur')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'catur'
                  ? 'bg-amber-100 text-amber-950 shadow-xs font-bold ring-1 ring-amber-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="text-sm">♟️</span>
              Catur 3D
            </button>
            <button
              id="tab-tebakbom-btn"
              onClick={() => setActiveTab('tebakbom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'tebakbom'
                  ? 'bg-sky-100 text-sky-950 shadow-xs font-bold ring-1 ring-sky-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Bomb className="w-3.5 h-3.5 text-sky-500" />
              Tebak Bom
            </button>
            <button
              id="tab-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Panduan & Fitur
            </button>
          </nav>

          {/* Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {getStatusBadge()}

            {/* Tombol Download ZIP Preview */}
            <button
              id="navbar-download-zip-btn"
              onClick={onOpenDownloadZip}
              title="Download source code lengkap dalam file ZIP (bebas node_modules)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>

            <button
              id="refresh-status-btn"
              onClick={onRefresh}
              title="Refresh status"
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'control' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Kontrol
          </button>
          <button
            onClick={() => setActiveTab('sholat')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'sholat' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            🌙 Sholat
          </button>
          <button
            onClick={() => setActiveTab('hdTest')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'hdTest' ? 'bg-cyan-50 text-cyan-700 font-semibold' : 'text-slate-600'
            }`}
          >
            ✨ Uji HD
          </button>
          <button
            onClick={() => setActiveTab('rpg')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'rpg' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600'
            }`}
          >
            ⚔️ RPG
          </button>
          <button
            id="tab-catur-mobile-btn"
            onClick={() => setActiveTab('catur')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'catur' ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400' : 'text-slate-600'
            }`}
          >
            ♟️ Catur 3D
          </button>
          <button
            id="tab-tebakbom-mobile-btn"
            onClick={() => setActiveTab('tebakbom')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'tebakbom' ? 'bg-sky-100 text-sky-950 font-bold ring-1 ring-sky-400' : 'text-slate-600'
            }`}
          >
            💣 Tebak Bom
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'logs' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'config' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-2 py-1 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'guide' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Panduan
          </button>
          <button
            onClick={onOpenDownloadZip}
            className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white shrink-0 flex items-center gap-1 shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
