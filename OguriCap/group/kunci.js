// ======================================================
// GROUP LOCK MANAGER V3 (Permanent Persistent Storage)
// ======================================================
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.resolve(__dirname, "database")
const DB_FILE = path.join(DB_DIR, "locked_groups.json")

export const botLock = {
  aktif: false,
  allLocked: false,
  lockedAt: null,
  groups: {},
  cache: {
    synced: false,
    lastSync: 0
  }
}

/**
 * Muat data penguncian dari disk secara permanen
 * Menjamin status terkunci tidak pernah hilang meski bot mati / sesi login reset
 */
export function loadLockStorage() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8")
      const data = JSON.parse(raw)
      botLock.allLocked = Boolean(data.allLocked)
      botLock.lockedAt = data.lockedAt || null
      botLock.groups = (data.groups && typeof data.groups === "object") ? data.groups : {}
      botLock.aktif = botLock.allLocked || Object.values(botLock.groups).some(g => g.locked)
      console.log(`🔒 [KUNCI] Berhasil memuat ${Object.keys(botLock.groups).length} grup dari penyimpanan permanen. Status AllLocked: ${botLock.allLocked}`)
      return
    }
  } catch (e) {
    console.error("🔒 [KUNCI] Gagal membaca locked_groups.json:", e.message)
  }

  botLock.allLocked = false
  botLock.lockedAt = null
  botLock.groups = {}
  botLock.aktif = false
  saveLockStorage()
}

/**
 * Simpan data penguncian ke disk secara atomik & instan
 */
export function saveLockStorage() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }

    const payload = {
      allLocked: Boolean(botLock.allLocked),
      lockedAt: botLock.lockedAt || null,
      updatedAt: Date.now(),
      groups: botLock.groups || {}
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8")
  } catch (e) {
    console.error("🔒 [KUNCI] Gagal menulis locked_groups.json:", e.message)
  }
}

// Inisialisasi awal saat modul dimuat
loadLockStorage()

export const cleanJid = (jid) => {
  if (!jid || typeof jid !== "string") return ""
  let clean = jid.trim().toLowerCase()
  if (clean.includes("@")) {
    const [user, domain] = clean.split("@")
    const cleanUser = user.split(":")[0]
    return `${cleanUser}@${domain}`
  }
  if (/^\d{10,25}(?:-\d+)?$/.test(clean)) {
    return `${clean}@g.us`
  }
  return clean
}

export const cekKunci = () => botLock.aktif || botLock.allLocked

export const setKunci = (status = false) => {
  botLock.aktif = Boolean(status)
  return botLock.aktif
}

