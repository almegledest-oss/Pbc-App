import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { BoardDirector } from '../../types';
import { PBCDirectorFrame } from '../Common/PBCDirectorFrame';
import { PBCFramedAvatar } from '../Common/PBCFramedAvatar';
import { generatePBCFrameImage } from '../../utils/pbcFrameGenerator';
import { safeStorage } from '../../utils/safeStorage';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  X, 
  Crown, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  Award,
  Globe
} from 'lucide-react';

export const BoardOfDirectorsBanner: React.FC = () => {
  const { directors, language, role, accountRole, canManageDirectors, setActiveTab } = useApp();
  const { currentTheme } = useTheme();
  const isLight = currentTheme.mode === 'light';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDirector, setSelectedDirector] = useState<BoardDirector | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [slideIntervalMs, setSlideIntervalMs] = useState<number>(() => {
    const saved = safeStorage.getItem('pbc_director_slide_interval');
    return saved ? parseInt(saved, 10) : 4500;
  });
  const [slideEffect, setSlideEffect] = useState<string>(() => {
    return safeStorage.getItem('pbc_director_slide_effect') || 'slide';
  });

  // Filter active directors only for the live banner
  const activeDirectors = directors.filter(d => d.isActive !== false);
  const currentDirector = activeDirectors[currentIndex] || activeDirectors[0];

  // Sync slide interval & effect if changed in settings/storage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedInterval = safeStorage.getItem('pbc_director_slide_interval');
      if (savedInterval) {
        setSlideIntervalMs(parseInt(savedInterval, 10));
      }
      const savedEffect = safeStorage.getItem('pbc_director_slide_effect');
      if (savedEffect) {
        setSlideEffect(savedEffect);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getEffectAnimation = (effect: string) => {
    switch (effect) {
      case 'whirl':
        return {
          initial: { opacity: 0, scale: 0.15, rotate: -540, filter: 'blur(12px)' },
          animate: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.15, rotate: 540, filter: 'blur(12px)' },
          transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
        };
      case 'vortex':
        return {
          initial: { opacity: 0, scale: 0.05, rotate: -720, filter: 'blur(20px) hue-rotate(180deg)' },
          animate: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px) hue-rotate(0deg)' },
          exit: { opacity: 0, scale: 0.05, rotate: 720, filter: 'blur(20px) hue-rotate(-180deg)' },
          transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        };
      case 'spiral':
        return {
          initial: { opacity: 0, scale: 0.2, rotate: -360, z: -500 },
          animate: { opacity: 1, scale: 1, rotate: 0, z: 0 },
          exit: { opacity: 0, scale: 1.8, rotate: 360, z: 500 },
          transition: { duration: 0.85, ease: 'circOut' }
        };
      case 'elastic':
        return {
          initial: { opacity: 0, scale: 0.3, y: -100 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.3, y: 100 },
          transition: { duration: 0.75, type: 'spring', stiffness: 200, damping: 12 }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, skewX: 30, skewY: 10, scale: 0.9, filter: 'contrast(1.8)' },
          animate: { opacity: 1, skewX: 0, skewY: 0, scale: 1, filter: 'contrast(1)' },
          exit: { opacity: 0, skewX: -30, skewY: -10, scale: 1.1, filter: 'contrast(1.8)' },
          transition: { duration: 0.45, ease: 'easeInOut' }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.5 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.5 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.4 },
          transition: { duration: 0.55, ease: 'easeOut' }
        };
      case 'flip':
        return {
          initial: { opacity: 0, rotateX: 90, scale: 0.85 },
          animate: { opacity: 1, rotateX: 0, scale: 1 },
          exit: { opacity: 0, rotateX: -90, scale: 0.85 },
          transition: { duration: 0.6, ease: 'easeInOut' }
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 },
          transition: { duration: 0.5, ease: 'easeInOut' }
        };
      case 'bounce':
        return {
          initial: { opacity: 0, y: -70, scale: 0.8 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 70, scale: 0.8 },
          transition: { duration: 0.65, type: 'spring', bounce: 0.4 }
        };
      case 'cube':
        return {
          initial: { opacity: 0, rotateY: 90, scale: 0.8 },
          animate: { opacity: 1, rotateY: 0, scale: 1 },
          exit: { opacity: 0, rotateY: -90, scale: 0.8 },
          transition: { duration: 0.6, ease: 'easeInOut' }
        };
      case 'blur':
        return {
          initial: { opacity: 0, filter: 'blur(20px) brightness(2)', scale: 0.9 },
          animate: { opacity: 1, filter: 'blur(0px) brightness(1)', scale: 1 },
          exit: { opacity: 0, filter: 'blur(20px) brightness(2)', scale: 1.1 },
          transition: { duration: 0.55 }
        };
      default:
        return {
          initial: { opacity: 0, scale: 0.15, rotate: -540, filter: 'blur(12px)' },
          animate: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.15, rotate: 540, filter: 'blur(12px)' },
          transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
        };
    }
  };

  // Auto slide loop
  useEffect(() => {
    if (activeDirectors.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeDirectors.length);
    }, slideIntervalMs);

    return () => clearInterval(timer);
  }, [activeDirectors.length, slideIntervalMs]);

  if (activeDirectors.length === 0) {
    return null;
  }

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {/* Live Board of Directors Banner Container */}
      <div 
        className={`relative rounded-3xl border-2 transition-all my-4 group overflow-hidden ${
          isLight
            ? 'bg-white border-amber-500/40 shadow-xl shadow-amber-950/5'
            : 'bg-gradient-to-r from-[#070D1B] via-[#0D1A33] to-[#081328] border-[#D4AF37]/40 shadow-2xl'
        }`}
        style={{
          backgroundColor: isLight ? '#FFFFFF' : undefined,
          backgroundImage: isLight ? 'none' : undefined
        }}
      >
        {/* Subtle Ambient Background Lighting */}
        <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isLight ? 'bg-amber-400/5' : 'bg-amber-500/10'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isLight ? 'bg-yellow-400/5' : 'bg-amber-400/10'
        }`} />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

        {/* Top Header Badge Row */}
        <div className={`flex items-center justify-between px-5 pt-4 pb-2.5 border-b relative z-10 ${
          isLight 
            ? 'bg-amber-50/40 border-amber-500/20' 
            : 'border-[#D4AF37]/20'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl border ${
              isLight
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}>
              <Crown className={`w-4 h-4 animate-pulse ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
            </span>
            <div>
              <h3 className={`text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5 ${
                isLight ? 'text-amber-900' : 'text-amber-300'
              }`}>
                {language === 'bn' ? 'বোর্ড অব ডাইরেক্টরস' : 'Board of Directors'}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-400'} animate-ping`} />
                  LIVE
                </span>
              </h3>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2 relative">
            {canManageDirectors && (
              <button
                onClick={() => setActiveTab('directors')}
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                  isLight
                    ? 'text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border-amber-300'
                    : 'text-amber-400 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                }`}
              >
                <span>{language === 'bn' ? 'ম্যানেজ করুন' : 'Manage'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Banner Slide Content Stage with Animated Transitions */}
        <div className="overflow-hidden min-h-[170px] relative z-10 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentDirector.id || currentIndex}
              {...getEffectAnimation(slideEffect)}
              onClick={() => setSelectedDirector(currentDirector)}
              className="w-full p-4 sm:p-6 cursor-pointer relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 hover:bg-amber-500/[0.02] transition-colors"
            >
              {/* Director Photo Frame - Circular Gold Ring matching Official PBC Frame */}
              <div className="relative shrink-0 group/photo">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#8A6A1C] via-[#F3CF60] to-[#9A7B1C] shadow-xl shadow-amber-950/60 overflow-hidden">
                  <PBCFramedAvatar 
                    photoUrl={currentDirector.photoUrl} 
                    name={currentDirector.name}
                    designation={currentDirector.designation}
                    className="w-full h-full rounded-full transition transform group-hover/photo:scale-105 duration-300"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-slate-900 z-20">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                </div>
              </div>

              {/* Director Meta Details */}
              <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                <div 
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide ${
                    isLight
                      ? 'bg-amber-100/90 border-amber-300/80 text-amber-900 shadow-xs'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                  style={{ color: isLight ? '#92400E' : '#FCD34D' }}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                  <span>{currentDirector.designation}</span>
                </div>

                <h4 
                  className={`text-xl sm:text-2xl md:text-3xl font-black tracking-wide uppercase truncate transition ${
                    isLight 
                      ? 'hover:text-amber-700' 
                      : 'hover:text-amber-300'
                  }`}
                  style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
                >
                  {currentDirector.name}
                </h4>

                {currentDirector.location && (
                  <p 
                    className="text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 font-semibold"
                    style={{ color: isLight ? '#475569' : '#CBD5E1' }}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                    <span className="truncate">{currentDirector.location}</span>
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDirector(currentDirector);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{language === 'bn' ? 'পোর্টফোলিও দেখুন' : 'View Full Portfolio'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <span 
                    className="text-[11px] italic font-medium hidden xs:inline"
                    style={{ color: isLight ? '#64748B' : '#94A3B8' }}
                  >
                    ({currentIndex + 1} / {activeDirectors.length})
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Buttons & Slide Indicators */}
        <div className={`flex items-center justify-between px-5 py-2.5 border-t relative z-10 ${
          isLight 
            ? 'bg-amber-50/50 border-amber-500/20' 
            : 'bg-[#030816]/70 border-[#D4AF37]/20'
        }`}>
          {/* Indicators */}
          <div className="flex items-center gap-1.5">
            {activeDirectors.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex 
                    ? 'w-6 bg-gradient-to-r from-amber-500 to-yellow-500' 
                    : isLight 
                      ? 'w-2 bg-slate-300 hover:bg-slate-400' 
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + activeDirectors.length) % activeDirectors.length)}
              className={`p-1.5 rounded-lg border transition cursor-pointer active:scale-90 ${
                isLight
                  ? 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600/60'
              }`}
              title="Previous Director"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeDirectors.length)}
              className={`p-1.5 rounded-lg border transition cursor-pointer active:scale-90 ${
                isLight
                  ? 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600/60'
              }`}
              title="Next Director"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Director Full Portfolio Modal */}
      {selectedDirector && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className={`border-2 rounded-3xl max-w-2xl w-full my-auto shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${
            isLight 
              ? 'bg-white border-amber-500/50 text-slate-900' 
              : 'bg-[#070D1B] border-[#D4AF37]/60 text-white'
          }`}>
            
            {/* Modal Header Banner */}
            <div className={`relative p-5 sm:p-6 border-b shrink-0 ${
              isLight 
                ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/40 border-amber-500/30' 
                : 'bg-gradient-to-r from-[#030816] via-[#0E1C38] to-[#0A1326] border-[#D4AF37]/30'
            }`}>
              <button
                onClick={() => setSelectedDirector(null)}
                className={`absolute top-4 right-4 p-2 rounded-full border transition cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300' 
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-2xl border ${
                  isLight
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Crown className={`w-6 h-6 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-black uppercase tracking-wider ${
                    isLight ? 'text-amber-900' : 'text-amber-300'
                  }`}>
                    {language === 'bn' ? 'ডাইরেক্টর পোর্টফোলিও' : 'Board Director Portfolio'}
                  </h3>
                  <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Probashi Business Club Executive Council
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body - 11 Detail Fields */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Official PBC Executive Frame Card */}
              <div className="w-full max-w-md mx-auto">
                <PBCDirectorFrame
                  photoUrl={selectedDirector.photoUrl}
                  name={selectedDirector.name}
                  designation={selectedDirector.designation}
                  location={selectedDirector.location}
                />
              </div>

              {/* 11 Requested Profile Fields Grid */}
              <div className="space-y-3">
                <h4 className={`text-xs font-black uppercase tracking-widest border-b pb-1.5 flex items-center gap-1.5 ${
                  isLight ? 'text-amber-800 border-amber-500/20' : 'text-amber-400 border-amber-500/20'
                }`}>
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'ব্যক্তিগত ও যোগাযোগ বিবরন' : 'Personal & Official Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  {/* 1. Name */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Name (নাম)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedDirector.name}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.name, 'name')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 2. Designation */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Designation (পদবি)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{selectedDirector.designation}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.designation, 'designation')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'designation' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 3. Location */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Location (অবস্থান)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.location || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.location || '', 'location')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'location' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 4. Mobile */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Mobile (মোবাইল)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{selectedDirector.mobile || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.mobile || '', 'mobile')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'mobile' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 5. National ID */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>National ID (এনআইডি)</div>
                      <div className={`text-sm font-mono font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.nationalId || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.nationalId || '', 'nationalId')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'nationalId' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 6. Email */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Email (ইমেইল)</div>
                      <div className={`text-sm font-bold mt-0.5 truncate max-w-[180px] ${isLight ? 'text-blue-700' : 'text-cyan-300'}`}>{selectedDirector.email || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.email || '', 'email')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                </div>

                {/* Address Section */}
                <h4 className={`text-xs font-black uppercase tracking-widest border-b pt-2 pb-1.5 flex items-center gap-1.5 ${
                  isLight ? 'text-amber-800 border-amber-500/20' : 'text-amber-400 border-amber-500/20'
                }`}>
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'ঠিকানা বিবরন' : 'Address Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  {/* 7. Home Address */}
                  <div className={`p-3 rounded-xl border sm:col-span-2 flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Home Address (বাড়ির ঠিকানা)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.homeAddress || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.homeAddress || '', 'homeAddress')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'homeAddress' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 8. Village */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Village (গ্রাম)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.village || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.village || '', 'village')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'village' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 9. Sub-District */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sub-District (উপজিলা/উপজেলা)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.subDistrict || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.subDistrict || '', 'subDistrict')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'subDistrict' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 10. District */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>District (জিলা/জেলা)</div>
                      <div className={`text-sm font-bold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedDirector.district || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.district || '', 'district')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'district' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 11. Postal Code */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-slate-800'
                  }`}>
                    <div>
                      <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Postal Code (পোস্টাল কোড)</div>
                      <div className={`text-sm font-mono font-bold mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{selectedDirector.postalCode || 'N/A'}</div>
                    </div>
                    <button onClick={() => handleCopy(selectedDirector.postalCode || '', 'postalCode')} className={`${isLight ? 'text-slate-500 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'} p-1`}>
                      {copiedField === 'postalCode' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#030816] border-[#D4AF37]/20'
            }`}>
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Verified PBC Board Director Profile
              </span>
              <button
                onClick={() => setSelectedDirector(null)}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl border transition cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' 
                    : 'bg-[#0B1528] hover:bg-[#112244] text-amber-300 border-[#D4AF37]/40'
                }`}
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
