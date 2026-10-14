/**
 * @file HouseholdContext.jsx
 * @description Contexto para la gestión del hogar activo y la sincronización
 * de los hogares que administra o a los que pertenece el usuario.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { localStore } from '../data/localStore';

const HouseholdContext = createContext();

export function HouseholdProvider({ children }) {
  const { currentUser } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(() => {
    return localStorage.getItem('expenseshare_active_hh') || 'hh_roble402';
  });

  // Suscribirse a cambios en el localStore
  useEffect(() => {
    const unsubscribe = localStore.subscribe((state) => {
      if (!currentUser) {
        setHouseholds([]);
        return;
      }
      // Filtrar hogares donde el usuario es admin o miembro
      const userHouseholds = state.households.filter(
        h => h.adminUid === currentUser.uid || h.memberUids.includes(currentUser.uid)
      );
      setHouseholds(userHouseholds);

      // Si el hogar seleccionado no está en la lista y hay disponibles, seleccionar el primero
      if (userHouseholds.length > 0) {
        setSelectedHouseholdId(prev => {
          const exists = userHouseholds.some(h => h.id === prev);
          const nextId = exists ? prev : userHouseholds[0].id;
          localStorage.setItem('expenseshare_active_hh', nextId);
          return nextId;
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const selectHousehold = (id) => {
    setSelectedHouseholdId(id);
    localStorage.setItem('expenseshare_active_hh', id);
  };

  const currentHousehold = households.find(h => h.id === selectedHouseholdId) || households[0] || null;
  const isCurrentAdmin = currentHousehold ? currentHousehold.adminUid === currentUser?.uid : false;

  const administeredHouseholds = households.filter(h => h.adminUid === currentUser?.uid);
  const memberHouseholds = households.filter(h => h.memberUids.includes(currentUser?.uid) && h.adminUid !== currentUser?.uid);

  return (
    <HouseholdContext.Provider
      value={{
        households,
        currentHousehold,
        selectedHouseholdId,
        selectHousehold,
        isCurrentAdmin,
        administeredHouseholds,
        memberHouseholds,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHousehold debe ser usado dentro de HouseholdProvider');
  return context;
}
