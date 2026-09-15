import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatusBanner } from './components/StatusBanner';
import { PairingCard } from './components/PairingCard';
import { LogsConsole } from './components/LogsConsole';
import { ConfigTab } from './components/ConfigTab';
import { GuideTab } from './components/GuideTab';
import { SholatTab } from './components/SholatTab';
import { HdTestTab } from './components/HdTestTab';
import { RpgTab } from './components/RpgTab';
import { CaturTab } from './components/CaturTab';
import { DownloadZipModal } from './components/DownloadZipModal';
import { BotState, LogEntry, SystemStats } from './types';
import { safeFetchJson, safeJsonParse } from './lib/safeJson';

export default function App() {
  const [activeTab, setActiveTab] = useState<'control' | 'logs' | 'config' | 'sholat' | 'hdTest' | 'rpg' | 'catur' | 'guide'>('control');
  const [isDownloadZipOpen, setIsDownloadZipOpen] = useState(false);
  const [botState, setBotState] = useState<BotState>({
    status: 'stopped',
    pairingCode: null,
    botNumber: null,
    customCode: null,
    connectedUser: null,
    startedAt: null,
    pid: null,
    hasSession: false,
    lastError: null,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto-switch ke tab catur jika ada param tab=catur atau room=XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'catur' || params.has('room')) {
      setActiveTab('catur');
    }
  }, []);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await safeFetchJson<BotState | null>(res, null);
        if (data) setBotState(data);
      }
    } catch {
      // Dev server might be reloading
    }
  }, []);

  // Fetch system stats
  const fetchSystemStats = useCallback(async () => {
    try {
      const res = await fetch('/api/system/stats');
      if (res.ok) {
        const data = await safeFetchJson<SystemStats | null>(res, null);
        if (data) setSystemStats(data);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStatus(), fetchSystemStats()]);
    setIsRefreshing(false);
    showToast('Status berhasil diperbarui', 'info');
  };

  // Start bot
  const handleStartBot = async (botNumber: string, customCode: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botNumber, customCode }),
      });
      const data = await safeFetchJson<{ success?: boolean; message?: string }>(res, {});
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Gagal memulai bot');
      }
      showToast('Bot sedang dimulai...', 'success');
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Stop bot
  const handleStopBot = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await safeFetchJson<{ success?: boolean; message?: string }>(res, {});
      if (!res.ok) throw new Error(data.message || 'Gagal menghentikan bot');
      showToast('Perintah penghentian bot dikirim', 'info');
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Restart bot
  const handleRestartBot = async (botNumber: string, customCode: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/bot/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botNumber, customCode }),
      });
      const data = await safeFetchJson<{ success?: boolean; message?: string }>(res, {});
      if (!res.ok) throw new Error(data.message || 'Gagal merestart bot');
      showToast('Bot sedang direstart...', 'success');
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset session
  const handleResetSession = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/bot/reset-session', { method: 'POST' });
      const data = await safeFetchJson<{ success?: boolean; message?: string }>(res, {});
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Gagal reset sesi');
      }
      showToast('Sesi WhatsApp berhasil di-reset', 'success');
      await fetchStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Clear logs in frontend state
  const handleClearLogs = () => {
    setLogs([]);
    showToast('Tampilan log dibersihkan', 'info');
  };

  // Initial fetch and SSE Connection
  useEffect(() => {
    fetchStatus();
    fetchSystemStats();

    const statsInterval = setInterval(fetchSystemStats, 10000);

    // Setup SSE
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/bot/events');

      eventSource.addEventListener('status', (e) => {
        try {
          const data = safeJsonParse<BotState | null>(e.data, null);
          if (data) {
            setBotState(data);
          }
        } catch {}
      });

      eventSource.addEventListener('log', (e) => {
        try {
          const newLog = safeJsonParse<LogEntry | null>(e.data, null);
          if (newLog && newLog.id) {
            setLogs((prev) => {
              // Cegah duplikasi log id saat SSE reconnect / initial payload
              if (prev.some((existing) => existing.id === newLog.id)) {
                return prev;
              }
              return [...prev.slice(-999), newLog];
            });
          }
        } catch {}
      });

      eventSource.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch {}

    return () => {
      clearInterval(statsInterval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchStatus, fetchSystemStats]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-alert"
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        state={botState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenDownloadZip={() => setIsDownloadZipOpen(true)}
      />

      {/* Download Source Code ZIP Modal */}
      <DownloadZipModal
        isOpen={isDownloadZipOpen}
        onClose={() => setIsDownloadZipOpen(false)}
        onShowToast={showToast}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Status Banner */}
        <StatusBanner state={botState} systemStats={systemStats} />

        {/* Tab Content */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            <PairingCard
              state={botState}
              onStart={handleStartBot}
              onStop={handleStopBot}
              onRestart={handleRestartBot}
              onResetSession={handleResetSession}
              isActionLoading={isActionLoading}
            />

            {/* Quick Live Preview of Logs below control */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Cuplikan Log Realtime Terbaru
                </h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Buka Console Lengkap &rarr;
                </button>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-48 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <p className="text-slate-500">Belum ada log. Mulai bot untuk melihat output.</p>
                ) : (
                  logs.slice(-6).map((log, index) => (
                    <div key={`preview-log-${log.id}-${index}`} className="truncate">
                      <span className="text-slate-500">[{log.time}]</span>{' '}
                      <span
                        className={
                          log.message.includes('Pairing Code')
                            ? 'text-yellow-300 font-bold'
                            : log.type === 'stderr'
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <LogsConsole
            logs={logs}
            onClearLogs={handleClearLogs}
            isRunning={botState.status !== 'stopped'}
          />
        )}

        {activeTab === 'config' && (
          <ConfigTab
            onRestartNeeded={() =>
              handleRestartBot(botState.botNumber || '', botState.customCode || 'OGURICAP')
            }
          />
        )}

        {activeTab === 'sholat' && <SholatTab onShowToast={showToast} />}

        {activeTab === 'hdTest' && <HdTestTab />}

        {activeTab === 'rpg' && <RpgTab />}

        {activeTab === 'catur' && <CaturTab />}

        {activeTab === 'guide' && (
          <GuideTab onOpenDownloadZip={() => setIsDownloadZipOpen(true)} />
        )}
      </main>

      {/* Clean Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Powered by <strong>OguriCap WhatsApp Bot (Baileys MD)</strong> • Runtime Web Environment
          </div>
          <div className="flex items-center gap-3">
            <span>Node {process.version || 'v22'}</span>
            <span>•</span>
            <span>Port 3000 (Vite + Express)</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Auto-pairing Code Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
