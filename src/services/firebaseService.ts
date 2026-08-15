import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { Member, Deposit, RealEstateProject, NotificationItem, ActivityLog, SystemSettings, CardTemplateConfig, BoardDirector, TrashedItem, ActiveSession } from '../types';
import { INITIAL_MEMBERS, INITIAL_DEPOSITS, INITIAL_PROJECTS, INITIAL_NOTIFICATIONS } from '../data/seedData';
import { INITIAL_DIRECTORS } from '../data/seedDirectors';
import { DEFAULT_CARD_TEMPLATE } from '../data/defaultCardTemplate';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'rejected' | 'inactive' | 'suspended';
  memberId?: string;
  createdAt?: any;
}

export interface ReportItem {
  id: string;
  title: string;
  period: string;
  reportType: string;
  generatedAt: string;
  totalMembers?: number;
  totalFund?: number;
  totalProfit?: number;
  notes?: string;
  createdAt?: any;
}

// Helper function to remove undefined values from objects before saving to Firestore
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as unknown as T;
  }

  if (obj instanceof Date || typeof (obj as any).toDate === 'function' || (obj as any)._methodName) {
    return obj;
  }

  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanUndefined(value);
    }
  }
  return cleaned as T;
}

let isGlobalQuotaExceeded = false;

// Helper to detect Firestore quota limit exceeded or resource exhausted errors
export function isQuotaExceededError(err: any): boolean {
  if (!err) return false;
  const code = (err.code || '').toString().toLowerCase();
  const msg = (err.message || err.toString() || '').toLowerCase();
  const hit = (
    code.includes('resource-exhausted') ||
    code.includes('quota') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('free daily read units') ||
    msg.includes('free daily write units')
  );
  if (hit) {
    isGlobalQuotaExceeded = true;
  }
  return hit;
}

