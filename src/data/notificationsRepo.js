/**
 * @file notificationsRepo.js
 * @description Repositorio para la creación, lectura y actualización de notificaciones del usuario.
 */

import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from './collections';
import { localStore } from './localStore';

/**
 * Crea una nueva notificación en el sistema.
 * @param {Object} notifData
 * @returns {Promise<Object>}
 */
export async function createNotification(notifData) {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    ...notifData,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, newNotif.id), newNotif);
  } catch (e) {}

  localStore.addNotification(newNotif);
  return newNotif;
}

/**
 * Marca una notificación como leída.
 * @param {string} notificationId
 */
export async function markNotificationAsRead(notificationId) {
  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      status: 'read',
    });
  } catch (e) {}

  localStore.updateNotification(notificationId, { status: 'read' });
}

/**
 * Marca todas las notificaciones de un usuario como leídas.
 * @param {string} userUid
 */
export async function markAllNotificationsAsRead(userUid) {
  const userNotifs = localStore.getNotifications(userUid);
  userNotifs.forEach(n => {
    if (n.status === 'unread') {
      localStore.updateNotification(n.id, { status: 'read' });
    }
  });
}
