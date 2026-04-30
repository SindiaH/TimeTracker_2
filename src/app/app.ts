import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { NAV_LINKS, NavLink } from '@core/constants/nav-links';
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

  protected readonly navLinks: ReadonlyArray<NavLink> = NAV_LINKS;
  protected readonly navAriaLabelKey: TranslationKey = TRANSLATION_KEYS.header.navigation;

  protected readonly isMobile: Signal<boolean> = this.menuStateService.isMobile;
  protected readonly isMenuOpen: Signal<boolean> = this.menuStateService.isOpen;

  protected onDrawerOpenedChange(open: boolean): void {
    this.menuStateService.setOpen(open);
  }

  protected onMobileLinkClicked(): void {
    this.menuStateService.close();
  }
}
