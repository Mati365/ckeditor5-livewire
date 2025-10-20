import type {
  EditorConfig,
  EditorCustomTranslationsDictionary,
  EditorPreset,
  EditorType,
} from '../../src/hooks/editor/typings';

/**
 * Creates a preset configuration for testing purposes.
 *
 * @param editorType - The type of CKEditor5 editor to use. Defaults to 'classic'.
 * @param config - Partial configuration object for the CKEditor5 editor.
 * @param customTranslations - Optional custom translations for the editor.
 * @returns An EditorPreset object configured for testing.
 */
export function createEditorPreset(
  editorType: EditorType = 'classic',
  config: Partial<EditorConfig> = {},
  customTranslations: EditorCustomTranslationsDictionary | null = null,
): EditorPreset {
  return {
    licenseKey: 'GPL',
    cloud: null,
    editorType,
    customTranslations,
    config: {
      ...createDefaultEditorConfig(),
      ...config,
    },
  };
}

/**
 * Creates a default editor configuration.
 */
export function createDefaultEditorConfig(): EditorConfig {
  return {
    plugins: ['Essentials', 'Paragraph', 'Bold', 'Italic', 'Undo'],
    toolbar: ['undo', 'redo', '|', 'bold', 'italic'],
  };
}
