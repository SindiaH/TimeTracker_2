export const TRANSLATION_KEYS = {
  app: {
    title: 'app.title',
  },
  header: {
    navigation: 'header.navigation',
    menuOpen: 'header.menuOpen',
    menuClose: 'header.menuClose',
    theme: {
      light: 'header.theme.light',
      dark: 'header.theme.dark',
      system: 'header.theme.system',
    },
    language: {
      enUs: 'header.language.en-US',
      deAt: 'header.language.de-AT',
    },
  },
  modules: {
    auth: 'modules.auth',
    tasks: 'modules.tasks',
    timeEntries: 'modules.timeEntries',
    calendar: 'modules.calendar',
    activities: 'modules.activities',
    settings: 'modules.settings',
    stubMessage: 'modules.stubMessage',
  },
} as const;

type Leaves<T> = T extends string ? T : T extends Record<string, unknown> ? Leaves<T[keyof T]> : never;

export type TranslationKey = Leaves<typeof TRANSLATION_KEYS>;
