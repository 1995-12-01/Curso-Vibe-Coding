/**
 * @file Card.jsx
 * @description Contenedor tipo tarjeta con borde grueso, sombra dura sólida y hover elevado.
 */

import React from 'react';

export default function Card({ children, className = '', onClick, ...props }) {
  const clickable = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      className={`flat-card ${className}`}
      style={{
        cursor: clickable ? 'pointer' : 'default',
        padding: '1.25rem',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
