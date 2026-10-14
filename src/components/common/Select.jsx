/**
 * @file Select.jsx
 * @description Selector tipo menú desplegable estilizado con estética Flat.
 */

import React from 'react';

export default function Select({
  label,
  error,
  options = [],
  id,
  value,
  onChange,
  required = false,
  placeholder = 'Selecciona una opción...',
  ...props
}) {
  const selectId = id || `select_${label?.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={selectId} className="flat-label">
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className="flat-select"
        style={{
          borderColor: error ? '#EF4444' : undefined,
          cursor: 'pointer',
        }}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value || opt.id} value={opt.value || opt.id}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>

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
    </div>
  );
}
