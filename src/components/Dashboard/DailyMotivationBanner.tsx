import React, { useState, useEffect, useMemo } from 'react';
import { 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Edit3, 
  Plus, 
  TrendingUp, 
  Briefcase, 
  Award,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QuoteItem } from '../../types';

export const DailyMotivationBanner: React.FC = () => {
  const { quotes, language, role, setIsQuotesManagerOpen, addNotification } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const canManage = role === 'admin' || role === 'super_admin';

  // Filter active quotes
  const activeQuotes: QuoteItem[] = useMemo(() => {
    const list = quotes.filter(q => q.isActive !== false);
    return list.length > 0 ? list : quotes;
  }, [quotes]);

  const currentQuote: QuoteItem | undefined = activeQuotes[currentIndex] || activeQuotes[0];

  // Auto slide every 7 seconds when not paused
  useEffect(() => {
    if (activeQuotes.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeQuotes.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [activeQuotes.length, isPaused]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= activeQuotes.length) {
      setCurrentIndex(0);
    }
  }, [activeQuotes.length, currentIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + activeQuotes.length) % activeQuotes.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % activeQuotes.length);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.quote}" — ${currentQuote.author}${currentQuote.authorDesignation ? ` (${currentQuote.authorDesignation})` : ''} | Probashi Business Club`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    addNotification(
      language === 'bn' ? 'উক্তি কপি করা হয়েছে' : 'Quote Copied',
      language === 'bn' ? 'উক্তিটি ক্লিপবোর্ডে কপি করা হয়েছে।' : 'Quote copied to clipboard successfully.',
      'system'
    );
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQuote) return;
    const shareText = `"${currentQuote.quote}"\n— ${currentQuote.author}${currentQuote.authorDesignation ? ` (${currentQuote.authorDesignation})` : ''}\n\n🌟 Probashi Business Club (PBC)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'bn' ? 'দৈনিক বিজনেস মোটিভেশন | PBC' : 'Daily Business Motivation | PBC',
          text: shareText
        });
      } catch (err) {
        // User cancelled or share not supported
      }
    } else {
      handleCopy(e);
    }
  };

  if (!currentQuote) return null;

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Investment':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case 'Business':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Leadership':
        return <Award className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (language === 'bn') {
      switch (category) {
        case 'Investment':
          return 'ইনভেস্টমেন্ট ভাবনা';
        case 'Business':
          return 'ব্যবসায়িক প্রজ্ঞা';
        case 'Savings':
          return 'সঞ্চয় ও মূলধন';
        case 'Leadership':
          return 'নেতৃত্ব ও দর্শন';
        default:
          return 'দৈনিক বিজনেস মোটিভেশন';
      }
    }
    return category ? `${category} Insight` : 'Daily Inspiration';
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden shadow-xl shadow-amber-950/20 border-2 border-amber-500/35 transition-all duration-300 group select-none mb-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Gradient & Islamic / Premium Geometric Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060D19] via-[#0B1528] to-[#081220] z-0" />
      
      {/* Golden Aura & Glow Highlights */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Gold Edge Lines */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-10" />

      {/* Corner Ornaments */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60 rounded-br-sm pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col justify-between min-h-[180px]">
        
        {/* Top Meta Bar */}
        <div className="flex items-center justify-end gap-1.5 mb-2">
          {/* Action buttons (Admin Manage, Copy, Share) */}
          {canManage && (
            <button
              onClick={() => setIsQuotesManagerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 transition active:scale-95 cursor-pointer shadow-xs"
              title={language === 'bn' ? 'উক্তি পরিবর্তন ও নতুন উক্তি যোগ করুন' : 'Manage Quotes'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'উক্তি ম্যানেজ' : 'Manage'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition active:scale-95 cursor-pointer"
            title={language === 'bn' ? 'উক্তি কপি করুন' : 'Copy quote'}
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition active:scale-95 cursor-pointer"
            title={language === 'bn' ? 'শেয়ার করুন' : 'Share quote'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center Quote Body with Large Quotation Mark */}
        <div className="relative my-2 sm:my-3">
          {/* Big Stylized Gold Quote Icon in background */}
          <div className="absolute -top-4 -left-2 text-amber-400/15 select-none pointer-events-none font-serif text-6xl sm:text-7xl leading-none">
            “
          </div>

          <p className="relative z-10 text-slate-100 font-serif text-base sm:text-lg md:text-xl font-medium leading-relaxed sm:leading-loose tracking-normal pl-4 sm:pl-6 border-l-2 border-amber-400/50">
            {language === 'bn' ? (currentQuote.quoteBn || currentQuote.quote) : currentQuote.quote}
          </p>
        </div>

        {/* Bottom Author Info & Carousel Controls */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-3.5 border-t border-slate-800/80">
          
          {/* Author Badge */}
          <div className="flex items-center gap-3">
            {currentQuote.authorPhotoUrl ? (
              <img 
                src={currentQuote.authorPhotoUrl} 
                alt={currentQuote.author}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-400/40 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-700/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold text-sm shadow-inner">
                {currentQuote.author.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="text-sm sm:text-base font-bold text-amber-300 tracking-wide flex items-center gap-1.5">
                <span>{currentQuote.author}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              {currentQuote.authorDesignation && (
                <div className="text-xs sm:text-[13px] text-slate-400 font-medium">
                  {currentQuote.authorDesignation}
                </div>
              )}
            </div>
          </div>

          {/* Carousel Slider Controls (Arrows & Dots) */}
          <div className="flex items-center gap-2">
            {activeQuotes.length > 1 && (
              <>
                {/* Dot Indicators */}
                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                  {activeQuotes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex 
                          ? 'w-6 bg-amber-400 shadow-xs shadow-amber-400/50' 
                          : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Left Button */}
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title={language === 'bn' ? 'পূর্ববর্তী উক্তি' : 'Previous quote'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Right Button */}
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title={language === 'bn' ? 'পরবর্তী উক্তি' : 'Next quote'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
