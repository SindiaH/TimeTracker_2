import { InjectionToken, Provider } from '@angular/core';
import { vi } from 'vitest';

/**
 * Wraps every function-typed property of `shape` in a `vi.fn()` so tests can
 * spy on it. Non-function properties (signals, observables, primitives) are
 * passed through unchanged. Use this to build hand-typed mock implementations
 * of backend interfaces (`IAuthService`, future `ITaskService`, …) where TS
 * structural typing keeps the shape in sync with the interface.
 */
export function createBackendMock<T extends object>(shape: T): T {
  const mock: Record<string, unknown> = {};
  for (const key of Object.keys(shape)) {
    const value = (shape as Record<string, unknown>)[key];
    mock[key] = typeof value === 'function' ? vi.fn(value as (...args: unknown[]) => unknown) : value;
  }
  return mock as T;
}

export function autoMockProvider<T extends object>(token: InjectionToken<T>, shape: T): Provider {
  return { provide: token, useFactory: () => createBackendMock<T>(shape) };
}
