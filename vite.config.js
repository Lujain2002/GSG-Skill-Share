import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages deployment: ensure correct asset paths
// Replace with your repo name if it changes
const base = '/GSG-Skill-Share/';

export default defineConfig({
  base,
  plugins: [react()]
});
