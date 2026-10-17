import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  // Dashboard browser keys are intentionally public, but must be restricted
  // to the dashboard website domains and Maps JavaScript/Geocoding APIs.
  // Expose ONLY this one value to the browser; do not widen Vite's envPrefix.
  const variables = loadEnv(mode, process.cwd(), [
    'GOOGLE_MAPS_BROWSER_API_KEY',
    'VITE_GOOGLE_MAPS_BROWSER_API_KEY',
  ]);
  const mapsBrowserKey =
    variables.GOOGLE_MAPS_BROWSER_API_KEY?.trim() ||
    variables.VITE_GOOGLE_MAPS_BROWSER_API_KEY?.trim() ||
    '';

  return {
    plugins: [react()],
    define: {
      __RODO_MAPS_BROWSER_API_KEY__: JSON.stringify(mapsBrowserKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
    },
  };
});
