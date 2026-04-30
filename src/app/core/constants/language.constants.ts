export const LANGUAGE_IDS = {
  enUs: 'en-US',
  deAt: 'de-AT',
} as const;

export type LanguageId = (typeof LANGUAGE_IDS)[keyof typeof LANGUAGE_IDS];

export const AVAILABLE_LANGUAGE_IDS: ReadonlyArray<LanguageId> = [LANGUAGE_IDS.enUs, LANGUAGE_IDS.deAt];

export const DEFAULT_LANGUAGE_ID: LanguageId = LANGUAGE_IDS.enUs;
