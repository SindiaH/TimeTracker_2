import { APP_ICONS, AppIcon } from '@core/constants/app-icons';
import { ROUTE_PATHS, RoutePath } from '@core/constants/app-routes';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';

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

export const SECONDARY_NAV_LINKS: ReadonlyArray<NavLink> = [
  { path: ROUTE_PATHS.settings, translationKey: TRANSLATION_KEYS.modules.settings, icon: APP_ICONS.navSettings },
  { path: ROUTE_PATHS.auth, translationKey: TRANSLATION_KEYS.modules.auth, icon: APP_ICONS.navAuth },
  { path: ROUTE_PATHS.showcase, translationKey: TRANSLATION_KEYS.modules.showcase, icon: APP_ICONS.navShowcase },
];

export const NAV_LINKS: ReadonlyArray<NavLink> = [...PRIMARY_NAV_LINKS, ...SECONDARY_NAV_LINKS];
