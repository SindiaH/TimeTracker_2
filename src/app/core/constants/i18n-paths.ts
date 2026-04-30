export const I18N_ASSETS_BASE_PATH = '/assets/i18n';

export function buildTranslationAssetUrl(langPath: string): string {
  return `${I18N_ASSETS_BASE_PATH}/${langPath}.json`;
}
