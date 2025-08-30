import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeSettingsProvider } from './theme/ThemeProvider';
import './styles.css';

createRoot(document.getElementById('root')).render(<ThemeSettingsProvider><App /></ThemeSettingsProvider>);
