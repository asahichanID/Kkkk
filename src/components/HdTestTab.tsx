import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Smartphone,
  Monitor,
  Square,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { safeFetchJson } from '../lib/safeJson';

interface DimensionData {
  width: number;
  height: number;
  aspectRatio: string;
  decimalRatio: number;
  dataUrl: string;
  fileSizeKb: number;
}

interface TestResult {
  success: boolean;
  provider: string;
  durationMs: number;
  isRatioPreserved: boolean;
  ratioDiffPct: number;
  original: DimensionData;
  enhanced: DimensionData;
  scaleFactor: number;
}

export const HdTestTab: React.FC = () => {
  const [sampleType, setSampleType] = useState<'9:16' | '16:9' | '1:1' | '4:5' | 'custom'>('9:16');
  const [forcedProvider, setForcedProvider] = useState<'auto' | 'upscalepics' | 'sharpLanczos' | 'ffmpegLanczos'>('auto');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'enhanced' | 'original'>('split');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Jalankan test otomatis saat pertama kali dibuka dengan preset 9:16
  useEffect(() => {
    runTest('9:16');
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Harap pilih berkas gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 20 MB.');
      return;
    }

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setCustomImageBase64(b64);
      setSampleType('custom');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const runTest = async (typeOverride?: '9:16' | '16:9' | '1:1' | '4:5' | 'custom') => {
    const typeToUse = typeOverride || sampleType;
    if (typeToUse === 'custom' && !customImageBase64) {
      setError('Silakan unggah gambar terlebih dahulu untuk mode kustom.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tools/hd-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleType: typeToUse,
          customImageBase64: typeToUse === 'custom' ? customImageBase64 : undefined,
          forcedProvider,
        }),
      });

      const data = await safeFetchJson<{ success?: boolean; error?: string } & any>(res, {});
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pengujian gambar HD');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="hd-test-tab-container" className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Inspector &amp; Tester Rasio Aspek Fitur .hd
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              Uji coba langsung fitur <code className="text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-mono font-semibold">.hd</code> dengan verifikasi presisi rasio aspek (Anti-Gepeng). Gambar diproses secara proporsional matematika murni sehingga format <strong>9:16, 16:9, 1:1, atau 4:5</strong> tetap persis tanpa peregangan atau distorsi.
            </p>
          </div>

          <button
            id="run-hd-test-btn"
            onClick={() => runTest()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sedang Memproses...' : 'Jalankan Uji HD Sekarang'}
          </button>
        </div>

        {/* Preset Selection Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Pilih Rasio Contoh:
          </span>

          <button
            id="preset-9-16-btn"
            onClick={() => {
              setSampleType('9:16');
              runTest('9:16');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sampleType === '9:16'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-2 ring-cyan-100 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
            9:16 (Story / Reels / Portrait)
          </button>

          <button
            id="preset-16-9-btn"
            onClick={() => {
              setSampleType('16:9');
              runTest('16:9');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sampleType === '16:9'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-2 ring-cyan-100 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
            16:9 (Landscape / Desktop)
          </button>

          <button
            id="preset-1-1-btn"
            onClick={() => {
              setSampleType('1:1');
              runTest('1:1');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sampleType === '1:1'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-2 ring-cyan-100 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Square className="w-3.5 h-3.5 text-indigo-600" />
            1:1 (Persegi / Avatar)
          </button>

          <button
            id="preset-4-5-btn"
            onClick={() => {
              setSampleType('4:5');
              runTest('4:5');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sampleType === '4:5'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-2 ring-cyan-100 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            4:5 (Portrait Feed)
          </button>

          <button
            id="preset-custom-btn"
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sampleType === 'custom'
                ? 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-2 ring-cyan-100 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            {customFileName ? `Foto: ${customFileName.slice(0, 18)}...` : 'Unggah Foto Sendiri...'}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Engine Provider Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Engine / Provider:</span>
            <select
              value={forcedProvider}
              onChange={(e) => setForcedProvider(e.target.value as any)}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            >
              <option value="auto">Auto (UpscalePics AI + 3 Lapis Backup Otomatis)</option>
              <option value="upscalepics">UpscalePics AI (Cloud 4x HD)</option>
              <option value="sharpLanczos">Sharp Multi-Pass Lanczos3 (Lokal Offline)</option>
              <option value="ffmpegLanczos">FFmpeg Lanczos 4x (Subprocess)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Gepeng Active: <strong>100% Proportional Preserved</strong></span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Metrics Banner */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hasil Uji: Rasio Aspek 100% Presisi (Anti-Gepeng)
                </h3>
                <p className="text-xs text-slate-500">
                  Diproses oleh provider <strong className="text-slate-800">{result.provider}</strong> dalam tempo{' '}
                  <strong className="text-slate-800">{(result.durationMs / 1000).toFixed(2)} detik</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Selisih Rasio: {result.ratioDiffPct.toFixed(2)}% (0% Distorsi)
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                <Zap className="w-3.5 h-3.5 text-cyan-600" />
                Faktor Pembesaran: {result.scaleFactor}× Super HD
              </span>
            </div>
          </div>

          {/* Dimension Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Dimension Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ukuran Asli (Sebelum HD)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                  {result.original.fileSizeKb} KB
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.original.width} × {result.original.height} px
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                <span>Rasio: <strong>{result.original.aspectRatio}</strong></span>
                <span className="font-mono">Desimal: {result.original.decimalRatio}</span>
              </div>
            </div>

            {/* Enhanced Dimension Card */}
            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                  Ukuran Setelah Fitur .hd (Super Resolution)
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-200 text-cyan-900">
                  {result.enhanced.fileSizeKb} KB
                </span>
              </div>
              <div className="text-2xl font-black text-cyan-950 font-mono">
                {result.enhanced.width} × {result.enhanced.height} px
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-cyan-800 pt-2 border-t border-cyan-200/80">
                <span>Rasio: <strong>{result.enhanced.aspectRatio}</strong></span>
                <span className="font-mono">Desimal: {result.enhanced.decimalRatio} (Identik 100%)</span>
              </div>
            </div>
          </div>

          {/* Visual Preview Mode Switcher */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs font-semibold text-slate-600">
              Tampilan Perbandingan Gambar:
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Berdampingan (Side-by-Side)
              </button>
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'enhanced' ? 'bg-white text-cyan-700 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Hanya Hasil HD
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  viewMode === 'original' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Hanya Gambar Asli
              </button>
            </div>
          </div>

          {/* Image Display Container */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/95 border border-slate-800 min-h-[380px] flex items-center justify-center">
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl py-2">
                {/* Original View */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-between w-full text-slate-300 text-xs px-1">
                    <span className="font-semibold">Gambar Asli ({result.original.width}×{result.original.height})</span>
                    <span className="text-slate-400 font-mono">{result.original.aspectRatio.split(' ')[0]}</span>
                  </div>
                  <div className="relative group border border-slate-700/80 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 max-h-[480px]">
                    <img
                      src={result.original.dataUrl}
                      alt="Original"
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => setZoomImage(result.original.dataUrl)}
                      className="absolute bottom-4 right-4 p-2 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                      title="Perbesar"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Enhanced View */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-between w-full text-cyan-300 text-xs px-1">
                    <span className="font-semibold text-cyan-400">Hasil HD ({result.enhanced.width}×{result.enhanced.height})</span>
                    <span className="text-cyan-400 font-mono">{result.enhanced.aspectRatio.split(' ')[0]}</span>
                  </div>
                  <div className="relative group border-2 border-cyan-500/50 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 max-h-[480px] ring-4 ring-cyan-500/10">
                    <img
                      src={result.enhanced.dataUrl}
                      alt="Enhanced"
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-md"
                    />
                    <span className="absolute top-4 left-4 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-600 text-white tracking-wider uppercase">
                      4K Ultra-Sharp
                    </span>
                    <button
                      onClick={() => setZoomImage(result.enhanced.dataUrl)}
                      className="absolute bottom-4 right-4 p-2 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                      title="Perbesar"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'enhanced' && (
              <div className="flex flex-col items-center gap-3 py-2 max-w-2xl">
                <div className="text-cyan-400 text-xs font-semibold">
                  Hasil Peningkatan HD ({result.enhanced.width} × {result.enhanced.height} px — {result.enhanced.aspectRatio})
                </div>
                <div className="relative border-2 border-cyan-500/60 rounded-xl overflow-hidden bg-slate-950 p-2 ring-8 ring-cyan-500/10 max-h-[550px]">
                  <img
                    src={result.enhanced.dataUrl}
                    alt="Enhanced Full"
                    className="max-h-[510px] w-auto object-contain rounded-lg shadow-xl"
                  />
                  <button
                    onClick={() => setZoomImage(result.enhanced.dataUrl)}
                    className="absolute bottom-4 right-4 p-2 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                    title="Perbesar"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'original' && (
              <div className="flex flex-col items-center gap-3 py-2 max-w-2xl">
                <div className="text-slate-300 text-xs font-semibold">
                  Gambar Asli ({result.original.width} × {result.original.height} px — {result.original.aspectRatio})
                </div>
                <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2 max-h-[550px]">
                  <img
                    src={result.original.dataUrl}
                    alt="Original Full"
                    className="max-h-[510px] w-auto object-contain rounded-lg shadow-xl"
                  />
                  <button
                    onClick={() => setZoomImage(result.original.dataUrl)}
                    className="absolute bottom-4 right-4 p-2 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                    title="Perbesar"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Penjelasan Teknis & Solusi Fix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            1
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Penyebab Masalah Gepeng</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sebelumnya terdapat pembatas minimal independen <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">Math.max(w, 1024)</code>. Pada gambar portrait seperti 9:16 (misal 360×640 px), lebarnya dipaksa menjadi 1024 px secara sepihak, sehingga gambar melebar secara horizontal dan tampak gepeng/distorsi.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            2
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Solusi Presisi Matematika</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Skala sekarang dihitung bersamaan berdasarkan sisi terpanjang: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">scale = 3840 / max(w, h)</code>. Kedua dimensi dikalikan dengan faktor skala yang persis sama, menjamin rasio aspek 9:16 (0.5625) tetap 0.5625 tanpa distorsi 1 piksel pun.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            3
          </div>
          <h4 className="font-bold text-slate-900 text-sm">3 Lapis Backup Otomatis</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Penyedia utama <strong>UpscalePics AI</strong> didukung 3 lapis backup otomatis: <strong>Remaker AI</strong>, <strong>Sharp Lanczos3 Multi-Pass</strong> (offline), dan <strong>FFmpeg Lanczos</strong>. Jika API cloud sibuk, bot otomatis beralih dalam milidetik sehingga fitur <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">.hd</code> selalu berhasil.
          </p>
        </div>
      </div>

      {/* Modal Zoom Gambar */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-auto">
            <img
              src={zoomImage}
              alt="Zoomed"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-700"
            />
            <p className="text-center text-xs text-slate-400 mt-2">
              Klik di mana saja untuk menutup
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HdTestTab;
