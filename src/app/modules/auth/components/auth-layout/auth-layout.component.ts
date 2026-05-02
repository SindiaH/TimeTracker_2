import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent extends ComponentBase {
  readonly titleKey = input<string>('');
  readonly descriptionKey = input<string>('');
}