export function getCachedItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Could not read cached item ${key}:`, e);
  }
  return fallback;
}

export function setCachedItem<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`Could not write cached item ${key}:`, e);
  }
}

export function notifyQuotaExceeded(err: any): void {
  if (isQuotaExceededError(err)) {
    isGlobalQuotaExceeded = true;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pbc_firestore_quota_exceeded', { detail: err }));
    }
  }
}

// ACTIVITY LOGS CRUD
export function subscribeActivityLogs(callback: (logs: ActivityLog[]) => void) {
  const colRef = collection(db, 'activity_logs');
  return onSnapshot(colRef, (snapshot) => {
    const list: ActivityLog[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userEmail: data.userEmail || 'system@pbcclub.org',
        action: data.action || 'System Action',
        details: data.details || '',
        timestamp: data.timestamp || new Date().toISOString()
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setCachedItem('pbc_cached_activity_logs', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeActivityLogs notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<ActivityLog[]>('pbc_cached_activity_logs', []));
  });
}

export async function addActivityLogDoc(userEmail: string, action: string, details: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    const newRef = doc(collection(db, 'activity_logs'));
    await setDoc(newRef, cleanUndefined({
      id: newRef.id,
      userEmail,
      action,
      details,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    }));
  } catch (err) {
    notifyQuotaExceeded(err);
    console.error('Error adding activity log:', err);
  }
}

// SYSTEM SETTINGS CRUD
export function subscribeSystemSettings(callback: (settings: SystemSettings) => void) {
  const docRef = doc(db, 'system_settings', 'global_config');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as SystemSettings;
      setCachedItem('pbc_cached_system_settings', data);
      callback(data);
    } else {
      const defaultSettings: SystemSettings = {
        clubName: 'PROBASHI BUSINESS CLUB',
        currencySymbol: '৳',
        minDepositAmount: 5000,
        allowNewRegistrations: true,
        noticeBoardText: 'Welcome to Probashi Business Club (PBC). Please ensure all monthly contributions are logged.'
      };
      callback(defaultSettings);
    }
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeSystemSettings notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<SystemSettings>('pbc_cached_system_settings', {
      clubName: 'PROBASHI BUSINESS CLUB',
      currencySymbol: '৳',
      minDepositAmount: 5000,
      allowNewRegistrations: true,
      noticeBoardText: 'Welcome to Probashi Business Club (PBC). Please ensure all monthly contributions are logged.'
    }));
  });
}

export async function updateSystemSettingsDoc(settings: Partial<SystemSettings>) {
  let settingsData = { ...settings };
  if (settingsData.customLogoUrl && settingsData.customLogoUrl.startsWith('data:image')) {
    try {
      settingsData.customLogoUrl = await compressDataUrlIfNeeded(settingsData.customLogoUrl, 300, 0.8);
    } catch (e) {
      console.warn('Could not compress custom logo image:', e);
    }
  }
  if (settingsData.defaultFrameOverlayUrl && settingsData.defaultFrameOverlayUrl.startsWith('data:image')) {
    try {
      settingsData.defaultFrameOverlayUrl = await compressDataUrlIfNeeded(settingsData.defaultFrameOverlayUrl, 1000, 0.85);
    } catch (e) {
      console.warn('Could not compress default frame overlay image:', e);
    }
  }

  const payload = cleanUndefined(settingsData);

  try {
    await setDoc(doc(db, 'system_settings', 'global_config'), payload, { merge: true });
  } catch (err: any) {
    notifyQuotaExceeded(err);
    console.warn('Failed to update system settings doc (saved locally):', err);
    if (err?.message?.includes('exceeds the maximum allowed size') || err?.code === 'invalid-argument') {
      try {
        const fallbackUrl = await compressDataUrlIfNeeded(settingsData.customLogoUrl || '', 180, 0.6);
        await setDoc(doc(db, 'system_settings', 'global_config'), { ...payload, customLogoUrl: fallbackUrl }, { merge: true }).catch(() => {});
      } catch {
        await setDoc(doc(db, 'system_settings', 'global_config'), { ...payload, customLogoUrl: '' }, { merge: true }).catch(() => {});
      }
    }
  }
}

// BOARD DIRECTORS CRUD
export function subscribeBoardDirectors(callback: (directors: BoardDirector[]) => void) {
  const colRef = collection(db, 'board_directors');
  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      if (!isGlobalQuotaExceeded) {
        INITIAL_DIRECTORS.forEach(async (dir) => {
          try {
            await setDoc(doc(db, 'board_directors', dir.id), cleanUndefined(dir));
          } catch (e) {
            notifyQuotaExceeded(e);
            console.warn('Error seeding initial director:', e);
          }
        });
      }
      setCachedItem('pbc_cached_directors', INITIAL_DIRECTORS);
      callback(INITIAL_DIRECTORS);
      return;
    }

    const demoNamesToRemove = [
      'Dr. Rafiqul Islam',
      'Engr. Mohammed Alamgir',
      'Syed Tanvir Ahmed',
      'Nusrat Jahan Chowdhury'
    ];

    const list: BoardDirector[] = [];
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const name = (data.name || '').trim();
      
      // Auto-clean old demo directors from database if found
      if (demoNamesToRemove.some(demoName => name.toLowerCase().includes(demoName.toLowerCase()))) {
        if (!isGlobalQuotaExceeded) deleteDoc(doc(db, 'board_directors', docSnap.id)).catch(() => {});
        return;
      }

      list.push({
        id: docSnap.id,
        name: data.name || '',
        designation: data.designation || '',
        photoUrl: data.photoUrl || '',
        location: data.location || '',
        mobile: data.mobile || '',
        nationalId: data.nationalId || '',
        email: data.email || '',
        homeAddress: data.homeAddress || '',
        village: data.village || '',
        subDistrict: data.subDistrict || '',
        district: data.district || '',
        postalCode: data.postalCode || '',
        displayOrder: data.displayOrder ?? 99,
        isActive: data.isActive !== false,
        allowedAccessUsers: data.allowedAccessUsers || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt
      });
    });

    if (list.length === 0) {
      if (!isGlobalQuotaExceeded) {
        INITIAL_DIRECTORS.forEach(async (dir) => {
          try {
            await setDoc(doc(db, 'board_directors', dir.id), cleanUndefined(dir));
          } catch (e) {
            notifyQuotaExceeded(e);
            console.warn('Error seeding initial director:', e);
          }
        });
      }
      setCachedItem('pbc_cached_directors', INITIAL_DIRECTORS);
      callback(INITIAL_DIRECTORS);
      return;
    }

    list.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
    setCachedItem('pbc_cached_directors', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeBoardDirectors notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<BoardDirector[]>('pbc_cached_directors', INITIAL_DIRECTORS));
  });
}

export async function addDirectorDoc(director: Omit<BoardDirector, 'id'>) {
  if (isGlobalQuotaExceeded) return `DIR-${Date.now().toString().slice(-4)}`;
  const newId = `DIR-${Date.now().toString().slice(-4)}`;
  let photoUrl = director.photoUrl || '';
  if (photoUrl && photoUrl.startsWith('data:image')) {
    try {
      photoUrl = await compressDataUrlIfNeeded(photoUrl, 800, 0.7);
    } catch (e) {
      console.warn('Could not compress director photo:', e);
    }
  }

  const payload = cleanUndefined({
    ...director,
    photoUrl,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  try {
    await setDoc(doc(db, 'board_directors', newId), payload);
  } catch (err: any) {
    notifyQuotaExceeded(err);
    if (err?.message?.includes('exceeds the maximum allowed size')) {
      const tightPhoto = await compressDataUrlIfNeeded(photoUrl, 500, 0.5);
      await setDoc(doc(db, 'board_directors', newId), { ...payload, photoUrl: tightPhoto });
    } else {
      throw err;
    }
  }
  return newId;
}

export async function updateDirectorDoc(id: string, director: Partial<BoardDirector>) {
  if (isGlobalQuotaExceeded) return;
  let photoUrl = director.photoUrl;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    try {
      photoUrl = await compressDataUrlIfNeeded(photoUrl, 800, 0.7);
    } catch (e) {
      console.warn('Could not compress director photo:', e);
    }
  }

  const payload = cleanUndefined({
    ...director,
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    updatedAt: new Date().toISOString()
  });

  try {
    await updateDoc(doc(db, 'board_directors', id), payload);
  } catch (err: any) {
    notifyQuotaExceeded(err);
    if (err?.message?.includes('exceeds the maximum allowed size') && photoUrl) {
      const tightPhoto = await compressDataUrlIfNeeded(photoUrl, 500, 0.5);
      await updateDoc(doc(db, 'board_directors', id), { ...payload, photoUrl: tightPhoto });
    } else {
      throw err;
    }
  }
}

export async function deleteDirectorDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'board_directors', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}


// BACKUP & RESTORE DATA
export async function exportBackupData() {
  const membersSnap = await getDocs(collection(db, 'members'));
  const depositsSnap = await getDocs(collection(db, 'deposits'));
  const projectsSnap = await getDocs(collection(db, 'projects'));
  const reportsSnap = await getDocs(collection(db, 'reports'));
  const usersSnap = await getDocs(collection(db, 'users'));
  const logsSnap = await getDocs(collection(db, 'activity_logs'));

  const backupObj = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    members: membersSnap.docs.map(d => d.data()),
    deposits: depositsSnap.docs.map(d => d.data()),
    projects: projectsSnap.docs.map(d => d.data()),
    reports: reportsSnap.docs.map(d => d.data()),
    users: usersSnap.docs.map(d => d.data()),
    activity_logs: logsSnap.docs.map(d => d.data())
  };

  return backupObj;
}

export async function restoreBackupData(backupObj: any) {
  if (!backupObj || typeof backupObj !== 'object' || isGlobalQuotaExceeded) throw new Error('Invalid backup file or quota exceeded');

  try {
    if (Array.isArray(backupObj.members)) {
      for (const m of backupObj.members) {
        if (m.id) await setDoc(doc(db, 'members', m.id), cleanUndefined(m), { merge: true });
      }
    }
    if (Array.isArray(backupObj.deposits)) {
      for (const d of backupObj.deposits) {
        if (d.id) await setDoc(doc(db, 'deposits', d.id), cleanUndefined(d), { merge: true });
      }
    }
    if (Array.isArray(backupObj.projects)) {
      for (const p of backupObj.projects) {
        if (p.id) await setDoc(doc(db, 'projects', p.id), cleanUndefined(p), { merge: true });
      }
    }
    if (Array.isArray(backupObj.reports)) {
      for (const r of backupObj.reports) {
        if (r.id) await setDoc(doc(db, 'reports', r.id), cleanUndefined(r), { merge: true });
      }
    }
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// ----------------------------------------------------------------------
// Seed Firestore Collections if Empty
// ----------------------------------------------------------------------
export async function seedFirestoreIfEmpty() {
  if (isGlobalQuotaExceeded) return;
  try {
    const superEmail = 'fokrulislammir9897@gmail.com';
    const qSuper = query(collection(db, 'users'), where('email', '==', superEmail));
    const superSnap = await getDocs(qSuper);

    if (superSnap.empty) {
      await setDoc(doc(db, 'users', 'superadmin-fokrul-doc'), cleanUndefined({
        email: superEmail,
        displayName: 'Fokrul Islam Mir (Super Admin)',
        role: 'super_admin',
        status: 'active',
        createdAt: serverTimestamp()
      }), { merge: true });
    } else {
      // If multiple duplicate docs exist for super admin, keep the first and delete the rest
      const docs = superSnap.docs;
      const keepDoc = docs[0];
      const existingData = keepDoc.data();

      // Only update if role or status is missing or changed
      if (existingData?.role !== 'super_admin' || existingData?.status !== 'active') {
        await setDoc(doc(db, 'users', keepDoc.id), cleanUndefined({
          email: superEmail,
          displayName: 'Fokrul Islam Mir (Super Admin)',
          role: 'super_admin',
          status: 'active',
          updatedAt: serverTimestamp()
        }), { merge: true });
      }

      if (docs.length > 1) {
        for (let i = 1; i < docs.length; i++) {
          await deleteDoc(doc(db, 'users', docs[i].id)).catch(() => {});
        }
      }
    }
  } catch (err: any) {
    notifyQuotaExceeded(err);
  }
}

// ----------------------------------------------------------------------
// Firestore Collection CRUD Operations
// ----------------------------------------------------------------------

// MEMBERS CRUD
export function subscribeMembers(callback: (members: Member[]) => void) {
  const colRef = collection(db, 'members');
  return onSnapshot(colRef, (snapshot) => {
    const list: Member[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        fullName: data.fullName || '',
        fullNameBn: data.fullNameBn || '',
        phone: data.phone || '',
        email: data.email || '',
        country: data.country || '',
        city: data.city || '',
        joinDate: data.joinDate || '',
        status: data.status || 'active',
        photoUrl: data.photoUrl || '',
        idCardPhotoUrl: data.idCardPhotoUrl || data.idCardFrontPhotoUrl || '',
        idCardFrontPhotoUrl: data.idCardFrontPhotoUrl || data.idCardPhotoUrl || '',
        idCardBackPhotoUrl: data.idCardBackPhotoUrl || '',
        totalDeposit: data.totalDeposit || 0,
        qrCodeData: data.qrCodeData || `PBC-MEMBER:${docSnap.id}:${data.fullName}:${data.status}`,
        barcodeData: data.barcodeData || `PBC-BC-${docSnap.id}`,
        passportNumber: data.passportNumber || '',
        idCardNumber: data.idCardNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        bloodGroup: data.bloodGroup || '',
        emergencyContact: data.emergencyContact || '',
        role: data.role || 'member',
        notes: data.notes || '',
        password: data.password || ''
      } as Member;
    });
    setCachedItem('pbc_cached_members', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeMembers notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<Member[]>('pbc_cached_members', INITIAL_MEMBERS));
  });
}

export async function addMemberDoc(id: string, memberData: Omit<Member, 'id'>) {
  if (isGlobalQuotaExceeded) return;
  const finalId = id && id.trim() !== '' ? id.trim() : `PBC-${1000 + Math.floor(Math.random() * 9000)}`;
  const qrCodeData = memberData.qrCodeData || `PBC-MEMBER:${finalId}:${memberData.fullName}:${memberData.status}`;
  const barcodeData = memberData.barcodeData || `PBC-BC-${finalId}`;

  let photoUrl = memberData.photoUrl;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    try {
      photoUrl = await compressDataUrlIfNeeded(photoUrl, 600, 0.75);
    } catch (e) {
      console.warn('Could not compress member photoUrl:', e);
    }
  }

  const payload = cleanUndefined({
    ...memberData,
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    id: finalId,
    qrCodeData,
    barcodeData,
    createdAt: serverTimestamp()
  });

  try {
    await setDoc(doc(db, 'members', finalId), payload);
  } catch (err: any) {
    notifyQuotaExceeded(err);
    if (err?.message?.includes('exceeds the maximum allowed size') && photoUrl) {
      const tightPhoto = await compressDataUrlIfNeeded(photoUrl, 400, 0.5);
      await setDoc(doc(db, 'members', finalId), { ...payload, photoUrl: tightPhoto }).catch(() => {});
    }
  }
}

export async function updateMemberDoc(oldId: string, data: Partial<Member>) {
  if (isGlobalQuotaExceeded) return;
  const newId = data.id && data.id.trim() !== '' ? data.id.trim() : oldId;

  // Compress photoUrl and ID card dataUrls if present
  let photoUrl = data.photoUrl;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    try {
      photoUrl = await compressDataUrlIfNeeded(photoUrl, 600, 0.75);
    } catch (e) {
      console.warn('Could not compress member photoUrl:', e);
    }
  }

  let idCardPhotoUrl = data.idCardPhotoUrl;
  if (idCardPhotoUrl && idCardPhotoUrl.startsWith('data:image')) {
    try {
      idCardPhotoUrl = await compressDataUrlIfNeeded(idCardPhotoUrl, 600, 0.75);
    } catch (e) {}
  }

  let idCardFrontPhotoUrl = (data as any).idCardFrontPhotoUrl;
  if (idCardFrontPhotoUrl && idCardFrontPhotoUrl.startsWith('data:image')) {
    try {
      idCardFrontPhotoUrl = await compressDataUrlIfNeeded(idCardFrontPhotoUrl, 600, 0.75);
    } catch (e) {}
  }

  let idCardBackPhotoUrl = (data as any).idCardBackPhotoUrl;
  if (idCardBackPhotoUrl && idCardBackPhotoUrl.startsWith('data:image')) {
    try {
      idCardBackPhotoUrl = await compressDataUrlIfNeeded(idCardBackPhotoUrl, 600, 0.75);
    } catch (e) {}
  }

  const processedData = {
    ...data,
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    ...(idCardPhotoUrl !== undefined ? { idCardPhotoUrl } : {}),
    ...(idCardFrontPhotoUrl !== undefined ? { idCardFrontPhotoUrl } : {}),
    ...(idCardBackPhotoUrl !== undefined ? { idCardBackPhotoUrl } : {})
  };

  try {
    if (newId !== oldId) {
      // Member ID changed - set new doc and delete old doc
      const oldRef = doc(db, 'members', oldId);
      const oldSnap = await getDoc(oldRef);
      let mergedData: any = { id: newId };
      if (oldSnap.exists()) {
        mergedData = { ...oldSnap.data(), ...processedData, id: newId };
        await deleteDoc(oldRef);
      } else {
        mergedData = { ...processedData, id: newId };
      }

      await setDoc(doc(db, 'members', newId), cleanUndefined(mergedData), { merge: true });

      // Cascade member ID update to associated deposit records
      try {
        const qDep = query(collection(db, 'deposits'), where('memberId', '==', oldId));
        const depSnap = await getDocs(qDep);
        for (const d of depSnap.docs) {
          await setDoc(doc(db, 'deposits', d.id), { memberId: newId }, { merge: true });
        }
      } catch (e) {
        notifyQuotaExceeded(e);
        console.warn('Could not cascade memberId update to deposits:', e);
      }
    } else {
      await setDoc(doc(db, 'members', oldId), cleanUndefined(processedData), { merge: true });
    }
  } catch (err: any) {
    notifyQuotaExceeded(err);
    if (err?.message?.includes('exceeds the maximum allowed size') && photoUrl) {
      const tightPhoto = await compressDataUrlIfNeeded(photoUrl, 400, 0.5);
      await setDoc(doc(db, 'members', newId), cleanUndefined({ ...processedData, photoUrl: tightPhoto }), { merge: true }).catch(() => {});
    }
  }
}

export async function deleteMemberDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'members', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// DEPOSITS CRUD
export function subscribeDeposits(callback: (deposits: Deposit[]) => void) {
  const colRef = collection(db, 'deposits');
  return onSnapshot(colRef, (snapshot) => {
    const list: Deposit[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        memberId: data.memberId || '',
        memberName: data.memberName || '',
        amount: data.amount || 0,
        currency: data.currency || 'BDT',
        localAmount: data.localAmount,
        depositDate: data.depositDate || '',
        paymentMethod: data.paymentMethod || 'Bank Wire',
        referenceNumber: data.referenceNumber || '',
        notes: data.notes || '',
        receiptUrl: data.receiptUrl || '',
        status: data.status || 'Approved',
        approvedByAdminName: data.approvedByAdminName || '',
        approvedByAdminId: data.approvedByAdminId || '',
        approvedByAdminSignature: data.approvedByAdminSignature || ''
      } as Deposit;
    });
    setCachedItem('pbc_cached_deposits', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeDeposits notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<Deposit[]>('pbc_cached_deposits', INITIAL_DEPOSITS));
  });
}

export async function addDepositDoc(id: string, depositData: Omit<Deposit, 'id' | 'status'> & { status?: string }) {
  if (isGlobalQuotaExceeded) return;
  let receiptUrl = depositData.receiptUrl || '';
  if (receiptUrl && receiptUrl.startsWith('data:image')) {
    try {
      receiptUrl = await compressDataUrlIfNeeded(receiptUrl, 800, 0.7);
    } catch (e) {
      console.warn('Could not compress deposit receipt image:', e);
    }
  }

  const payload = cleanUndefined({
    ...depositData,
    id,
    receiptUrl,
    status: (depositData as any).status || 'Approved',
    createdAt: serverTimestamp()
  });

  try {
    await setDoc(doc(db, 'deposits', id), payload);
  } catch (err: any) {
    notifyQuotaExceeded(err);
    console.warn('Failed to save deposit doc (saved locally):', err);
    if (err?.message?.includes('exceeds the maximum allowed size') || err?.code === 'invalid-argument') {
      try {
        const fallbackUrl = await compressDataUrlIfNeeded(receiptUrl, 400, 0.5);
        await setDoc(doc(db, 'deposits', id), { ...payload, receiptUrl: fallbackUrl }).catch(() => {});
      } catch {
        await setDoc(doc(db, 'deposits', id), { ...payload, receiptUrl: '' }).catch(() => {});
      }
    }
  }
}

export async function updateDepositDoc(id: string, data: Partial<Deposit>) {
  if (isGlobalQuotaExceeded) return;
  let updatedData = { ...data };
  if (updatedData.receiptUrl && updatedData.receiptUrl.startsWith('data:image')) {
    try {
      updatedData.receiptUrl = await compressDataUrlIfNeeded(updatedData.receiptUrl, 800, 0.7);
    } catch (e) {
      console.warn('Could not compress deposit receipt image:', e);
    }
  }

  const payload = cleanUndefined(updatedData);

  try {
    await setDoc(doc(db, 'deposits', id), payload, { merge: true });
  } catch (err: any) {
    notifyQuotaExceeded(err);
    console.warn('Failed to update deposit doc (saved locally):', err);
    if (err?.message?.includes('exceeds the maximum allowed size') || err?.code === 'invalid-argument') {
      try {
        const fallbackUrl = await compressDataUrlIfNeeded(updatedData.receiptUrl || '', 400, 0.5);
        await setDoc(doc(db, 'deposits', id), { ...payload, receiptUrl: fallbackUrl }, { merge: true }).catch(() => {});
      } catch {
        await setDoc(doc(db, 'deposits', id), { ...payload, receiptUrl: '' }, { merge: true }).catch(() => {});
      }
    }
  }
}

export async function deleteDepositDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'deposits', id));
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Failed to delete deposit doc:', err);
  }
}

// PROJECTS CRUD
export function subscribeProjects(callback: (projects: RealEstateProject[]) => void) {
  const colRef = collection(db, 'projects');
  return onSnapshot(colRef, (snapshot) => {
    const list: RealEstateProject[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const investmentAmount = data.investmentAmount || 0;
      const currentValue = data.currentValue || 0;
      const profit = data.profit !== undefined ? data.profit : (currentValue - investmentAmount);
      const loss = Math.max(0, investmentAmount - currentValue);

      return {
        id: docSnap.id,
        projectName: data.projectName || '',
        projectNameBn: data.projectNameBn,
        category: data.category || data.propertyType || 'Real Estate',
        propertyType: data.propertyType || 'Real Estate',
        country: data.country || '',
        city: data.city || '',
        address: data.address || '',
        investmentAmount,
        currentValue,
        profit,
        loss,
        investmentDate: data.investmentDate || data.purchaseDate || new Date().toISOString().split('T')[0],
        purchaseDate: data.purchaseDate || data.investmentDate || '',
        status: data.status || 'Approved',
        isArchived: !!data.isArchived,
        photos: Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : [],
        documents: data.documents || [],
        description: data.description || '',
        expectedRoiPercent: data.expectedRoiPercent || (investmentAmount > 0 ? Number(((profit / investmentAmount) * 100).toFixed(1)) : 0),
        totalInvestors: data.totalInvestors || 0
      } as RealEstateProject;
    });
    setCachedItem('pbc_cached_projects', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeProjects notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<RealEstateProject[]>('pbc_cached_projects', INITIAL_PROJECTS));
  });
}

export async function addProjectDoc(id: string, projectData: Omit<RealEstateProject, 'id' | 'profit' | 'loss'>) {
  if (isGlobalQuotaExceeded) return;
  const profit = Math.max(0, projectData.currentValue - projectData.investmentAmount);
  const loss = Math.max(0, projectData.investmentAmount - projectData.currentValue);

  try {
    await setDoc(doc(db, 'projects', id), cleanUndefined({
      ...projectData,
      id,
      profit,
      loss,
      isArchived: projectData.isArchived || false,
      createdAt: serverTimestamp()
    }));
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Failed to add project doc:', err);
  }
}

export async function updateProjectDoc(id: string, data: Partial<RealEstateProject>) {
  if (isGlobalQuotaExceeded) return;
  const updateData = { ...data };
  if (updateData.currentValue !== undefined && updateData.investmentAmount !== undefined) {
    updateData.profit = Math.max(0, updateData.currentValue - updateData.investmentAmount);
    updateData.loss = Math.max(0, updateData.investmentAmount - updateData.currentValue);
  }
  try {
    await setDoc(doc(db, 'projects', id), cleanUndefined(updateData), { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Failed to update project doc:', err);
  }
}

export async function archiveProjectDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await setDoc(doc(db, 'projects', id), {
      isArchived: true,
      status: 'Archived'
    }, { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function restoreProjectDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await setDoc(doc(db, 'projects', id), {
      isArchived: false,
      status: 'Approved'
    }, { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function deleteProjectDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// REPORTS CRUD
export function subscribeReports(callback: (reports: ReportItem[]) => void) {
  const colRef = collection(db, 'reports');
  return onSnapshot(colRef, (snapshot) => {
    const list: ReportItem[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || '',
        period: data.period || '',
        reportType: data.reportType || 'Quarterly Audit',
        generatedAt: data.generatedAt || new Date().toISOString().split('T')[0],
        totalMembers: data.totalMembers,
        totalFund: data.totalFund,
        totalProfit: data.totalProfit,
        notes: data.notes
      } as ReportItem;
    });
    setCachedItem('pbc_cached_reports', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeReports notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<ReportItem[]>('pbc_cached_reports', []));
  });
}

export async function addReportDoc(report: Omit<ReportItem, 'id'>) {
  if (isGlobalQuotaExceeded) return 'RPT-LOCAL';
  const newRef = doc(collection(db, 'reports'));
  const id = newRef.id;
  try {
    await setDoc(newRef, cleanUndefined({
      ...report,
      id,
      createdAt: serverTimestamp()
    }));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
  return id;
}

export async function updateReportDoc(id: string, data: Partial<ReportItem>) {
  if (isGlobalQuotaExceeded) return;
  try {
    await setDoc(doc(db, 'reports', id), cleanUndefined(data), { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function deleteReportDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'reports', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// USERS CRUD
export function subscribeUsers(callback: (users: UserProfile[]) => void) {
  const colRef = collection(db, 'users');
  return onSnapshot(colRef, (snapshot) => {
    const seenEmails = new Map<string, UserProfile>();
    const duplicateDocIdsToDelete: string[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const email = (data.email || '').toLowerCase().trim();
      if (!email) continue;

      let role: 'super_admin' | 'admin' | 'member' = data.role || 'member';

      // Strict rule: ONLY fokrulislammir9897@gmail.com can have super_admin role
      if (email === 'fokrulislammir9897@gmail.com') {
        role = 'super_admin';
      } else if (role === 'super_admin') {
        role = 'admin'; // Automatically demote any other user claiming super_admin
      }

      const userProfile: UserProfile = {
        uid: docSnap.id,
        email: data.email || '',
        displayName: data.displayName || '',
        role,
        memberId: data.memberId || '',
        status: data.status || 'active'
      } as UserProfile;

      if (!seenEmails.has(email)) {
        seenEmails.set(email, userProfile);
      } else {
        const existing = seenEmails.get(email)!;
        if (role === 'super_admin') {
          duplicateDocIdsToDelete.push(existing.uid);
          seenEmails.set(email, userProfile);
        } else {
          duplicateDocIdsToDelete.push(docSnap.id);
        }
      }
    }

    // Automatically remove duplicate user documents from Firestore in background
    if (duplicateDocIdsToDelete.length > 0) {
      duplicateDocIdsToDelete.forEach(dupId => {
        deleteDoc(doc(db, 'users', dupId)).catch(() => {});
      });
    }

    const finalUsers = Array.from(seenEmails.values());
    setCachedItem('pbc_cached_users', finalUsers);
    callback(finalUsers);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeUsers notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<UserProfile[]>('pbc_cached_users', []));
  });
}

export async function setUserProfileDoc(uid: string, profile: Omit<UserProfile, 'uid'>) {
  if (isGlobalQuotaExceeded) return;
  const cleanEmail = (profile.email || '').toLowerCase().trim();

  let finalRole = profile.role;
  if (cleanEmail === 'fokrulislammir9897@gmail.com') {
    finalRole = 'super_admin';
  } else if (finalRole === 'super_admin') {
    finalRole = 'admin';
  }

  try {
    // Requirement 5: Check if user document already exists by email before creating
    if (cleanEmail) {
      const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const usersSnap = await getDocs(qUsers);
      if (!usersSnap.empty) {
        const existingDoc = usersSnap.docs[0];
        await setDoc(doc(db, 'users', existingDoc.id), cleanUndefined({
          ...profile,
          role: finalRole,
          uid: existingDoc.id,
          updatedAt: serverTimestamp()
        }), { merge: true });

        // Clean up extra duplicate docs for this email if any
        for (let i = 1; i < usersSnap.docs.length; i++) {
          await deleteDoc(doc(db, 'users', usersSnap.docs[i].id)).catch(() => {});
        }
        return;
      }
    }

    await setDoc(doc(db, 'users', uid), cleanUndefined({
      ...profile,
      role: finalRole,
      uid,
      createdAt: serverTimestamp()
    }), { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function updateUserProfileDoc(uid: string, data: Partial<UserProfile>) {
  if (isGlobalQuotaExceeded) return;
  if (data.role === 'super_admin' && data.email?.toLowerCase().trim() !== 'fokrulislammir9897@gmail.com') {
    data.role = 'admin';
  }
  try {
    await setDoc(doc(db, 'users', uid), cleanUndefined(data), { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function deleteUserProfileDoc(uid: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// ----------------------------------------------------------------------
// CARD TEMPLATE MANAGEMENT
// ----------------------------------------------------------------------
export function subscribeCardTemplate(callback: (template: CardTemplateConfig) => void) {
  const templateRef = doc(db, 'system_settings', 'cardTemplate');
  return onSnapshot(templateRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...DEFAULT_CARD_TEMPLATE, ...docSnap.data() } as CardTemplateConfig);
    } else {
      callback(DEFAULT_CARD_TEMPLATE);
    }
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore cardTemplate subscription notice:', err);
    callback(DEFAULT_CARD_TEMPLATE);
  });
}

export async function saveCardTemplateDoc(template: CardTemplateConfig): Promise<void> {
  if (isGlobalQuotaExceeded) return;
  try {
    const templateRef = doc(db, 'system_settings', 'cardTemplate');
    await setDoc(templateRef, {
      ...template,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
    console.error('Failed to save card template to Firestore:', err);
    throw err;
  }
}

// ----------------------------------------------------------------------
// FIREBASE STORAGE UPLOAD FOR MEMBER PHOTOS & BACKGROUNDS
// ----------------------------------------------------------------------
export function compressImageToDataUrl(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      if (!rawUrl) {
        reject(new Error('Failed to read image file'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(rawUrl);
          }
        } catch {
          resolve(rawUrl);
        }
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function compressDataUrlIfNeeded(dataUrl: string, maxDim = 800, quality = 0.7): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return Promise.resolve(dataUrl || '');
  }

  if (dataUrl.length < 250000) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('Canvas compression failed:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function uploadMemberPhoto(file: File, memberId?: string): Promise<string> {
  const localDataUrlPromise = compressImageToDataUrl(file);

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `member_photos/${memberId || Date.now()}_${safeName}`;
    const storageRef = ref(storage, filename);

    const storageUploadPromise = (async () => {
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Storage upload timeout')), 1500);
    });

    const downloadUrl = await Promise.race([storageUploadPromise, timeoutPromise]);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload notice, falling back to instant compressed data URL:', err);
    return await localDataUrlPromise;
  }
}

// ----------------------------------------------------------------------
// ROLE & ACCOUNT STATUS RESOLVER
// ----------------------------------------------------------------------
export async function getUserRoleAndStatus(uid: string, email: string): Promise<{
  role: 'super_admin' | 'admin' | 'member';
  status: 'active' | 'pending' | 'rejected' | 'inactive' | 'suspended';
  member?: Member;
  userProfile?: UserProfile;
  notFound?: boolean;
}> {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Check if user is Super Admin
    if (cleanEmail === 'fokrulislammir9897@gmail.com') {
      const superAdminProfile: UserProfile = {
        uid,
        email: 'fokrulislammir9897@gmail.com',
        displayName: 'Fokrul Islam Mir (Super Admin)',
        role: 'super_admin'
      };

      // Persist/update to Firestore users collection if quota allows
      if (!isGlobalQuotaExceeded) {
        try {
          const qSuper = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const superSnap = await getDocs(qSuper);
          if (!superSnap.empty) {
            const mainDoc = superSnap.docs[0];
            const mainData = mainDoc.data();
            if (mainData?.role !== 'super_admin' || mainData?.status !== 'active') {
              await setDoc(doc(db, 'users', mainDoc.id), cleanUndefined({
                ...superAdminProfile,
                uid: mainDoc.id,
                status: 'active',
                updatedAt: serverTimestamp()
              }), { merge: true }).catch((e) => notifyQuotaExceeded(e));
            }
          } else {
            await setDoc(doc(db, 'users', uid), cleanUndefined({
              ...superAdminProfile,
              status: 'active',
              createdAt: serverTimestamp()
            }), { merge: true }).catch((e) => notifyQuotaExceeded(e));
          }
        } catch (e) {
          notifyQuotaExceeded(e);
          console.warn('Could not update super_admin user doc:', e);
        }
      }

      // Check member status in cached members or Firestore
      let member: Member | undefined = undefined;
      const cachedMembers = getCachedItem<Member[]>('pbc_cached_members', INITIAL_MEMBERS);
      member = cachedMembers.find(m => m.email.toLowerCase() === cleanEmail);

      try {
        const qMembers = query(collection(db, 'members'), where('email', '==', cleanEmail));
        const membersSnap = await getDocs(qMembers);
        if (!membersSnap.empty) {
          const mDoc = membersSnap.docs[0];
          member = { id: mDoc.id, ...mDoc.data() } as Member;
        }
      } catch (e) {
        notifyQuotaExceeded(e);
      }

      return {
        role: 'super_admin',
        status: 'active',
        member,
        userProfile: superAdminProfile,
        notFound: false
      };
    }

    // 2. For all other users, fetch user profile from Firestore 'users' collection or local cache
    let userProfile: UserProfile | undefined = undefined;
    let userDocData: any = null;

    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) {
        userDocData = userSnap.data();
        userProfile = { uid: userSnap.id, ...userDocData } as UserProfile;
      } else if (cleanEmail) {
        const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const usersSnap = await getDocs(qUsers);
        if (!usersSnap.empty) {
          const uDoc = usersSnap.docs[0];
          userDocData = uDoc.data();
          userProfile = { uid: uDoc.id, ...userDocData } as UserProfile;
        }
      }
    } catch (e) {
      notifyQuotaExceeded(e);
      // Fallback to cached users list
      const cachedUsers = getCachedItem<UserProfile[]>('pbc_cached_users', []);
      const foundCachedUser = cachedUsers.find(u => u.uid === uid || u.email.toLowerCase() === cleanEmail);
      if (foundCachedUser) {
        userDocData = foundCachedUser;
        userProfile = foundCachedUser;
      }
    }

    // Fallback check in cached members list if still null
    if (!userDocData && cleanEmail) {
      const cachedMembers = getCachedItem<Member[]>('pbc_cached_members', INITIAL_MEMBERS);
      const foundMem = cachedMembers.find(m => m.email.toLowerCase() === cleanEmail);
      if (foundMem) {
        userDocData = {
          role: foundMem.role || 'member',
          status: foundMem.status || 'active',
          memberId: foundMem.id,
          displayName: foundMem.fullName
        };
        userProfile = {
          uid,
          email: cleanEmail,
          displayName: foundMem.fullName,
          role: (foundMem.role as any) || 'member',
          status: (foundMem.status as any) || 'active',
          memberId: foundMem.id
        };
      }
    }

    // If the user document or cached profile does not exist, check fallback
    if (!userDocData) {
      return {
        role: 'member',
        status: 'inactive',
        notFound: true
      };
    }

    // Read role ONLY from Firestore/Profile. Do not allow another super_admin.
    let role: 'super_admin' | 'admin' | 'member' = userDocData.role;
    if (role === 'super_admin') {
      role = 'admin'; // Only fokrulislammir9897@gmail.com can have super_admin
    }
    if (role !== 'admin' && role !== 'member') {
      role = 'member';
    }

    let status: 'active' | 'pending' | 'rejected' | 'inactive' | 'suspended' = userDocData.status || 'active';

    // Fetch linked member object if exists
    let member: Member | undefined = undefined;
    if (cleanEmail) {
      const cachedMembers = getCachedItem<Member[]>('pbc_cached_members', INITIAL_MEMBERS);
      member = cachedMembers.find(m => m.email.toLowerCase() === cleanEmail);

      try {
        const qMembers = query(collection(db, 'members'), where('email', '==', cleanEmail));
        const membersSnap = await getDocs(qMembers);
        if (!membersSnap.empty) {
          const mDoc = membersSnap.docs[0];
          member = { id: mDoc.id, ...mDoc.data() } as Member;
          if (member.status) {
            status = member.status as any;
          }
          if (member.role === 'admin' && role === 'member') {
            role = 'admin';
          }
        }
      } catch (e) {
        notifyQuotaExceeded(e);
      }
    }

    return {
      role,
      status,
      member,
      userProfile,
      notFound: false
    };
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Notice in getUserRoleAndStatus (using default member fallback):', err);
    return {
      role: 'member',
      status: 'active',
      notFound: false
    };
  }
}

// ----------------------------------------------------------------------
// TRASH ITEMS (RECYCLE BIN) CRUD
// ----------------------------------------------------------------------
export function subscribeTrashedItems(callback: (items: TrashedItem[]) => void) {
  const colRef = collection(db, 'trashed_items');
  return onSnapshot(colRef, (snapshot) => {
    const list: TrashedItem[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        itemType: data.itemType || 'Deposit',
        title: data.title || '',
        originalId: data.originalId || '',
        originalCollection: data.originalCollection || 'deposits',
        itemData: data.itemData || {},
        deletedByEmail: data.deletedByEmail || '',
        deletedByName: data.deletedByName || '',
        deletedByRole: data.deletedByRole || '',
        reason: data.reason || 'No reason specified',
        deletedAt: data.deletedAt || new Date().toISOString()
      };
    }).sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
    setCachedItem('pbc_cached_trashed_items', list);
    callback(list);
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeTrashedItems notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<TrashedItem[]>('pbc_cached_trashed_items', []));
  });
}

export async function addTrashedItemDoc(item: Omit<TrashedItem, 'id'>) {
  if (isGlobalQuotaExceeded) return `TRASH-LOCAL-${Date.now()}`;
  const trashId = `TRASH-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const payload = cleanUndefined({
    ...item,
    id: trashId
  });
  try {
    await setDoc(doc(db, 'trashed_items', trashId), payload);
  } catch (err) {
    notifyQuotaExceeded(err);
  }
  return trashId;
}

