/**
 * @file localStore.js
 * @description Almacén local reactivo con persistencia en localStorage y soporte pub/sub.
 * Garantiza que ExpenseShare funcione fluidamente de forma autónoma o como réplica local.
 */

import { SEED_USERS, SEED_HOUSEHOLDS, SEED_EXPENSES, SEED_NOTIFICATIONS } from './seedData';

const STORAGE_KEYS = {
  USERS: 'expenseshare_users',
  HOUSEHOLDS: 'expenseshare_households',
  EXPENSES: 'expenseshare_expenses',
  NOTIFICATIONS: 'expenseshare_notifications',
};

// Cargar o inicializar datos
function getInitial(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error leyendo localStorage:', e);
  }
  return fallback;
}

// Estado reactivo en memoria
const state = {
  users: getInitial(STORAGE_KEYS.USERS, SEED_USERS),
  households: getInitial(STORAGE_KEYS.HOUSEHOLDS, SEED_HOUSEHOLDS),
  expenses: getInitial(STORAGE_KEYS.EXPENSES, SEED_EXPENSES),
  notifications: getInitial(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
};

// Suscriptores de eventos
const listeners = new Set();

function persist(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }
}

function notify() {
  listeners.forEach((callback) => {
    try {
      callback({ ...state });
    } catch (err) {
      console.error('Error en listener de localStore:', err);
    }
  });
}

export const localStore = {
  getState() {
    return state;
  },

  subscribe(callback) {
    listeners.add(callback);
    callback({ ...state });
    return () => listeners.delete(callback);
  },

  // Operaciones de Usuarios
  getUsers() {
    return state.users;
  },

  getUserById(uid) {
    return state.users.find(u => u.uid === uid) || null;
  },

  getUserByHandle(handle) {
    const clean = handle.replace('@', '').toLowerCase();
    return state.users.find(u => u.handle.toLowerCase() === clean) || null;
  },

  addUser(user) {
    state.users = [...state.users, user];
    persist(STORAGE_KEYS.USERS, state.users);
    notify();
    return user;
  },

  updateUser(uid, updates) {
    state.users = state.users.map(u => (u.uid === uid ? { ...u, ...updates } : u));
    persist(STORAGE_KEYS.USERS, state.users);
    notify();
  },

  // Operaciones de Hogares
  getHouseholds() {
    return state.households;
  },

  getHouseholdById(id) {
    return state.households.find(h => h.id === id) || null;
  },

  addHousehold(household) {
    state.households = [household, ...state.households];
    persist(STORAGE_KEYS.HOUSEHOLDS, state.households);
    notify();
    return household;
  },

  updateHousehold(id, updates) {
    state.households = state.households.map(h => (h.id === id ? { ...h, ...updates } : h));
    persist(STORAGE_KEYS.HOUSEHOLDS, state.households);
    notify();
  },

  // Operaciones de Gastos
  getExpenses(householdId) {
    if (!householdId) return state.expenses;
    return state.expenses.filter(e => e.householdId === householdId);
  },

  getExpenseById(id) {
    return state.expenses.find(e => e.id === id) || null;
  },

  addExpense(expense) {
    state.expenses = [expense, ...state.expenses];
    persist(STORAGE_KEYS.EXPENSES, state.expenses);
    notify();
    return expense;
  },

  updateExpense(id, updates) {
    state.expenses = state.expenses.map(e => (e.id === id ? { ...e, ...updates } : e));
    persist(STORAGE_KEYS.EXPENSES, state.expenses);
    notify();
  },

  deleteExpense(id) {
    state.expenses = state.expenses.filter(e => e.id !== id);
    persist(STORAGE_KEYS.EXPENSES, state.expenses);
    notify();
  },

  // Operaciones de Notificaciones
  getNotifications(uid) {
    if (!uid) return state.notifications;
    return state.notifications.filter(n => n.recipientUid === uid);
  },

  addNotification(notif) {
    state.notifications = [notif, ...state.notifications];
    persist(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
    return notif;
  },

  updateNotification(id, updates) {
    state.notifications = state.notifications.map(n => (n.id === id ? { ...n, ...updates } : n));
    persist(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
  },

  // Restablecer datos iniciales
  resetToSeed() {
    state.users = [...SEED_USERS];
    state.households = [...SEED_HOUSEHOLDS];
    state.expenses = [...SEED_EXPENSES];
    state.notifications = [...SEED_NOTIFICATIONS];
    persist(STORAGE_KEYS.USERS, state.users);
    persist(STORAGE_KEYS.HOUSEHOLDS, state.households);
    persist(STORAGE_KEYS.EXPENSES, state.expenses);
    persist(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
    notify();
  }
};
