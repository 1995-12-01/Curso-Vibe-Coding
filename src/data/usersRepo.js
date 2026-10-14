/**
 * @file usersRepo.js
 * @description Repositorio de datos para usuarios: perfiles, búsqueda de handles,
 * verificación de unicidad y sugerencia de alternativas.
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from './collections';
import { localStore } from './localStore';
import { generateHandleSuggestions } from '../domain/handleGenerator';

/**
 * Obtiene el perfil de un usuario por su UID.
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.debug('Usando fallback localStore para getUserProfile:', error.message);
  }
  return localStore.getUserById(uid);
}

/**
 * Crea o guarda el perfil de un usuario en Firestore y en el almacén local.
 * @param {Object} userData
 */
export async function createUserProfile(userData) {
  const cleanData = {
    ...userData,
    handle: userData.handle.replace('@', '').toLowerCase(),
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTIONS.USERS, cleanData.uid), cleanData);
  } catch (error) {
    console.debug('Usando fallback localStore para createUserProfile:', error.message);
  }

  localStore.addUser(cleanData);
  return cleanData;
}

/**
 * Actualiza datos del perfil del usuario (nombre, color de acento, etc.).
 * @param {string} uid
 * @param {Object} updates
 */
export async function updateUserProfile(uid, updates) {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
  } catch (error) {
    console.debug('Usando fallback localStore para updateUserProfile:', error.message);
  }
  localStore.updateUser(uid, updates);
}

/**
 * Verifica si un handle ya está en uso y sugiere alternativas si no está disponible.
 * @param {string} handle Handle a verificar (sin o con @)
 * @param {string} [currentUid] UID opcional del usuario actual para ignorarlo en la verificación
 * @returns {Promise<{ isAvailable: boolean, suggestions: string[] }>}
 */
export async function checkHandleAvailability(handle, currentUid = null) {
  const clean = handle.replace('@', '').toLowerCase().trim();
  const allUsers = localStore.getUsers();
  const existingHandles = allUsers.map(u => u.handle.toLowerCase());

  // Buscar en Firestore si está conectado
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('handle', '==', clean));
    const snap = await getDocs(q);
    const foundDoc = snap.docs.find(d => d.id !== currentUid);
    if (foundDoc) {
      const suggestions = generateHandleSuggestions(clean, existingHandles);
      return { isAvailable: false, suggestions };
    }
  } catch (e) {
    // Si Firestore no está listo, verificar en memoria local
  }

  const match = allUsers.find(u => u.handle.toLowerCase() === clean && u.uid !== currentUid);
  if (match) {
    const suggestions = generateHandleSuggestions(clean, existingHandles);
    return { isAvailable: false, suggestions };
  }

  return { isAvailable: true, suggestions: [] };
}

/**
 * Busca usuarios por handle para la funcionalidad de autocompletado al invitar miembros.
 * @param {string} queryStr Término de búsqueda (ej. "mar")
 * @param {string[]} [excludeUids] Lista de UIDs que ya son miembros para no sugerirlos
 * @returns {Promise<Array<{ uid: string, displayName: string, handle: string, accentColor: string }>>}
 */
export async function searchUsersByHandle(queryStr, excludeUids = []) {
  if (!queryStr || queryStr.trim().length === 0) return [];

  const cleanQuery = queryStr.replace('@', '').toLowerCase().trim();
  const allUsers = localStore.getUsers();

  const filtered = allUsers.filter(u => {
    if (excludeUids.includes(u.uid)) return false;
    return (
      u.handle.toLowerCase().includes(cleanQuery) ||
      u.displayName.toLowerCase().includes(cleanQuery)
    );
  });

  return filtered.slice(0, 5);
}
