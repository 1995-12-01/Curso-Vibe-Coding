/**
 * @file Button.jsx
 * @description Botón interactivo con estética Flat MD3 de alto contraste,
 * borde grueso, sombra sólida desplazada y micro-animación de pulsado.
 */

import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = `flat-button-${variant}`;
  const sizeClass = size === 'sm' ? 'flat-button-sm' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flat-button ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} strokeWidth={2.5} />}
      <span>{children}</span>
    </button>
  );
}
