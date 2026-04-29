import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';

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

    const data: Data = this.route.snapshot.data;
    this.moduleName.set((data['moduleName'] as string | undefined) ?? '');
    this.translationKey.set((data['translationKey'] as string | undefined) ?? '');
  }
}
