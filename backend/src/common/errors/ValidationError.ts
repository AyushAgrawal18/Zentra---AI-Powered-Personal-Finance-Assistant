import { AppError } from './AppError';

export class ValidationError extends AppError {
  public readonly details: any;

  constructor(message: string, details?: any, statusCode = 400) {
    super(message, statusCode, 'VALIDATION_ERROR');
    this.details = details;
  }
}
