/**
 * @file expensesRepo.js
 * @description Repositorio de datos para el ciclo de vida completo de Gastos:
 * Creación, Aceptación, Rechazo con justificación, Solicitud de ayuda abierta y
 * Registro de contribuciones con comprobante de pago.
 */

import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from './collections';
import { localStore } from './localStore';
import { createNotification } from './notificationsRepo';
import { EXPENSE_STATUSES } from '../domain/constants';
import { validatePaymentContribution } from '../domain/validations';

/**
 * Crea un nuevo gasto asignado por el administrador.
 * Nace en estado 'pending_acceptance' y envía notificación al responsable.
 * @param {Object} expenseData
 * @param {string} creatorName
 * @returns {Promise<Object>}
 */
export async function createExpense(expenseData, creatorName = 'El administrador') {
  const newExpense = {
    id: `exp_${Date.now()}`,
    householdId: expenseData.householdId,
    name: expenseData.name.trim(),
    amount: Number(expenseData.amount),
    category: expenseData.category,
    dueDate: expenseData.dueDate,
    status: EXPENSE_STATUSES.PENDING.id,
    assignedUids: expenseData.assignedUids,
    originalAssignedUid: expenseData.assignedUids[0] || '',
    openHelpRequested: false,
    rejectionReason: '',
    suggestedUid: '',
    totalPaid: 0,
    payments: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, COLLECTIONS.EXPENSES, newExpense.id), newExpense);
  } catch (e) {}

  localStore.addExpense(newExpense);

  // Enviar notificación a cada usuario asignado
  for (const assignedUid of newExpense.assignedUids) {
    await createNotification({
      recipientUid: assignedUid,
      type: 'expense_assigned',
      title: 'Nuevo gasto asignado',
      message: `${creatorName} te ha asignado el gasto "${newExpense.name}" por $${newExpense.amount.toLocaleString()}. Por favor revisa y acepta la responsabilidad.`,
      expenseId: newExpense.id,
      householdId: newExpense.householdId,
    });
  }

  return newExpense;
}

/**
 * Actualiza los datos generales de un gasto existente.
 * @param {string} expenseId
 * @param {Object} updates
 */
export async function updateExpense(expenseId, updates) {
  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);
}

/**
 * Elimina un gasto existente.
 * @param {string} expenseId
 */
export async function deleteExpense(expenseId) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
  } catch (e) {}

  localStore.deleteExpense(expenseId);
}

/**
 * Acepta la responsabilidad de pago de un gasto.
 * Pasa de 'pending_acceptance' a 'in_progress'.
 * @param {string} expenseId
 * @param {string} userUid
 */
export async function acceptExpenseResponsibility(expenseId, userUid) {
  const expense = localStore.getExpenseById(expenseId);
  if (!expense) throw new Error('Gasto no encontrado.');

  const updates = {
    status: EXPENSE_STATUSES.IN_PROGRESS.id,
    rejectionReason: '',
  };

  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);
}

/**
 * Rechaza la responsabilidad de un gasto con justificación obligatoria
 * y sugerencia opcional de otro miembro.
 * @param {string} expenseId
 * @param {string} userUid
 * @param {string} userName
 * @param {string} justification
 * @param {string} [suggestedUid]
 */
export async function rejectExpenseResponsibility(expenseId, userUid, userName, justification, suggestedUid = '') {
  const expense = localStore.getExpenseById(expenseId);
  if (!expense) throw new Error('Gasto no encontrado.');

  const household = localStore.getHouseholdById(expense.householdId);

  const updates = {
    status: EXPENSE_STATUSES.REJECTED.id,
    rejectionReason: justification.trim(),
    suggestedUid: suggestedUid || '',
  };

  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);

  // Notificar al administrador del hogar
  if (household?.adminUid) {
    await createNotification({
      recipientUid: household.adminUid,
      type: 'rejection',
      title: 'Gasto rechazado',
      message: `${userName} rechazó el gasto "${expense.name}". Motivo: "${justification}".`,
      expenseId,
      householdId: expense.householdId,
    });
  }

  // Si sugirió a otro miembro, notificarle la sugerencia
  if (suggestedUid && suggestedUid !== userUid) {
    await createNotification({
      recipientUid: suggestedUid,
      type: 'expense_assigned',
      title: 'Sugerencia de responsabilidad de gasto',
      message: `${userName} no puede asumir "${expense.name}" y te ha sugerido como responsable de pago.`,
      expenseId,
      householdId: expense.householdId,
    });
  }
}

