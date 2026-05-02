import { ChangeDetectionStrategy, Component, inject, OnInit, Signal, signal } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { DesktopService } from '@core/services/desktop/desktop.service';
import { ActiveWindowInfo } from '@shared/desktop/ipc-contract';

const REFRESH_DELAY_SECONDS = 5;

@Component({
  selector: 'app-desktop-debug',
  standalone: false,
  templateUrl: './desktop-debug.component.html',
  styleUrl: './desktop-debug.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopDebugComponent extends ComponentBase implements OnInit {
  private readonly desktopService = inject(DesktopService);

  private readonly _isDesktop = signal<boolean>(false);
  private readonly _hostname = signal<string | null>(null);
  private readonly _idleSeconds = signal<number | null>(null);
  private readonly _activeWindow = signal<ActiveWindowInfo | null>(null);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _countdown = signal<number | null>(null);

  protected readonly isDesktop: Signal<boolean> = this._isDesktop.asReadonly();
  protected readonly hostname: Signal<string | null> = this._hostname.asReadonly();
  protected readonly idleSeconds: Signal<number | null> = this._idleSeconds.asReadonly();
  protected readonly activeWindow: Signal<ActiveWindowInfo | null> = this._activeWindow.asReadonly();
  protected readonly errorMessage: Signal<string | null> = this._errorMessage.asReadonly();
  protected readonly countdown: Signal<number | null> = this._countdown.asReadonly();

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.clearInterval());
  }

  ngOnInit(): void {
    this._isDesktop.set(this.desktopService.isDesktop);
    void this.performRefresh();
  }

  protected refresh(): void {
    if (this._countdown() !== null) {
      return;
    }
    this._errorMessage.set(null);
    this._countdown.set(REFRESH_DELAY_SECONDS);
    this.intervalId = setInterval(() => {
      const remaining = (this._countdown() ?? 0) - 1;
      if (remaining <= 0) {
        this.clearInterval();
        this._countdown.set(null);
        void this.performRefresh();
      } else {
        this._countdown.set(remaining);
      }
    }, 1000);
  }

  private async performRefresh(): Promise<void> {
    this._errorMessage.set(null);
    try {
      const [host, idle, win] = await Promise.all([
        this.desktopService.getHostname(),
        this.desktopService.getIdleSeconds(),
        this.desktopService.getCurrentActiveWindow(),
      ]);
      this._hostname.set(host);
      this._idleSeconds.set(idle);
      this._activeWindow.set(win);
    } catch (error) {
      this._errorMessage.set(error instanceof Error ? error.message : String(error));
    }
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
