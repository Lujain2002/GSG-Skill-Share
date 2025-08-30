import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CORE_PRIMARYS, DEFAULT_THEME_SETTINGS } from './constants';

const ThemeCtx = createContext(null);
export const useThemeSettings = () => useContext(ThemeCtx);

// Constants moved to separate file to stabilize exports for HMR

export function ThemeSettingsProvider({ children }) {
  // Start with default each app load; per-user persistence handled inside AuthContext via profile
  const [settings, setSettings] = useState(DEFAULT_THEME_SETTINGS);

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: settings.mode,
      primary: { main: settings.primary },
      background: {
        default: settings.mode === 'dark' ? '#0f1115' : '#f5f6f8',
        paper: settings.mode === 'dark' ? '#161c24' : '#ffffff'
      }
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif',
      fontWeightRegular: settings.mode === 'light' ? 500 : 400
    }
  }), [settings]);

  useEffect(() => {
  document.documentElement.dataset.colorMode = settings.mode;
  }, [settings.mode]);

  const value = {
    settings,
    setPrimary: (color) => setSettings(s => ({ ...s, primary: color })),
    toggleMode: () => setSettings(s => ({ ...s, mode: s.mode === 'dark' ? 'light' : 'dark' })),
  setMode: (mode) => setSettings(s => ({ ...s, mode })),
    coreColors: CORE_PRIMARYS
  };

  return (
    <ThemeCtx.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}
