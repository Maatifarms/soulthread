# Calendar Engine

The Calendar Engine is a robust, timezone-aware availability engine built for SoulThread. It serves as the single source of truth for provider slots and seamlessly integrates with the `BookingEngine` via the `EventPublisher`.

## Core Features
1. **Dynamic Slot Generation**: Automatically splits provider working hours into discrete slots using configurable duration and buffer times.
2. **Double-Booking Prevention**: Utilizes Firestore Transactions and Ephemeral Locks (`slot_locks`) to guarantee atomicity. No two users can book the same slot at the same millisecond.
3. **Timezone Accuracy**: Built on top of `date-fns` and `date-fns-tz`. All internal operations are strict UTC. Daylight Savings Time shifts are safely respected.
4. **Holiday Blocking**: Fast filtering to prevent slots from generating on dates marked as `vacation`, `holiday`, or `blocked`.
5. **Event-Driven**: When a user selects a slot, `CalendarSlotReserved` is published. When a booking confirms, the `CalendarSubscriber` permanently locks the slot.

## Architecture

This engine utilizes the **Repository Pattern** and **Service Layer Pattern**:

- `CalendarRepository.js`: The only file that directly queries or mutates Firestore for calendar entities.
- `CalendarService.js`: The orchestrator that coordinates slot generation and locking.
- `SlotGenerator.js`, `AvailabilityRules.js`, `ConflictDetector.js`: Pure functions/static classes for domain logic. Extremely testable.
- `TimezoneManager.js`: The strict timezone boundary.

## APIs Exported

- `updateAvailability(guideId, payload)`: Configure recurring weekly hours.
- `blockDate(guideId, payload)`: Block out specific dates.
- `getAvailableSlots(guideId, targetDate)`: Main slot generation endpoint.
- `reserveSlot(guideId, startTime, endTime)`: Lock a slot for 10 minutes prior to checkout.
- `releaseSlot(lockId)`: Manually free a lock if the user abandons checkout.

## Firestore Schema

### `provider_availability/{guideId}`
```json
{
  "timezone": "Asia/Kolkata",
  "sessionDuration": 45,
  "bufferTime": 15,
  "workingHours": {
    "1": [{"start": "09:00", "end": "13:00"}],
    "2": [{"start": "10:00", "end": "17:00"}]
  }
}
```

### `slot_locks/{guideId_YYYYMMDD_HHMM}`
```json
{
  "guideId": "123",
  "userId": "456",
  "startTime": "2026-10-15T09:00:00.000Z",
  "endTime": "2026-10-15T09:45:00.000Z",
  "status": "locked",
  "expiresAt": "Timestamp(now + 10 mins)" 
}
```
*(A TTL policy on `expiresAt` automatically cleans up abandoned locks).*
