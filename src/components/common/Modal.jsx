/**
 * @file Modal.jsx
 * @description Cuadro de diálogo modal animado con borde grueso, sombra sólida y cierre accesible.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '520px',
  icon: Icon,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade" onClick={onClose}>
      <div
        className="modal-content animate-pop"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {Icon && (
              <div style={{
                background: 'var(--user-pastel)',
                color: 'var(--user-accent)',
                padding: '6px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
              }}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
            )}
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            style={{
              padding: '4px',
              borderRadius: '8px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-surface-alt)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <X size={18} strokeWidth={2.5} color="var(--text-main)" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div>{children}</div>
      </div>
    </div>
  );
}
