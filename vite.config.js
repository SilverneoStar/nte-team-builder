import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build settings for the site (deployed to GitHub Pages by .github/workflows/deploy.yml).
export default defineConfig({
  plugins: [react()],
  build: {
    // Modern browsers only: smaller output without old-browser workarounds.
    target: 'es2020',
    rollupOptions: {
      output: {
        // React rarely changes, so it gets its own file that browsers can keep
        // cached between site updates.
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
});
