import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

// eslint-disable-next-line node/prefer-global/process
process.env.APP_URL = 'http://localhost:8000';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.ts'],
      refresh: true,
    }),
    tailwindcss(),
  ],
  server: {
    cors: true,
  },
});
