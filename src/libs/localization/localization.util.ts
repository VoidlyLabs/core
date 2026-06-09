export const SUPPORTED_LANGUAGES = ['uk', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type LocalizedString = Record<SupportedLanguage, string>;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'uk';

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function resolveLanguage(
  lang?: string,
  acceptLanguage?: string,
): SupportedLanguage {
  if (isSupportedLanguage(lang)) {
    return lang;
  }

  const acceptedLanguages = acceptLanguage
    ?.split(',')
    .map((item) => item.trim().split(';')[0]?.toLowerCase())
    .filter(Boolean);

  const acceptedLanguage = acceptedLanguages?.find((item) =>
    isSupportedLanguage(item),
  );

  return acceptedLanguage ?? DEFAULT_LANGUAGE;
}

export function localize(
  value: LocalizedString | string | null | undefined,
  language: SupportedLanguage,
): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value[language] || value[DEFAULT_LANGUAGE] || value.en || '';
}
