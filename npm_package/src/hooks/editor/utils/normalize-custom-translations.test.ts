import { describe, expect, it } from 'vitest';

import type { EditorCustomTranslationsDictionary } from '../typings';

import { normalizeCustomTranslations } from './normalize-custom-translations';

describe('normalizeCustomTranslations', () => {
  it('should normalize empty translations object', () => {
    const input: EditorCustomTranslationsDictionary = {};
    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({});
  });

  it('should normalize single language translation', () => {
    const input: EditorCustomTranslationsDictionary = {
      en: {
        Bold: 'Bold Text',
        Italic: 'Italic Text',
      },
    };

    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({
      en: {
        dictionary: {
          Bold: 'Bold Text',
          Italic: 'Italic Text',
        },
      },
    });
  });

  it('should normalize multiple language translations', () => {
    const input: EditorCustomTranslationsDictionary = {
      en: {
        Bold: 'Bold Text',
        Italic: 'Italic Text',
      },
      pl: {
        Bold: 'Pogrubienie',
        Italic: 'Kursywa',
      },
      de: {
        Bold: 'Fett',
        Italic: 'Kursiv',
      },
    };

    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({
      en: {
        dictionary: {
          Bold: 'Bold Text',
          Italic: 'Italic Text',
        },
      },
      pl: {
        dictionary: {
          Bold: 'Pogrubienie',
          Italic: 'Kursywa',
        },
      },
      de: {
        dictionary: {
          Bold: 'Fett',
          Italic: 'Kursiv',
        },
      },
    });
  });

  it('should handle empty dictionary for a language', () => {
    const input: EditorCustomTranslationsDictionary = {
      en: {},
      pl: {
        Bold: 'Pogrubienie',
      },
    };

    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({
      en: {
        dictionary: {},
      },
      pl: {
        dictionary: {
          Bold: 'Pogrubienie',
        },
      },
    });
  });

  it('should preserve special characters and unicode in translations', () => {
    const input: EditorCustomTranslationsDictionary = {
      zh: {
        粗体: '加粗文本',
        斜体: '斜体文本',
      },
      ar: {
        Bold: 'عريض',
        Italic: 'مائل',
      },
    };

    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({
      zh: {
        dictionary: {
          粗体: '加粗文本',
          斜体: '斜体文本',
        },
      },
      ar: {
        dictionary: {
          Bold: 'عريض',
          Italic: 'مائل',
        },
      },
    });
  });

  it('should handle language codes with regions', () => {
    const input: EditorCustomTranslationsDictionary = {
      'en-US': {
        Color: 'Color',
      },
      'en-GB': {
        Color: 'Colour',
      },
    };

    const result = normalizeCustomTranslations(input);

    expect(result).toEqual({
      'en-US': {
        dictionary: {
          Color: 'Color',
        },
      },
      'en-GB': {
        dictionary: {
          Color: 'Colour',
        },
      },
    });
  });
});
