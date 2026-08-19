import React, { useState } from 'react';
import { useVersion } from '../../context/VersionContext';
import { useApp } from '../../context/AppContext';
import { RefreshCw, Sparkles, CheckCircle2, ShieldCheck, Clock, DownloadCloud } from 'lucide-react';

interface AppUpdateSettingCardProps {
  compact?: boolean;
}

export const AppUpdateSettingCard: React.FC<AppUpdateSettingCardProps> = ({ compact = false }) => {
  const { hasNewVersion, isChecking, isUpdating, currentVersion, checkVersion, applyUpdate, lastChecked } = useVersion();
  const { language } = useApp();
  const [justCheckedSuccess, setJustCheckedSuccess] = useState(false);

  const handleManualCheck = async () => {
    const foundNew = await checkVersion(true);
    if (!foundNew) {
      setJustCheckedSuccess(true);
      setTimeout(() => setJustCheckedSuccess(false), 3000);
    }
  };

  // Format version timestamp or string
  const formatVersionDisplay = (ver: string) => {
    if (!ver) return 'v1.4.0';
    if (/^\d{12,}$/.test(ver)) {
      const date = new Date(parseInt(ver, 10));
      if (!isNaN(date.getTime())) {
        return `v1.4.0 (Build ${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})`;
      }
    }
    return `v1.4.0 (${ver})`;
  };

  // Compact layout (e.g., inside compact sidebar menus or headers)
  if (compact) {
    if (hasNewVersion) {
      return (
        <button
          onClick={applyUpdate}
          disabled={isUpdating}
          className="w-full p-2.5 bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-600/40 border border-amber-400/60 rounded-xl text-left transition flex items-center justify-between gap-2 shadow-md cursor-pointer animate-pulse"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-300 truncate">
                {language === 'bn' ? 'নতুন আপডেট এসেছে!' : 'New Update Available!'}
              </p>
              <p className="text-[10px] text-amber-200/80 truncate">
                {language === 'bn' ? 'রিফ্রেশ করতে চাপুন' : 'Click to reload'}
              </p>
            </div>
          </div>
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 shrink-0 ${isUpdating ? 'animate-spin' : ''}`} />
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 py-0.5">
        <span className="truncate">{formatVersionDisplay(currentVersion)}</span>
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
          title="Check for latest update"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : (language === 'bn' ? 'চেক' : 'Check')}</span>
        </button>
      </div>
    );
  }

  // Full detailed card (inside More Drawer / Settings / Admin Panel)
  return (
    <div
      id="pbc-app-version-setting-box"
      className={`rounded-2xl p-4 transition-all duration-300 border ${
        hasNewVersion
          ? 'bg-gradient-to-br from-[#0B1528] via-[#16274A] to-[#0D1E3A] border-amber-500/80 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-[#0B1528] border-[#D4AF37]/30 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              hasNewVersion
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {hasNewVersion ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white tracking-wide">
                {hasNewVersion
                  ? (language === 'bn' ? 'নতুন আপডেট উপলব্ধ!' : 'New Update Available!')
                  : (language === 'bn' ? 'অ্যাপ ভার্সন ও আপডেট' : 'App Version & System')}
              </h4>
              {hasNewVersion ? (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider animate-bounce">
                  Update
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-500/30">
                  {language === 'bn' ? 'আপ-টু-ডেট' : 'Up to date'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {hasNewVersion
                ? (language === 'bn'
                    ? 'PBC Club সিস্টেমের নতুন আপডেট রিলিজ হয়েছে। সকল লেটেস্ট ফিচার ও ফিক্স পেতে এখনই রিলোড করুন।'
                    : 'A new official release is ready. Reload now to load latest features and data seamlessly.')
                : (language === 'bn'
                    ? 'আপনার অ্যাপটি সর্বশেষ আপডেটেড ভার্সনে সঠিকভাবে চলছে।'
                    : 'You are currently running the latest version of PBC Club Portal.')}
            </p>
          </div>
        </div>
      </div>

      {/* Version details badge */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatVersionDisplay(currentVersion)}</span>
          {lastChecked && (
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              • {language === 'bn' ? 'চেক করা হয়েছে:' : 'Checked:'} {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Action Button */}
        {hasNewVersion ? (
          <button
            id="btn-apply-update-from-settings"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? (language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (language === 'bn' ? 'আপডেট করুন (Reload Now)' : 'Update Now (Reload)')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {justCheckedSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'bn' ? 'সম্পূর্ণ আপ-টু-ডেট' : 'Up to date'}
              </span>
            )}
            <button
              id="btn-manual-check-update"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? (language === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...') : (language === 'bn' ? 'আপডেট চেক করুন' : 'Check for Updates')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
