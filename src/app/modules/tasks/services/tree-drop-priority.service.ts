import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';
import { ServiceBase } from '@core/base/service-base';

@Injectable()
export class TreeDropPriorityService extends ServiceBase {
  private readonly document = inject(DOCUMENT);
  private cursor: { x: number; y: number } | null = null;

  constructor() {
    super();
    fromEvent<PointerEvent>(this.document, 'pointermove', { capture: true, passive: true })
      .pipe(this.takeUntilDestroyed())
      .subscribe((event) => {
        this.cursor = { x: event.clientX, y: event.clientY };
      });
  }

  hasInnerDropListUnderCursor(myContainer: Element): boolean {
    if (this.cursor === null) return false;
    const target = this.document.elementFromPoint(this.cursor.x, this.cursor.y);
    if (target === null) return false;
    let current: Element | null = target;
    while (current !== null && current !== myContainer) {
      if (current.classList.contains('cdk-drop-list')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
}
