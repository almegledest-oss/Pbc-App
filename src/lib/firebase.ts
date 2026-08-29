import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
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

// Global safety filter for transient Firestore SDK internal assertion assertions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event?.message || '';
    if (typeof msg === 'string' && msg.includes('FIRESTORE') && msg.includes('INTERNAL ASSERTION FAILED')) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Firestore SDK] Intercepted transient assertion:', msg);
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = (event?.reason?.message || event?.reason?.toString() || '');
    if (typeof reasonStr === 'string' && reasonStr.includes('FIRESTORE') && reasonStr.includes('INTERNAL ASSERTION FAILED')) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Firestore SDK] Intercepted transient assertion rejection:', reasonStr);
    }
  });
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const storage = getStorage(app);

export default app;


