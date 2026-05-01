import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { APP_ICONS, AppIcon } from '@core/constants/app-icons';
import { NavLink, PRIMARY_NAV_LINKS } from '@core/constants/nav-links';
import { TRANSLATION_KEYS, TranslationKey } from '@core/constants/translation-keys';
import { MenuStateService } from '@core/services/menu-state/menu-state.service';

@Component({
  selector: 'app-shared-header',
  standalone: false,
  templateUrl: './shared-header.component.html',
  styleUrl: './shared-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedHeaderComponent extends ComponentBase {
  private readonly menuStateService = inject(MenuStateService);

  protected readonly brandIcon: AppIcon = APP_ICONS.brand;
  protected readonly brandTitleKey: TranslationKey = TRANSLATION_KEYS.app.title;
  protected readonly navAriaLabelKey: TranslationKey = TRANSLATION_KEYS.header.navigation;

  protected readonly isMobile: Signal<boolean> = this.menuStateService.isMobile;
  protected readonly isMenuOpen: Signal<boolean> = this.menuStateService.isOpen;

  protected readonly menuButtonIcon: Signal<AppIcon> = computed<AppIcon>(() =>
    this.isMenuOpen() ? APP_ICONS.menuClose : APP_ICONS.menuOpen,
  );

  protected readonly menuButtonAriaKey: Signal<TranslationKey> = computed<TranslationKey>(() =>
    this.isMenuOpen() ? TRANSLATION_KEYS.header.menuClose : TRANSLATION_KEYS.header.menuOpen,
  );

  protected readonly primaryNavLinks: ReadonlyArray<NavLink> = PRIMARY_NAV_LINKS;

  protected onMenuToggle(): void {
    this.menuStateService.toggle();
  }
}
