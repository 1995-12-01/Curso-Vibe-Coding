/**
 * @file householdsRepo.js
 * @description Repositorio de datos para administración de Hogares, invitaciones y miembros.
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from './collections';
import { localStore } from './localStore';
import { createNotification } from './notificationsRepo';

/**
 * Obtiene todos los hogares en los que participa un usuario (como admin o miembro).
 * @param {string} uid
 * @returns {Promise<{ administered: Array<Object>, memberOf: Array<Object> }>}
 */
export async function getHouseholdsForUser(uid) {
  const allHouseholds = localStore.getHouseholds();

  const administered = allHouseholds.filter(h => h.adminUid === uid);
  const memberOf = allHouseholds.filter(h => h.memberUids.includes(uid) && h.adminUid !== uid);

  return { administered, memberOf };
}

/**
 * Obtiene un hogar por su ID.
 * @param {string} householdId
 * @returns {Promise<Object|null>}
 */
export async function getHouseholdById(householdId) {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId));
    if (snap.exists()) return snap.data();
  } catch (e) {
    // Usar store local
  }
  return localStore.getHouseholdById(householdId);
}

/**
 * Crea un nuevo hogar. El creador se convierte automáticamente en el administrador.
 * @param {string} name Nombre del hogar
 * @param {string} adminUid UID del usuario creador
 * @returns {Promise<Object>} Hogar creado
 */
export async function createHousehold(name, adminUid) {
  const newHousehold = {
    id: `hh_${Date.now()}`,
    name: name.trim(),
    adminUid,
    memberUids: [adminUid],
    pendingInvites: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTIONS.HOUSEHOLDS, newHousehold.id), newHousehold);
  } catch (e) {
    console.debug('Usando store local para createHousehold:', e.message);
  }

  localStore.addHousehold(newHousehold);
  return newHousehold;
}

/**
 * Invita a un usuario a unirse al hogar mediante su UID.
 * Se agrega a pendingInvites y se le envía una notificación.
 * @param {string} householdId
 * @param {string} inviteeUid
 * @param {string} adminName
 * @returns {Promise<void>}
 */
export async function inviteUserToHousehold(householdId, inviteeUid, adminName) {
  const household = localStore.getHouseholdById(householdId);
  if (!household) throw new Error('Hogar no encontrado.');

  if (household.memberUids.includes(inviteeUid)) {
    throw new Error('El usuario ya es miembro de este hogar.');
  }

  if (household.pendingInvites?.includes(inviteeUid)) {
    throw new Error('Ya existe una invitación pendiente para este usuario.');
  }

  const updatedPending = [...(household.pendingInvites || []), inviteeUid];

  try {
    await updateDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId), {
      pendingInvites: updatedPending,
    });
  } catch (e) {
    // Local fallback
  }

  localStore.updateHousehold(householdId, { pendingInvites: updatedPending });

  // Crear notificación para el usuario invitado
  await createNotification({
    recipientUid: inviteeUid,
    type: 'invite',
    title: 'Invitación a nuevo hogar',
    message: `${adminName} te ha invitado a unirte al hogar "${household.name}".`,
    status: 'unread',
    householdId,
    householdName: household.name,
  });
}

/**
 * Acepta una invitación pendiente a un hogar.
 * @param {string} householdId
 * @param {string} userUid
 */
export async function acceptHouseholdInvite(householdId, userUid) {
  const household = localStore.getHouseholdById(householdId);
  if (!household) return;

  const updatedPending = (household.pendingInvites || []).filter(uid => uid !== userUid);
  const updatedMembers = Array.from(new Set([...household.memberUids, userUid]));

  try {
    await updateDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId), {
      pendingInvites: updatedPending,
      memberUids: updatedMembers,
    });
  } catch (e) {}

  localStore.updateHousehold(householdId, {
    pendingInvites: updatedPending,
    memberUids: updatedMembers,
  });
}

/**
 * Rechaza o cancela una invitación pendiente a un hogar.
 * @param {string} householdId
 * @param {string} userUid
 */
export async function declineHouseholdInvite(householdId, userUid) {
  const household = localStore.getHouseholdById(householdId);
  if (!household) return;

  const updatedPending = (household.pendingInvites || []).filter(uid => uid !== userUid);

  try {
    await updateDoc(doc(db, COLLECTIONS.HOUSEHOLDS, householdId), {
      pendingInvites: updatedPending,
    });
  } catch (e) {}

  localStore.updateHousehold(householdId, {
    pendingInvites: updatedPending,
  });
}
