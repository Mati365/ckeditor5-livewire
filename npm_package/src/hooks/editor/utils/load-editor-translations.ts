/**
 * Loads all required translations for the editor based on the language configuration.
 *
 * @param language - The language configuration object containing UI and content language codes.
 * @param language.ui - The UI language code.
 * @param language.content - The content language code.
 * @param hasPremium - Whether premium features are enabled and premium translations should be loaded.
 * @returns A promise that resolves to an array of loaded translation objects.
 */
export async function loadAllEditorTranslations(
  language: { ui: string; content: string; },
  hasPremium: boolean,
) {
  const translations = [language.ui, language.content];
  const loadedTranslations = await Promise.all(
    [
      loadEditorPkgTranslations('ckeditor5', translations),
      /* v8 ignore next */
      hasPremium && loadEditorPkgTranslations('ckeditor5-premium-features', translations),
    ].filter(pkg => !!pkg),
  )
    .then(translations => translations.flat());

  return loadedTranslations;
}

/**
 * Loads the editor translations for the given languages.
 *
 * Make sure this function is properly compiled and bundled in self hosted environments!
 *
 * @param pkg - The package to load translations from ('ckeditor5' or 'ckeditor5-premium-features').
 * @param translations - The list of language codes to load translations for.
 * @returns A promise that resolves to an array of loaded translation packs.
 */
async function loadEditorPkgTranslations(
  pkg: EditorPkgName,
  translations: string[],
) {
  /* v8 ignore next */
  return await Promise.all(
    translations
      .filter(lang => lang !== 'en') // 'en' is the default language, no need to load it.
      .map(async (lang) => {
        const pack = await loadEditorTranslation(pkg, lang);

        /* v8 ignore next */
        return pack?.default ?? pack;
      })
      .filter(Boolean),
  );
}

/**
 * Type representing the package name for CKEditor 5.
 */
type EditorPkgName = 'ckeditor5' | 'ckeditor5-premium-features';

/**
 * Load translation for CKEditor 5
 * @param pkg - Package type: 'ckeditor5' or 'premium'
 * @param lang - Language code (e.g., 'pl', 'en', 'de')
 * @returns Translation object or null if failed
 */
