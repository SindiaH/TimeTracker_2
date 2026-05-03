export const FORM_ERROR_CODES = {
  required: 'required',
  email: 'email',
  minLength: 'minlength',
  maxLength: 'maxlength',
  min: 'min',
  max: 'max',
  pattern: 'pattern',
  mismatch: 'mismatch',
} as const;

export type FormErrorCode = (typeof FORM_ERROR_CODES)[keyof typeof FORM_ERROR_CODES];
