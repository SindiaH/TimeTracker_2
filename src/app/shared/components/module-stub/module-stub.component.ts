import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
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

  protected readonly moduleName: WritableSignal<string> = signal<string>('');
  protected readonly translationKey: WritableSignal<string> = signal<string>('');

  constructor() {
    super();

    const data = this.route.snapshot.data as ExtendedRoutesData;
    this.moduleName.set(data.moduleName ?? '');
    this.translationKey.set(data.translationKey ?? '');
  }
}
