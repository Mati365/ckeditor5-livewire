import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

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
    watch: {
      ignored: [
        '**/vendor/**/!(mati365)/**',
        '**/vendor/mati365/!(ckeditor5-livewire)/**',
        '**/vendor/mati365/ckeditor5-livewire/!(npm_package)/**',
        '**/storage/**',
        '**/node_modules/**',
      ],
    },
  },
});
