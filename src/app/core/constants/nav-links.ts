import { APP_ICONS, AppIcon } from '@core/constants/app-icons';
import { ROUTE_PATHS, RoutePath } from '@core/constants/app-routes';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { environment } from '@environments/environment';

export type NavLink = {
  path: RoutePath;
  translationKey: TranslationKey;
  icon: AppIcon;
};

export const PRIMARY_NAV_LINKS: ReadonlyArray<NavLink> = [
  { path: ROUTE_PATHS.tasks, translationKey: TRANSLATION_KEYS.modules.tasks, icon: APP_ICONS.navTasks },
  {
    path: ROUTE_PATHS.timeEntries,
    translationKey: TRANSLATION_KEYS.modules.timeEntries,
    icon: APP_ICONS.navTimeEntries,
  },
  { path: ROUTE_PATHS.calendar, translationKey: TRANSLATION_KEYS.modules.calendar, icon: APP_ICONS.navCalendar },
  {
    path: ROUTE_PATHS.activities,
    translationKey: TRANSLATION_KEYS.modules.activities,
    icon: APP_ICONS.navActivities,
  },
];

const SHOWCASE_NAV_LINK: NavLink = {
  path: ROUTE_PATHS.showcase,
  translationKey: TRANSLATION_KEYS.modules.showcase,
  icon: APP_ICONS.navShowcase,
};

export const SECONDARY_NAV_LINKS: ReadonlyArray<NavLink> = [
  { path: ROUTE_PATHS.settings, translationKey: TRANSLATION_KEYS.modules.settings, icon: APP_ICONS.navSettings },
  ...(environment.production ? [] : [SHOWCASE_NAV_LINK]),
  { path: ROUTE_PATHS.account, translationKey: TRANSLATION_KEYS.modules.account, icon: APP_ICONS.navAccount },
];

export const NAV_LINKS: ReadonlyArray<NavLink> = [...PRIMARY_NAV_LINKS, ...SECONDARY_NAV_LINKS];
