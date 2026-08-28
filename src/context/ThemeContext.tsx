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

  // Active theme ID resolution: Firestore systemSettings > Local cached > Default
  const activeThemeId = useMemo(() => {
    return systemSettings?.activeThemeId || safeStorage.getItem('pbc_selected_theme_id') || DEFAULT_THEME_ID;
  }, [systemSettings?.activeThemeId]);

  const currentTheme = useMemo(() => {
    const found = APP_THEMES.find(t => t.id === activeThemeId);
    return found || APP_THEMES[0]; // Always fallback to PBC Royal Navy & Gold
  }, [activeThemeId]);

  // Inject CSS Variables and Mode Class to Root DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const vars = currentTheme.cssVariables;

    Object.entries(vars).forEach(([cssVar, value]) => {
      root.style.setProperty(cssVar, value);
    });

    if (currentTheme.mode === 'light') {
      root.classList.add('light-theme');
      body.classList.add('light-theme');
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
    } else {
      root.classList.remove('light-theme');
      body.classList.remove('light-theme');
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
    }

    safeStorage.setItem('pbc_selected_theme_id', currentTheme.id);
  }, [currentTheme]);

  const setAppTheme = async (themeId: string) => {
    const target = APP_THEMES.find(t => t.id === themeId);
    if (!target) return;

    setIsChangingTheme(true);
    safeStorage.setItem('pbc_selected_theme_id', themeId);

    // If Super Admin, persist across all devices in Firestore System Settings
    if (role === 'super_admin') {
      try {
        await updateSystemSettings({ activeThemeId: themeId });
      } catch (err) {
        console.warn('Failed to sync theme to Firestore:', err);
      }
    }

    setTimeout(() => {
      setIsChangingTheme(false);
    }, 300);
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
