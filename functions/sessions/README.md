# Session Engine

The Session Engine is the operational core of SoulThread's Guide-Patient interactions. It standardizes the lifecycle of all appointments regardless of whether they are Video, Audio, or Face-to-Face (Offline).

## Core Modules

1. **Session State Machine (`SessionStateMachine.js`)**:
   Enforces strict lifecycle transitions. A session must pass through `SCHEDULED -> PREPARING -> READY -> IN_PROGRESS -> COMPLETED`. Illegal transitions throw hard errors and revert the Firestore transaction.

2. **Provider Plugins (`MeetingProviderInterface.js`, `DailyProvider.js`, `OfflineProvider.js`)**:
   The engine implements a factory pattern (`ProviderFactory.js`). To add Zoom or Jitsi in the future, simply create a new class implementing the `MeetingProviderInterface` and register it in the factory. The core engine never knows which video provider is active.

3. **Session Core (`SessionService.js`)**:
   Handles the transactional state updates and automatically logs an immutable trail of events to the `session_events` subcollection. This acts as the definitive source of truth for Attendance (preventing "He said, She said" disputes regarding late arrivals).

4. **Event Integration (`SessionSubscriber.js`)**:
   Listens to the Event Bus. When a Booking moves to `BookingConfirmed`, the `SessionSubscriber` automatically creates the Session entity and generates the meeting room (if applicable).

## APIs Exported

- `joinSession(sessionId)`: Dynamically generates provider-specific tokens (e.g. Daily JWT) to ensure users cannot spoof roles (a patient cannot join as a host).
- `markReady(sessionId)`: Registers the user's presence in the waiting room.
- `startSession(sessionId)`: Marks the official start of the clinical timer.
- `completeSession(sessionId)`: Ends the session, automatically tearing down the video provider room and firing the `SessionCompleted` event to unlock the post-session Care Package workflows.

## Firestore Schema

### `sessions/{sessionId}`
```json
{
  "bookingId": "123",
  "guideId": "456",
  "patientId": "789",
  "mode": "video",
  "duration": 45,
  "status": "in_progress",
  "meetingDetails": {
    "provider": "daily",
    "meetingId": "room_xyz",
    "joinUrl": "https://...",
    "hostUrl": "https://..."
  },
  "workflowStatus": {
    "recording": false,
    "notesCompleted": false,
    "followUpAssigned": false
  }
}
```

### `sessions/{sessionId}/session_events/{eventId}`
```json
{
  "type": "GuideCheckedIn",
  "userId": "456",
  "role": "guide",
  "previousState": "preparing",
  "newState": "guide_ready",
  "timestamp": "Timestamp(now)"
}
```
