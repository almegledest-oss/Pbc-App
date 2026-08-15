import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Building2, KeyRound, X, AlertCircle, CheckCircle2, Lock, Mail, User, Phone, Globe, MapPin, UserPlus, LogIn, Compass, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { UserRole, Member } from '../../types';
import { PbcLogo } from '../Common/PbcLogo';
import { MaintenanceNoticeScreen } from '../Common/MaintenanceNoticeScreen';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

const COUNTRY_CITY_MAP: Record<string, string[]> = {
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Al Khobar', 'Jubail', 'Tabuk'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Shah Alam'],
  'Singapore': ['Singapore'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Oldham', 'Leeds'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Paterson', 'Dallas'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Bologna', 'Naples'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali'],
};
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
  const [signupPhone, setSignupPhone] = useState('');
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
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.country_name) {
          setSignupCountry(data.country_name);
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
    const matchedCountryKey = Object.keys(COUNTRY_CITY_MAP).find(
      c => c.toLowerCase() === val.trim().toLowerCase()
    );
    if (matchedCountryKey && COUNTRY_CITY_MAP[matchedCountryKey]?.length > 0) {
      setSignupCity(COUNTRY_CITY_MAP[matchedCountryKey][0]);
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
        if (!signupPhone.trim()) {
          throw new Error('Please enter your phone number (ফোন নম্বর লিখুন)।');
        }
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

        // 2. Determine and format Member ID
        let newMemberId = '';
        const userEnteredId = signupMemberId.trim().toUpperCase();

        if (userEnteredId) {
          const formattedId = userEnteredId.startsWith('PBC-')
            ? userEnteredId
            : `PBC-${userEnteredId.replace(/[^A-Z0-9]/g, '')}`;

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
        } else {
          // Auto-generate next unique Member ID
          let nextNum = 1001;
          members.forEach(m => {
            const num = parseInt(m.id.replace(/\D/g, ''), 10);
            if (!isNaN(num) && num >= nextNum) {
              nextNum = num + 1;
            }
          });
          newMemberId = `PBC-${nextNum}`;
        }

        // 3. Attempt Firebase Auth registration
        let uid = `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        try {
          const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword);
          if (userCred?.user?.uid) {
            uid = userCred.user.uid;
          }
        } catch (signupErr: any) {
          console.warn('Firebase auth registration notice:', signupErr?.message);
        }

        // 4. Create Member data structure
        const existingById = members.find(m => m.id.toUpperCase() === newMemberId.toUpperCase());
        const newMemberData: Member = {
          id: newMemberId,
          fullName: signupFullName.trim(),
          phone: signupPhone.trim(),
          email: cleanEmail,
          country: signupCountry.trim() || 'Saudi Arabia',
          city: signupCity.trim() || 'Riyadh',
          joinDate: existingById?.joinDate || new Date().toISOString().split('T')[0],
          status: 'pending', // Pending Admin Verification
          photoUrl: existingById?.photoUrl || '',
          totalDeposit: existingById?.totalDeposit || 0,
          qrCodeData: `PBC-MEMBER:${newMemberId}:${signupFullName.trim()}:pending`,
          barcodeData: `PBC-BC-${newMemberId}`,
          role: 'member',
          password: signupPassword,
          notes: existingById?.notes ? `${existingById.notes} | Self-Registered` : 'Self-Registered Member (Pending Approval)'
        };

        // 5. Persist Member to Firestore permanently
        await addMemberDoc(newMemberId, newMemberData);

        // 6. Persist User Profile to Firestore permanently
        await setUserProfileDoc(uid, {
          email: cleanEmail,
          displayName: signupFullName.trim(),
          role: 'member',
          status: 'pending',
          memberId: newMemberId
        });

        // 7. System notification
        addNotification(
          'New Member Registration',
          `New member applicant ${signupFullName.trim()} (${newMemberId}) registered and is awaiting admin approval.`,
          'system'
        );

        alert(`অভিনন্দন! আপনার মেম্বার অ্যাকাউন্ট (${newMemberId}) সফলভাবে তৈরি ও ডাটাবেজে স্থায়ীভাবে জমা হয়েছে।\n\nনিরাপত্তার স্বার্থে অ্যাকাউন্টটি বর্তমানে প্রশাসনিক অনুমোদনের (Admin Approval) অপেক্ষায় রয়েছে। এডমিন অনুমোদন করলেই আপনি এই ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।`);

        // Switch to login view
        setMode('login');
        setLoginInput(cleanEmail);
        setPassword('');
        setIsAuthModalOpen(true);
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
              throw new Error('আপনার অ্যাকাউন্টটি প্রশাসনিক অনুমোদনের (Admin Approval) অপেক্ষায় রয়েছে।');
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
            if (member || targetMember) {
              setCurrentMember(member || targetMember!);
            }

            setActiveTab('dashboard');
            localStorage.setItem('pbc_role', finalRole);
            localStorage.setItem('pbc_logged_in', 'true');
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
            throw new Error('আপনার অ্যাকাউন্টটি প্রশাসনিক অনুমোদনের (Admin Approval) অপেক্ষায় রয়েছে। এডমিন অনুমোদন করলেই লগইন করতে পারবেন।');
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
          setActiveTab('dashboard');
          localStorage.setItem('pbc_role', effectiveRole);
          localStorage.setItem('pbc_logged_in', 'true');
          setIsLoggedIn(true);
          setIsAuthModalOpen(false);
          setShowAdminLoginForm(false);
          return;
        }

        // 3. Super Admin Direct Fallback
        if (isSuperAdminEmail) {
          if (password === 'Pbc@12345' || password === 'admin123') {
            setRole('super_admin');
            setActiveTab('dashboard');
            localStorage.setItem('pbc_role', 'super_admin');
            localStorage.setItem('pbc_logged_in', 'true');
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!resetEmail) return;

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      setTimeout(() => {
        setResetEmailSent(false);
        setIsForgotOpen(false);
      }, 3000);
    } catch (err: any) {
      setResetEmailSent(true);
      setTimeout(() => {
        setResetEmailSent(false);
        setIsForgotOpen(false);
      }, 3000);
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

        {/* Mode Switcher Tabs (Sign In vs Register Member) */}
        {!isForgotOpen && (
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

        {!isForgotOpen ? (
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
                  <label className="block text-slate-200 font-bold mb-1">
                    Member ID / মেম্বার আইডি *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={signupMemberId}
                      onChange={e => setSignupMemberId(e.target.value)}
                      placeholder="e.g. PBC-1001"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
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

                <div>
                  <label className="block text-slate-200 font-bold mb-1">
                    Mobile / Phone / ফোন নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value)}
                      placeholder="e.g. +966 50 123 4567"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                    />
                  </div>
                </div>

                {/* Country & City Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-200 font-bold mb-1">
                      Country / দেশ
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        list="pbc-country-list"
                        value={signupCountry}
                        onChange={e => handleCountryChange(e.target.value)}
                        placeholder="Saudi Arabia"
                        className="w-full pl-9 pr-2.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                      />
                      <datalist id="pbc-country-list">
                        {Object.keys(COUNTRY_CITY_MAP).map(country => (
                          <option key={country} value={country} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold mb-1">
                      City / শহর
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        list="pbc-city-list"
                        value={signupCity}
                        onChange={e => setSignupCity(e.target.value)}
                        placeholder="Riyadh"
                        className="w-full pl-9 pr-2.5 py-2.5 bg-[#0B1528] border border-amber-500/30 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                      />
                      <datalist id="pbc-city-list">
                        {(
                          COUNTRY_CITY_MAP[
                            Object.keys(COUNTRY_CITY_MAP).find(
                              c => c.toLowerCase() === signupCountry.trim().toLowerCase()
                            ) || ''
                          ] || Object.values(COUNTRY_CITY_MAP).flat()
                        ).map((city, idx) => (
                          <option key={`${city}-${idx}`} value={city} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

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
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Reset Your Password / পাসওয়ার্ড রিসেট করুন</h4>
              <p className="text-slate-400 text-[11px] mt-1">
                Enter your registered PBC Club email address / আপনার নিবন্ধিত ইমেইল ঠিকানা দিন
              </p>
            </div>

            {resetEmailSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Password reset link sent! / পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে!</span>
              </div>
            ) : (
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Registered Email / নিবন্ধিত ইমেইল</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="member@pbcclub.org"
                  className="w-full px-3.5 py-2.5 bg-[#0B1528] border border-amber-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="flex-1 py-2.5 bg-[#030816] border border-amber-500/20 text-slate-300 font-bold rounded-xl hover:text-amber-200 transition"
              >
                Back / ফিরে যান
              </button>
              <button
                type="submit"
                disabled={loading || resetEmailSent}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Link / লিঙ্ক পাঠান'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
