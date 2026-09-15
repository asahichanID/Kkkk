import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, Search, ArrowDown, Check, Filter } from 'lucide-react';
import { LogEntry } from '../types';

interface LogsConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  isRunning: boolean;
}

export const LogsConsole: React.FC<LogsConsoleProps> = ({ logs, onClearLogs, isRunning }) => {
  const [filterType, setFilterType] = useState<'all' | 'stdout' | 'stderr' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      return log.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogTypeBadge = (type: LogEntry['type']) => {
    switch (type) {
      case 'stderr':
        return <span className="text-rose-500 font-semibold">[ERR]</span>;
      case 'system':
        return <span className="text-blue-500 font-semibold">[SYS]</span>;
      case 'stdout':
      default:
        return <span className="text-emerald-500 font-semibold">[OUT]</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-[650px]">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Console Logs Realtime</h2>
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </div>
            <p className="text-xs text-slate-500">
              {filteredLogs.length} baris log tercatat (Server-Sent Events)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dalam log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3 h-3 text-slate-400 ml-1" />
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                filterType === 'all' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('stdout')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                filterType === 'stdout' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Stdout
            </button>
            <button
              onClick={() => setFilterType('stderr')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                filterType === 'stderr' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Error
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                filterType === 'system' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Sistem
            </button>
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Auto-scroll aktif' : 'Auto-scroll mati'}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              autoScroll
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* Copy logs */}
          <button
            id="copy-logs-btn"
            onClick={handleCopyLogs}
            title="Salin semua log"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Clear logs */}
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            title="Bersihkan tampilan log"
            className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal View Body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-950 text-slate-200 p-4 rounded-xl mt-4 font-mono text-xs leading-relaxed space-y-1 shadow-inner select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p>Belum ada aktivitas log yang tercatat.</p>
            <p className="text-[11px]">Klik "Hubungkan &amp; Mulai Bot" untuk memulai streaming log.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={`console-log-${log.id}-${index}`} className="flex items-start gap-2 hover:bg-slate-900/80 px-1.5 py-0.5 rounded">
              <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
              <span className="shrink-0 select-none">{getLogTypeBadge(log.type)}</span>
              <span
                className={`break-all whitespace-pre-wrap ${
                  log.message.includes('Pairing Code')
                    ? 'text-yellow-300 font-bold bg-yellow-950/40 px-1 rounded'
                    : log.message.includes('Connected to')
                    ? 'text-emerald-300 font-bold'
                    : log.type === 'stderr'
                    ? 'text-rose-400'
                    : 'text-slate-200'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
