/**
 * @file CreateExpenseModal.jsx
 * @description Modal para que el administrador cree nuevos gastos en el hogar
 * con asignación individual o múltiple y validaciones en tiempo real.
 */

import React, { useState } from 'react';
import { PlusCircle, DollarSign, Calendar, Layers, Users } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { EXPENSE_CATEGORIES } from '../../domain/constants';
import { validateExpenseForm } from '../../domain/validations';
import { createExpense } from '../../data/expensesRepo';

export default function CreateExpenseModal({
  isOpen,
  onClose,
  householdId,
  householdMembers = [],
  adminName = 'El Administrador',
  onExpenseCreated,
}) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: EXPENSE_CATEGORIES[0].id,
    assignedUids: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Manejar selección múltiple de miembros asignados
  const toggleMemberAssignment = (uid) => {
    setFormData(prev => {
      const exists = prev.assignedUids.includes(uid);
      const updated = exists
        ? prev.assignedUids.filter(id => id !== uid)
        : [...prev.assignedUids, uid];
      return { ...prev, assignedUids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateExpenseForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      await createExpense(
        {
          ...formData,
          householdId,
        },
        adminName
      );

      // Limpiar formulario y cerrar
      setFormData({
        name: '',
        amount: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: EXPENSE_CATEGORIES[0].id,
        assignedUids: [],
      });
      setErrors({});
      onClose();
      if (onExpenseCreated) onExpenseCreated();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Gasto del Hogar"
      icon={PlusCircle}
    >
      <form onSubmit={handleSubmit}>
        {/* Nombre del gasto */}
        <Input
          label="Nombre del gasto"
          required
          placeholder="Ej. Recibo de Luz CFE, Renta del mes, etc."
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Monto presupuestado */}
          <Input
            label="Monto presupuestado ($)"
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            icon={DollarSign}
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            error={errors.amount}
          />

          {/* Fecha límite de pago */}
          <Input
            label="Fecha límite de pago"
            required
            type="date"
            icon={Calendar}
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            error={errors.dueDate}
          />
        </div>

        {/* Categoría */}
        <Select
          label="Categoría de gasto"
          required
          options={EXPENSE_CATEGORIES.map(c => ({ id: c.id, label: c.label }))}
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          error={errors.category}
        />

        {/* Miembro(s) responsable(s) - Asignación individual o múltiple */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="flat-label">
            Miembro(s) responsable(s) del pago <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Selecciona a quién o a quiénes se les asignará la responsabilidad:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {householdMembers.map((member) => {
              const isSelected = formData.assignedUids.includes(member.uid);
              return (
                <div
                  key={member.uid}
                  onClick={() => toggleMemberAssignment(member.uid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--user-accent)' : '2px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--user-pastel)' : 'var(--bg-surface)',
                    boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Avatar user={member} size={28} />
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {member.displayName}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        @{member.handle}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Manejado por el contenedor
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          {errors.assignedUids && (
            <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.4rem' }}>
              {errors.assignedUids}
            </p>
          )}
        </div>

        {errors.form && (
          <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {errors.form}
          </p>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creando gasto...' : 'Crear y Asignar Gasto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
