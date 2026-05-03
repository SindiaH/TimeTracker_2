import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent extends ComponentBase {
  readonly isDrawerOpen = input<boolean>(false);
  readonly drawerOpenedChange = output<boolean>();
}
