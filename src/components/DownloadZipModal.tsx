import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  FileArchive,
  CheckCircle2,
  FolderTree,
  AlertCircle,
  HardDrive,
  Layers,
  Terminal,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ProjectExportInfo } from '../types';
import { safeFetchJson } from '../lib/safeJson';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [info, setInfo] = useState<ProjectExportInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchExportInfo();
    }
  }, [isOpen]);

  const fetchExportInfo = async () => {
    setLoadingInfo(true);
    try {
      const res = await fetch('/api/project/export-info');
      if (res.ok) {
        const data = await safeFetchJson<ProjectExportInfo | null>(res, null);
        if (data) setInfo(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingInfo(false);
    }
  };

  const [downloadProgressText, setDownloadProgressText] = useState<string>('');

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadProgressText('Menghubungi server & memproses arsip...');
    onShowToast('Sedang membuat & mengompresi berkas ZIP asli...', 'info');

    try {
      setDownloadProgressText('Mengunduh data biner ZIP (bebas node_modules)...');
      const response = await fetch('/api/project/download-zip', {
        headers: {
          'Accept': 'application/zip, application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}: ${response.statusText}`);
      }

      setDownloadProgressText('Menyimpan file ZIP ke perangkat Anda...');
      const blob = await response.blob();

      // Buat Blob eksplisit dengan MIME application/zip untuk mencegah browser salah menebak sebagai HTML
      const zipBlob = new Blob([blob], { type: 'application/zip' });
      const objectUrl = window.URL.createObjectURL(zipBlob);

      const filename = `oguricap-bot-source-${new Date().toISOString().slice(0, 10)}.zip`;
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(objectUrl);
      }, 2000);

      onShowToast('Arsip ZIP asli (.zip) berhasil diunduh!', 'success');
    } catch (err: any) {
      console.error('ZIP download error:', err);
      onShowToast(`Gagal mengunduh ZIP: ${err.message || 'Error'}`, 'error');
    } finally {
      setDownloading(false);
      setDownloadProgressText('');
    }
  };

  const handleOpenDirectInNewTab = () => {
    // Membuka endpoint langsung di tab baru browser sebagai metode cadangan jika iframe memblokir download
    const directUrl = `${window.location.origin}/api/project/download-zip`;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Membuka unduhan ZIP langsung di tab baru browser...', 'info');
  };

  const handleCopyGitCommands = () => {
    const commands = `git init\ngit add .\ngit commit -m "feat: initial commit OguriCap Bot and Web Manager"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME/REPO_NAME.git\ngit push -u origin main`;
    navigator.clipboard.writeText(commands);
    setCopiedGit(true);
    onShowToast('Perintah Git berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedGit(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="download-zip-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="download-zip-modal-content"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Download Source Code (ZIP)
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Solusi ekspor lengkap karena deploy langsung ke GitHub terbatas di preview
              </p>
            </div>
          </div>
          <button
            id="close-zip-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Status Note */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-blue-950">
                Kondisi Khusus Lingkungan Preview AI Studio:
              </span>{' '}
              Fitur deploy langsung ke GitHub tidak tersedia dari dalam container preview. Tombol ini
              menghasilkan arsip ZIP utuh dengan file proyek yang <strong>100% lengkap</strong>, terstruktur,
              dan <strong>bebas sampah</strong> (tanpa ribuan file <code>node_modules</code>), sehingga sangat
              ringan dan langsung siap Anda upload ke GitHub atau server produksi.
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Total Berkas Bersih</div>
                <div className="text-base font-bold text-slate-900">
                  {loadingInfo ? '...' : `${info?.totalFiles || 0} file`}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Estimasi Ukuran ZIP</div>
                <div className="text-base font-bold text-slate-900">
                  {loadingInfo ? '...' : info?.totalSizeFormatted || '~15 MB'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Kesesuaian Target</div>
                <div className="text-xs font-bold text-slate-900">
                  GitHub &amp; Railway Ready
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Komponen Proyek yang Disertakan (Wajib &amp; Lengkap)
            </h3>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              {info?.includedCategories.map((cat, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 py-1 border-b border-slate-100 last:border-none">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">{cat.name}</span>
                      <p className="text-[11px] text-slate-500">{cat.description}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-white text-slate-600 border border-slate-200 rounded-md shrink-0">
                    {cat.fileCount} file
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Excluded (Sampah & Node Modules) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>File Sampah yang Dikecualikan (Otomatis Bersih)</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(info?.excludedItems || [
                'node_modules/ (root & OguriCap/)',
                '.git/ (internal git database)',
                'dist/ (build output)',
                '.vite/ & .cache/',
                '*.log (file log runtime)',
                '.DS_Store, Thumbs.db',
              ]).map((ex, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
                >
                  <span className="text-rose-500 font-bold">✕</span> {ex}
                </span>
              ))}
            </div>
          </div>

          {/* How to Push to GitHub Guide */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Panduan Upload ke GitHub Baru</span>
              </div>
              <button
                onClick={handleCopyGitCommands}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {copiedGit ? '✓ Tersalin' : 'Salin Perintah Git'}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 leading-relaxed">
              {`# 1. Ekstrak file zip ke folder pilihan Anda
# 2. Buka terminal di folder tersebut lalu jalankan:
git init
git add .
git commit -m "feat: initial commit OguriCap Bot"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main`}
            </pre>
            <p className="text-[11px] text-slate-400">
              Setelah ter-push ke GitHub, Anda bisa langsung menghubungkan repo tersebut ke{' '}
              <strong className="text-white">Railway.app</strong> (otomatis mendeteksi <code>railway.json</code> &amp; <code>nixpacks.toml</code>).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="text-xs text-slate-500 w-full sm:w-auto">
            {downloadProgressText ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {downloadProgressText}
              </span>
            ) : (
              <span>
                Nama berkas:{' '}
                <code className="text-slate-700 font-mono font-semibold">
                  oguricap-bot-source-{new Date().toISOString().slice(0, 10)}.zip
                </code>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="direct-tab-download-btn"
              type="button"
              onClick={handleOpenDirectInNewTab}
              title="Gunakan jika download di dalam iframe preview tidak merespons"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Tab Baru</span>
            </button>
            <button
              id="cancel-zip-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              id="confirm-download-zip-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunduh ZIP...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ZIP (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
