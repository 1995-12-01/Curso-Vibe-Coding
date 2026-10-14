/**
 * @file Input.jsx
 * @description Campo de formulario reutilizable con etiquetas, estados de error y ayuda.
 */

import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  id,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || `input_${label?.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <div style={{ marginBottom: '1rem' }} className={className}>
      {label && (
        <label htmlFor={inputId} className="flat-label">
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            pointerEvents: 'none',
          }}>
            <Icon size={18} strokeWidth={2.3} />
          </div>
        )}

        <input
          id={inputId}
          className="flat-input"
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            borderColor: error ? '#EF4444' : undefined,
          }}
          {...props}
        />
      </div>

      {error && (
        <p style={{
          color: '#EF4444',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          marginTop: '0.35rem',
        }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
