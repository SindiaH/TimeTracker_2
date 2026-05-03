import { PostgrestError } from '@supabase/supabase-js';
import { DataErrorCode, DataOperationError } from '@database/services/interfaces/data-error';

export class SupabaseUtil {
  static parseDate(value: unknown): Date | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  static mapError(error: PostgrestError): DataOperationError {
    return new DataOperationError(SupabaseUtil.toCode(error), error.message, error);
  }

  static toCode(error: PostgrestError): DataErrorCode {
    switch (error.code) {
      case 'PGRST116':
        return 'not-found';
      case '42501':
        return 'permission-denied';
      case '23505':
        return 'conflict';
      default:
        return 'unknown';
    }
  }
}
