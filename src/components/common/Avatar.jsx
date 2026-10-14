/**
 * @file Avatar.jsx
 * @description Avatar de usuario que muestra iniciales con borde grueso y el color
 * de acento distintivo del miembro para rápida identificación visual.
 */

import React from 'react';

export default function Avatar({
  user,
  name = '',
  color = '#2563EB',
  size = 36,
  showTooltip = false,
  className = '',
}) {
  const displayName = user?.displayName || name || 'Usuario';
  const accentColor = user?.accentColor || color;

  // Extraer iniciales (ej. "Carlos Gómez" -> "CG")
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('') || '?';

  return (
    <div
      title={showTooltip ? `${displayName} (@${user?.handle || ''})` : undefined}
      className={`flat-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        backgroundColor: accentColor,
        color: '#FFFFFF',
        borderRadius: '9999px',
        border: '2px solid var(--border-color)',
        boxShadow: '2px 2px 0px var(--shadow-color)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${Math.max(11, Math.floor(size * 0.4))}px`,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
