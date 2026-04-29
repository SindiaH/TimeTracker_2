import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { EventType, Router } from '@angular/router';
import { ComponentBase } from '@core/base/component-base';
import { TabGroupType } from '@shared/types/tab-group.type';

@Component({
  selector: 'app-tab-group',
  standalone: false,
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGroupComponent extends ComponentBase {
  readonly fitInkBarToContent = input<boolean>(false);
  readonly stretchTabs = input<boolean>(true);
  readonly tabs = input<TabGroupType[]>([]);

  readonly clicked = output<TabGroupType>();

  protected readonly computedTabs = signal<TabGroupType[]>([]);

  constructor(router: Router) {
    super();

    effect(() => {
      this.refreshTabs();
    });

    router.events.pipe(this.takeUntilDestroyed()).subscribe((event) => {
      if (event.type === EventType.NavigationEnd) {
        this.refreshTabs();
      }
    });
  }

  private refreshTabs(): void {
    const tabs = this.tabs().map((tab, index) => ({
      ...tab,
      id: tab.id ?? index,
      active: tab.link ? window.location.href.includes(tab.link) : tab.active,
    }));
    this.computedTabs.set(tabs);
  }

  protected activateTab(activatedTab: TabGroupType): void {
    const tabs = this.tabs().map((tab) => ({ ...tab, active: tab.label === activatedTab.label }));
    this.computedTabs.set(tabs);
    this.clicked.emit(activatedTab);
  }
}
