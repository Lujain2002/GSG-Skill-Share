import React, { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CORE_PRIMARYS, DEFAULT_THEME_SETTINGS } from './constants';

const ThemeCtx = createContext(null);
export const useThemeSettings = () => useContext(ThemeCtx);

// Constants moved to separate file to stabilize exports for HMR

const BODY_FONT_STACK = '"Nunito","Poppins",system-ui,-apple-system,"Segoe UI","Roboto","Ubuntu",sans-serif';
const HEADING_FONT_STACK = '"Poppins","Nunito",system-ui,-apple-system,"Segoe UI","Roboto","Ubuntu",sans-serif';

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
      fontFamily: BODY_FONT_STACK,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 700,
        letterSpacing: '-0.015em'
      },
      h3: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 600,
        letterSpacing: '-0.01em'
      },
      h4: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 600,
        letterSpacing: '-0.005em'
      },
      h5: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 600,
        letterSpacing: '-0.005em'
      },
      h6: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 600,
        letterSpacing: '0em'
      },
      subtitle1: {
        fontFamily: BODY_FONT_STACK,
        fontWeight: 500,
        letterSpacing: '0.01em'
      },
      subtitle2: {
        fontFamily: BODY_FONT_STACK,
        fontWeight: 500,
        letterSpacing: '0.015em'
      },
      body1: {
        fontFamily: BODY_FONT_STACK,
        fontWeight: 400,
        letterSpacing: '0.01em'
      },
      body2: {
        fontFamily: BODY_FONT_STACK,
        fontWeight: 400,
        letterSpacing: '0.015em'
      },
      button: {
        fontFamily: HEADING_FONT_STACK,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'none'
      }
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
