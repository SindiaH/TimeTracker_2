import type { SchemaPath } from '@angular/forms/signals';
import { validate } from '@angular/forms/signals';

export function matchValueValidator<TValue>(target: SchemaPath<TValue>, source: SchemaPath<TValue>): void {
  validate(target, ({ value, valueOf }) => {
    return value() === valueOf(source) ? null : { kind: 'mismatch' };
  });
}
