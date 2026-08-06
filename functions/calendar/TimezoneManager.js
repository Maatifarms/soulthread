const { formatInTimeZone, toZonedTime, fromZonedTime } = require('date-fns-tz');
const { parse, isValid, addMinutes } = require('date-fns');

/**
 * TimezoneManager abstracts date-fns-tz logic for DST-safe math.
 * All internal engine operations use UTC Dates/Timestamps.
 * Conversions to/from Guide's local timezone only happen at the boundary.
 */
class TimezoneManager {
  /**
   * Converts a local time string (e.g. "09:00") on a specific local date string (e.g. "2026-10-15")
   * in a specific timezone to a UTC Date object.
   */
  static localTimeToUTC(dateString, timeString, timeZone) {
    const localDateTimeStr = `${dateString}T${timeString}:00`;
    // Parse the local time assuming it's exactly what the clock says in that timezone
    // fromZonedTime converts that local wall-clock time into a true UTC Date
    return fromZonedTime(localDateTimeStr, timeZone);
  }

  /**
   * Converts a UTC Date back to a local string format.
   */
  static utcToLocalString(utcDate, timeZone, format = 'yyyy-MM-dd HH:mm:ss') {
    return formatInTimeZone(utcDate, timeZone, format);
  }

  /**
   * Safe addition of minutes to a UTC date.
   */
  static addMinutesUTC(utcDate, minutes) {
    return addMinutes(utcDate, minutes);
  }

  /**
   * Get the start of the day in a specific timezone, returned as UTC Date.
   */
  static startOfDayUTC(dateString, timeZone) {
    return this.localTimeToUTC(dateString, "00:00", timeZone);
  }

  /**
   * Get the end of the day in a specific timezone, returned as UTC Date.
   */
  static endOfDayUTC(dateString, timeZone) {
    return this.localTimeToUTC(dateString, "23:59", timeZone);
  }
}

module.exports = { TimezoneManager };