const ensureGroup = (id, name = "Unknown Group") => {
  const cleanId = cleanJid(id)
  if (!cleanId) return null

  if (!botLock.groups[cleanId]) {
    botLock.groups[cleanId] = {
      id: cleanId,
      name: name || "Unknown Group",
      locked: Boolean(botLock.allLocked),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
  if (name && name !== "Unknown Group") {
    botLock.groups[cleanId].name = name
  }
  return botLock.groups[cleanId]
}

export const registerGroup = (id, name = "Unknown Group") => {
  const cleanId = cleanJid(id)
  const group = ensureGroup(cleanId, name)
  if (name && name !== "Unknown Group") {
    group.name = name
  }
  group.updatedAt = Date.now()
  return group
}

export const removeGroup = (id) => {
  const cleanId = cleanJid(id)
  delete botLock.groups[cleanId]
  delete botLock.groups[id]
  saveLockStorage()
}

/**
 * Memeriksa apakah suatu grup sedang dikunci
 * 1. Jika grup tercatat di database/memory:
 *    - Jika locked === false -> PASTI DIBUKA (return false)
 *    - Jika locked === true  -> PASTI DIKUNCI (return true)
 * 2. Jika grup belum pernah tercatat, ikuti botLock.allLocked
 */
export const isLocked = (chat) => {
  if (!chat) return false
  const cleanId = cleanJid(chat)
  if (!cleanId.endsWith('@g.us')) return false // Kunci hanya berlaku untuk grup

  // 1. Cek langsung status grup yang tercatat
  const g = botLock.groups[cleanId] || botLock.groups[chat]
  if (g) {
    if (g.locked === false || g.explicitlyUnlocked === true) {
      return false
    }
    if (g.locked === true) {
      return true
    }
  }

  // 2. Jika grup belum terdaftar, ikuti allLocked
  if (botLock.allLocked) {
    return true
  }

  return false
}

/**
 * Kunci satu grup tertentu
 */
export const lockGroup = (chat, name) => {
  const cleanId = cleanJid(chat)
  if (!cleanId) return null
  const group = ensureGroup(cleanId, name)
  group.locked = true
  delete group.explicitlyUnlocked
  group.lockedAt = Date.now()
  group.updatedAt = Date.now()
  if (botLock.groups[chat] && chat !== cleanId) {
    botLock.groups[chat].locked = true
    delete botLock.groups[chat].explicitlyUnlocked
    botLock.groups[chat].lockedAt = Date.now()
    botLock.groups[chat].updatedAt = Date.now()
  }
  botLock.aktif = true
  saveLockStorage()
  return group
}

/**
 * Buka kunci satu grup tertentu
 * Ketika satu grup dibuka, mode beralih dari allLocked ke selektif per-grup:
 * - Grup yang dipilih menjadi locked = false (DIBUKA)
 * - Grup-grup lain yang terkunci TETAP terkunci
 * - allLocked diubah jadi false agar tidak ada kontradiksi status
 */
export const unlockGroup = (chat) => {
  const cleanId = cleanJid(chat)
  if (!cleanId) return null
  const group = ensureGroup(cleanId)
  group.locked = false
  group.explicitlyUnlocked = true
  group.updatedAt = Date.now()
  if (botLock.groups[chat] && chat !== cleanId) {
    botLock.groups[chat].locked = false
    botLock.groups[chat].explicitlyUnlocked = true
    botLock.groups[chat].updatedAt = Date.now()
  }

  // Mengubah allLocked menjadi false karena sudah ada grup yang dibuka
  botLock.allLocked = false
  botLock.aktif = Object.values(botLock.groups).some(g => g.locked)
  saveLockStorage()
  return group
}

/**
 * MODE 1: Kunci SEMUA grup tanpa sisa!
 * Menandai botLock.allLocked = true dan seluruh grup yang tercatat menjadi locked = true
 */
export const lockAllGroups = () => {
  botLock.allLocked = true
  botLock.lockedAt = Date.now()
  botLock.aktif = true

  for (const id in botLock.groups) {
    botLock.groups[id].locked = true
    delete botLock.groups[id].explicitlyUnlocked
    botLock.groups[id].lockedAt = Date.now()
    botLock.groups[id].updatedAt = Date.now()
  }

  saveLockStorage()
  return Object.values(botLock.groups)
}

/**
 * Buka seluruh grup yang terkunci
 */
export const unlockAllGroups = () => {
  botLock.allLocked = false
  botLock.lockedAt = null
  botLock.aktif = false

  for (const id in botLock.groups) {
    botLock.groups[id].locked = false
    delete botLock.groups[id].explicitlyUnlocked
    botLock.groups[id].updatedAt = Date.now()
  }

  saveLockStorage()
  return Object.values(botLock.groups)
}

export const getAllGroups = () => Object.values(botLock.groups)

export const getLockedGroups = () => {
  const all = Object.values(botLock.groups)
  return all.filter(v => v.locked === true)
}

export const getUnlockedGroups = () => {
  const all = Object.values(botLock.groups)
  return all.filter(v => !v.locked)
}

/**
 * Sinkronisasi grup dari koneksi Baileys
 * CATATAN: Dilengkapi timeout 6 detik agar tidak pernah menggantung/blocking jika WA lambat
 */
export const syncGroups = async (conn) => {
  try {
    if (!conn?.groupFetchAllParticipating) return getAllGroups()
    
    // Timeout safeguard 6 detik
    const fetchPromise = conn.groupFetchAllParticipating()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout sync Baileys")), 6000))
    const groups = await Promise.race([fetchPromise, timeoutPromise]).catch(err => {
      console.warn("⚠️ [GroupLock Sync Timeout/Warning]:", err.message || err)
      return null
    })

    if (!groups || typeof groups !== 'object') return getAllGroups()
    let hasChanges = false

    for (const rawId in groups) {
      const id = cleanJid(rawId)
      if (!id || !id.endsWith('@g.us')) continue
      const subject = groups[rawId]?.subject || "Unknown Group"
      if (!botLock.groups[id]) {
        botLock.groups[id] = {
          id,
          name: subject,
          locked: Boolean(botLock.allLocked),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        hasChanges = true
      } else {
        if (botLock.groups[id].name !== subject) {
          botLock.groups[id].name = subject
          hasChanges = true
        }
      }
    }

    botLock.cache.synced = true
    botLock.cache.lastSync = Date.now()

    if (hasChanges) {
      saveLockStorage()
    }

    return getAllGroups()
  } catch (e) {
    console.error("[GroupLock Sync Error]", e.message || e)
    return getAllGroups()
  }
}
