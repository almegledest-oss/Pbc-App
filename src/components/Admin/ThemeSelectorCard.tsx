import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Palette, Check, Sparkles, RefreshCw, ShieldCheck, Sun, Moon } from 'lucide-react';
import { DEFAULT_THEME_ID } from '../../types/theme';

export const ThemeSelectorCard: React.FC = () => {
  const { currentTheme, availableThemes, setAppTheme, isChangingTheme } = useTheme();
  const { role } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSuperAdmin = role === 'super_admin';

  const handleSelectTheme = async (themeId: string) => {
    try {
      await setAppTheme(themeId);
      const chosen = availableThemes.find(t => t.id === themeId);
      setSuccessMsg(`Theme updated to "${chosen?.name || themeId}"!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDefault = async () => {
    await handleSelectTheme(DEFAULT_THEME_ID);
  };

  return (
    <div className="p-5 sm:p-6 bg-[#070D1B] rounded-2xl border border-[#D4AF37]/30 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2 flex-wrap">
                <span>App Color Themes & Aesthetics (অ্যাপের থিম পরিবর্তন)</span>
                {currentTheme.isDefault && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/40">
                    DEFAULT ACTIVE
                  </span>
                )}
                {currentTheme.mode === 'light' ? (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md flex items-center gap-1">
                    <Sun className="w-3 h-3" /> LIGHT MODE ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-black rounded-md flex items-center gap-1">
                    <Moon className="w-3 h-3 text-amber-400" /> DARK MODE ACTIVE
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Choose between Official Royal Dark themes and Ultra-Clean Light themes. Your data and layout remain 100% intact.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentTheme.id !== DEFAULT_THEME_ID && (
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default (রয়েল গোল্ড)</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice */}
      {isSuperAdmin ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Super Admin Privilege:</strong> Any theme you select here will automatically sync in real-time across all devices and member screens.
          </span>
        </div>
      ) : (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2 text-xs text-blue-300">
          <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            Theme preview mode. Changes are applied to your current session.
          </span>
        </div>
      )}

      {/* Theme Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {availableThemes.map((theme) => {
          const isSelected = currentTheme.id === theme.id;
          const isLight = theme.mode === 'light';

          return (
            <button
              key={theme.id}
              type="button"
              disabled={isChangingTheme}
              onClick={() => handleSelectTheme(theme.id)}
              className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between border cursor-pointer group ${
                isSelected
                  ? 'border-amber-400 shadow-xl ring-2 ring-amber-400/40 bg-gradient-to-b from-[#0B1528] to-[#070D1B]'
                  : 'border-slate-800 hover:border-slate-600 bg-[#0B1528]/80 hover:bg-[#0B1528]'
              }`}
            >
              {/* Color Swatch Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
                    <span
                      className="w-5 h-5 rounded-lg shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.previewColors.bg }}
                      title="Background"
                    />
                    <span
                      className="w-5 h-5 rounded-lg shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.previewColors.card }}
                      title="Card Surface"
                    />
                    <span
                      className="w-5 h-5 rounded-lg shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.previewColors.accent }}
                      title="Accent"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLight ? (
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-400/40 flex items-center gap-1">
                        <Sun className="w-2.5 h-2.5" /> Light
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-md border border-slate-700 flex items-center gap-1">
                        <Moon className="w-2.5 h-2.5" /> Dark
                      </span>
                    )}

                    {isSelected && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition">
                    {theme.name}
                  </h5>
                  <p className="text-[11px] font-medium text-amber-400 mt-0.5">
                    {theme.nameBn}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{theme.isDefault ? '⭐ Official Default' : isLight ? '☀️ Light Palette' : '🌙 Dark Palette'}</span>
                <span className="font-bold uppercase" style={{ color: theme.previewColors.accent }}>
                  {isSelected ? 'Applied' : 'Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold text-center animate-fade-in">
          ✓ {successMsg}
        </div>
      )}
    </div>
  );
};
