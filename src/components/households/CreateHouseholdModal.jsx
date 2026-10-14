/**
 * @file CreateHouseholdModal.jsx
 * @description Modal para crear un nuevo grupo hogar.
 * El usuario se convierte automáticamente en el administrador.
 */

import React, { useState } from 'react';
import { Home, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { createHousehold } from '../../data/householdsRepo';
import { useAuth } from '../../context/AuthContext';
import { useHousehold } from '../../context/HouseholdContext';

export default function CreateHouseholdModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { selectHousehold } = useHousehold();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del hogar es obligatorio.');
      return;
    }
    if (name.trim().length < 3) {
      setError('El nombre del hogar debe tener al menos 3 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const newHh = await createHousehold(name, currentUser.uid);
      selectHousehold(newHh.id);
      setName('');
      setError('');
      onClose();
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
      title="Crear Nuevo Hogar"
      icon={Home}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre del hogar"
          required
          placeholder="Ej. Casa Roble 402, Depa Condesa, Hogar Familiar"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          helperText="Te convertirás en el administrador de este hogar y podrás invitar a otros miembros y crear gastos."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creando hogar...' : 'Crear Hogar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
