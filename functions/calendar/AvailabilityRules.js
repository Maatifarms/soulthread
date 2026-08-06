class AvailabilityRules {
  /**
   * Checks if a given date string (YYYY-MM-DD) falls on a holiday or vacation exception.
   */
  static isDateBlocked(dateString, exceptions) {
    if (!exceptions || exceptions.length === 0) return false;
    
    // Simple check if the target date is between startDate and endDate of any exception
    return exceptions.some(ex => {
      return dateString >= ex.startDate && dateString <= ex.endDate;
    });
  }

  /**
   * Extracts the working hour blocks for a specific date given the provider's recurring configuration.
   */
  static getWorkingHoursForDate(dateObjUTC, workingHoursConfig, timeZone) {
    // We need to know what day of the week it is in the PROVIDER'S local timezone, not UTC.
    // e.g., A Friday night UTC might be Saturday morning in Asia/Kolkata
    const { formatInTimeZone } = require('date-fns-tz');
    const localDayOfWeek = formatInTimeZone(dateObjUTC, timeZone, 'i'); // 1 = Monday, 7 = Sunday
    
    // JavaScript standard is 0 = Sunday, 1 = Monday... so convert 'i' (1-7) to (0-6)
    let jsDayIndex = parseInt(localDayOfWeek, 10) % 7; 
    
    // In workingHoursConfig, keys are "0", "1", "2" etc.
    const blocks = workingHoursConfig[String(jsDayIndex)];
    return blocks || [];
  }
}

module.exports = { AvailabilityRules };
