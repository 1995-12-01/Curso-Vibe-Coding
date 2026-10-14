/**
 * @file Header.jsx
 * @description Encabezado superior adaptativo para vista móvil y de escritorio.
 */

import React from 'react';
import { Home, Sun, Moon, ShieldCheck, Users } from 'lucide-react';
import { useHousehold } from '../../context/HouseholdContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Header({ title, subtitle }) {
  const { currentHousehold, isCurrentAdmin } = useHousehold();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '2.5px solid var(--border-color)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Indicador de Hogar Activo */}
        {currentHousehold && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'var(--user-pastel)',
              border: '2px solid var(--border-color)',
              borderRadius: '9999px',
              boxShadow: '2px 2px 0px var(--shadow-color)',
            }}
          >
            {isCurrentAdmin ? (
              <ShieldCheck size={16} strokeWidth={2.5} color="var(--user-accent)" />
            ) : (
              <Home size={16} strokeWidth={2.5} color="var(--user-accent)" />
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentHousehold.name}
            </span>
          </div>
        )}

        {/* Botón de tema en móvil */}
        <button
          className="flex md:hidden"
          onClick={toggleTheme}
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: '2px solid var(--border-color)',
            background: 'var(--bg-surface-alt)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'light' ? (
            <Moon size={18} strokeWidth={2.4} color="var(--text-main)" />
          ) : (
            <Sun size={18} strokeWidth={2.4} color="#FBBF24" />
          )}
        </button>

        {/* Avatar del usuario actual en móvil */}
        <div className="flex md:hidden">
          <Avatar user={currentUser} size={32} />
        </div>
      </div>
    </header>
  );
}
