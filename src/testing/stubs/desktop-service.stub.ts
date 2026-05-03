import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ActiveWindowInfo, SecondInstancePayload } from '@shared/desktop/ipc-contract';
import { IDesktopConfig } from '@shared/desktop/desktop-config';

@Injectable()
export class DesktopServiceStub {
  readonly isDesktop: boolean = false;
  readonly deepLink$: Observable<string> = EMPTY;
  readonly secondInstance$: Observable<SecondInstancePayload> = EMPTY;

  async getHostname(): Promise<string | null> {
    return null;
  }

  async getCurrentActiveWindow(): Promise<ActiveWindowInfo | null> {
    return null;
  }

  async getIdleSeconds(): Promise<number | null> {
    return null;
  }

  async getDesktopConfig(): Promise<IDesktopConfig | null> {
    return null;
  }

  async saveDesktopConfig(_config: IDesktopConfig): Promise<void> {
    return;
  }

  async getStoredTheme(): Promise<string | null> {
    return null;
  }

  async saveStoredTheme(_theme: string): Promise<void> {
    return;
  }

  async getSqliteFolder(): Promise<string | null> {
    return null;
  }
}
