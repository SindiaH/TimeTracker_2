import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
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

  protected readonly isDesktop: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly hostname: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly idleSeconds: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly activeWindow: WritableSignal<ActiveWindowInfo | null> = signal<ActiveWindowInfo | null>(null);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly countdown: WritableSignal<number | null> = signal<number | null>(null);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.clearInterval());
  }

  ngOnInit(): void {
    this.isDesktop.set(this.desktopService.isDesktop);
    void this.performRefresh();
  }

  protected refresh(): void {
    if (this.countdown() !== null) {
      return;
    }
    this.errorMessage.set(null);
    this.countdown.set(REFRESH_DELAY_SECONDS);
    this.intervalId = setInterval(() => {
      const remaining = (this.countdown() ?? 0) - 1;
      if (remaining <= 0) {
        this.clearInterval();
        this.countdown.set(null);
        void this.performRefresh();
      } else {
        this.countdown.set(remaining);
      }
    }, 1000);
  }

  private async performRefresh(): Promise<void> {
    this.errorMessage.set(null);
    try {
      const [host, idle, win] = await Promise.all([
        this.desktopService.getHostname(),
        this.desktopService.getIdleSeconds(),
        this.desktopService.getCurrentActiveWindow(),
      ]);
      this.hostname.set(host);
      this.idleSeconds.set(idle);
      this.activeWindow.set(win);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : String(error));
    }
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
