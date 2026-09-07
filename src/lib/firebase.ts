import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  setLogLevel
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress internal log spam
try {
  setLogLevel('silent');
} catch (e) {
  // Ignored if unsupported
}

// Global safety filter for transient Firestore / IndexedDB errors
if (typeof window !== 'undefined') {
  const isIgnorableError = (msg: string) => {
    const lower = msg.toLowerCase();
    return (
      (msg.includes('FIRESTORE') && msg.includes('INTERNAL ASSERTION FAILED')) ||
      lower.includes('database is closing') ||
      lower.includes('database is hidden') ||
      lower.includes('connection is closing') ||
      lower.includes('idbdatabase')
    );
  };

  window.addEventListener('error', (event) => {
    const msg = event?.message || event?.error?.message || '';
    if (typeof msg === 'string' && isIgnorableError(msg)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Firestore SDK] Intercepted transient storage warning:', msg);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = (event?.reason?.message || event?.reason?.toString() || '');
    if (typeof reasonStr === 'string' && isIgnorableError(reasonStr)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Firestore SDK] Intercepted transient rejection:', reasonStr);
    }
  });
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore with persistentLocalCache & multi-tab manager so data is stored in IndexedDB.
// On page reload or revisit, existing docs cost 0 network reads!
// When new docs are added/uploaded, real-time listeners receive only the delta (1 read).
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, databaseId);
} catch (err: any) {
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, databaseId);
  } catch {
    firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db = firestoreDb;
export const storage = getStorage(app);

export default app;
