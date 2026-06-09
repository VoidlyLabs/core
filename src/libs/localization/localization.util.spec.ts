import { localize, resolveLanguage } from './localization.util';

describe('localization utilities', () => {
  it('uses query language before accept-language header', () => {
    expect(resolveLanguage('en', 'uk')).toBe('en');
  });

  it('falls back to supported accept-language value', () => {
    expect(resolveLanguage(undefined, 'de-DE,de;q=0.9,uk;q=0.8')).toBe('uk');
  });

  it('defaults to Ukrainian for unsupported languages', () => {
    expect(resolveLanguage('de', 'pl')).toBe('uk');
  });

  it('localizes values with Ukrainian fallback', () => {
    expect(localize({ uk: 'Kava', en: '' }, 'en')).toBe('Kava');
  });
});
