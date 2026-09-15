const globalCooldown = {};
const globalWarn = {};

export const globalSpam = (key, detik) => {
  const now = Date.now();
  const sisa = (detik * 1000) - (now - (globalCooldown[key] ?? 0));
  if (sisa > 0) {
    if (!globalWarn[key]) {
      globalWarn[key] = true;
      return { ok: false, warn: true, sisa };
    }
    return { ok: false, warn: false, sisa };
  }
  globalCooldown[key] = now;
  globalWarn[key] = false;
  return { ok: true, sisa: 0 };
};

const userCooldown = {};
const userWarn = {};

export const cekSpam = (sender, key, detik) => {
  const id = `${sender}:${key}`;
  const now = Date.now();
  const sisa = (detik * 1000) - (now - (userCooldown[id] ?? 0));
  if (sisa > 0) {
    if (!userWarn[id]) {
      userWarn[id] = true;
      return { ok: false, warn: true, sisa };
    }
    return { ok: false, warn: false, sisa };
  }
  delete userWarn[id];
  return { ok: true, warn: false, sisa: 0 };
};

export const setSpam = (sender, key) => {
  const id = `${sender}:${key}`;
  userCooldown[id] = Date.now();
  delete userWarn[id];
};

export const resetUserSpam = (sender, key) => {
  const id = `${sender}:${key}`;
  delete userCooldown[id];
  delete userWarn[id];
};

export const resetGlobalSpam = (key) => {
  delete globalCooldown[key];
  delete globalWarn[key];
};

export const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];
