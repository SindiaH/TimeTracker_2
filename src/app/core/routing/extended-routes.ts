import { Route } from '@angular/router';
import { ModuleDisplayName } from '@core/constants/module-display-names';
import { TranslationKey } from '@core/constants/translation-keys';

export type ExtendedRoutesData = {
  moduleName?: ModuleDisplayName;
  translationKey?: TranslationKey;
};

export type ExtendedRoute = Omit<Route, 'data'> & {
  data?: ExtendedRoutesData;
};

export type ExtendedRoutes = ExtendedRoute[];
