import { BaseRepository } from './BaseRepository';
import { where, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

class NotificationRepositoryImpl extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Listens to a user's notifications, ordered by creation date descending.
   * @param {string} userId 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  listenForUser(userId, callback) {
    return this.listen([
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    ], callback);
  }

  /**
   * Marks a notification as read.
   * @param {string} notificationId 
   */
  async markAsRead(notificationId) {
    return this.update(notificationId, { read: true });
  }

  /**
   * Marks all provided notifications as read.
   * @param {Array} notifications 
   */
  async markAllAsRead(notifications) {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, this.collectionName, n.id), { read: true });
    });
    
    await batch.commit();
  }

  /**
   * Deletes all read notifications.
   * @param {Array} notifications 
   */
  async clearAllRead(notifications) {
    const readNotifs = notifications.filter(n => n.read);
    if (readNotifs.length === 0) return;

    const batch = writeBatch(db);
    readNotifs.forEach(n => {
      batch.delete(doc(db, this.collectionName, n.id));
    });

    await batch.commit();
  }
}

export const NotificationRepository = new NotificationRepositoryImpl();
