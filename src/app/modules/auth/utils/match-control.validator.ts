import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchControlValidator(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const otherControl = parent.get(otherControlName);
    if (!otherControl) {
      return null;
    }
    return control.value === otherControl.value ? null : { mismatch: true };
  };
}
