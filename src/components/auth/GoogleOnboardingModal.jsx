/**
 * @file GoogleOnboardingModal.jsx
 * @description Modal de configuración inicial para usuarios que inician sesión con Google:
 * Permite seleccionar handle único (con sugerencia de alternativas si ya existe) y color de identificación.
 */

import React, { useState } from 'react';
import { Sparkles, Check, AtSign } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { USER_ACCENT_COLORS } from '../../domain/constants';
import { useAuth } from '../../context/AuthContext';
import { checkHandleAvailability } from '../../data/usersRepo';

export default function GoogleOnboardingModal() {
  const { googleOnboardingUser, completeGoogleOnboarding } = useAuth();
  if (!googleOnboardingUser) return null;

  const defaultHandle = googleOnboardingUser.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();

  const [handle, setHandle] = useState(defaultHandle);
  const [selectedColor, setSelectedColor] = useState(USER_ACCENT_COLORS[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError('El handle de usuario es obligatorio.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const cleanHandle = handle.replace('@', '').toLowerCase().trim();
      const check = await checkHandleAvailability(cleanHandle);

      if (!check.isAvailable) {
        setError(`El handle @${cleanHandle} ya está en uso.`);
        setSuggestions(check.suggestions);
        setSubmitting(false);
        return;
      }

      await completeGoogleOnboarding(cleanHandle, selectedColor);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(googleOnboardingUser)}
      onClose={() => {}} // Obligatorio completar
      title="Completa tu Perfil de ExpenseShare"
      icon={Sparkles}
    >
      <div style={{
        backgroundColor: 'var(--bg-surface-alt)',
        border: '2px solid var(--border-color)',
        borderRadius: '10px',
        padding: '0.85rem',
        marginBottom: '1rem',
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
          ¡Bienvenido/a <strong>{googleOnboardingUser.displayName}</strong>! Elige tu handle público por el cual otros usuarios te buscarán e invitarán a sus hogares, y selecciona tu color de acento.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Campo de handle */}
        <Input
          label="Tu @handle único"
          required
          icon={AtSign}
          placeholder="ej. carlos_admin, maria_dev"
          value={handle}
          onChange={(e) => {
            setHandle(e.target.value);
            if (error) setError('');
            if (suggestions.length) setSuggestions([]);
          }}
          error={error}
        />

        {/* Sugerencias de alternativas si el handle ya existe */}
        {suggestions.length > 0 && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--bg-surface-alt)',
            border: '2px solid var(--border-subtle)',
            borderRadius: '8px',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
              SUGERENCIAS DISPONIBLES:
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setHandle(sug);
                    setError('');
                    setSuggestions([]);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    borderRadius: '6px',
                    border: '1.5px solid var(--user-accent)',
                    backgroundColor: 'var(--user-pastel)',
                    color: 'var(--user-accent)',
                    cursor: 'pointer',
                  }}
                >
                  @{sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de color de identificación */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="flat-label">Color de identificación personal</label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Este color te identificará en avatares y teñirá el fondo de la app con una trama en versión pastel.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {USER_ACCENT_COLORS.map((col) => {
              const isSelected = selectedColor.accent === col.accent;
              return (
                <div
                  key={col.accent}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: isSelected ? '2.5px solid var(--border-color)' : '2px solid transparent',
                    boxShadow: isSelected ? '3px 3px 0px var(--shadow-color)' : 'none',
                    backgroundColor: col.pastel,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'transform 0.1s ease',
                    transform: isSelected ? 'scale(1.04)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '999px',
                      backgroundColor: col.accent,
                      border: '1.5px solid var(--border-color)',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>
                    {col.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vista previa del avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0.75rem',
          backgroundColor: selectedColor.pastel,
          border: '2px solid var(--border-color)',
          borderRadius: '10px',
          marginBottom: '1.25rem',
        }}>
          <Avatar
            user={{
              displayName: googleOnboardingUser.displayName,
              accentColor: selectedColor.accent,
            }}
            size={42}
          />
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {googleOnboardingUser.displayName}
            </p>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedColor.accent }}>
              @{handle || 'handle'}
            </span>
          </div>
        </div>

        <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Guardando perfil...' : 'Comenzar a Usar ExpenseShare'}
        </Button>
      </form>
    </Modal>
  );
}
