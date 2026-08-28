import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Palette, Check, RefreshCw, X, ShieldCheck, Sun, Moon } from 'lucide-react';
import { DEFAULT_THEME_ID } from '../../types/theme';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, availableThemes, setAppTheme, isChangingTheme } = useTheme();
  const { role } = useApp();

  if (!isOpen) return null;

  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1528] text-white w-full max-w-2xl rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#070D1B] border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Application Theme Customizer</span>
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-mono">
                  {currentTheme.name}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Select your preferred color theme without affecting layout or data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Sync Banner */}
        {isSuperAdmin && (
          <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Super Admin:</strong> Selecting a theme will update and sync across all members in real-time.
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableThemes.map((theme) => {
              const isSelected = currentTheme.id === theme.id;
              const isLight = theme.mode === 'light';

              return (
                <button
                  key={theme.id}
                  type="button"
                  disabled={isChangingTheme}
                  onClick={async () => {
                    await setAppTheme(theme.id);
                  }}
                  className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between border cursor-pointer group ${
                    isSelected
                      ? 'border-amber-400 shadow-xl ring-2 ring-amber-400/40 bg-gradient-to-b from-[#0B1528] to-[#070D1B]'
                      : 'border-slate-800 hover:border-slate-600 bg-[#070D1B]/80 hover:bg-[#070D1B]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Swatches */}
                      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
                        <span
                          className="w-4 h-4 rounded-md shadow-sm border border-white/20"
                          style={{ backgroundColor: theme.previewColors.bg }}
                        />
                        <span
                          className="w-4 h-4 rounded-md shadow-sm border border-white/20"
                          style={{ backgroundColor: theme.previewColors.card }}
                        />
                        <span
                          className="w-4 h-4 rounded-md shadow-sm border border-white/20"
                          style={{ backgroundColor: theme.previewColors.accent }}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isLight ? (
                          <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[9px] font-bold rounded flex items-center gap-0.5">
                            <Sun className="w-2.5 h-2.5" /> Light
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded flex items-center gap-0.5">
                            <Moon className="w-2.5 h-2.5" /> Dark
                          </span>
                        )}
                        {isSelected && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition">
                        {theme.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-amber-400 mt-0.5">
                        {theme.nameBn}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{theme.isDefault ? '⭐ Default Theme' : isLight ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
                    <span className="font-bold uppercase" style={{ color: theme.previewColors.accent }}>
                      {isSelected ? 'Applied' : 'Select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070D1B] border-t border-[#D4AF37]/30 flex items-center justify-between">
          <button
            type="button"
            onClick={async () => {
              await setAppTheme(DEFAULT_THEME_ID);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Official Default</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
