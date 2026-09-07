import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CLUB_RULES, ClubRuleCategory, ClubRuleItem } from '../../data/defaultClubRules';
import { 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Wallet, 
  Building2, 
  TrendingUp, 
  LogOut, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Printer, 
  FileText, 
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Check
} from 'lucide-react';

export const ClubRulesView: React.FC = () => {
  const { systemSettings, language, navigateWithHistory, role } = useApp();
  const isBn = language === 'bn';

  const categories: ClubRuleCategory[] = (systemSettings.clubRules && systemSettings.clubRules.length > 0)
    ? systemSettings.clubRules
    : DEFAULT_CLUB_RULES;

  const lastUpdated = systemSettings.clubRulesLastUpdated || '২০২৬-০৯-০৪';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Expand all by default
    const initial: Record<string, boolean> = {};
    categories.forEach(c => { initial[c.id] = true; });
    return initial;
  });

  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    categories.forEach(c => { all[c.id] = true; });
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-amber-400" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'LogOut':
        return <LogOut className="w-5 h-5 text-rose-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleShareOrCopy = (rule: ClubRuleItem) => {
    const textToCopy = `${rule.number} ${isBn ? rule.titleBn : rule.titleEn}\n${isBn ? rule.descriptionBn : rule.descriptionEn}\n\n— প্রবাসী বিজনেস ক্লাব (PBC)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedRuleId(rule.id);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter rules based on search
  const filteredCategories = categories.map(cat => {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
      return null;
    }

    if (!searchQuery.trim()) {
      return cat;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchingRules = cat.rules.filter(r => 
      r.number.toLowerCase().includes(q) ||
      r.titleBn.toLowerCase().includes(q) ||
      r.titleEn.toLowerCase().includes(q) ||
      r.descriptionBn.toLowerCase().includes(q) ||
      r.descriptionEn.toLowerCase().includes(q)
    );

    if (matchingRules.length > 0 || cat.nameBn.toLowerCase().includes(q) || cat.nameEn.toLowerCase().includes(q)) {
      return {
        ...cat,
        rules: matchingRules.length > 0 ? matchingRules : cat.rules
      };
    }

    return null;
  }).filter(Boolean) as ClubRuleCategory[];

  const totalRulesCount = categories.reduce((acc, cat) => acc + cat.rules.length, 0);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto print:p-0 print:m-0">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#070D1B] to-[#040814] border-2 border-[#D4AF37]/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'অফিসিয়াল গঠনতন্ত্র ও উপবিধি' : 'Official Constitution & By-Laws'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              {isBn ? 'প্রবাসী বিজনেস ক্লাব নীতিমালা ও নিয়মাবলী' : 'Probashi Business Club Rules & Constitution'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isBn 
                ? 'ক্লাবের স্বচ্ছতা, শৃঙ্খলা, নিরাপদ হালাল বিনিয়োগ এবং সদস্যদের অধিকার সুরক্ষায় প্রণীত সর্বসম্মত গঠনতন্ত্র ও আচরণবিধি।' 
                : 'Formulated to protect transparency, Islamic Shariah business ethics, and every member rights.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-[#030712] px-3 py-1.5 rounded-xl border border-slate-800 text-amber-300/90 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? 'সর্বশেষ সংস্করণ:' : 'Last Updated:'} {lastUpdated}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-[#030712] px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{categories.length} {isBn ? 'টি অধ্যায়' : 'Chapters'} | {totalRulesCount} {isBn ? 'টি ধারা' : 'Articles'}</span>
              </span>
            </div>
          </div>

          {/* Quick Actions (Print & Help Desk navigation) */}
          <div className="flex flex-row sm:flex-col gap-2.5 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-3 bg-[#070D1B] hover:bg-[#112244] text-slate-200 border border-amber-500/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'প্রিন্ট / সেভ করুন' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={() => navigateWithHistory('help_desk', { title: 'Help Desk', titleBn: 'হেল্প ডেস্ক' })}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isBn ? 'হেল্প ডেস্ক যোগাযোগ' : 'Contact Support'}</span>
            </button>
            
            {(role === 'super_admin' || role === 'admin') && (
              <button
                onClick={() => navigateWithHistory('admin_panel', { title: 'Admin Panel', titleBn: 'এডমিন প্যানেল', subView: 'club_rules_settings' })}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'নীতিমালা এডিট করুন (Admin)' : 'Edit Rules (Admin)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search and Filter Bar */}
      <div className="p-4 bg-[#0B1528] rounded-2xl border border-[#D4AF37]/20 shadow-lg flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'ধারা, কিস্তি বা নিয়ম সার্চ করুন...' : 'Search by keyword or clause...'}
            className="w-full pl-9 pr-4 py-2.5 bg-[#070D1B] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter pills & Expand/Collapse */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-[#070D1B] text-slate-300 hover:bg-[#112244]'
            }`}
          >
            {isBn ? 'সকল অধ্যায়' : 'All Chapters'}
          </button>
          
          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] text-[11px] text-slate-300 font-bold whitespace-nowrap transition"
          >
            {isBn ? 'সব খুলুন' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-[#070D1B] hover:bg-[#112244] text-[11px] text-slate-300 font-bold whitespace-nowrap transition"
          >
            {isBn ? 'সব বন্ধ করুন' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* 3. Category Horizontal Pills (Quick Jumping) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none print:hidden">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setExpandedCategories(prev => ({ ...prev, [cat.id]: true }));
            }}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#0B1528] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{cat.categoryNumber}.</span>
            <span>{isBn ? cat.nameBn : cat.nameEn}</span>
          </button>
        ))}
      </div>

      {/* 4. Filtered Categories & Rules List */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-[#0B1528] rounded-3xl border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {isBn ? 'কোনো নিয়ম বা ধারা পাওয়া যায়নি' : 'No matching rules found'}
          </h3>
          <p className="text-xs text-slate-400">
            {isBn ? 'অনুগ্রহ করে অন্য শব্দ দিয়ে অনুসন্ধান করুন।' : 'Please try searching with a different keyword.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl mt-2"
          >
            {isBn ? 'ফিল্টার ক্লিয়ার করুন' : 'Clear Filter'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.id] !== false;

            return (
              <div 
                key={category.id}
                className="rounded-3xl bg-[#0B1528] border-2 border-[#D4AF37]/25 overflow-hidden shadow-xl transition-all"
              >
                {/* Category Header */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  className="p-5 sm:p-6 bg-gradient-to-r from-[#0E1B33] to-[#070D1B] border-b border-[#D4AF37]/20 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#122240] transition select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                      {getCategoryIcon(category.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                          {isBn ? `অধ্যায় ${category.categoryNumber}` : `Chapter ${category.categoryNumber}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                          {category.rules.length} {isBn ? 'টি ধারা' : 'Articles'}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                        {isBn ? category.nameBn : category.nameEn}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#070D1B] border border-slate-700 flex items-center justify-center text-slate-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Category Rules List */}
                {isExpanded && (
                  <div className="divide-y divide-slate-800/80 p-2 sm:p-4">
                    {category.rules.map((rule) => (
                      <div 
                        key={rule.id}
                        className="p-4 sm:p-5 rounded-2xl hover:bg-[#070D1B]/70 transition space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-xs shrink-0">
                              {rule.number}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                              {isBn ? rule.titleBn : rule.titleEn}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleShareOrCopy(rule)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition cursor-pointer print:hidden"
                            title={isBn ? 'ধারা কপি করুন' : 'Copy Article'}
                          >
                            {copiedRuleId === rule.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-1 sm:pl-9">
                          {isBn ? rule.descriptionBn : rule.descriptionEn}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Bottom Advice & Notice */}
      <div className="p-6 rounded-3xl bg-[#070D1B] border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isBn ? 'নীতিমালা সংক্রান্ত কোনো জিজ্ঞাসা বা প্রস্তাবনা আছে?' : 'Have suggestions or queries about by-laws?'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn 
                ? 'পরিচালনা পর্ষদের সাথে সরাসরি যোগাযোগ করে আপনার পরামর্শ জানাতে পারেন।' 
                : 'Contact the board of directors directly to share feedback or recommendations.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateWithHistory('help_desk', { title: 'Help Desk', titleBn: 'হেল্প ডেস্ক' })}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-2 shrink-0"
        >
          <span>{isBn ? 'সাপোর্ট যোগাযোগ' : 'PBC Helpline'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
