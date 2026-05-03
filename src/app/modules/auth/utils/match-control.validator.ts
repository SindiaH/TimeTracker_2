import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FORM_ERROR_CODES } from '@core/constants/form-error-codes';

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
    const hasMismatch = targetErrors?.[FORM_ERROR_CODES.mismatch] === true;

    if (source.value === target.value) {
      if (hasMismatch) {
        const remaining = { ...targetErrors };
        delete remaining[FORM_ERROR_CODES.mismatch];
        target.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
      }
    } else if (!hasMismatch) {
      target.setErrors({ ...(targetErrors ?? {}), [FORM_ERROR_CODES.mismatch]: true });
    }
    return null;
  };
}
