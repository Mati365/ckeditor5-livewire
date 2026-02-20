/// <reference types="vitest" />
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts'],
      include: ['src/**/*.ts', 'bundler/**/*.ts'],
      beforeWriteFile: (filePath, content) => {
        if (filePath.includes('/dist/src/')) {
          return {
            filePath: filePath.replace('/dist/src/', '/dist/'),
            content,
          };
        }

        return { filePath, content };
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'bundler/vite-ckeditor5-externalize': resolve(__dirname, 'bundler/vite-ckeditor5-externalize.ts'),
      },
      name: 'CKEditor5Livewire',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: isExternalModule,
      output: {
        globals: {
          'ckeditor5': 'CKEditor5',
          'ckeditor5-premium-features': 'CKEditor5PremiumFeatures',
        },
      },
    },
  },
  test: {
    globals: true,
    watch: false,
    environment: 'happy-dom',
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: [
        ...configDefaults.exclude,
        '**/node_modules/**',
        '**/dist/**',
        './src/types/*.type.ts',
        './src/**/index.ts',
        './src/**/*.d.ts',
        '**/test-utils/**',
        './scripts/**',
        './bundler/**',
      ],
    },
  },
});

function isExternalModule(id: string): boolean {
  return [
    'ckeditor5',
    'ckeditor5-premium-features',
  ].includes(id)
  || /^ckeditor5\/translations\/.+\.js$/.test(id)
  || /^ckeditor5-premium-features\/translations\/.+\.js$/.test(id);
}
