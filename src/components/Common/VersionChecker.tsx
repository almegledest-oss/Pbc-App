import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

declare const __APP_BUILD_TIME__: string | undefined;

const VERSION_STORAGE_KEY = 'pbc_installed_version';
const LAST_RELOAD_KEY = 'pbc_last_chunk_reload';

export const VersionChecker: React.FC = () => {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [latestServerVersion, setLatestServerVersion] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const currentRunningVersionRef = useRef<string>('');

  useEffect(() => {
    // Determine the active compiled version
    const compiledVersion = typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__
      ? __APP_BUILD_TIME__
      : '';

    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY) || '';

    // The current active version is the compiled bundle build time, or the previously acknowledged version
    const currentActive = compiledVersion || storedVersion;
    currentRunningVersionRef.current = currentActive;

    // If compiledVersion is known and differs from stored, sync storage on fresh load
    if (compiledVersion && compiledVersion !== storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, compiledVersion);
      currentRunningVersionRef.current = compiledVersion;
    }

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?_cb=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        if (data && data.version) {
          const serverVer = String(data.version).trim();
          const activeVer = String(currentRunningVersionRef.current).trim();

          // First run initialization if no active version was set yet
          if (!activeVer) {
            currentRunningVersionRef.current = serverVer;
            localStorage.setItem(VERSION_STORAGE_KEY, serverVer);
            setHasNewVersion(false);
            return;
          }

          // Strict comparison: Only show banner if server version is genuinely different from active version
          if (serverVer && serverVer !== activeVer) {
            setLatestServerVersion(serverVer);
            setHasNewVersion(true);
          } else {
            setHasNewVersion(false);
          }
        }
      } catch {
        // Network offline or fetch suppressed - safely ignore
      }
    };

    // 1. Initial check after 3 seconds of load
    const initialTimer = setTimeout(() => {
      checkVersion();
    }, 3000);

    // 2. Periodic background check every 3 minutes
    const interval = setInterval(checkVersion, 3 * 60 * 1000);

    // 3. Tab visibility check (when user switches back to this tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Global error handler for dynamic chunk loading failures (stale bundle chunks)
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = 'message' in event ? event.message : String(event.reason || '');
      if (
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes('Importing a module script failed') ||
        errorMsg.includes('Loading chunk')
      ) {
        // Force clean refresh to clear stale script references
        const lastReload = sessionStorage.getItem(LAST_RELOAD_KEY);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(LAST_RELOAD_KEY, String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. Persist the new server version so upon reload currentVersion === serverVersion
      if (latestServerVersion) {
        localStorage.setItem(VERSION_STORAGE_KEY, latestServerVersion);
        currentRunningVersionRef.current = latestServerVersion;
      }

      // 2. Clear caches if CacheStorage API is available
      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
      }
    } catch {
      // Ignore cache clearing errors
    }

    // 3. Clean reload with cache bypass
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  if (!hasNewVersion) return null;

  return (
    <div
      id="pbc-version-update-banner"
      className="fixed bottom-5 right-5 z-[99999] max-w-sm bg-gradient-to-r from-[#0B1528] to-[#122240] border border-amber-500/50 shadow-2xl rounded-2xl p-4 text-white backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>New Update Available</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            নতুন আপডেট রিলিজ হয়েছে। লেটেস্ট ফিচার ও ডেটা পেতে অ্যাপটি রিফ্রেশ করুন।
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              id="pbc-btn-reload-latest-version"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'আপডেট হচ্ছে...' : 'আপডেট করুন (Reload)'}
            </button>
            <button
              id="pbc-btn-dismiss-update-banner"
              onClick={() => setHasNewVersion(false)}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
