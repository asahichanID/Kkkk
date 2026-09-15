import React from 'react';
import {
  HelpCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  FileCode,
  CheckCircle,
  Download,
  FolderArchive,
} from 'lucide-react';

interface GuideTabProps {
  onOpenDownloadZip?: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({ onOpenDownloadZip }) => {
  const commands = [
    { cmd: '.sholat on / off', desc: 'Aktifkan/matikan notifikasi jadwal sholat realtime di grup dengan poster canvas Ramadan' },
    { cmd: '.sholat', desc: 'Lihat status aktif dan rincian waktu sholat hari ini untuk daerah yang diatur' },
    { cmd: '.menu / .menubutton', desc: 'Menu interaktif dengan tombol seleksi "TRACEN MENU" (NativeFlow Sairidev) terbagi per kategori rapi' },
    { cmd: '.ping', desc: 'Cek kecepatan respons dan uptime server bot' },
    { cmd: '.s / .sticker', desc: 'Ubah gambar / video singkat menjadi stiker WhatsApp' },
    { cmd: '.ai <pertanyaan>', desc: 'Tanya kecerdasan buatan (AI) / interaksi chat' },
    { cmd: '.owner', desc: 'Menampilkan kontak pemilik/developer bot' },
    { cmd: '.runtime', desc: 'Melihat durasi waktu bot telah aktif menyala' },
    { cmd: '.speed', desc: 'Uji kecepatan koneksi internet bot' },
    { cmd: '.settimezone <zona>', desc: 'Mengatur zona waktu (WIB/WITA/WIT)' },
    { cmd: '.qc <teks>', desc: 'Membuat stiker kutipan (fake chat bubble) estetik' },
    { cmd: '.toimg', desc: 'Konversi stiker kembali menjadi foto biasa' },
  ];

  const features = [
    {
      title: 'Baileys Multi-Device Asli',
      desc: 'Menggunakan library Baileys langsung dari repository OguriCap tanpa simulasi/dummy.',
      icon: Zap,
    },
    {
      title: 'Custom Pairing Code',
      desc: 'Bebas ribet tanpa perlu kamera atau scan QR code, cukup masukkan 8 digit pairing code.',
      icon: Sparkles,
    },
    {
      title: 'Realtime Live Logs',
      desc: 'Memantau aktivitas bot, pesan masuk, error, dan siklus proses secara instan via Server-Sent Events.',
      icon: MessageSquare,
    },
    {
      title: 'Tanpa Perlu VPS Eksternal',
      desc: 'Berjalan mandiri di dalam container web app modern dengan proses latar belakang terisolasi.',
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Download Source Code ZIP Banner (Khusus Preview) */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Download Source Code Proyek (Arsip ZIP)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Khusus Preview
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
              Karena deploy langsung ke GitHub tidak dapat dilakukan dari dalam container preview, Anda dapat
              mengunduh seluruh source code bersih (bebas dari <code>node_modules</code> dan file sampah) untuk
              di-push ke GitHub atau di-upload ke VPS / Railway / Pterodactyl.
            </p>
          </div>
        </div>
        {onOpenDownloadZip && (
          <button
            id="guide-download-zip-btn"
            onClick={onOpenDownloadZip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP Sekarang</span>
          </button>
        )}
      </div>

      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tentang OguriCap WhatsApp Bot
            </h2>
            <p className="text-xs text-slate-500">
              Bot WhatsApp modern berbasis Node.js & Baileys MD karya AsahiChan & NazeDev
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Built-in Commands Quick Reference */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Referensi Perintah Utama (Commands)
            </h3>
            <p className="text-xs text-slate-500">
              Kirimkan perintah-perintah ini ke nomor bot setelah status terhubung
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commands.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <code className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                  {c.cmd}
                </code>
                <span className="text-xs text-slate-700">{c.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Panduan Deployment Pterodactyl &amp; Mode Selector
            </h3>
            <p className="text-xs text-slate-500">
              Sistem khusus pemilihan mode (Web App vs Bot WA Saja) sebelum/setelah instalasi dependensi
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
            <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              Pilihan Mode Operasi di Console Pterodactyl
            </h5>
            <p className="mb-2 leading-relaxed">
              Saat bot dijalankan pertama kali di Pterodactyl, console panel akan memunculkan prompt interaktif dengan 2 opsi:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong>[1] Web App:</strong> Menjalankan dashboard web port 3000 + WhatsApp Bot Manager.</li>
              <li><strong>[2] Bot WA Saja:</strong> Sistem seutuhnya berpindah ke folder <code>OguriCap/</code>, memindahkan/menginstal <code>node_modules</code> ke dalam <code>OguriCap/</code>, dan menjalankan bot tanpa overhead web dashboard.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">
              Perintah Startup di Pterodactyl
            </h5>
            <p className="mb-2">
              Atur baris Startup Command pada Pterodactyl Panel menjadi salah satu dari perintah berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                <span className="text-blue-700 font-bold">bash ptero.sh</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">Rekomendasi (Bash interactive wizard)</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                <span className="text-blue-700 font-bold">node ptero.js</span>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">Alternatif Node.js direct launcher</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">
              Auto-Select Tanpa Interaksi (Environment Variable)
            </h5>
            <p>
              Jika ingin langsung menentukan mode tanpa perlu mengetik di console, tambahkan Environment Variable di Pterodactyl: <code>DEPLOY_MODE=bot</code> atau <code>DEPLOY_MODE=webapp</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tanya Jawab &amp; Troubleshooting
            </h3>
            <p className="text-xs text-slate-500">
              Solusi cepat untuk kendala koneksi atau pairing WhatsApp
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">
              Berapa lama masa berlaku kode pairing?
            </h5>
            <p>
              Kode pairing WhatsApp aktif selama kurang lebih 15-30 detik. Jika kedaluwarsa sebelum sempat dimasukkan di ponsel, cukup klik tombol <strong>Restart Bot</strong> untuk meminta kode baru.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">
              Bagaimana cara mengganti nomor WhatsApp bot?
            </h5>
            <p>
              Klik tombol <strong>Reset Sesi WhatsApp</strong> di tab Kontrol Bot. Ini akan menghapus token lama di folder <code>nazedev/</code>, lalu Anda bisa memasukkan nomor baru dan melakukan pairing ulang.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 mb-1">
              Apakah bot tetap tersambung jika halaman web di-refresh?
            </h5>
            <p>
              Ya, bot berjalan di backend server (Node.js runtime). Setelah berhasil pairing, sesi tersimpan secara permanen sehingga bot akan otomatis terhubung kembali saat server berjalan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
