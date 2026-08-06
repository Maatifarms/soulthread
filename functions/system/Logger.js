/**
 * Structured Logger for Google Cloud Logging (Stackdriver)
 * Outputs JSON lines that can be automatically parsed, indexed, and alerted on.
 */
class Logger {
  static format(level, message, context = {}) {
    // GCP natively parses 'severity' field
    const logEntry = {
      severity: level,
      message: message,
      timestamp: new Date().toISOString(),
      ...context
    };
    return JSON.stringify(logEntry);
  }

  /**
   * @param {string} message 
   * @param {Object} [context] - Correlation IDs, user IDs, etc.
   */
  static info(message, context = {}) {
    console.log(this.format('INFO', message, context));
  }

  static warn(message, context = {}) {
    console.warn(this.format('WARNING', message, context));
  }

  static error(message, context = {}, error = null) {
    const errorDetails = error ? { 
      errorName: error.name, 
      errorMessage: error.message, 
      stack: error.stack 
    } : {};
    
    console.error(this.format('ERROR', message, { ...context, ...errorDetails }));
  }

  static fatal(message, context = {}, error = null) {
    // FATAL should trigger immediate P0 alerts in a properly configured GCP environment
    const errorDetails = error ? { 
      errorName: error.name, 
      errorMessage: error.message, 
      stack: error.stack 
    } : {};
    
    console.error(this.format('CRITICAL', message, { ...context, ...errorDetails }));
  }
}

module.exports = { Logger };
