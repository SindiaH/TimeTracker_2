import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

@Injectable()
export class ChangeDetectorRefStub implements Partial<ChangeDetectorRef> {
  detectChanges(): void {
    return;
  }

  markForCheck(): void {
    return;
  }

  detach(): void {
    return;
  }

  reattach(): void {
    return;
  }

  checkNoChanges(): void {
    return;
  }
}

export const createRouterStub = () => ({
  navigate: vi.fn().mockResolvedValue(true),
  navigateByUrl: vi.fn().mockResolvedValue(true),
  createUrlTree: vi.fn(),
  serializeUrl: vi.fn().mockReturnValue(''),
  events: of(),
  url: '/',
});

export const activatedRouteStub: Partial<ActivatedRoute> = {
  params: of({}),
  queryParams: of({}),
  fragment: of(null),
  data: of({}),
  snapshot: {
    params: {},
    queryParams: {},
    data: {},
  } as unknown as ActivatedRoute['snapshot'],
};
