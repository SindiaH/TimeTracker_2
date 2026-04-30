import { Translation } from '@jsverse/transloco';
import { LanguageId } from '@core/constants/language.constants';

export type Locale = {
  langId: LanguageId;
  data: Translation;
};
