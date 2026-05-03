import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';

const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

export function provideAppDateAdapter(locale: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: locale },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ]);
}
