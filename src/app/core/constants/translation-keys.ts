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
    tasks: 'modules.tasks',
    timeEntries: 'modules.timeEntries',
    calendar: 'modules.calendar',
    activities: 'modules.activities',
    settings: 'modules.settings',
    account: 'modules.account',
    showcase: 'modules.showcase',
    stubMessage: 'modules.stubMessage',
  },
  account: {
    title: 'account.title',
    description: 'account.description',
    fields: {
      email: 'account.fields.email',
      userId: 'account.fields.userId',
    },
  },
  auth: {
    signOut: 'auth.signOut',
    fields: {
      email: 'auth.fields.email',
      password: 'auth.fields.password',
      newPassword: 'auth.fields.newPassword',
      confirmPassword: 'auth.fields.confirmPassword',
    },
    login: {
      title: 'auth.login.title',
      description: 'auth.login.description',
      submit: 'auth.login.submit',
      forgotPassword: 'auth.login.forgotPassword',
      orMagicLink: 'auth.login.orMagicLink',
      magicLinkButton: 'auth.login.magicLinkButton',
      noAccount: 'auth.login.noAccount',
      goToRegister: 'auth.login.goToRegister',
    },
    register: {
      title: 'auth.register.title',
      description: 'auth.register.description',
      submit: 'auth.register.submit',
      haveAccount: 'auth.register.haveAccount',
      goToLogin: 'auth.register.goToLogin',
    },
    passwordReset: {
      title: 'auth.passwordReset.title',
      description: 'auth.passwordReset.description',
      submit: 'auth.passwordReset.submit',
      backToLogin: 'auth.passwordReset.backToLogin',
    },
    feedback: {
      magicLinkSent: 'auth.feedback.magicLinkSent',
      passwordResetSent: 'auth.feedback.passwordResetSent',
      signupSuccess: 'auth.feedback.signupSuccess',
      passwordUpdated: 'auth.feedback.passwordUpdated',
    },
    errors: {
      emailRequired: 'auth.errors.emailRequired',
      emailInvalid: 'auth.errors.emailInvalid',
      passwordRequired: 'auth.errors.passwordRequired',
      passwordMinLength: 'auth.errors.passwordMinLength',
      passwordMismatch: 'auth.errors.passwordMismatch',
      invalidCredentials: 'auth.errors.invalidCredentials',
      emailNotConfirmed: 'auth.errors.emailNotConfirmed',
      userAlreadyExists: 'auth.errors.userAlreadyExists',
      userNotFound: 'auth.errors.userNotFound',
      weakPassword: 'auth.errors.weakPassword',
      samePassword: 'auth.errors.samePassword',
      rateLimit: 'auth.errors.rateLimit',
      otpDisabled: 'auth.errors.otpDisabled',
      signupDisabled: 'auth.errors.signupDisabled',
      recoveryLinkInvalid: 'auth.errors.recoveryLinkInvalid',
      unexpected: 'auth.errors.unexpected',
    },
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
