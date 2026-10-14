/**
 * @file InviteMemberModal.jsx
 * @description Modal para que el administrador invite miembros buscándolos por su handle
 * con autocompletado en tiempo real y envío de notificación.
 */

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Check, Send } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { searchUsersByHandle } from '../../data/usersRepo';
import { inviteUserToHousehold } from '../../data/householdsRepo';
import { useAuth } from '../../context/AuthContext';

export default function InviteMemberModal({
  isOpen,
  onClose,
  household,
}) {
  if (!household) return null;

  const { currentUser } = useAuth();
  const [queryStr, setQueryStr] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviting, setInviting] = useState(false);

  // Excluir miembros ya existentes y ya invitados
  const excludeUids = [...household.memberUids, ...(household.pendingInvites || [])];

  useEffect(() => {
    if (!queryStr.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const matches = await searchUsersByHandle(queryStr, excludeUids);
        setResults(matches);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [queryStr, household]);

  const handleSendInvite = async (userToInvite) => {
    setInviting(true);
    setError('');
    setSuccess('');
    try {
      await inviteUserToHousehold(household.id, userToInvite.uid, currentUser.displayName);
      setSuccess(`¡Invitación enviada exitosamente a @${userToInvite.handle}!`);
      setQueryStr('');
      setResults([]);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invitar Miembro a "${household.name}"`}
      icon={UserPlus}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Input
          label="Buscar usuario por su @handle o nombre"
          placeholder="Escribe ej. 'maria', 'diego', 'carlos'..."
          icon={Search}
          value={queryStr}
          onChange={(e) => {
            setQueryStr(e.target.value);
            setError('');
            setSuccess('');
          }}
          helperText="La búsqueda autocompleta los resultados en tiempo real."
        />
      </div>

      {/* Resultados de autocompletado */}
      <div style={{ marginBottom: '1.25rem' }}>
        {searching && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buscando usuarios...</p>
        )}

        {results.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            border: '2px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-surface-alt)',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: '4px' }}>
              USUARIOS ENCONTRADOS
            </span>
            {results.map((u) => (
              <div
                key={u.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Avatar user={u} size={32} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {u.displayName}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      @{u.handle}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  icon={Send}
                  disabled={inviting}
                  onClick={() => handleSendInvite(u)}
                >
                  Invitar
                </Button>
              </div>
            ))}
          </div>
        )}

        {queryStr.trim() && !searching && results.length === 0 && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No se encontraron usuarios disponibles con ese handle o ya forman parte del hogar.
          </p>
        )}
      </div>

      {success && (
        <div style={{
          backgroundColor: '#DCFCE7',
          border: '2px solid #22C55E',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          marginBottom: '1rem',
          color: '#15803D',
          fontSize: '0.85rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Check size={18} />
          {success}
        </div>
      )}

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