async function loadEditorTranslation(pkg: EditorPkgName, lang: string): Promise<any> {
  try {
    /* v8 ignore next 2 */
    if (pkg === 'ckeditor5') {
      /* v8 ignore next 79 */
      switch (lang) {
        case 'af': return await import('ckeditor5/translations/af.js');
        case 'ar': return await import('ckeditor5/translations/ar.js');
        case 'ast': return await import('ckeditor5/translations/ast.js');
        case 'az': return await import('ckeditor5/translations/az.js');
        case 'bg': return await import('ckeditor5/translations/bg.js');
        case 'bn': return await import('ckeditor5/translations/bn.js');
        case 'bs': return await import('ckeditor5/translations/bs.js');
        case 'ca': return await import('ckeditor5/translations/ca.js');
        case 'cs': return await import('ckeditor5/translations/cs.js');
        case 'da': return await import('ckeditor5/translations/da.js');
        case 'de': return await import('ckeditor5/translations/de.js');
        case 'de-ch': return await import('ckeditor5/translations/de-ch.js');
        case 'el': return await import('ckeditor5/translations/el.js');
        case 'en': return await import('ckeditor5/translations/en.js');
        case 'en-au': return await import('ckeditor5/translations/en-au.js');
        case 'en-gb': return await import('ckeditor5/translations/en-gb.js');
        case 'eo': return await import('ckeditor5/translations/eo.js');
        case 'es': return await import('ckeditor5/translations/es.js');
        case 'es-co': return await import('ckeditor5/translations/es-co.js');
        case 'et': return await import('ckeditor5/translations/et.js');
        case 'eu': return await import('ckeditor5/translations/eu.js');
        case 'fa': return await import('ckeditor5/translations/fa.js');
        case 'fi': return await import('ckeditor5/translations/fi.js');
        case 'fr': return await import('ckeditor5/translations/fr.js');
        case 'gl': return await import('ckeditor5/translations/gl.js');
        case 'gu': return await import('ckeditor5/translations/gu.js');
        case 'he': return await import('ckeditor5/translations/he.js');
        case 'hi': return await import('ckeditor5/translations/hi.js');
        case 'hr': return await import('ckeditor5/translations/hr.js');
        case 'hu': return await import('ckeditor5/translations/hu.js');
        case 'hy': return await import('ckeditor5/translations/hy.js');
        case 'id': return await import('ckeditor5/translations/id.js');
        case 'it': return await import('ckeditor5/translations/it.js');
        case 'ja': return await import('ckeditor5/translations/ja.js');
        case 'jv': return await import('ckeditor5/translations/jv.js');
        case 'kk': return await import('ckeditor5/translations/kk.js');
        case 'km': return await import('ckeditor5/translations/km.js');
        case 'kn': return await import('ckeditor5/translations/kn.js');
        case 'ko': return await import('ckeditor5/translations/ko.js');
        case 'ku': return await import('ckeditor5/translations/ku.js');
        case 'lt': return await import('ckeditor5/translations/lt.js');
        case 'lv': return await import('ckeditor5/translations/lv.js');
        case 'ms': return await import('ckeditor5/translations/ms.js');
        case 'nb': return await import('ckeditor5/translations/nb.js');
        case 'ne': return await import('ckeditor5/translations/ne.js');
        case 'nl': return await import('ckeditor5/translations/nl.js');
        case 'no': return await import('ckeditor5/translations/no.js');
        case 'oc': return await import('ckeditor5/translations/oc.js');
        case 'pl': return await import('ckeditor5/translations/pl.js');
        case 'pt': return await import('ckeditor5/translations/pt.js');
        case 'pt-br': return await import('ckeditor5/translations/pt-br.js');
        case 'ro': return await import('ckeditor5/translations/ro.js');
        case 'ru': return await import('ckeditor5/translations/ru.js');
        case 'si': return await import('ckeditor5/translations/si.js');
        case 'sk': return await import('ckeditor5/translations/sk.js');
        case 'sl': return await import('ckeditor5/translations/sl.js');
        case 'sq': return await import('ckeditor5/translations/sq.js');
        case 'sr': return await import('ckeditor5/translations/sr.js');
        case 'sr-latn': return await import('ckeditor5/translations/sr-latn.js');
        case 'sv': return await import('ckeditor5/translations/sv.js');
        case 'th': return await import('ckeditor5/translations/th.js');
        case 'tk': return await import('ckeditor5/translations/tk.js');
        case 'tr': return await import('ckeditor5/translations/tr.js');
        case 'tt': return await import('ckeditor5/translations/tt.js');
        case 'ug': return await import('ckeditor5/translations/ug.js');
        case 'uk': return await import('ckeditor5/translations/uk.js');
        case 'ur': return await import('ckeditor5/translations/ur.js');
        case 'uz': return await import('ckeditor5/translations/uz.js');
        case 'vi': return await import('ckeditor5/translations/vi.js');
        case 'zh': return await import('ckeditor5/translations/zh.js');
        case 'zh-cn': return await import('ckeditor5/translations/zh-cn.js');
        default:
          console.warn(`Language ${lang} not found in ckeditor5 translations`);
          return null;
      }
    }
    /* v8 ignore next 79 */
    else {
      // Premium features translations
      switch (lang) {
        case 'af': return await import('ckeditor5-premium-features/translations/af.js');
        case 'ar': return await import('ckeditor5-premium-features/translations/ar.js');
        case 'ast': return await import('ckeditor5-premium-features/translations/ast.js');
        case 'az': return await import('ckeditor5-premium-features/translations/az.js');
        case 'bg': return await import('ckeditor5-premium-features/translations/bg.js');
        case 'bn': return await import('ckeditor5-premium-features/translations/bn.js');
        case 'bs': return await import('ckeditor5-premium-features/translations/bs.js');
        case 'ca': return await import('ckeditor5-premium-features/translations/ca.js');
        case 'cs': return await import('ckeditor5-premium-features/translations/cs.js');
        case 'da': return await import('ckeditor5-premium-features/translations/da.js');
        case 'de': return await import('ckeditor5-premium-features/translations/de.js');
        case 'de-ch': return await import('ckeditor5-premium-features/translations/de-ch.js');
        case 'el': return await import('ckeditor5-premium-features/translations/el.js');
        case 'en': return await import('ckeditor5-premium-features/translations/en.js');
        case 'en-au': return await import('ckeditor5-premium-features/translations/en-au.js');
        case 'en-gb': return await import('ckeditor5-premium-features/translations/en-gb.js');
        case 'eo': return await import('ckeditor5-premium-features/translations/eo.js');
        case 'es': return await import('ckeditor5-premium-features/translations/es.js');
        case 'es-co': return await import('ckeditor5-premium-features/translations/es-co.js');
        case 'et': return await import('ckeditor5-premium-features/translations/et.js');
        case 'eu': return await import('ckeditor5-premium-features/translations/eu.js');
        case 'fa': return await import('ckeditor5-premium-features/translations/fa.js');
        case 'fi': return await import('ckeditor5-premium-features/translations/fi.js');
        case 'fr': return await import('ckeditor5-premium-features/translations/fr.js');
        case 'gl': return await import('ckeditor5-premium-features/translations/gl.js');
        case 'gu': return await import('ckeditor5-premium-features/translations/gu.js');
        case 'he': return await import('ckeditor5-premium-features/translations/he.js');
        case 'hi': return await import('ckeditor5-premium-features/translations/hi.js');
        case 'hr': return await import('ckeditor5-premium-features/translations/hr.js');
        case 'hu': return await import('ckeditor5-premium-features/translations/hu.js');
        case 'hy': return await import('ckeditor5-premium-features/translations/hy.js');
        case 'id': return await import('ckeditor5-premium-features/translations/id.js');
        case 'it': return await import('ckeditor5-premium-features/translations/it.js');
        case 'ja': return await import('ckeditor5-premium-features/translations/ja.js');
        case 'jv': return await import('ckeditor5-premium-features/translations/jv.js');
        case 'kk': return await import('ckeditor5-premium-features/translations/kk.js');
        case 'km': return await import('ckeditor5-premium-features/translations/km.js');
        case 'kn': return await import('ckeditor5-premium-features/translations/kn.js');
        case 'ko': return await import('ckeditor5-premium-features/translations/ko.js');
        case 'ku': return await import('ckeditor5-premium-features/translations/ku.js');
        case 'lt': return await import('ckeditor5-premium-features/translations/lt.js');
        case 'lv': return await import('ckeditor5-premium-features/translations/lv.js');
        case 'ms': return await import('ckeditor5-premium-features/translations/ms.js');
        case 'nb': return await import('ckeditor5-premium-features/translations/nb.js');
        case 'ne': return await import('ckeditor5-premium-features/translations/ne.js');
        case 'nl': return await import('ckeditor5-premium-features/translations/nl.js');
        case 'no': return await import('ckeditor5-premium-features/translations/no.js');
        case 'oc': return await import('ckeditor5-premium-features/translations/oc.js');
        case 'pl': return await import('ckeditor5-premium-features/translations/pl.js');
        case 'pt': return await import('ckeditor5-premium-features/translations/pt.js');
        case 'pt-br': return await import('ckeditor5-premium-features/translations/pt-br.js');
        case 'ro': return await import('ckeditor5-premium-features/translations/ro.js');
        case 'ru': return await import('ckeditor5-premium-features/translations/ru.js');
        case 'si': return await import('ckeditor5-premium-features/translations/si.js');
        case 'sk': return await import('ckeditor5-premium-features/translations/sk.js');
        case 'sl': return await import('ckeditor5-premium-features/translations/sl.js');
        case 'sq': return await import('ckeditor5-premium-features/translations/sq.js');
        case 'sr': return await import('ckeditor5-premium-features/translations/sr.js');
        case 'sr-latn': return await import('ckeditor5-premium-features/translations/sr-latn.js');
        case 'sv': return await import('ckeditor5-premium-features/translations/sv.js');
        case 'th': return await import('ckeditor5-premium-features/translations/th.js');
        case 'tk': return await import('ckeditor5-premium-features/translations/tk.js');
        case 'tr': return await import('ckeditor5-premium-features/translations/tr.js');
        case 'tt': return await import('ckeditor5-premium-features/translations/tt.js');
        case 'ug': return await import('ckeditor5-premium-features/translations/ug.js');
        case 'uk': return await import('ckeditor5-premium-features/translations/uk.js');
        case 'ur': return await import('ckeditor5-premium-features/translations/ur.js');
        case 'uz': return await import('ckeditor5-premium-features/translations/uz.js');
        case 'vi': return await import('ckeditor5-premium-features/translations/vi.js');
        case 'zh': return await import('ckeditor5-premium-features/translations/zh.js');
        case 'zh-cn': return await import('ckeditor5-premium-features/translations/zh-cn.js');
        default:
          console.warn(`Language ${lang} not found in premium translations`);
          return await import('ckeditor5-premium-features/translations/en.js'); // fallback to English
      }
    }
    /* v8 ignore next 7 */
  }
  catch (error) {
    console.error(`Failed to load translation for ${pkg}/${lang}:`, error);
    return null;
  }
}
