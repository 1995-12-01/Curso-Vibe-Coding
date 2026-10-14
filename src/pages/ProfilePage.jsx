/**
 * @file ProfilePage.jsx
 * @description Vista de perfil de usuario:
 * Muestra nombre, handle único público y selector de paleta de color de identificación
 * con actualización inmediata de la trama pastel del fondo de la aplicación.
 */

import React, { useState } from 'react';
import { User, Check, Sparkles, AtSign, Mail, Shield, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { USER_ACCENT_COLORS } from '../domain/constants';
import { useAuth } from '../context/AuthContext';
import { localStore } from '../data/localStore';

export default function ProfilePage() {
  const { currentUser, updateUserColor } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSelectColor = async (colorObj) => {
    await updateUserColor(colorObj);
    setSuccessMessage(`¡Color actualizado a ${colorObj.name}! La trama de fondo ha sido adaptada.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer todos los datos de demostración a su estado inicial?')) {
      localStore.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div className="page-container animate-fade">
      {/* 1. Encabezado */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--text-heading-color)' }}>
          Mi Perfil de Usuario
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
          Configura tus datos personales y tu color distintivo en el sistema.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Tarjeta de Datos Personales */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Avatar user={currentUser} size={64} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {currentUser?.displayName || 'Usuario'}
              </h3>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: 'var(--user-accent)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}>
                <AtSign size={14} />{currentUser?.handle || 'handle'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-alt)',
              border: '1.5px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                CORREO ELECTRÓNICO
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {currentUser?.email || 'correo@ejemplo.com'}
              </p>
            </div>

            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-alt)',
              border: '1.5px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                HANDLE DE BÚSQUEDA
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                @{currentUser?.handle}
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Tus compañeros de hogar te encuentran e invitan con este handle.
              </span>
            </div>
          </div>
        </Card>

        {/* Tarjeta de Color de Identificación y Trama Pastel */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Sparkles size={20} color="var(--user-accent)" strokeWidth={2.6} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Color de Identificación
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Personaliza tu color de acento. Las superficies grandes y el fondo de toda la aplicación proyectarán una trama en la versión pastel de tu color.
          </p>

          {/* Cuadrícula de colores */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '1rem',
          }}>
            {USER_ACCENT_COLORS.map((col) => {
              const isSelected = currentUser?.accentColor === col.accent;

              return (
                <button
                  key={col.accent}
                  type="button"
                  onClick={() => handleSelectColor(col)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: isSelected ? '2.5px solid var(--border-color)' : '2px solid var(--border-subtle)',
                    boxShadow: isSelected ? '3px 3px 0px var(--shadow-color)' : 'none',
                    backgroundColor: col.pastel,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.12s ease',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '999px',
                    backgroundColor: col.accent,
                    border: '1.5px solid var(--border-color)',
                  }} />
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    textAlign: 'center',
                  }}>
                    {col.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {successMessage && (
            <div style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #22C55E',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              color: '#15803D',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Check size={16} />
              {successMessage}
            </div>
          )}
        </Card>
      </div>

      {/* Zona de Desarrollo / Demostración */}
      <div style={{ marginTop: '2.5rem' }}>
        <Card style={{
          backgroundColor: 'var(--bg-surface-alt)',
          border: '2px dashed var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Restablecer Datos de Demostración
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reinicia los hogares, gastos y notificaciones a sus datos de prueba originales.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleResetData}
            >
              Restablecer Datos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
