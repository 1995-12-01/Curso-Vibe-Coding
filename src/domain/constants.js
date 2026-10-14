/**
 * @file constants.js
 * @description Definición de constantes del dominio para ExpenseShare:
 * categorías, estados de gasto, colores de identificación de usuarios y configuración general.
 */

// Categorías de gasto requeridas por especificación
export const EXPENSE_CATEGORIES = [
  { id: 'servicios', label: 'Servicios (luz, agua, internet)', icon: 'Zap' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'Utensils' },
  { id: 'renta', label: 'Renta o hipoteca', icon: 'Home' },
  { id: 'transporte', label: 'Transporte', icon: 'Car' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: 'Film' },
  { id: 'compras', label: 'Compras del hogar', icon: 'ShoppingBag' },
  { id: 'salud', label: 'Salud', icon: 'HeartPulse' },
  { id: 'otros', label: 'Otros', icon: 'Layers' },
];

// Estados de un gasto con sus identificadores y estilos visuales
export const EXPENSE_STATUSES = {
  PENDING: {
    id: 'pending_acceptance',
    label: 'Pendiente de aceptación',
    badgeClass: 'badge-pending',
    color: '#EAB308', // Amarillo
  },
  IN_PROGRESS: {
    id: 'in_progress',
    label: 'En progreso',
    badgeClass: 'badge-in_progress',
    color: '#3B82F6', // Azul
  },
  PARTIALLY_PAID: {
    id: 'partially_paid',
    label: 'Parcialmente pagado',
    badgeClass: 'badge-partially_paid',
    color: '#F97316', // Naranja
  },
  PAID: {
    id: 'paid',
    label: 'Pagado',
    badgeClass: 'badge-paid',
    color: '#22C55E', // Verde
  },
  REJECTED: {
    id: 'rejected',
    label: 'Rechazado',
    badgeClass: 'badge-rejected',
    color: '#EF4444', // Rojo
  },
};

// Paleta curada de colores de identificación para miembros.
// Cada color incluye su versión de acento viva y su versión pastel para tramas de fondo.
export const USER_ACCENT_COLORS = [
  { name: 'Azul Eléctrico', accent: '#2563EB', pastel: '#DBEAFE', dot: 'rgba(37, 99, 235, 0.22)' },
  { name: 'Esmeralda Fresco', accent: '#059669', pastel: '#D1FAE5', dot: 'rgba(5, 150, 105, 0.22)' },
  { name: 'Violeta Intenso', accent: '#7C3AED', pastel: '#EDE9FE', dot: 'rgba(124, 58, 237, 0.22)' },
  { name: 'Rosa Vibrante', accent: '#DB2777', pastel: '#FCE7F3', dot: 'rgba(219, 39, 119, 0.22)' },
  { name: 'Ámbar Cálido', accent: '#D97706', pastel: '#FEF3C7', dot: 'rgba(217, 119, 6, 0.22)' },
  { name: 'Cian Océano', accent: '#0891B2', pastel: '#CFFAFE', dot: 'rgba(8, 145, 178, 0.22)' },
  { name: 'Índigo Profundo', accent: '#4F46E5', pastel: '#E0E7FF', dot: 'rgba(79, 70, 229, 0.22)' },
  { name: 'Coral / Carmín', accent: '#E11D48', pastel: '#FFE4E6', dot: 'rgba(225, 29, 72, 0.22)' },
];

/**
 * Obtiene un color de acento aleatorio para nuevos registros.
 * @returns {typeof USER_ACCENT_COLORS[0]}
 */
export function getRandomAccentColor() {
  const index = Math.floor(Math.random() * USER_ACCENT_COLORS.length);
  return USER_ACCENT_COLORS[index];
}
