const { TimezoneManager } = require('./TimezoneManager');

class SlotGenerator {
  /**
   * Generates discrete UTC time slots for a specific local date, given a guide's availability block.
   */
  static generateSlotsForBlock(dateString, timeZone, block, duration, bufferTime) {
    const slots = [];
    
    // Parse the start and end of the block in UTC
    let currentSlotStartUTC = TimezoneManager.localTimeToUTC(dateString, block.start, timeZone);
    const blockEndUTC = TimezoneManager.localTimeToUTC(dateString, block.end, timeZone);

    while (currentSlotStartUTC < blockEndUTC) {
      const currentSlotEndUTC = TimezoneManager.addMinutesUTC(currentSlotStartUTC, duration);
      
      // If the slot plus duration exceeds the block's end, we stop generating for this block
      if (currentSlotEndUTC > blockEndUTC) {
        break;
      }

      slots.push({
        start: currentSlotStartUTC,
        end: currentSlotEndUTC
      });

      // Move to the next slot start, adding duration and the required buffer
      currentSlotStartUTC = TimezoneManager.addMinutesUTC(currentSlotStartUTC, duration + bufferTime);
    }

    return slots;
  }
}

module.exports = { SlotGenerator };
