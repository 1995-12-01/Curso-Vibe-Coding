/**
 * @file AuthContext.jsx
 * @description Contexto de autenticación para ExpenseShare.
 * Soporta Email/Contraseña, Google Auth con diálogo de onboarding para handle y color,
 * persistencia de perfil y selector ágil de usuarios de prueba.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, createUserProfile, updateUserProfile, checkHandleAvailability } from '../data/usersRepo';
import { getRandomAccentColor, USER_ACCENT_COLORS } from '../domain/constants';
import { localStore } from '../data/localStore';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { applyUserThemeColors } = useTheme();

  // Usuario activo en el sistema (por defecto Carlos para facilitar la primera vista en desarrollo)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('expenseshare_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return localStore.getUserById('user_carlos');
  });

  const [loading, setLoading] = useState(false);
  const [googleOnboardingUser, setGoogleOnboardingUser] = useState(null); // Usuario de Google pendiente de handle

  // Sincronizar colores de trama en cuanto cambia el usuario activo
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('expenseshare_active_user', JSON.stringify(currentUser));
      applyUserThemeColors({
        accent: currentUser.accentColor,
        pastel: currentUser.pastelColor,
        dot: currentUser.pastelDot,
      });
    }
  }, [currentUser]);

  // Escuchar cambios de Auth en Firebase (cuando el emulador o servicio esté activo)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * Iniciar sesión con correo y contraseña
   */
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      // Intentar con Firebase Auth si el emulador está listo
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(credential.user.uid);
        if (profile) {
          setCurrentUser(profile);
          return profile;
        }
      } catch (authError) {
        // Fallback local en desarrollo
        console.debug('Firebase Auth local fallback:', authError.message);
      }

      // Buscar usuario en el almacén local
      const found = localStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setCurrentUser(found);
        return found;
      }
      throw new Error('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrarse con Correo, Contraseña, Nombre y Handle
   */
  const registerWithEmail = async (email, password, displayName, handle) => {
    setLoading(true);
    try {
      const cleanHandle = handle.replace('@', '').toLowerCase().trim();
      const availability = await checkHandleAvailability(cleanHandle);
      if (!availability.isAvailable) {
        throw new Error(`El handle @${cleanHandle} ya está en uso. Prueba con: ${availability.suggestions.join(', ')}`);
      }

      const randomColor = getRandomAccentColor();
      let uid = `user_${Date.now()}`;

      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        uid = credential.user.uid;
      } catch (authError) {
        console.debug('Firebase Auth fallback para registro:', authError.message);
      }

      const newProfile = {
        uid,
        email,
        displayName: displayName || cleanHandle,
        handle: cleanHandle,
        accentColor: randomColor.accent,
        pastelColor: randomColor.pastel,
        pastelDot: randomColor.dot,
        createdAt: new Date().toISOString(),
      };

      await createUserProfile(newProfile);
      setCurrentUser(newProfile);
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar sesión con Cuenta de Google
   */
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      let firebaseUser = null;

      try {
        const result = await signInPopup(auth, provider);
        firebaseUser = result.user;
      } catch (e) {
        console.debug('Fallback Google Sign-In simulado:', e.message);
        // Simular respuesta de Google para desarrollo local
        firebaseUser = {
          uid: `google_${Date.now()}`,
          email: 'usuario.google@gmail.com',
          displayName: 'Usuario Google',
        };
      }

      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (existingProfile) {
        setCurrentUser(existingProfile);
        return { needsOnboarding: false, profile: existingProfile };
      }

      // Si no existe, activar diálogo modal de onboarding para elegir handle y color
      setGoogleOnboardingUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Usuario Google',
      });

      return { needsOnboarding: true, tempUser: firebaseUser };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Completar onboarding de usuario de Google seleccionando handle y color
   */
  const completeGoogleOnboarding = async (handle, colorObj) => {
    if (!googleOnboardingUser) throw new Error('No hay sesión de Google pendiente.');

    const cleanHandle = handle.replace('@', '').toLowerCase().trim();
    const availability = await checkHandleAvailability(cleanHandle);
    if (!availability.isAvailable) {
      throw new Error(`El handle @${cleanHandle} ya está en uso. Opciones sugeridas: ${availability.suggestions.join(', ')}`);
    }

    const selectedColor = colorObj || getRandomAccentColor();

    const newProfile = {
      uid: googleOnboardingUser.uid,
      email: googleOnboardingUser.email,
      displayName: googleOnboardingUser.displayName,
      handle: cleanHandle,
      accentColor: selectedColor.accent,
      pastelColor: selectedColor.pastel,
      pastelDot: selectedColor.dot,
      createdAt: new Date().toISOString(),
    };

    await createUserProfile(newProfile);
    setCurrentUser(newProfile);
    setGoogleOnboardingUser(null);
    return newProfile;
  };

  /**
   * Actualizar color de identificación del usuario actual
   */
  const updateUserColor = async (colorObj) => {
    if (!currentUser) return;
    const updates = {
      accentColor: colorObj.accent,
      pastelColor: colorObj.pastel,
      pastelDot: colorObj.dot,
    };
    await updateUserProfile(currentUser.uid, updates);
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  /**
   * Cambiar de usuario en desarrollo local para alternar rápidamente entre roles
   */
  const switchDemoUser = (targetUid) => {
    const user = localStore.getUserById(targetUid);
    if (user) {
      setCurrentUser(user);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('expenseshare_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        googleOnboardingUser,
        setGoogleOnboardingUser,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        completeGoogleOnboarding,
        updateUserColor,
        switchDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
}
