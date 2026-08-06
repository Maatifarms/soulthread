import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * SOULTHREAD PLATFORM EVENT PUBLISHER
 * 
 * Master Integration Hub. Rather than individual UI components
 * dispatching complex downstream logic, components publish an event here.
 * Cloud Functions / Subscriptions handle the downstream routing
 * (e.g., updating timeline, generating push notifications, adjusting Analytics).
 */

export const PlatformEvents = {
    BOOKING_CREATED: 'BOOKING_CREATED',
    SESSION_COMPLETED: 'SESSION_COMPLETED',
    JOURNAL_CREATED: 'JOURNAL_CREATED',
    MOOD_UPDATED: 'MOOD_UPDATED',
    CARE_PLAN_UPDATED: 'CARE_PLAN_UPDATED',
    CARE_PLAN_CREATED: 'CARE_PLAN_CREATED',
    HOMEWORK_ASSIGNED: 'HOMEWORK_ASSIGNED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    FOLLOWUP_SCHEDULED: 'FOLLOWUP_SCHEDULED',
    RESOURCE_SHARED: 'RESOURCE_SHARED',
    CIRCLE_JOINED: 'CIRCLE_JOINED',
    ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
    PROFILE_UPDATED: 'PROFILE_UPDATED',
    NOTIFICATION_SENT: 'NOTIFICATION_SENT'
};

/**
 * Publishes a global platform event.
 * @param {string} eventType - One of PlatformEvents
 * @param {string} userId - The user who triggered the event
 * @param {object} payload - Structured payload specific to the event
 */
export async function publishEvent(eventType, userId, payload = {}) {
    try {
        await addDoc(collection(db, 'platform_events'), {
            type: eventType,
            userId: userId,
            payload: payload,
            timestamp: serverTimestamp(),
            status: 'pending' // Cloud functions process pending events, then mark 'processed'
        });
        
        // Log locally for debugging
        if (process.env.NODE_ENV !== 'production') {
            
        }
    } catch (error) {
        console.error(`[EventPublisher] Failed to publish ${eventType}:`, error);
        // We do not throw here to prevent blocking critical UI paths if the event bus is down
    }
}
