import type { LivewireComponent } from '../../../livewire';

declare module 'ckeditor5' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface EditorConfig {
    livewire?: {
      component: LivewireComponent;
      saveDebounceMs: number;
      emit: {
        change?: boolean;
        focus?: boolean;
      };
    };
  }
}
