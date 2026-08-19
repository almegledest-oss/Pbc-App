import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

declare const __APP_BUILD_TIME__: string | undefined;

const VERSION_STORAGE_KEY = 'pbc_installed_version';
const ACKNOWLEDGED_VERSION_KEY = 'pbc_acknowledged_version';
const LAST_RELOAD_KEY = 'pbc_last_chunk_reload';

export interface VersionContextType {
  hasNewVersion: boolean;
  isChecking: boolean;
  isUpdating: boolean;
  currentVersion: string;
  latestVersion: string;
  lastChecked: Date | null;
  checkVersion: (manual?: boolean) => Promise<boolean>;
  applyUpdate: () => Promise<void>;
  dismissNotification: () => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const currentRunningVersionRef = useRef<string>('');

  useEffect(() => {
    // 1. Determine current running version from acknowledged, installed or compiled define
    const compiledVersion = typeof __APP_BUILD_TIME__ !== 'undefined' && __APP_BUILD_TIME__
      ? String(__APP_BUILD_TIME__).trim()
      : '';
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY) || '';
    const acknowledgedVersion = localStorage.getItem(ACKNOWLEDGED_VERSION_KEY) || '';

    // Pick the most updated known timestamp
    let bestVersion = acknowledgedVersion || storedVersion || compiledVersion || '1.4.0';

    // If both numeric timestamps exist, choose the largest one
    const numStored = parseInt(storedVersion, 10);
    const numAck = parseInt(acknowledgedVersion, 10);
    const numComp = parseInt(compiledVersion, 10);
    const maxTime = Math.max(
      isNaN(numStored) ? 0 : numStored,
      isNaN(numAck) ? 0 : numAck,
      isNaN(numComp) ? 0 : numComp
    );
    if (maxTime > 0) {
      bestVersion = String(maxTime);
    }

    currentRunningVersionRef.current = bestVersion;
    setCurrentVersion(bestVersion);

    // Save baseline if not stored yet
    if (!storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, bestVersion);
    }
    if (!acknowledgedVersion) {
      localStorage.setItem(ACKNOWLEDGED_VERSION_KEY, bestVersion);
    }

    // 2. Initial silent check after 3.5s
    const initialTimer = setTimeout(() => {
      checkVersion(false);
    }, 3500);

    // 3. Periodic background check every 4 minutes
    const interval = setInterval(() => {
      checkVersion(false);
    }, 4 * 60 * 1000);

    // 4. Check on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Stale chunk handling for live SPA updates
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = 'message' in event ? event.message : String(event.reason || '');
      if (
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes('Importing a module script failed') ||
        errorMsg.includes('Loading chunk')
      ) {
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

  const checkVersion = async (manual: boolean = false): Promise<boolean> => {
    if (manual) setIsChecking(true);
    try {
      const response = await fetch(`/version.json?_cb=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      setLastChecked(new Date());

      if (!response.ok) {
        if (manual) setIsChecking(false);
        return false;
      }

      const data = await response.json();
      if (data && data.version) {
        const serverVer = String(data.version).trim();
        const storedVer = localStorage.getItem(VERSION_STORAGE_KEY) || '';
        const ackVer = localStorage.getItem(ACKNOWLEDGED_VERSION_KEY) || '';
        const compiledVer = typeof __APP_BUILD_TIME__ !== 'undefined' ? String(__APP_BUILD_TIME__).trim() : '';

        // If newly opened without any previous record, sync and treat as fresh up-to-date install
        if (!storedVer && !ackVer) {
          localStorage.setItem(VERSION_STORAGE_KEY, serverVer);
          localStorage.setItem(ACKNOWLEDGED_VERSION_KEY, serverVer);
          currentRunningVersionRef.current = serverVer;
          setCurrentVersion(serverVer);
          setHasNewVersion(false);
          if (manual) setIsChecking(false);
          return false;
        }

        // Direct equality match with installed/acknowledged/compiled version
        if (serverVer === storedVer || serverVer === ackVer || serverVer === compiledVer) {
          setHasNewVersion(false);
          if (manual) setIsChecking(false);
          return false;
        }

        // Numeric timestamp comparison
        const serverNum = parseInt(serverVer, 10);
        const storedNum = parseInt(storedVer, 10);
        const ackNum = parseInt(ackVer, 10);
        const compiledNum = parseInt(compiledVer, 10);

        const highestLocalTime = Math.max(
          isNaN(storedNum) ? 0 : storedNum,
          isNaN(ackNum) ? 0 : ackNum,
          isNaN(compiledNum) ? 0 : compiledNum
        );

        if (!isNaN(serverNum) && highestLocalTime > 0) {
          // If server version is older than or equal to what we already have/acknowledged:
          if (serverNum <= highestLocalTime) {
            setHasNewVersion(false);
            if (manual) setIsChecking(false);
            return false;
          }
        }

        // Server has a genuinely newer timestamp
        setLatestVersion(serverVer);
        setHasNewVersion(true);
        if (manual) setIsChecking(false);
        return true;
      }

      if (manual) setIsChecking(false);
      return false;
    } catch {
      if (manual) setIsChecking(false);
      return false;
    }
  };

  const applyUpdate = async () => {
    setIsUpdating(true);
    try {
      const targetVer = latestVersion || String(Date.now());
      localStorage.setItem(VERSION_STORAGE_KEY, targetVer);
      localStorage.setItem(ACKNOWLEDGED_VERSION_KEY, targetVer);
      currentRunningVersionRef.current = targetVer;
      setCurrentVersion(targetVer);
      setHasNewVersion(false);

      if ('caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
      }
    } catch {
      // ignore
    }

    // Force hard reload bypassing cache
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('_v', Date.now().toString());
      window.location.replace(url.toString());
    }, 300);
  };

  const dismissNotification = () => {
    if (latestVersion) {
      localStorage.setItem(ACKNOWLEDGED_VERSION_KEY, latestVersion);
      localStorage.setItem(VERSION_STORAGE_KEY, latestVersion);
    }
    setHasNewVersion(false);
  };

  return (
    <VersionContext.Provider
      value={{
        hasNewVersion,
        isChecking,
        isUpdating,
        currentVersion,
        latestVersion,
        lastChecked,
        checkVersion,
        applyUpdate,
        dismissNotification
      }}
    >
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = (): VersionContextType => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};
