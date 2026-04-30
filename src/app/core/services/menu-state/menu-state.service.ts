import { DOCUMENT } from '@angular/common';
import { inject, Injectable, Signal, signal } from '@angular/core';
import { ServiceBase } from '@core/base/service-base';
import { MENU_MOBILE_MEDIA_QUERY } from '@core/constants/layout';

@Injectable({ providedIn: 'root' })
export class MenuStateService extends ServiceBase {
  private readonly document = inject(DOCUMENT);

  private readonly mediaQuery: MediaQueryList | null = this.document.defaultView?.matchMedia
    ? this.document.defaultView.matchMedia(MENU_MOBILE_MEDIA_QUERY)
    : null;

  private readonly _isMobile = signal<boolean>(this.mediaQuery?.matches ?? false);
  private readonly _isOpen = signal<boolean>(false);

  readonly isMobile: Signal<boolean> = this._isMobile.asReadonly();
  readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();

  constructor() {
    super();
    this.subscribeToBreakpoint();
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggle(): void {
    this._isOpen.update((value) => !value);
  }

  setOpen(open: boolean): void {
    this._isOpen.set(open);
  }

  private subscribeToBreakpoint(): void {
    if (!this.mediaQuery) {
      return;
    }

    const listener = (event: MediaQueryListEvent): void => {
      this._isMobile.set(event.matches);
      if (!event.matches) {
        this._isOpen.set(false);
      }
    };

    this.mediaQuery.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => this.mediaQuery?.removeEventListener('change', listener));
  }
}
