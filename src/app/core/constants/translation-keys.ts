export const TRANSLATION_KEYS = {
  app: {
    title: 'app.title',
  },
  shared: {
    previous: 'shared.previous',
    next: 'shared.next',
    close: 'shared.close',
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
    showcase: 'modules.showcase',
    stubMessage: 'modules.stubMessage',
  },
  showcase: {
    pageTitle: 'showcase.pageTitle',
    pageSubtitle: 'showcase.pageSubtitle',
    searchPlaceholder: 'showcase.searchPlaceholder',
    sections: {
      buttons: 'showcase.sections.buttons',
      inputs: 'showcase.sections.inputs',
      toggles: 'showcase.sections.toggles',
      date: 'showcase.sections.date',
      containers: 'showcase.sections.containers',
      navigation: 'showcase.sections.navigation',
      lists: 'showcase.sections.lists',
      pagination: 'showcase.sections.pagination',
      dialogs: 'showcase.sections.dialogs',
      info: 'showcase.sections.info',
    },
  },
} as const;

type Leaves<T> = T extends string ? T : T extends Record<string, unknown> ? Leaves<T[keyof T]> : never;

export type TranslationKey = Leaves<typeof TRANSLATION_KEYS>;
