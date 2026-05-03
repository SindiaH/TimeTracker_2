import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
import { TranslationKey } from '@core/constants/translation-keys';
import { ExtendedRoutesData } from '@core/routing/extended-routes';

@Component({
  selector: 'app-module-stub',
  standalone: false,
  templateUrl: './module-stub.component.html',
  styleUrl: './module-stub.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleStubComponent extends ComponentBase {
  private readonly route = inject(ActivatedRoute);

  private readonly _moduleName = signal<string>('');
  private readonly _translationKey = signal<TranslationKey | null>(null);

  protected readonly moduleName: Signal<string> = this._moduleName.asReadonly();
  protected readonly translationKey: Signal<TranslationKey | null> = this._translationKey.asReadonly();

  constructor() {
    super();

    const data = this.route.snapshot.data as ExtendedRoutesData;
    this._moduleName.set(data.moduleName ?? '');
    this._translationKey.set(data.translationKey ?? null);
  }
}
