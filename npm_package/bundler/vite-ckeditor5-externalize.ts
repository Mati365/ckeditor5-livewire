import type { Plugin } from 'vite';

export function viteCKEditorExternalize(): Plugin {
  return {
    name: 'ckeditor5-externalize',
    enforce: 'pre',
    config: (config) => {
      if (config.optimizeDeps?.exclude && !Array.isArray(config.optimizeDeps.exclude)) {
        throw new Error('ckeditor5-externalize: config.optimizeDeps.exclude is not an array');
      }

      if (config.build?.rollupOptions?.external && !Array.isArray(config.build.rollupOptions.external)) {
        throw new Error('ckeditor5-externalize: config.build.rollupOptions.external is not an array');
      }

      config.optimizeDeps ??= {};
      config.optimizeDeps.exclude = [
        ...((config.optimizeDeps.exclude as string[]) || []),
        'ckeditor5',
        'ckeditor5-premium-features',
        'ckeditor5-livewire',
      ];

      config.build ??= {};
      config.build.rollupOptions ??= {};
      config.build.rollupOptions.external = [
        ...((config.build.rollupOptions.external as any[]) || []),
        'ckeditor5',
        'ckeditor5-premium-features',
        /^ckeditor5\/.*/,
        /^ckeditor5-premium-features\/.*/,
      ];
    },
    configResolved: (resolvedConfig) => {
      (resolvedConfig.plugins as any).push({
        name: 'remove-id-prefix',
        transform: (code: string) => {
          if (typeof code === 'string') {
            return code.replace(/\/@id\/ckeditor5/g, 'ckeditor5');
          }
          return null;
        },
      });
    },
    resolveId: (id) => {
      if (
        id === 'ckeditor5'
        || id === 'ckeditor5-premium-features'
        || id.startsWith('ckeditor5/')
        || id.startsWith('ckeditor5-premium-features/')
      ) {
        return {
          id,
          external: true,
        };
      }
      return null;
    },
  };
}
