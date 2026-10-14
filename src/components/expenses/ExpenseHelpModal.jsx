/**
 * @file ExpenseHelpModal.jsx
 * @description Diálogo para confirmar la solicitud de ayuda comunitaria abierta
 * a todos los miembros del hogar para pagar un gasto.
 */

import React, { useState } from 'react';
import { HandHelping, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { requestOpenHelpForExpense } from '../../data/expensesRepo';

export default function ExpenseHelpModal({
  isOpen,
  onClose,
  expense,
  currentUser,
  onHelpRequested,
}) {
  if (!expense) return null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await requestOpenHelpForExpense(expense.id, currentUser.displayName);
      onClose();
      if (onHelpRequested) onHelpRequested();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Ayuda Abierta"
      icon={HandHelping}
    >
      <div style={{
        backgroundColor: '#FED7AA',
        border: '2px solid #EA580C',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <AlertCircle size={18} color="#9A3412" />
          <h4 style={{ margin: 0, color: '#9A3412', fontSize: '0.95rem' }}>
            ¿Deseas pedir ayuda a tus compañeros de hogar?
          </h4>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#7C2D12', margin: 0 }}>
          Al solicitar ayuda abierta sobre <strong>"{expense.name}"</strong>, todos los miembros del hogar recibirán una notificación y podrán sumarse como aportantes para completar el pago entre todos.
        </p>
      </div>

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Notificando...' : 'Sí, Solicitar Ayuda'}
        </Button>
      </div>
    </Modal>
  );
}
