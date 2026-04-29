import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App extends ComponentBase {
  protected readonly title = signal<string>('TimeTracker_2');
  protected readonly isLoading = signal<boolean>(false);

  protected toggleLoading(): void {
    this.isLoading.update((value: boolean) => !value);
  }
}
