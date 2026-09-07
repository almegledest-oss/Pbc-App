import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AppTheme, APP_THEMES, DEFAULT_THEME_ID } from '../types/theme';
import { useApp } from './AppContext';
import { safeStorage } from '../utils/safeStorage';

interface ThemeContextType {
  currentTheme: AppTheme;
  availableThemes: AppTheme[];
  setAppTheme: (themeId: string) => Promise<void>;
  isChangingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { systemSettings, updateSystemSettings, role } = useApp();
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  // 1. Manage current selected theme ID with React state so any change triggers immediate render
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return safeStorage.getItem('pbc_selected_theme_id') || systemSettings?.activeThemeId || DEFAULT_THEME_ID;
  });

  // Sync with Firestore settings if updated remotely or on initial fetch
  useEffect(() => {
    if (systemSettings?.activeThemeId && systemSettings.activeThemeId !== selectedThemeId) {
      setSelectedThemeId(systemSettings.activeThemeId);
      safeStorage.setItem('pbc_selected_theme_id', systemSettings.activeThemeId);
    }
  }, [systemSettings?.activeThemeId]);

  const currentTheme = useMemo(() => {
    const found = APP_THEMES.find(t => t.id === selectedThemeId);
    return found || APP_THEMES[0]; // Always fallback to PBC Royal Navy & Gold
  }, [selectedThemeId]);

  // Inject CSS Variables and Mode Class to Root DOM & Body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const vars = currentTheme.cssVariables;

    Object.entries(vars).forEach(([cssVar, value]) => {
      root.style.setProperty(cssVar, String(value));
    });

    if (currentTheme.mode === 'light') {
      root.classList.add('light-theme');
      body.classList.add('light-theme');
      root.classList.remove('dark-theme', 'dark');
      body.classList.remove('dark-theme', 'dark');
    } else {
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
      root.classList.add('dark-theme', 'dark');
      body.classList.add('dark-theme', 'dark');
    }

    safeStorage.setItem('pbc_selected_theme_id', currentTheme.id);
  }, [currentTheme]);

  const setAppTheme = async (themeId: string) => {
    const target = APP_THEMES.find(t => t.id === themeId);
    if (!target) return;

    setIsChangingTheme(true);
    // Instant UI update via React state
    setSelectedThemeId(themeId);
    safeStorage.setItem('pbc_selected_theme_id', themeId);

    // Apply immediate classes so visual transition is instantaneous
    const root = document.documentElement;
    const body = document.body;
    if (target.mode === 'light') {
      root.classList.add('light-theme');
      body.classList.add('light-theme');
      root.classList.remove('dark-theme', 'dark');
      body.classList.remove('dark-theme', 'dark');
    } else {
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
      root.classList.add('dark-theme', 'dark');
      body.classList.add('dark-theme', 'dark');
    }

    // If Super Admin or Admin, persist across all devices in Firestore System Settings
    if (role === 'super_admin' || role === 'admin') {
      try {
        await updateSystemSettings({ activeThemeId: themeId });
      } catch (err) {
        console.warn('Failed to sync theme to Firestore:', err);
      }
    }

    setTimeout(() => {
      setIsChangingTheme(false);
    }, 150);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        availableThemes: APP_THEMES,
        setAppTheme,
        isChangingTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
