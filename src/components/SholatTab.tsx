import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Plus,
  Sparkles,
  Eye,
  Info,
  Calendar,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Radio,
  BookOpen,
} from 'lucide-react';
import { SholatConfig, SholatRegion, GroupSholatItem, PrayerSchedule } from '../types';
import { safeFetchJson } from '../lib/safeJson';

interface SholatTabProps {
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

const PRAYER_AYAT_INFO: Record<string, { arabic: string; translation: string; surah: string }> = {
  Subuh: {
    arabic: 'أَقِمِ ٱلصَّلَوٰةَ لِدُلُوكِ ٱلشَّمْسِ إِلَىٰ غَسَقِ ٱلَّيْلِ وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًۭا',
    translation: '“Dan (dirikanlah pula sholat) Subuh. Sesungguhnya sholat Subuh itu disaksikan (oleh para malaikat).”',
    surah: "QS. Al-Isra' [17]: 78",
  },
  Dzuhur: {
    arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ',
    translation: '“Apabila telah diseru untuk melaksanakan sholat, maka segeralah mengingat Allah dan tinggalkanlah jual beli.”',
    surah: "QS. Al-Jumu'ah [62]: 9",
  },
  Ashar: {
    arabic: 'حَـٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُوا۟ لِلَّهِ قَـٰنِتِينَ',
    translation: '“Peliharalah semua sholat(mu), dan (peliharalah) sholat wustha (Ashar). Berdirilah untuk Allah dengan khusyuk.”',
    surah: 'QS. Al-Baqarah [2]: 238',
  },
  Maghrib: {
    arabic: 'وَأَقِمِ ٱلصَّلَوٰةَ طَرَفَىِ ٱلنَّهَARِ وَزُلَفًۭا مِّنَ ٱلَّيْلِ ۚ إِنَّ ٱلْحَسَنَٰتِ يُذْهِبْنَ ٱلسَّيِّـَٔاتِ',
    translation: '“Dan dirikanlah sholat itu pada kedua tepi siang dan pada bagian-bagian permulaan malam.”',
    surah: 'QS. Hud [11]: 114',
  },
  Isya: {
    arabic: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَٰبًۭا مَّوْقُوتًۭا',
    translation: '“Sungguh, sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.”',
    surah: "QS. An-Nisa' [4]: 103",
  },
  Imsak: {
    arabic: 'وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ',
    translation: '“Dan dirikanlah sholat, tunaikanlah zakat, dan ruku\'lah beserta orang-orang yang ruku\'.”',
    surah: 'QS. Al-Baqarah [2]: 43',
  },
};

export const SholatTab: React.FC<SholatTabProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<SholatConfig | null>(null);
  const [availableRegions, setAvailableRegions] = useState<SholatRegion[]>([]);
  const [groups, setGroups] = useState<GroupSholatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Audio preview state
  const [playingAudio, setPlayingAudio] = useState<'regular' | 'subuh' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Canvas Preview state
  const [selectedPreviewPrayer, setSelectedPreviewPrayer] = useState('Maghrib');
  const [previewTimestamp, setPreviewTimestamp] = useState(Date.now());
  const [newGroupId, setNewGroupId] = useState('');

