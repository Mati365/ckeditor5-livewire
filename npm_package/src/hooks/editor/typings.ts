/**
 * Represents a unique identifier for a CKEditor5 editor instance.
 * This is typically the ID of the HTML element that the editor is attached to.
 */
export type EditorId = string;

/**
 * Defines editor type supported by CKEditor5.
 */
export type EditorType = 'inline' | 'classic' | 'balloon' | 'decoupled' | 'multiroot';

/**
 * Represents a CKEditor5 plugin as a string identifier.
 */
export type EditorPlugin = string;

/**
 * Configuration object for CKEditor5 editor instance.
 */
export type EditorConfig = {
  /**
   * Array of plugin identifiers to be loaded by the editor.
   */
  plugins: EditorPlugin[];

  /**
   * Other configuration options are flexible and can be any key-value pairs.
   */
  [key: string]: any;
};

/**
 * Configuration object for CKEditor5 cloud services.
 */
export type EditorCloudConfig = {
  /**
   * The version of CKEditor5 being used.
   */
  editorVersion: string;

  /**
   * Indicates whether the CKEditor5 instance is a premium version.
   */
  premium: boolean;

  /**
   * List of language codes for translations available in the CKEditor5 instance.
   */
  translations: string[];

  /**
   * Configuration for CKEditor5's upload adapter.
   */
  ckbox: {
    version: string;
    theme: string | null;
  } | null;
};

/**
 * Configuration object for the CKEditor5 hook.
 */
export type EditorPreset = {
  /**
   * The configuration of the cloud.
   */
  cloud: EditorCloudConfig | null;

  /**
   * The type of CKEditor5 editor to use.
   * Must be one of the predefined types: 'inline', 'classic', 'balloon', 'decoupled', or 'multiroot'.
   */
  editorType: EditorType;

  /**
   * The configuration object for the CKEditor5 editor.
   * This should match the configuration expected by CKEditor5.
   */
  config: EditorConfig;

  /**
   * The license key for CKEditor5.
   * This is required for using CKEditor5 with a valid license.
   */
  licenseKey: string;

  /**
   * Optional watchdog configuration for error recovery.
   */
  watchdogConfig?: Record<string, any> | null;

  /**
   * Optional custom translations for the editor.
   * This allows for localization of the editor interface.
   */
  customTranslations?: EditorCustomTranslationsDictionary | null;
};

/**
 * Represents the language settings for the CKEditor5 editor.
 */
export type EditorLanguage = {
  ui: string;
  content: string;
};

/**
 * Represents custom translations for the editor.
 */
export type EditorCustomTranslationsDictionary = {
  [language: string]: {
    [key: string]: string | ReadonlyArray<string>;
  };
};
