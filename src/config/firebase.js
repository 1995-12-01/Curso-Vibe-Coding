/**
 * @file firebase.js
 * @description Inicialización del SDK de Firebase y conexión con los emuladores locales
 * (Auth: 9099, Firestore: 8080, Storage: 9199).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuración por defecto para desarrollo local
// El usuario podrá sustituir estos valores con las credenciales de su proyecto en la consola de Firebase
const firebaseConfig = {
  apiKey: "demo-expenseshare-api-key",
  authDomain: "demo-expenseshare.firebaseapp.com",
  projectId: "demo-expenseshare",
  storageBucket: "demo-expenseshare.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Inicializar la aplicación de Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Instancias de servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Estado de conexión a emuladores
let emulatorsConnected = false;

/**
 * Conecta los servicios de Firebase a los emuladores locales si se ejecuta en localhost
 */
export function initEmulators() {
  if (emulatorsConnected) return;

  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );

  if (isLocalhost) {
    try {
      // Conectar Emulador de Authentication en el puerto 9099
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      // Conectar Emulador de Firestore en el puerto 8080
      connectFirestoreEmulator(db, 'localhost', 8080);
      // Conectar Emulador de Storage en el puerto 9199
      connectStorageEmulator(storage, 'localhost', 9199);

      emulatorsConnected = true;
      console.info('⚡ [Firebase] Conectado exitosamente a los Emuladores locales (Auth: 9099, Firestore: 8080, Storage: 9199)');
    } catch (err) {
      console.warn('⚠️ [Firebase] Aviso al conectar emuladores (pueden estar ya conectados o no inicializados):', err.message);
    }
  }
}

// Ejecutar conexión a emuladores de manera segura
initEmulators();

export default app;