  // Fetch sholat data
  const fetchSholatData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/sholat/config');
      if (res.ok) {
        const data = await safeFetchJson<{
          config?: SholatConfig;
          availableRegions?: SholatRegion[];
          groups?: GroupSholatItem[];
        }>(res, {});
        if (data.config) {
          setConfig(data.config);
          setAvailableRegions(data.availableRegions || []);
          setGroups(data.groups || []);
        }
      } else {
        throw new Error('Gagal memuat konfigurasi sholat');
      }
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSholatData();
  }, []);

  // Audio playback toggle
  const togglePlayAudio = (type: 'regular' | 'subuh') => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingAudio === type) {
      setPlayingAudio(null);
      return;
    }

    const audioUrl = type === 'subuh' ? '/api/sholat/audio/adzan-subuh' : '/api/sholat/audio/adzan';
    const newAudio = new Audio(audioUrl);
    newAudio.onended = () => setPlayingAudio(null);
    newAudio.onerror = () => {
      onShowToast('Gagal memutar audio adzan', 'error');
      setPlayingAudio(null);
    };

    audioRef.current = newAudio;
    newAudio.play().catch((e) => {
      console.error(e);
      onShowToast('Browser memblokir autoplay audio', 'info');
    });
    setPlayingAudio(type);
  };

  // Sync Realtime Schedule
  const handleSyncRealtime = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sholat/sync-realtime', {
        method: 'POST',
      });
      const data = await safeFetchJson<{ error?: string; config?: SholatConfig }>(res, {});
      if (!res.ok || !data.config) throw new Error(data.error || 'Gagal sinkronisasi waktu realtime');

      setConfig(data.config);
      setPreviewTimestamp(Date.now());
      onShowToast('Jadwal sholat realtime berhasil disinkronkan', 'success');
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle region change
  const handleSelectRegion = (regionId: string) => {
    if (!config) return;
    const reg = availableRegions.find((r) => r.id === regionId);
    if (!reg) return;

    setConfig({
      ...config,
      region: reg.name,
      regionId: reg.id,
      timezone: reg.timezone,
      tzLabel: reg.tzLabel,
    });
  };

  // Handle manual schedule time change
  const handleTimeChange = (prayerName: string, val: string) => {
    if (!config) return;
    setConfig({
      ...config,
      schedule: {
        ...config.schedule,
        [prayerName]: val,
      },
    });
  };

  // Save changes
  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/sholat/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await safeFetchJson<{ error?: string; config?: SholatConfig }>(res, {});
      if (!res.ok || !data.config) throw new Error(data.error || 'Gagal menyimpan konfigurasi');

      setConfig(data.config);
      onShowToast('Pengaturan wilayah & jadwal sholat realtime berhasil disimpan', 'success');
      setPreviewTimestamp(Date.now());
    } catch (err: any) {
      onShowToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle group status
  const handleToggleGroup = async (groupId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/sholat/toggle-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, enabled: !currentStatus }),
      });
      const data = await safeFetchJson<{ error?: string; success?: boolean }>(res, {});
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status grup');

      // Update local state
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, waktusholat: !currentStatus } : g))
      );
      onShowToast(
        `Jadwal sholat untuk grup berhasil di-${!currentStatus ? 'aktifkan (ON)' : 'nonaktifkan (OFF)'}`,
        'success'
      );
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  // Add custom group
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupId.trim()) return;

    try {
      const res = await fetch('/api/sholat/add-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: newGroupId.trim(), enabled: true }),
      });
      const data = await safeFetchJson<{ error?: string; success?: boolean }>(res, {});
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan grup');

      onShowToast('Grup baru berhasil ditambahkan dan diaktifkan', 'success');
      setNewGroupId('');
      fetchSholatData();
    } catch (err: any) {
      onShowToast(err.message, 'error');
    }
  };

  if (isLoading || !config) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Memuat Jadwal Sholat Realtime...</p>
      </div>
    );
  }

  const prayers = ['Imsak', 'Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
  const activeAyat = PRAYER_AYAT_INFO[selectedPreviewPrayer] || PRAYER_AYAT_INFO.Maghrib;

  return (
    <div className="space-y-6">
      {/* Top Banner Ramadan Visual & Realtime Edition */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Moon className="w-48 h-48 text-amber-300" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Waktu Realtime Astronomis • Tema Visual Ramadan Abadi</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Fitur Jadwal Sholat Realtime (.sholat on/off)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Waktu sholat dihitung otomatis secara realtime (berlaku sepanjang waktu / kapan pun). Bot mengirimkan <strong>Poster Canvas Islami + Ayat Ajakan Sholat + Lantunan Audio Adzan MP3</strong> otomatis ke grup WhatsApp yang diaktifkan.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Wilayah: <strong>{config.region} ({config.tzLabel})</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Grup Aktif: <strong>{groups.filter((g) => g.waktusholat).length} Grup</strong></span>
            </div>
            <button
              onClick={handleSyncRealtime}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 border border-blue-400/40 flex items-center gap-1.5 text-white font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Realtime'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Region, Time Settings & Audio Adzan (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Custom Daerah & Timezone */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Custom Daerah &amp; Zona Waktu</h3>
                  <p className="text-xs text-slate-500">Daerah bawaan: Asia/Jakarta (WIB)</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                {config.tzLabel}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Wilayah Cepat (Preset Indonesia):
                </label>
                <select
                  value={config.regionId || 'jakarta'}
                  onChange={(e) => handleSelectRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  {availableRegions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} — {reg.tzLabel} ({reg.timezone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Wilayah Tampilan:
                  </label>
                  <input
                    type="text"
                    value={config.region}
                    onChange={(e) => setConfig({ ...config, region: e.target.value })}
                    placeholder="Contoh: DKI Jakarta & Sekitarnya"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Zona Waktu (Timezone):
                  </label>
                  <select
                    value={config.timezone}
                    onChange={(e) => {
                      const tz = e.target.value;
                      const label = tz === 'Asia/Jayapura' ? 'WIT' : tz === 'Asia/Makassar' ? 'WITA' : 'WIB';
                      setConfig({ ...config, timezone: tz, tzLabel: label });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Audio Lantunan Adzan Player */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lantunan Audio Adzan</h3>
                  <p className="text-xs text-slate-500">Audio adzan otomatis dikirim bersama poster &amp; ayat</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800">
                <Music className="w-3.5 h-3.5" /> MP3 Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {/* Audio Adzan Reguler */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Adzan Reguler</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dzuhur, Ashar, Maghrib, Isya</p>
                </div>
                <button
                  onClick={() => togglePlayAudio('regular')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    playingAudio === 'regular'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {playingAudio === 'regular' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Jeda
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Putar
                    </>
                  )}
                </button>
              </div>

              {/* Audio Adzan Subuh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Adzan Khusus Subuh</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Memuat "Ash-shalatu khairum minan-naum"</p>
                </div>
                <button
                  onClick={() => togglePlayAudio('subuh')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    playingAudio === 'subuh'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {playingAudio === 'subuh' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Jeda
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Putar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Jadwal Waktu Sholat Hari Ini (Realtime) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Jadwal Waktu Sholat Realtime Hari Ini</h3>
                  <p className="text-xs text-slate-500">Waktu asli sekarang &amp; otomatis tersinkronisasi</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {Object.entries(config.schedule || {}).map(([pName, pTime]) => (
                <div
                  key={pName}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all flex flex-col justify-between gap-1.5"
                >
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {pName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={pTime}
                      onChange={(e) => handleTimeChange(pName, e.target.value)}
                      placeholder="00:00"
                      className="w-full px-2.5 py-1 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-semibold">{config.tzLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Kontrol Grup Tertentu (Khusus Grup Saja) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kontrol Grup WhatsApp</h3>
                  <p className="text-xs text-slate-500">Pilih grup mana saja yang menerima jadwal sholat</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Khusus Grup Saja
              </span>
            </div>

            {/* Instruction Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-blue-50/80 border border-emerald-200/80 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Perintah WhatsApp Resmi:</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900">
                      Tersedia Sekarang
                    </span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-emerald-800 text-[11px] mb-1">⚡ Uji Coba Langsung (Realtime Test):</p>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        <li><code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.tessholat</code> — Tes kirim poster + adzan saat ini</li>
                        <li><code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.tessholat subuh</code> — Tes khusus adzan Subuh</li>
                        <li><code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.tessholat maghrib</code> — Tes adzan Maghrib</li>
                      </ul>
                      <p className="text-[10px] text-slate-400 mt-1 italic">*Bisa dites di grup maupun di PC pribadi bot</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-blue-800 text-[11px] mb-1">👥 Menu Interaktif &amp; Tombol Ngambang:</p>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        <li><code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.aktifkansholat</code> — Buka menu button &amp; daftar grup (bisa dari PC / grup mana pun)</li>
                        <li><code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.sholat on</code> / <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">.sholat off</code> — Toggle grup saat ini</li>
                        <li>Tekan pilihan grup di WhatsApp untuk langsung konfirmasi nyala otomatis realtime</li>
                      </ul>
                      <p className="text-[10px] text-slate-400 mt-1 italic">*Menggunakan @sairidev/baileys-new untuk audio Voice Note (VN)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Group List */}
            <div className="mt-4 space-y-2.5">
              {groups.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Belum ada grup yang terdaftar di bot
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Masukkan Group ID (JID) di bawah atau ketik <code>.sholat on</code> langsung di grup WhatsApp
                  </p>
                </div>
              ) : (
                groups.map((grp, gIdx) => (
                  <div
                    key={`${grp.id}-${gIdx}`}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      grp.waktusholat
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {grp.name || grp.id}
                        </span>
                        {grp.waktusholat ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Aktif (ON)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            <XCircle className="w-3 h-3" />
                            Nonaktif (OFF)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md">
                        {grp.id}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleGroup(grp.id, grp.waktusholat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                        grp.waktusholat
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {grp.waktusholat ? 'Matikan' : 'Aktifkan'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Group Input */}
            <form onSubmit={handleAddGroup} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                placeholder="Tambah ID Grup manual (misal: 120363xxx@g.us)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Grup</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Canvas Preview & Ayat Pengingat (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Live Preview Poster Canvas</h3>
              </div>

              <button
                onClick={() => setPreviewTimestamp(Date.now())}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sholat Tabs for preview */}
            <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
              {prayers.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPreviewPrayer(p);
                    setPreviewTimestamp(Date.now());
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedPreviewPrayer.toLowerCase() === p.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Actual Rendered Canvas Image */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner group">
              <img
                key={`${selectedPreviewPrayer}-${previewTimestamp}`}
                src={`/api/sholat/preview-canvas?prayerName=${selectedPreviewPrayer}&t=${previewTimestamp}`}
                alt="Ramadan Canvas Preview"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
              />
            </div>

            {/* Quranic Verse Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900">Ayat Ajakan Sholat ({selectedPreviewPrayer}):</h4>
              </div>
              <p className="text-xs font-serif text-slate-900 text-right leading-relaxed mb-1">
                {activeAyat.arabic}
              </p>
              <p className="text-[11px] text-slate-700 italic leading-normal">
                {activeAyat.translation}
              </p>
              <p className="text-[10px] font-bold text-amber-800 mt-1">
                {activeAyat.surah}
              </p>
            </div>

            {/* WhatsApp Text Message Caption Preview */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">Format Caption Pesan WhatsApp:</h4>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-sans leading-relaxed whitespace-pre-line select-text">
                {`*PANGGILAN SHOLAT ${selectedPreviewPrayer.toUpperCase()}*
──────────────
• Waktu   : *${config.schedule[selectedPreviewPrayer] || '18:10'} ${config.tzLabel}*
• Wilayah : ${config.region}
• Hari    : Senin, 8 September 2026

${activeAyat.arabic}

_${activeAyat.translation}_
*— ${activeAyat.surah}*

──────────────
_"Hayya 'alas-shalah, hayya 'alal-falah."_
Mari sejenak menghentikan aktivitas, sucikan diri dengan berwudhu, dan tunaikan sholat fardhu berjamaah tepat waktu.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
