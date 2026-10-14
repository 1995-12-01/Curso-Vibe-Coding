/**
 * @file validations.js
 * @description Funciones puras de validación de reglas de negocio para ExpenseShare.
 * Garantiza que ninguna operación inválida se ejecute o persista en la base de datos.
 */

import { EXPENSE_STATUSES } from './constants';

/**
 * Valida la creación o edición de un gasto.
 * @param {Object} data Datos del formulario de gasto
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateExpenseForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre del gasto es obligatorio.';
  } else if (data.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  }

  const amountNumber = Number(data.amount);
  if (data.amount === undefined || data.amount === '' || isNaN(amountNumber)) {
    errors.amount = 'Debes ingresar un monto válido.';
  } else if (amountNumber <= 0) {
    errors.amount = 'El monto debe ser estrictamente mayor a cero ($0).';
  }

  if (!data.dueDate) {
    errors.dueDate = 'La fecha límite de pago es obligatoria.';
  }

  if (!data.category) {
    errors.category = 'Debes seleccionar una categoría de gasto.';
  }

  if (!data.assignedUids || data.assignedUids.length === 0) {
    errors.assignedUids = 'Debes asignar al menos a un miembro responsable.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valida el registro de un pago o contribución.
 * @param {Object} data Datos del pago
 * @param {Object} expense Gasto al cual se abona
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validatePaymentContribution(data, expense) {
  const errors = {};

  // Regla de negocio: Impedir registrar un pago en un gasto que ya está en estado "pagado"
  if (expense.status === EXPENSE_STATUSES.PAID.id) {
    errors.general = 'Este gasto ya se encuentra totalmente liquidado ("Pagado"). No se admiten más pagos.';
    return { isValid: false, errors };
  }

  const amountNumber = Number(data.amount);
  if (data.amount === undefined || data.amount === '' || isNaN(amountNumber)) {
    errors.amount = 'Debes ingresar un monto a aportar.';
  } else if (amountNumber <= 0) {
    errors.amount = 'El monto a aportar debe ser estrictamente mayor a $0.';
  }

  // Regla de negocio: Impedir dejar comentario vacío
  if (!data.comment || data.comment.trim().length === 0) {
    errors.comment = 'El comentario es obligatorio para explicar el pago.';
  } else if (data.comment.trim().length < 4) {
    errors.comment = 'El comentario debe contener al menos 4 caracteres explicativos.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valida el rechazo de la responsabilidad de un gasto.
 * @param {string} reason Justificación del rechazo
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateExpenseRejection(reason) {
  if (!reason || reason.trim().length === 0) {
    return {
      isValid: false,
      error: 'Debes escribir una justificación obligatoria para rechazar este gasto.',
    };
  }
  if (reason.trim().length < 6) {
    return {
      isValid: false,
      error: 'La justificación debe tener al menos 6 caracteres explicativos.',
    };
  }
  return { isValid: true };
}

/**
 * Valida el formato y longitud de un handle de usuario.
 * @param {string} handle Handle sin o con @
 * @returns {{ isValid: boolean, cleanHandle: string, error?: string }}
 */
export function validateHandle(handle) {
  if (!handle) {
    return { isValid: false, cleanHandle: '', error: 'El handle de usuario es obligatorio.' };
  }

  const clean = handle.startsWith('@') ? handle.slice(1).trim().toLowerCase() : handle.trim().toLowerCase();

  if (clean.length < 3) {
    return { isValid: false, cleanHandle: clean, error: 'El handle debe tener al menos 3 caracteres.' };
  }

  if (clean.length > 20) {
    return { isValid: false, cleanHandle: clean, error: 'El handle no puede superar los 20 caracteres.' };
  }

  // Solo letras minúsculas, números, puntos y guiones bajos
  const validRegex = /^[a-z0-9_.]+$/;
  if (!validRegex.test(clean)) {
    return { isValid: false, cleanHandle: clean, error: 'Solo se permiten letras minúsculas, números, "_" y "."' };
  }

  return { isValid: true, cleanHandle: clean };
}
