import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { MenuStateService } from '@core/services/menu-state/menu-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App extends ComponentBase {
  private readonly menuStateService = inject(MenuStateService);

  protected readonly isMenuOpen: Signal<boolean> = this.menuStateService.isOpen;

  protected onDrawerOpenedChange(open: boolean): void {
    this.menuStateService.setOpen(open);
  }
}
