const { CalendarRepository } = require('./CalendarRepository');
const { AvailabilityRules } = require('./AvailabilityRules');
const { ConflictDetector } = require('./ConflictDetector');
const { SlotGenerator } = require('./SlotGenerator');
const { SlotLocker } = require('./SlotLocker');
const { TimezoneManager } = require('./TimezoneManager');
const { EventPublisher } = require('../events/EventPublisher');

class CalendarService {
  constructor() {
    this.repo = new CalendarRepository();
  }

  async updateAvailability(guideId, payload) {
    await this.repo.setAvailability(guideId, payload);
    // Optionally publish an event here if needed
  }

  async blockDate(guideId, payload) {
    const exceptionId = await this.repo.addException(guideId, payload);
    return exceptionId;
  }

  /**
   * Core orchestrator method for slot generation.
   * targetDateStr: YYYY-MM-DD
   */
  async getAvailableSlots(guideId, targetDateStr) {
    const config = await this.repo.getAvailability(guideId);
    if (!config) throw new Error('Provider availability not configured');

    const { timezone, sessionDuration, bufferTime, workingHours } = config;

    // 1. Check Holidays / Exceptions
    const startOfDayUTC = TimezoneManager.startOfDayUTC(targetDateStr, timezone);
    const endOfDayUTC = TimezoneManager.endOfDayUTC(targetDateStr, timezone);
    
    // ISO YYYY-MM-DD strings format matching
    const exceptions = await this.repo.getExceptionsInRange(guideId, targetDateStr, targetDateStr);
    if (AvailabilityRules.isDateBlocked(targetDateStr, exceptions)) {
      return []; // Completely blocked
    }

    // 2. Resolve Working Hours for the target date
    const dailyBlocks = AvailabilityRules.getWorkingHoursForDate(startOfDayUTC, workingHours, timezone);
    if (!dailyBlocks || dailyBlocks.length === 0) {
      return []; // Not working on this day
    }

    // 3. Generate raw slots in UTC
    let rawSlots = [];
    for (const block of dailyBlocks) {
      const slots = SlotGenerator.generateSlotsForBlock(targetDateStr, timezone, block, sessionDuration, bufferTime);
      rawSlots = rawSlots.concat(slots);
    }

    // 4. Fetch Conflicts (Locks & Bookings)
    // We only need to fetch constraints that fall within the UTC boundaries of the day
    const locks = await this.repo.getLocksInRange(guideId, startOfDayUTC, endOfDayUTC);
    const bookings = await this.repo.getBookingsInRange(guideId, startOfDayUTC, endOfDayUTC);

    // 5. Filter conflicts
    const availableSlots = rawSlots.filter(slot => {
      return !ConflictDetector.hasConflict(slot.start, slot.end, locks, bookings);
    });

    return availableSlots.map(s => ({
      start: s.start.toISOString(),
      end: s.end.toISOString()
    }));
  }

  async reserveSlot(db, guideId, userId, startTimeISO, endTimeISO) {
    const startTimeUTC = new Date(startTimeISO);
    const endTimeUTC = new Date(endTimeISO);
    
    // Acquire the lock transactionally
    const lockId = await SlotLocker.acquireLock(db, guideId, userId, startTimeUTC, endTimeUTC);
    
    // Emit Event
    await EventPublisher.publish('CalendarSlotReserved', { lockId, guideId, userId, startTime: startTimeISO });

    return lockId;
  }

  async releaseSlot(db, lockId, userId) {
    await SlotLocker.releaseLock(db, lockId, userId);
    await EventPublisher.publish('CalendarSlotReleased', { lockId, userId });
  }

  async confirmSlot(db, lockId) {
    await SlotLocker.confirmLock(db, lockId);
    await EventPublisher.publish('CalendarSlotBooked', { lockId });
  }
}

module.exports = { CalendarService };
