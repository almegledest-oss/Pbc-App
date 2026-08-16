/**
 * Safe LocalStorage Utility with QuotaExceededError Protection & Auto-Purging
 */

const CACHE_PREFIXES = ['pbc_cached_', 'pbc_preview_'];

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Failed to read key "${key}":`, err);
    }
    return null;
  },

  setItem(key: string, value: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (err: any) {
      console.warn(`[SafeStorage] localStorage.setItem failed for "${key}". Attempting auto-cleanup...`, err?.name || err);
      
      // Handle QuotaExceededError
      if (
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014 ||
        err?.number === -2147024882
      ) {
        this.clearNonEssentialCaches(key);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
            return true;
          }
        } catch (retryErr) {
          console.warn(`[SafeStorage] Still exceeded quota after cleanup for key "${key}". Skipping write safely.`);
        }
      }
    }
    return false;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, err);
    }
  },

  clearNonEssentialCaches(keepKey?: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k !== keepKey) {
          if (
            CACHE_PREFIXES.some(prefix => k.startsWith(prefix)) ||
            k === 'pbc_cached_custom_logo' ||
            k === 'pbc_default_frame_overlay'
          ) {
            keysToRemove.push(k);
          }
        }
      }

      keysToRemove.forEach(k => {
        try {
          window.localStorage.removeItem(k);
        } catch (e) {
          // ignore
        }
      });
      console.info(`[SafeStorage] Purged ${keysToRemove.length} cached items to free localStorage space.`);
    } catch (e) {
      console.warn('[SafeStorage] Error during cache purging:', e);
    }
  }
};
