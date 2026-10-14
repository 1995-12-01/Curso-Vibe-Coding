/**
 * @file Textarea.jsx
 * @description Área de texto multilinea con estética flat y validación de errores.
 */

import React from 'react';

export default function Textarea({
  label,
  error,
  helperText,
  id,
  required = false,
  rows = 3,
  ...props
}) {
  const textareaId = id || `textarea_${label?.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={textareaId} className="flat-label">
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className="flat-textarea"
        style={{
          borderColor: error ? '#EF4444' : undefined,
          resize: 'vertical',
        }}
        {...props}
      />

      {error && (
        <p style={{
          color: '#EF4444',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: '0.35rem',
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
