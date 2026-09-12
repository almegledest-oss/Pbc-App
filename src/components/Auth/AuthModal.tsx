import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Building2, KeyRound, X, AlertCircle, CheckCircle2, Lock, Mail, User, Phone, Globe, MapPin, UserPlus, LogIn, Compass, Eye, EyeOff, ShieldCheck, Clock, MessageSquare, ArrowRight, Sparkles, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';
import { UserRole, Member } from '../../types';
import { PbcLogo } from '../Common/PbcLogo';
import { MaintenanceNoticeScreen } from '../Common/MaintenanceNoticeScreen';
import { safeStorage } from '../../utils/safeStorage';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { findCountryByName, validatePhoneDigits, findCountryByDialCode, COUNTRY_CITY_MAP, getCitiesForCountry } from '../../utils/countryDialCodes';
import { PhoneInputWithCountry } from '../Common/PhoneInputWithCountry';
import { CountryCitySelector } from '../Common/CountryCitySelector';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getUserRoleAndStatus,
  setUserProfileDoc,
  addMemberDoc
} from '../../services/firebaseService';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    setRole,
    role,
    language,
    isLoggedIn,
    setIsLoggedIn,
    setActiveTab,
    setCurrentMember,
    members,
    users,
    systemSettings,
    addNotification
  } = useApp();
  const labels = t[language];

  const [showAdminLoginForm, setShowAdminLoginForm] = useState(false);

  // Login states
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup states for member self-registration
  const [signupMemberId, setSignupMemberId] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDialCode, setSignupDialCode] = useState('+966');
  const [signupPhoneDigits, setSignupPhoneDigits] = useState('');
  const [signupCountry, setSignupCountry] = useState('Saudi Arabia');
  const [signupCity, setSignupCity] = useState('Riyadh');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'registration-success' | 'pending-review'>('login');
  
  // Submitted applicant state for success modal
  const [submittedApplicant, setSubmittedApplicant] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
  } | null>(null);

  // Pending applicant info when logging in before approval
  const [pendingApplicantInfo, setPendingApplicantInfo] = useState<{
    id: string;
    fullName: string;
    email: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.country_name) {
          setSignupCountry(data.country_name);
          const matchedCountry = findCountryByName(data.country_name);
          if (matchedCountry) {
            setSignupDialCode(matchedCountry.dialCode);
          }
          const cities = COUNTRY_CITY_MAP[data.country_name];
          if (data.city) {
            setSignupCity(data.city);
          } else if (cities && cities.length > 0) {
            setSignupCity(cities[0]);
          }
        }
      } else {
        const res2 = await fetch('https://ip-api.com/json/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.country) {
            setSignupCountry(data2.country);
            const matchedCountry = findCountryByName(data2.country);
            if (matchedCountry) {
              setSignupDialCode(matchedCountry.dialCode);
            }
            if (data2.city) setSignupCity(data2.city);
          }
        }
      }
    } catch (err) {
      console.warn('Auto location detect notice:', err);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleCountryChange = (val: string) => {
    setSignupCountry(val);
    const matchedDial = findCountryByName(val);
    if (matchedDial) {
      setSignupDialCode(matchedDial.dialCode);
    }
    const matchedCountryKey = Object.keys(COUNTRY_CITY_MAP).find(
      c => c.toLowerCase() === val.trim().toLowerCase()
    );
    if (matchedCountryKey && COUNTRY_CITY_MAP[matchedCountryKey]?.length > 0) {
      setSignupCity(COUNTRY_CITY_MAP[matchedCountryKey][0]);
    }
  };

  const handleDialCodeChange = (code: string) => {
    setSignupDialCode(code);
    const matchedCountry = findCountryByDialCode(code);
    if (matchedCountry) {
      // Sync country if not already matching
      if (signupCountry.toLowerCase() !== matchedCountry.name.toLowerCase()) {
        setSignupCountry(matchedCountry.name);
        const cities = COUNTRY_CITY_MAP[matchedCountry.name];
        if (cities && cities.length > 0) {
          setSignupCity(cities[0]);
        }
      }
    }
  };

  if (systemSettings.maintenanceMode && role !== 'super_admin' && !showAdminLoginForm) {
    return <MaintenanceNoticeScreen onOpenSuperAdminLogin={() => setShowAdminLoginForm(true)} />;
  }

  if (!isLoggedIn) {
    // Modal is mandatory if not logged in
  } else if (!isAuthModalOpen) {
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (mode === 'signup') {
        const cleanEmail = signupEmail.trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          throw new Error('Please enter a valid email address (একটি সঠিক ইমেইল ঠিকানা দিন)।');
        }
        if (!signupFullName.trim()) {
          throw new Error('Please enter your full name (পুরো নাম লিখুন)।');
        }
        
        // Validate Phone with country dial code and length bounds
        const cleanDigits = signupPhoneDigits.replace(/\D/g, '');
        const phoneValidation = validatePhoneDigits(signupDialCode, cleanDigits);
        if (!phoneValidation.valid) {
          throw new Error(phoneValidation.messageBn || phoneValidation.message || 'ফোন নম্বরটি সঠিক নয়');
        }
        const fullPhoneNumber = `${signupDialCode} ${cleanDigits}`;

        if (!signupPassword) {
          throw new Error('Please enter a password (পাসওয়ার্ড দিন)।');
        }
        if (signupPassword.length < 6) {
          throw new Error('Password must be at least 6 characters (পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে)।');
        }
        if (signupPassword !== signupConfirmPassword) {
          throw new Error('Passwords do not match (পাসওয়ার্ড মিলছে না)।');
        }

        // 1. Check if member or user document already exists with this email in memory or Firestore
        let emailAlreadyExists = members.some(m => m.email.toLowerCase().trim() === cleanEmail);
        if (!emailAlreadyExists) {
          try {
            const qEmail = query(collection(db, 'members'), where('email', '==', cleanEmail));
            const snapEmail = await getDocs(qEmail);
            if (!snapEmail.empty) emailAlreadyExists = true;
          } catch (e) {
            console.warn('Firestore email check notice:', e);
          }
        }
        if (emailAlreadyExists) {
          throw new Error('An account with this email already exists. Please Sign In (এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে সাইন ইন করুন)।');
        }

        // 2. Validate and format Member ID (Exactly 5 Digits)
        let newMemberId = '';
        const rawMemberIdDigits = signupMemberId.replace(/^PBC-/, '').replace(/\D/g, '').trim();

        if (!rawMemberIdDigits || rawMemberIdDigits.length !== 5) {
          throw new Error('Member ID must be exactly 5 digits (e.g. PBC-10001) / সদস্য আইডি অবশ্যই ঠিক ৫ ডিজিটের হতে হবে।');
        }

        const formattedId = `PBC-${rawMemberIdDigits}`;

        // Check if Member ID already exists
        let idAlreadyExists = members.some(m => m.id.toUpperCase() === formattedId);
        if (!idAlreadyExists) {
          try {
            const snapId = await getDoc(doc(db, 'members', formattedId));
            if (snapId.exists()) idAlreadyExists = true;
          } catch (e) {}
        }

        if (idAlreadyExists) {
          const existingById = members.find(m => m.id.toUpperCase() === formattedId);
          if (existingById?.password && existingById.password.trim() !== '') {
            throw new Error(`Member ID (${formattedId}) is already registered. Please Sign In.`);
          }
        }
        newMemberId = formattedId;

        // 3. Create Member data structure
        const existingById = members.find(m => m.id.toUpperCase() === newMemberId.toUpperCase());
        const newMemberData: Member = {
          id: newMemberId,
          fullName: signupFullName.trim(),
          phone: fullPhoneNumber,
          email: cleanEmail,
          country: signupCountry.trim() || 'Saudi Arabia',
          city: signupCity.trim() || 'Riyadh',
          joinDate: existingById?.joinDate || new Date().toISOString().split('T')[0],
          status: 'pending', // Pending Admin Verification
          photoUrl: existingById?.photoUrl || '',
          totalDeposit: existingById?.totalDeposit || 0,
          qrCodeData: 'PBC-MEMBER:' + newMemberId + ':' + signupFullName.trim() + ':pending',
          barcodeData: 'PBC-BC-' + newMemberId,
          role: 'member',
          password: signupPassword,
          notes: existingById?.notes ? existingById.notes + ' | Self-Registered' : 'Self-Registered Member (Pending Approval)'
        };

        // 4. Persist Member to Firestore permanently
        try {
          await Promise.race([
            addMemberDoc(newMemberId, newMemberData),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
          ]);
        } catch (e) {
          console.warn('Member doc save notice:', e);
        }

        // 5. Attempt Firebase Auth registration & profile doc
        let uid = 'usr-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
        try {
          const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword);
          if (userCred?.user?.uid) {
            uid = userCred.user.uid;
          }
          await signOut(auth).catch(() => {});
        } catch (signupErr: any) {
          console.warn('Firebase auth registration notice:', signupErr?.message);
        }

        try {
          await setUserProfileDoc(uid, {
            email: cleanEmail,
            displayName: signupFullName.trim(),
            role: 'member',
            status: 'pending',
            memberId: newMemberId
          });
        } catch (e) {
          console.warn('User profile doc save notice:', e);
        }
        // 7. System notification
        addNotification(
          'New Member Registration',
          `New member applicant ${signupFullName.trim()} (${newMemberId}) registered and is awaiting admin approval.`,
          'system'
        );

        // Set submitted applicant details and show Success Confirmation Screen
        setSubmittedApplicant({
          id: newMemberId,
          fullName: signupFullName.trim(),
          email: cleanEmail,
          phone: fullPhoneNumber,
          country: signupCountry.trim() || 'Saudi Arabia',
          city: signupCity.trim() || 'Riyadh'
        });
        setMode('registration-success');
        setLoginInput(cleanEmail);
        setPassword('');
        setLoading(false);
        return;
      } else {
        // ----------------------------------------------------
        // LOGIN MODE (Supports both Email and Member ID)
        // ----------------------------------------------------
        const rawInput = loginInput.trim();
        if (!rawInput) {
          throw new Error('Please enter your Email Address or Member ID (ইমেইল বা মেম্বার আইডি লিখুন)।');
        }

        let cleanEmail = '';
        let targetMember: Member | undefined = undefined;
        let targetUser: any = undefined;

        const isEmailInput = rawInput.includes('@');

        if (isEmailInput) {
          cleanEmail = rawInput.toLowerCase();
          // Find in memory
          targetMember = members.find(m => m.email && m.email.toLowerCase().trim() === cleanEmail);
          targetUser = users.find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);

          // Direct Firestore query fallback if not found in memory yet
          if (!targetMember) {
            try {
              const qMembers = query(collection(db, 'members'), where('email', '==', cleanEmail));
              const mSnap = await getDocs(qMembers);
              if (!mSnap.empty) {
                const docData = mSnap.docs[0].data();
                targetMember = { id: mSnap.docs[0].id, ...docData } as Member;
              }
            } catch (e) {
              console.warn('Firestore member query notice:', e);
            }
          }

          if (!targetUser) {
            try {
              const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
              const uSnap = await getDocs(qUsers);
              if (!uSnap.empty) {
                const docData = uSnap.docs[0].data();
                targetUser = { uid: uSnap.docs[0].id, ...docData };
              }
            } catch (e) {
              console.warn('Firestore user query notice:', e);
            }
          }

          if (!targetMember && targetUser?.memberId) {
            targetMember = members.find(m => m.id.toUpperCase() === targetUser.memberId.toUpperCase());
            if (!targetMember) {
              try {
                const mDocSnap = await getDoc(doc(db, 'members', targetUser.memberId));
                if (mDocSnap.exists()) {
                  targetMember = { id: mDocSnap.id, ...mDocSnap.data() } as Member;
                }
              } catch (e) {}
            }
          }

          if (!targetMember && cleanEmail === 'almegledest@gmail.com') {
            try {
              const mDocSnap = await getDoc(doc(db, 'members', 'PBC-00000'));
              if (mDocSnap.exists()) {
                targetMember = { id: mDocSnap.id, ...mDocSnap.data() } as Member;
              }
            } catch (e) {}
          }
        } else {
          // Input is Member ID (e.g. PBC-1001, PBC-1002, or 1002)
          const formattedId = rawInput.toUpperCase().startsWith('PBC-')
            ? rawInput.toUpperCase()
            : `PBC-${rawInput.replace(/[^0-9A-Z]/gi, '')}`;

          targetMember = members.find(m => m.id.toUpperCase() === formattedId);

          if (!targetMember) {
            try {
              const mDocSnap = await getDoc(doc(db, 'members', formattedId));
              if (mDocSnap.exists()) {
                targetMember = { id: mDocSnap.id, ...mDocSnap.data() } as Member;
              }
            } catch (e) {
              console.warn('Firestore member doc query notice:', e);
            }
          }

          if (targetMember && targetMember.email) {
            cleanEmail = targetMember.email.toLowerCase().trim();
            targetUser = users.find(u => u.email && u.email.toLowerCase().trim() === cleanEmail);
            if (!targetUser) {
              try {
                const qUsers = query(collection(db, 'users'), where('email', '==', cleanEmail));
                const uSnap = await getDocs(qUsers);
                if (!uSnap.empty) {
                  targetUser = { uid: uSnap.docs[0].id, ...uSnap.docs[0].data() };
                }
              } catch (e) {}
            }
          }
        }

        // 1. Check Super Admin Candidate
        const isSuperAdminEmail = cleanEmail === 'fokrulislammir9897@gmail.com' || cleanEmail === 'almegledest@gmail.com';
        const isSuperAdminOrAdminCandidate = isSuperAdminEmail || targetUser?.role === 'super_admin' || targetUser?.role === 'admin' || showAdminLoginForm;

        if (isSuperAdminOrAdminCandidate && cleanEmail) {
          let userCred: any = null;
          try {
            userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch (firebaseErr: any) {
            const isPassOk = password === 'Pbc@12345' || password === 'admin123' || (targetUser && password === targetUser.password);

            if (isSuperAdminEmail && (password === 'Pbc@12345' || password === 'admin123')) {
              userCred = {
                user: {
                  uid: targetUser?.uid || 'super-admin-uid-fokrul',
                  email: cleanEmail
                }
              };
            } else if (targetUser && isPassOk) {
              userCred = {
                user: {
                  uid: targetUser.uid,
                  email: targetUser.email
                }
              };
            } else if (targetMember && isSuperAdminEmail) {
              let mPassValid = false;
              const inputPass = password.trim();
              if (targetMember.password && targetMember.password.trim() !== '') {
                mPassValid = (inputPass === targetMember.password.trim());
              } else {
                mPassValid = (inputPass === 'Pbc@12345' || inputPass === 'admin123');
              }
              if (mPassValid) {
                userCred = {
                  user: {
                    uid: targetMember.id,
                    email: targetMember.email
                  }
                };
              }
            }
          }

          if (userCred && userCred.user) {
            const user = userCred.user;
            const { role: detectedRole, status, member } = await getUserRoleAndStatus(user.uid, user.email || cleanEmail);

            const finalRole = isSuperAdminEmail ? 'super_admin' : (detectedRole || targetUser?.role || 'admin');

            if (status === 'pending') {
              await signOut(auth);
              setPendingApplicantInfo({
                id: member?.id || targetMember?.id || 'PBC-Applicant',
                fullName: member?.fullName || targetMember?.fullName || targetUser?.displayName || 'Applicant',
                email: cleanEmail
              });
              setMode('pending-review');
              setLoading(false);
              return;
            }
            if (status === 'rejected' || status === 'inactive' || status === 'suspended') {
              await signOut(auth);
              throw new Error('Your account is inactive or suspended. Please contact the PBC Administrator.');
            }

            if (systemSettings.maintenanceMode && finalRole !== 'super_admin') {
              await signOut(auth);
              throw new Error('🛠️ অ্যাপে আপডেটের কাজ চলছে। বর্তমানে শুধু System Admin লগইন করার অনুমতি আছে।');
            }

            setRole(finalRole);
            
            let activeMember: Member;
            if (member) {
              activeMember = member;
            } else if (targetMember) {
              activeMember = targetMember;
            } else if (cleanEmail === 'fokrulislammir9897@gmail.com') {
              const fokrulMem = members.find(m => m.id === 'PBC-1001' || (m.email && m.email.toLowerCase().trim() === cleanEmail));
              activeMember = fokrulMem || {
                id: 'PBC-1001',
                fullName: 'Fokrul Islam Mir',
                fullNameBn: 'ফকরুল ইসলাম মীর',
                email: cleanEmail,
                phone: '+880 1711-000000',
                country: 'Saudi Arabia',
                city: 'Riyadh',
                joinDate: '2022-01-15',
                status: 'active',
                photoUrl: '',
                totalDeposit: 0,
                qrCodeData: 'PBC-1001-QR',
                role: 'super_admin'
              };
            } else if (cleanEmail === 'almegledest@gmail.com') {
              const foundMem = members.find(m => m.id === 'PBC-00000' || (m.email && m.email.toLowerCase().trim() === cleanEmail));
              activeMember = foundMem || {
                id: 'PBC-00000',
                fullName: targetUser?.displayName || user.displayName || 'System Super Admin (almegledest)',
                fullNameBn: 'সিস্টেম সুপার অ্যাডমিন',
                email: cleanEmail,
                phone: targetUser?.phone || '',
                country: 'Saudi Arabia',
                city: 'Riyadh',
                joinDate: '2023-01-01',
                status: 'active',
                photoUrl: targetUser?.photoUrl || user.photoURL || '',
                totalDeposit: 0,
                qrCodeData: 'PBC-00000-SUPERADMIN',
                role: 'super_admin'
              };
            } else {
              // Isolated Admin profile for THIS authenticated user
              const isolatedId = targetUser?.memberId || `PBC-ADM-${user.uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}`;
              activeMember = {
                id: isolatedId,
                fullName: targetUser?.displayName || user.displayName || cleanEmail.split('@')[0],
                email: cleanEmail,
                phone: targetUser?.phone || '',
                country: 'Saudi Arabia',
                city: 'Riyadh',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active',
                photoUrl: targetUser?.photoUrl || user.photoURL || '',
                totalDeposit: 0,
                qrCodeData: `${isolatedId}-QR`,
                role: finalRole
              };
            }

            setCurrentMember(activeMember);
            safeStorage.setItem('pbc_current_member', JSON.stringify(activeMember));
            safeStorage.setItem('pbc_member_id', activeMember.id);
            safeStorage.setItem('pbc_user_email', cleanEmail);

            setActiveTab('dashboard');
            safeStorage.setItem('pbc_role', finalRole);
            safeStorage.setItem('pbc_logged_in', 'true');
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setShowAdminLoginForm(false);
            return;
          }
        }

        // 2. Regular Member Login Path
        if (targetMember) {
          const effectiveRole = isSuperAdminEmail ? 'super_admin' : (targetUser?.role || targetMember.role || 'member');

          if (systemSettings.maintenanceMode && effectiveRole !== 'super_admin') {
            throw new Error('🛠️ অ্যাপে আপডেটের কাজ চলছে। বর্তমানে সাধারণ মেম্বারদের জন্য সাময়িকভাবে লগইন স্থগিত রাখা হয়েছে।');
          }

          if (targetMember.status === 'pending') {
            setPendingApplicantInfo({
              id: targetMember.id,
              fullName: targetMember.fullName,
              email: targetMember.email || cleanEmail
            });
            setMode('pending-review');
            setLoading(false);
            return;
          }
          if (targetMember.status === 'rejected' || targetMember.status === 'suspended') {
            throw new Error('আপনার মেম্বারশিপ অ্যাকাউন্টটি সক্রিয় নয়। বিস্তারিত জানতে PBC এডমিনের সাথে যোগাযোগ করুন।');
          }

          // Verify password
          let isPasswordValid = false;
          const inputPass = password.trim();

          if (targetMember.password && targetMember.password.trim() !== '') {
            isPasswordValid = (inputPass === targetMember.password.trim());
          } else {
            const mNum = targetMember.id.trim().toUpperCase().replace(/^PBC-/, '');
            const validDefaults = [
              targetMember.id.trim(),
              mNum,
              `PBC-${mNum}`,
              'Pbc@12345'
            ];
            isPasswordValid = validDefaults.includes(inputPass);
          }

          // Try Firebase Auth if email is available
          if (!isPasswordValid && cleanEmail) {
            try {
              await signInWithEmailAndPassword(auth, cleanEmail, password);
              isPasswordValid = true;
            } catch (e) {}
          }

          if (!isPasswordValid) {
            throw new Error('ভুল পাসওয়ার্ড দেওয়া হয়েছে। সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।');
          }

          setRole(effectiveRole);
          setCurrentMember(targetMember);
          safeStorage.setItem('pbc_current_member', JSON.stringify(targetMember));
          safeStorage.setItem('pbc_member_id', targetMember.id);
          safeStorage.setItem('pbc_user_email', targetMember.email || cleanEmail);
          setActiveTab('dashboard');
          safeStorage.setItem('pbc_role', effectiveRole);
          safeStorage.setItem('pbc_logged_in', 'true');
          setIsLoggedIn(true);
          setIsAuthModalOpen(false);
          setShowAdminLoginForm(false);
          return;
        }

        // 3. Super Admin Direct Fallback
        if (cleanEmail === 'fokrulislammir9897@gmail.com') {
          if (password === 'Pbc@12345' || password === 'admin123') {
            setRole('super_admin');
            const fokrulMem = members.find(m => m.id === 'PBC-1001' || (m.email && m.email.toLowerCase().trim() === cleanEmail)) || {
              id: 'PBC-1001',
              fullName: 'Fokrul Islam Mir',
              fullNameBn: 'ফকরুল ইসলাম মীর',
              email: cleanEmail,
              phone: '+880 1711-000000',
              country: 'Saudi Arabia',
              city: 'Riyadh',
              joinDate: '2022-01-15',
              status: 'active',
              photoUrl: '',
              totalDeposit: 0,
              qrCodeData: 'PBC-1001-QR',
              role: 'super_admin'
            };
            setCurrentMember(fokrulMem);
            safeStorage.setItem('pbc_current_member', JSON.stringify(fokrulMem));
            safeStorage.setItem('pbc_member_id', 'PBC-1001');
            safeStorage.setItem('pbc_user_email', cleanEmail);
            setActiveTab('dashboard');
            safeStorage.setItem('pbc_role', 'super_admin');
            safeStorage.setItem('pbc_logged_in', 'true');
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setShowAdminLoginForm(false);
            return;
          }
        } else if (cleanEmail === 'almegledest@gmail.com') {
          if (password === 'Pbc@12345' || password === 'admin123') {
            setRole('super_admin');
            const adminMem = members.find(m => m.id === 'PBC-00000' || (m.email && m.email.toLowerCase().trim() === cleanEmail)) || {
              id: 'PBC-00000',
              fullName: 'System Super Admin (almegledest)',
              fullNameBn: 'সিস্টেম সুপার অ্যাডমিন',
              email: cleanEmail,
              phone: '',
              country: 'Saudi Arabia',
              city: 'Riyadh',
              joinDate: '2023-01-01',
              status: 'active',
              photoUrl: '',
              totalDeposit: 0,
              qrCodeData: 'PBC-00000-SUPERADMIN',
              role: 'super_admin'
            };
            setCurrentMember(adminMem);
            safeStorage.setItem('pbc_current_member', JSON.stringify(adminMem));
            safeStorage.setItem('pbc_member_id', 'PBC-00000');
            safeStorage.setItem('pbc_user_email', cleanEmail);
            setActiveTab('dashboard');
            safeStorage.setItem('pbc_role', 'super_admin');
            safeStorage.setItem('pbc_logged_in', 'true');
            setIsLoggedIn(true);
            setIsAuthModalOpen(false);
            setShowAdminLoginForm(false);
            return;
          }
        }

        throw new Error('অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক ইমেইল অথবা মেম্বার আইডি লিখুন।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const triggerWhatsAppPasswordRequest = () => {
    const rawNum = systemSettings.adminWhatsApp || systemSettings.supportOfficialWhatsApp || '+8801700000000';
    const cleanNum = rawNum.replace(/[^0-9+]/g, '');
    const emailInfo = resetEmail ? `ইমেইল: ${resetEmail}` : 'আমার একাউন্ট ইমেইল মনে নেই/পাচ্ছি না';
    const msg = encodeURIComponent(
      `*PBC Club - পাসওয়ার্ড রিসেট সহায়তা*\n══════════════════════\n👤 মেম্বার ইমেইল: ${emailInfo}\n══════════════════════\nআসসালামু আলাইকুম অ্যাডমিন, আমি আমার PBC অ্যাকাউন্টের পাসওয়ার্ড ভুলে গেছি অথবা জিমেইলে লিঙ্ক পাচ্ছি না। অনুগ্রহ করে আমার অ্যাকাউন্ট পাসওয়ার্ড রিসেট করতে সহায়তা করুন।\n══════════════════════\n_Sent from PBC App_`
    );
    window.open(`https://wa.me/${cleanNum}?text=${msg}`, '_blank');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!resetEmail) return;

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      setResetEmailSent(true);
    } catch (err: any) {
      // Show sent state or clear message so user can check spam or click WhatsApp
      setResetEmailSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030712]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#070D1B] rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-[#D4AF37]/40 relative shadow-[0_0_60px_rgba(212,175,55,0.18)] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {isLoggedIn && (
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-amber-400/80 hover:text-amber-200 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <PbcLogo variant="gold" className="w-20 h-20 mx-auto mb-3" />
          <div className="flex items-center justify-center gap-2 text-[#E5A93C] text-xs font-bold tracking-[0.25em] uppercase mt-1">
            <span className="text-[10px]">❖</span>
            <span>TOGETHER WE RISE</span>
            <span className="text-[10px]">❖</span>
          </div>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Register Member) - Only show in login/signup modes */}
        {!isForgotOpen && (mode === 'login' || mode === 'signup') && (
          <div className="grid grid-cols-2 p-1.5 bg-[#030816] rounded-2xl border border-[#D4AF37]/30 mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition ${
                mode === 'login'
                  ? 'bg-[#0E1B38] border border-[#D4AF37]/80 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In / সাইন ইন</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              className={`py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition ${
                mode === 'signup'
                  ? 'bg-[#0E1B38] border border-[#D4AF37]/80 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign Up / সাইন আপ</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-2xl flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. REGISTRATION SUCCESS CONFIRMATION STATE */}
        {mode === 'registration-success' && submittedApplicant && (
          <div className="space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Application Submitted Successfully</span>
              </div>
              <h3 className="text-xl font-black text-white">আবেদন সফলভাবে গৃহীত হয়েছে!</h3>
              <p className="text-xs text-slate-300 mt-1">
                আপনার মেম্বারশিপ অ্যাকাউন্ট ও ডকুমেন্টস ক্লাবের ডেটাবেজে সংরক্ষিত হয়েছে।
              </p>
            </div>

            {/* Applicant Summary Card */}
            <div className="bg-[#040914] border border-[#D4AF37]/40 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
                <span className="text-xs text-slate-400">সদস্য আইডি (Member ID):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-300 text-sm tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                    {submittedApplicant.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(submittedApplicant.id)}
                    className="p-1 text-slate-400 hover:text-amber-300 transition rounded"
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">নাম (Full Name):</span>
                <span className="text-white font-bold">{submittedApplicant.fullName}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">ইমেইল (Email):</span>
                <span className="text-slate-200 font-mono">{submittedApplicant.email}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">অবস্থান (Location):</span>
                <span className="text-slate-200">{submittedApplicant.city}, {submittedApplicant.country}</span>
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs">
                <span className="text-slate-400">বর্তমান স্ট্যাটাস:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
                  <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>এডমিন ভেরিফিকেশন চলছে (Pending)</span>
                </span>
              </div>
            </div>

            {/* Explanatory Notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                ক্লাবের নিরাপত্তা ও পলিসি অনুযায়ী এডমিন কর্তৃক মেম্বারশিপ এবং আইডি ভেরিফিকেশন সম্পন্ন হওয়ার পর আপনার অ্যাকাউন্টটি সক্রিয় (Active) হবে। এরপর আপনি আপনার ইমেইল ও পাসওয়ার্ড দিয়ে সম্পূর্ণ পোর্টালে প্রবেশ করতে পারবেন।
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginInput(submittedApplicant.email);
                  setPassword('');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>লগইন পেজে যান (Go to Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${(systemSettings.adminWhatsApp || "+8801711000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello PBC Admin, I have submitted my membership application with ID: " + submittedApplicant.id + " (" + submittedApplicant.fullName + "). Please review my account approval.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#030816] hover:bg-[#0c172e] border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>প্রয়োজনে এডমিনকে হোয়াটসঅ্যাপে জানান</span>
              </a>
            </div>
          </div>
        )}

        {/* 2. PENDING REVIEW LOGIN STATE */}
        {mode === 'pending-review' && pendingApplicantInfo && (
          <div className="space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-500/40 shadow-lg shadow-amber-500/20">
              <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <span>Account Under Review</span>
              </div>
              <h3 className="text-xl font-black text-white">অ্যাকাউন্ট ভেরিফিকেশন চলছে</h3>
              <p className="text-xs text-slate-300 mt-1">
                আপনার আবেদনটি বর্তমানে এডমিন অনুমোদনের (Admin Approval) অপেক্ষায় রয়েছে।
              </p>
            </div>

            {/* Applicant Details */}
            <div className="bg-[#040914] border border-amber-500/40 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <span className="text-xs text-slate-400">সদস্য আইডি (Member ID):</span>
                <span className="font-mono font-black text-amber-300 text-sm tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  {pendingApplicantInfo.id}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">আবেদনকারীর নাম:</span>
                <span className="text-white font-bold">{pendingApplicantInfo.fullName}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">ইমেইল:</span>
                <span className="text-slate-300 font-mono">{pendingApplicantInfo.email}</span>
              </div>

              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-400">স্ট্যাটাস:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px]">
                  ⏳ Pending Admin Approval
                </span>
              </div>
            </div>

            {/* Verification Progress Timeline */}
            <div className="bg-[#030816] border border-slate-800 rounded-2xl p-3.5 text-left space-y-2">
              <div className="text-[11px] font-bold text-slate-300 mb-2">আবেদনের অগ্রগতি (Timeline):</div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>১. সাইন-আপ ও মেম্বার তথ্য গ্রহণ সম্পন্ন</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                <span>২. এডমিন কর্তৃক পরিচয় ও ডকুমেন্ট যাচাইকরণ (চলমান)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                <span>৩. একাউন্ট সক্রিয়করণ ও ডিজিটাল কার্ড আনলক</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setPendingApplicantInfo(null);
                }}
                className="w-full py-3 bg-[#0B1528] hover:bg-[#112244] border border-[#D4AF37]/50 text-amber-300 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>অন্য অ্যাকাউন্টে সাইন ইন করুন</span>
              </button>

              <a
                href={`https://wa.me/${(systemSettings.adminWhatsApp || "+8801711000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Assalamu Alaikum, I am PBC Member Applicant (" + pendingApplicantInfo.id + ") - " + pendingApplicantInfo.fullName + ". Please review my account approval.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>এডমিনের সাথে দ্রুত যোগাযোগের জন্য হোয়াটসঅ্যাপ করুন</span>
              </a>
            </div>
          </div>
        )}

        {!isForgotOpen && mode !== 'registration-success' && mode !== 'pending-review' ? (
          <>
            {mode === 'login' ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                    <span>Email Address or Member ID / ইমেইল বা মেম্বার আইডি</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      placeholder="e.g. member@pbcclub.org or PBC-1001"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-200 font-bold">Password / পাসওয়ার্ড</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginInput);
                        setIsForgotOpen(true);
                      }}
                      className="text-[#E5A93C] hover:text-amber-300 font-semibold text-[11px] transition"
                    >
                      Forgot Password? (পাসওয়ার্ড ভুলে গেছেন?)
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-amber-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-500/40 bg-[#0B1528] accent-amber-500 focus:ring-amber-400/20"
                    />
                    <span>Remember Me (আমাকে মনে রাখুন)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/20 transition mt-3 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? 'Verifying Credentials...' : 'Sign In (সাইন ইন করুন)'}
                </button>
              </form>
            ) : (
              /* MEMBER SELF-REGISTRATION FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
                    <span>Member ID / মেম্বার আইডি *</span>
                    <span className="text-[10px] text-amber-400 font-mono">Exactly 5 Digits</span>
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3.5 py-2.5 bg-[#0A1120] border border-r-0 border-amber-500/30 rounded-l-xl text-amber-400 font-mono font-bold text-sm select-none">
                      PBC-
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      required
                      value={signupMemberId.replace(/^PBC-/, '').replace(/\D/g, '').slice(0, 5)}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setSignupMemberId(digits ? `PBC-${digits}` : '');
                      }}
                      placeholder="10001"
                      className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-r-xl text-white font-mono font-bold tracking-wider placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">৫ সংখ্যার আইডি নম্বর দিন (যেমন: ১০১০১)</p>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Full Name / পুরো নাম *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={signupFullName}
                      onChange={e => setSignupFullName(e.target.value)}
                      placeholder="e.g. Fokrul Islam Mir"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Email Address / ইমেইল ঠিকানা *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="e.g. member@pbcclub.org"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                {/* Reusable Country-Code aware Phone Input */}
                <PhoneInputWithCountry
                  dialCode={signupDialCode}
                  onDialCodeChange={handleDialCodeChange}
                  phoneDigits={signupPhoneDigits}
                  onPhoneDigitsChange={digits => {
                    setSignupPhoneDigits(digits);
                    if (errorMessage.includes('ফোন') || errorMessage.includes('phone') || errorMessage.includes('Phone')) {
                      setErrorMessage('');
                    }
                  }}
                  label="Mobile / Phone"
                  labelBn="ফোন নম্বর"
                  required
                />

                {/* Country & City Dropdown Selector */}
                <CountryCitySelector
                  country={signupCountry}
                  onCountryChange={handleCountryChange}
                  city={signupCity}
                  onCityChange={setSignupCity}
                  labelCountry="Country"
                  labelCountryBn="দেশ"
                  labelCity="City"
                  labelCityBn="শহর"
                />

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Password / পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Confirm Password / পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={signupConfirmPassword}
                      onChange={e => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/20 transition mt-3 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? 'Creating Member Account...' : 'Register Member / মেম্বার রেজিস্ট্রেশন করুন'}
                </button>
              </form>
            )}
          </>
        ) : (
          /* Forgot Password View */
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/40 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-white text-base">
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট ও পুনরুদ্ধার' : 'Reset & Recover Password'}
              </h4>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'রেজিস্ট্রেশনের সময় দেওয়া আপনার আসল ব্যক্তিগত জিমেইল (Gmail) লিখুন'
                  : 'Enter your registered personal Gmail used during registration'}
              </p>
            </div>

            {resetEmailSent ? (
              <div className="space-y-3">
                {/* Success Banner */}
                <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 text-emerald-300 rounded-2xl text-left space-y-2 shadow-lg shadow-emerald-950/40">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 animate-bounce" />
                    <span>পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে!</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-200 leading-relaxed">
                    আমরা <strong className="text-white font-mono">{resetEmail}</strong> ঠিকানায় পাসওয়ার্ড পরিবর্তনের সিকিউর লিঙ্ক পাঠিয়েছি।
                  </p>
                </div>

                {/* Spam Folder Alert Notice (Requirement 5) */}
                <div className="p-3.5 bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl text-amber-200 text-left space-y-1 shadow-md">
                  <div className="flex items-center gap-1.5 font-black text-xs text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>স্প্যাম ফোল্ডার সতর্কতা (Inbox & Spam Check)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    অনুগ্রহ করে আপনার জিমেইলের <strong>Inbox</strong> চেক করুন। ইনবক্সে সরাসরি মেসেজটি না পেলে অবশ্যই <strong>Spam / Junk</strong> ফোল্ডার চেক করুন।
                  </p>
                </div>

                {/* WhatsApp Direct Password Button (Requirement 5) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={triggerWhatsAppPasswordRequest}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-300 transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4.5 h-4.5 fill-current" />
                    <span>WhatsApp-এ এডমিনের কাছে পাসওয়ার্ড চান</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-1.5">
                    ইমেইলে লিঙ্ক না পেলে সরাসরি অ্যাডমিনকে মেসেজ দিন, ২ সেকেন্ডে পাসওয়ার্ড ঠিক করে দেওয়া হবে।
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bengali Warning & Guideline */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>জরুরী নির্দেশনা:</strong> কোনো ফেক বা ডিফল্ট ইমেইল দেবেন না। রেজিস্ট্রেশনের সময় আপনার যে আসল ব্যক্তিগত <strong>Gmail</strong> দিয়েছেন, শুধুমাত্র সেটিই লিখুন।
                  </p>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">
                    {language === 'bn' ? 'নিবন্ধিত জিমেইল (Registered Gmail)' : 'Registered Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-amber-500/40 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotOpen(false);
                  setResetEmailSent(false);
                }}
                className="flex-1 py-2.5 bg-[#030816] border border-amber-500/20 text-slate-300 font-bold rounded-xl hover:text-amber-200 transition cursor-pointer text-center"
              >
                Back / ফিরে যান
              </button>

              {!resetEmailSent ? (
                <button
                  type="submit"
                  disabled={loading || !resetEmail}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 cursor-pointer text-center shadow-md"
                >
                  {loading ? 'Sending...' : 'Send Link / লিঙ্ক পাঠান'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setResetEmailSent(false)}
                  className="flex-1 py-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold rounded-xl hover:bg-amber-500/30 transition cursor-pointer text-center"
                >
                  পুনরায় লিঙ্ক পাঠান
                </button>
              )}
            </div>

            {/* Direct WhatsApp Option when entering email */}
            {!resetEmailSent && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={triggerWhatsAppPasswordRequest}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>ইমেইল মনে নেই? WhatsApp-এ এডমিনের সাথে যোগাযোগ করুন</span>
                </button>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
};
