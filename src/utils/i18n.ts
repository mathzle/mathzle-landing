import en from '../i18n/en.json';
import vi from '../i18n/vi.json';

export type Locale = 'en' | 'vi';

const dictionaries = { en, vi } as const;
export type Dictionary = typeof en;

/**
 * Get the typed dictionary for a locale. The EN dictionary is the source
 * of truth for shape — VI must match its keys.
 */
export function t(locale: Locale): Dictionary {
  // Cast keeps the VI JSON loose (it has _note for translators) while
  // exposing the typed shape downstream.
  return dictionaries[locale] as Dictionary;
}

export function getLocaleFromPath(path: string): Locale {
  return path.startsWith('/vi') ? 'vi' : 'en';
}

/** Swap the locale prefix in a path: '/en/about' → '/vi/about' */
export function altPathForLocale(path: string, target: Locale): string {
  return path.replace(/^\/(en|vi)(\/|$)/, `/${target}$2`);
}

/** Human-readable label for a locale switcher. */
export function localeLabel(locale: Locale): string {
  return locale === 'vi' ? 'Tiếng Việt' : 'English';
}
