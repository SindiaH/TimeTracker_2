import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchControlsValidator(sourceControlName: string, targetControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!(group instanceof FormGroup)) {
      return null;
    }
    const source = group.get(sourceControlName);
    const target = group.get(targetControlName);
    if (!source || !target) {
      return null;
    }
    const targetErrors = target.errors;
    const hasMismatch = targetErrors?.['mismatch'] === true;

    if (source.value === target.value) {
      if (hasMismatch) {
        const remaining = { ...targetErrors };
        delete remaining['mismatch'];
        target.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
      }
    } else if (!hasMismatch) {
      target.setErrors({ ...(targetErrors ?? {}), mismatch: true });
    }
    return null;
  };
}