/**
 * Activa la solicitud de ayuda abierta para un gasto.
 * Notifica a todos los miembros del hogar.
 * @param {string} expenseId
 * @param {string} requesterName
 */
export async function requestOpenHelpForExpense(expenseId, requesterName) {
  const expense = localStore.getExpenseById(expenseId);
  if (!expense) throw new Error('Gasto no encontrado.');

  const household = localStore.getHouseholdById(expense.householdId);
  if (!household) throw new Error('Hogar no encontrado.');

  const updates = {
    openHelpRequested: true,
  };

  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);

  // Notificar a todos los miembros del hogar
  for (const memberUid of household.memberUids) {
    await createNotification({
      recipientUid: memberUid,
      type: 'help_request',
      title: 'Solicitud de ayuda abierta',
      message: `${requesterName} solicita ayuda comunitaria para pagar "${expense.name}" ($${expense.amount.toLocaleString()}).`,
      expenseId,
      householdId: expense.householdId,
    });
  }
}

/**
 * Un miembro acepta ayudar en un gasto abierto.
 * Se le agrega al arreglo de asignados para permitirle registrar su contribución.
 * @param {string} expenseId
 * @param {string} helperUid
 */
export async function joinAsExpenseHelper(expenseId, helperUid) {
  const expense = localStore.getExpenseById(expenseId);
  if (!expense) return;

  const updatedAssigned = Array.from(new Set([...expense.assignedUids, helperUid]));
  const updates = {
    assignedUids: updatedAssigned,
    // Si estaba en rechazado o pendiente, pasa a en progreso
    status: (expense.status === EXPENSE_STATUSES.REJECTED.id || expense.status === EXPENSE_STATUSES.PENDING.id)
      ? EXPENSE_STATUSES.IN_PROGRESS.id
      : expense.status,
  };

  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);
}

/**
 * Registra una contribución / pago a un gasto.
 * Actualiza automáticamente el estado a 'partially_paid' o 'paid'.
 * @param {string} expenseId
 * @param {Object} paymentData { amount, comment, receiptUrl, uid, userName }
 * @returns {Promise<{ newStatus: string, totalPaid: number }>}
 */
export async function addPaymentContribution(expenseId, paymentData) {
  const expense = localStore.getExpenseById(expenseId);
  if (!expense) throw new Error('Gasto no encontrado.');

  const validation = validatePaymentContribution(paymentData, expense);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(' ');
    throw new Error(errorMsg);
  }

  const paymentRecord = {
    id: `pay_${Date.now()}`,
    uid: paymentData.uid,
    userName: paymentData.userName,
    amount: Number(paymentData.amount),
    comment: paymentData.comment.trim(),
    receiptUrl: paymentData.receiptUrl || '',
    createdAt: new Date().toISOString(),
  };

  const newTotalPaid = Number(expense.totalPaid || 0) + paymentRecord.amount;
  const isFullyPaid = newTotalPaid >= Number(expense.amount);
  const newStatus = isFullyPaid ? EXPENSE_STATUSES.PAID.id : EXPENSE_STATUSES.PARTIALLY_PAID.id;

  // Si el usuario que pagó no estaba en assignedUids (por ejemplo alguien que ayuda), incluirlo
  const updatedAssigned = Array.from(new Set([...expense.assignedUids, paymentData.uid]));

  const updates = {
    totalPaid: newTotalPaid,
    status: newStatus,
    assignedUids: updatedAssigned,
    payments: [...(expense.payments || []), paymentRecord],
  };

  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), updates);
  } catch (e) {}

  localStore.updateExpense(expenseId, updates);

  return { newStatus, totalPaid: newTotalPaid };
}
