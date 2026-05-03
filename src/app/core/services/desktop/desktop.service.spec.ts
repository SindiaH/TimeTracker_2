import { TestBed } from '@angular/core/testing';
import { lastValueFrom, take, timeout } from 'rxjs';
import { DesktopService } from '@core/services/desktop/desktop.service';

describe('DesktopService — web fallback', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DesktopService] });
  });

  it('reports isDesktop=false when __TAURI_INTERNALS__ is undefined', () => {
    const service = TestBed.inject(DesktopService);

    expect(service.isDesktop).toBe(false);
  });

  it('returns null from every async accessor in the web build', async () => {
    const service = TestBed.inject(DesktopService);

    expect(await service.getHostname()).toBeNull();
    expect(await service.getCurrentActiveWindow()).toBeNull();
    expect(await service.getIdleSeconds()).toBeNull();
    expect(await service.getDesktopConfig()).toBeNull();
    expect(await service.getStoredTheme()).toBeNull();
    expect(await service.getSqliteFolder()).toBeNull();
  });

  it('saveDesktopConfig and saveStoredTheme are no-ops in the web build', async () => {
    const service = TestBed.inject(DesktopService);

    await expect(
      service.saveDesktopConfig({
        version: '1',
        autoTracking: { autoStartTracking: false },
        windowOptions: { zoom: 1 },
        sqlLiteConfig: { folder: '' },
        syncConfig: { activitiesSyncType: 'supabase', tasksSyncType: 'supabase' },
      }),
    ).resolves.toBeUndefined();

    await expect(service.saveStoredTheme('dark')).resolves.toBeUndefined();
  });

  it('deepLink$ and secondInstance$ complete immediately as EMPTY in the web build', async () => {
    const service = TestBed.inject(DesktopService);

    await expect(
      lastValueFrom(service.deepLink$.pipe(take(1), timeout(50)), { defaultValue: null }),
    ).resolves.toBeNull();
    await expect(
      lastValueFrom(service.secondInstance$.pipe(take(1), timeout(50)), { defaultValue: null }),
    ).resolves.toBeNull();
  });
});