export async function deleteTrashedItemDoc(id: string) {
  if (isGlobalQuotaExceeded) return;
  try {
    await deleteDoc(doc(db, 'trashed_items', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

export async function restoreTrashedItemDoc(trashedItem: TrashedItem) {
  if (isGlobalQuotaExceeded) return;
  const { originalCollection, originalId, itemData, id } = trashedItem;
  if (originalCollection && originalId && itemData) {
    try {
      await setDoc(doc(db, originalCollection, originalId), cleanUndefined(itemData));
    } catch (err) {
      notifyQuotaExceeded(err);
    }
  }
  try {
    await deleteDoc(doc(db, 'trashed_items', id));
  } catch (err) {
    notifyQuotaExceeded(err);
  }
}

// ----------------------------------------------------------------------
// ACTIVE SESSIONS (ONLINE NOW) TRACKING
let prevActiveSessionsFingerprint = '';

// ----------------------------------------------------------------------
export function subscribeActiveSessions(callback: (sessions: ActiveSession[]) => void) {
  const colRef = collection(db, 'active_sessions');
  return onSnapshot(colRef, (snapshot) => {
    const list: ActiveSession[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: data.uid || '',
        email: data.email || '',
        memberName: data.memberName || 'PBC Member',
        memberId: data.memberId || '',
        role: data.role || 'member',
        photoUrl: data.photoUrl || '',
        lastActive: data.lastActive || new Date().toISOString(),
        loginTime: data.loginTime || new Date().toISOString(),
        deviceInfo: data.deviceInfo || 'Web Browser',
        activeTab: data.activeTab || 'dashboard',
        isOnline: data.isOnline !== false
      };
    }).sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

    // Only trigger callback if sessions meaningfully changed (prevents re-render cascades on timestamp-only updates)
    const fingerprint = list.map(s => `${s.id}:${s.role}:${s.activeTab}:${s.isOnline}`).join('|');
    if (fingerprint !== prevActiveSessionsFingerprint) {
      prevActiveSessionsFingerprint = fingerprint;
      setCachedItem('pbc_cached_active_sessions', list);
      callback(list);
    }
  }, (err) => {
    notifyQuotaExceeded(err);
    console.warn('Firestore subscribeActiveSessions notice (Quota/Offline):', err?.message || err);
    callback(getCachedItem<ActiveSession[]>('pbc_cached_active_sessions', []));
  });
}

function cleanDocId(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/gi, '_');
}

let lastActiveSessionWriteTime = 0;
let lastActiveSessionKey = '';

export async function updateActiveSessionDoc(session: Partial<ActiveSession> & { email: string }) {
  if (!session.email || isGlobalQuotaExceeded) return;
  const docId = cleanDocId(session.email.toLowerCase().trim());
  const nowMs = Date.now();
  const sessionKey = `${docId}_${session.activeTab}_${session.role}`;

  // Throttle writes: skip if same key and updated within 60 seconds
  if (sessionKey === lastActiveSessionKey && nowMs - lastActiveSessionWriteTime < 60000) {
    return;
  }

  lastActiveSessionWriteTime = nowMs;
  lastActiveSessionKey = sessionKey;

  const now = new Date().toISOString();
  const payload = cleanUndefined({
    id: docId,
    email: session.email.toLowerCase().trim(),
    uid: session.uid || '',
    memberName: session.memberName || 'PBC Member',
    memberId: session.memberId || '',
    role: session.role || 'member',
    photoUrl: session.photoUrl || '',
    lastActive: now,
    loginTime: session.loginTime || now,
    deviceInfo: session.deviceInfo || (navigator?.userAgent ? (navigator.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop') : 'Web Browser'),
    activeTab: session.activeTab || 'dashboard',
    isOnline: true
  });
  try {
    await setDoc(doc(db, 'active_sessions', docId), payload, { merge: true });
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Notice updating active session doc:', err);
  }
}

export async function clearActiveSessionDoc(email: string) {
  if (!email || isGlobalQuotaExceeded) return;
  const docId = cleanDocId(email.toLowerCase().trim());
  try {
    await deleteDoc(doc(db, 'active_sessions', docId));
  } catch (err) {
    notifyQuotaExceeded(err);
    console.warn('Notice clearing active session:', err);
  }
}

// ----------------------------------------------------------------------
// Auth helper methods
// ----------------------------------------------------------------------
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
};
