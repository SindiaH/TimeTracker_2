import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TranslationKey } from '@core/constants/translation-keys';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent extends ComponentBase {
  readonly titleKey: InputSignal<TranslationKey | null> = input<TranslationKey | null>(null);
  readonly descriptionKey: InputSignal<TranslationKey | null> = input<TranslationKey | null>(null);
}
