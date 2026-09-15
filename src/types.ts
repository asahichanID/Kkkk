export interface BotState {
  status: 'stopped' | 'starting' | 'waiting_code' | 'pairing_ready' | 'connected' | 'reconnecting' | 'error';
  pairingCode: string | null;
  botNumber: string | null;
  customCode: string | null;
  connectedUser: {
    id?: string;
    name?: string;
    [key: string]: any;
  } | null;
  startedAt: number | null;
  pid: number | null;
  hasSession: boolean;
  lastError: string | null;
}

export interface LogEntry {
  id: number;
  time: string;
  type: 'stdout' | 'stderr' | 'system';
  message: string;
}

export interface BotConfig {
  botname: string;
  author: string;
  packname: string;
  timezone: string;
  number_bot: string;
  custom_pairing_code: string;
  owners: string[];
  prefixes: string[];
  rawContent?: string;
}

export interface SystemStats {
  uptime: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  rss: number;
  heapUsed: number;
  heapTotal: number;
  botRunning: boolean;
  botPid: number | null;
}

export interface PrayerSchedule {
  Imsak: string;
  Subuh: string;
  Terbit: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
  [key: string]: string;
}

export interface SholatRegion {
  id: string;
  name: string;
  timezone: string;
  tzLabel: string;
  lat: number;
  lon: number;
}

export interface GroupSholatItem {
  id: string;
  name: string;
  waktusholat: boolean;
  memberCount?: number;
}

export interface SholatConfig {
  region: string;
  regionId: string;
  timezone: string;
  tzLabel: string;
  schedule: PrayerSchedule;
  enabledGroups: Record<string, boolean>;
  updatedAt?: number;
}

export interface ProjectExportInfo {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  timestamp: string;
  includedCategories: {
    name: string;
    description: string;
    fileCount: number;
  }[];
  excludedItems: string[];
}

