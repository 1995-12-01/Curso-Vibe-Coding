/**
 * @file ExpenseRejectModal.jsx
 * @description Modal interactivo para rechazar la responsabilidad de un gasto.
 * Requiere obligatoriamente una justificación y permite sugerir a otro miembro del hogar.
 */

import React, { useState } from 'react';
import { XCircle, UserCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import { validateExpenseRejection } from '../../domain/validations';
import { rejectExpenseResponsibility } from '../../data/expensesRepo';

export default function ExpenseRejectModal({
  isOpen,
  onClose,
  expense,
  currentUser,
  householdMembers = [],
  onRejectSuccess,
}) {
  if (!expense) return null;

  const [justification, setJustification] = useState('');
  const [suggestedUid, setSuggestedUid] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Miembros elegibles para sugerir (excluyendo al usuario actual)
  const candidateMembers = householdMembers.filter(m => m.uid !== currentUser?.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateExpenseRejection(justification);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setSubmitting(true);
    try {
      await rejectExpenseResponsibility(
        expense.id,
        currentUser.uid,
        currentUser.displayName,
        justification,
        suggestedUid
      );

      setJustification('');
      setSuggestedUid('');
      setError('');
      onClose();

      if (onRejectSuccess) onRejectSuccess();
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
      title="Rechazar Responsabilidad del Gasto"
      icon={XCircle}
    >
      <div style={{
        backgroundColor: '#FEE2E2',
        border: '2px solid #EF4444',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
          Gasto: {expense.name} (${Number(expense.amount).toLocaleString('es-MX')})
        </p>
        <p style={{ fontSize: '0.75rem', color: '#7F1D1D', marginTop: '2px' }}>
          Para no asumir este pago, debes indicar el motivo al administrador y a tus compañeros.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Justificación obligatoria */}
        <Textarea
          label="Justificación del rechazo"
          required
          rows={3}
          placeholder="Explica por qué no puedes asumir este gasto (ej. 'Este mes no estuve en casa', 'Yo ya cubrí el servicio anterior', etc.)."
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          error={error}
        />

        {/* Sugerencia opcional de otro miembro */}
        <Select
          label="Sugerir a otro miembro como responsable (Opcional)"
          placeholder="Selecciona a un compañero..."
          options={candidateMembers.map(m => ({
            id: m.uid,
            label: `${m.displayName} (@${m.handle})`,
          }))}
          value={suggestedUid}
          onChange={(e) => setSuggestedUid(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" disabled={submitting}>
            {submitting ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
