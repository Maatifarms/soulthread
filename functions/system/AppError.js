/**
 * Standardized Application Error
 * Distinguishes expected operational errors (e.g. Invalid Input, Not Found)
 * from programmatic bugs, ensuring we map them to correct HTTP codes
 * without leaking internal stack traces.
 */
class AppError extends Error {
  /**
   * @param {string} code - Internal error code (e.g., 'NOT_FOUND', 'PERMISSION_DENIED')
   * @param {string} message - Human readable message
   * @param {number} httpStatus - The HTTP status to return (e.g., 404, 403)
   * @param {Object} [details] - Additional contextual data
   */
  constructor(code, message, httpStatus = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    
    // Captures the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory for 404 Not Found
   */
  static NotFound(message = 'Resource not found', details = {}) {
    return new AppError('NOT_FOUND', message, 404, details);
  }

  /**
   * Factory for 403 Permission Denied
   */
  static PermissionDenied(message = 'Permission denied', details = {}) {
    return new AppError('PERMISSION_DENIED', message, 403, details);
  }

  /**
   * Factory for 400 Bad Request
   */
  static BadRequest(message = 'Invalid request', details = {}) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }
  
  /**
   * Factory for 409 Conflict (e.g. Double Booking)
   */
  static Conflict(message = 'Resource conflict', details = {}) {
    return new AppError('CONFLICT', message, 409, details);
  }
}

module.exports = { AppError };
