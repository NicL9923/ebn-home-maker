/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/home-maker-react-app',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildCommonjs(['react-moment'])],
    },
  },

  resolve: {
    mainFields: [], // Resolve issue moment-js was causing (through react-live-clock)
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
