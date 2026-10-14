/**
 * @file BottomNav.jsx
 * @description Barra de navegación flotante inferior para dispositivos móviles.
 * Muestra únicamente iconos con bordes y sombras sólidas según las especificaciones.
 */

import React from 'react';
import { LayoutDashboard, Home, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { localStore } from '../../data/localStore';

export default function BottomNav({ activePage, setActivePage }) {
  const { currentUser } = useAuth();

  const userNotifs = localStore.getNotifications(currentUser?.uid);
  const unreadCount = userNotifs.filter(n => n.status === 'unread').length;

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'households', label: 'Hogares', icon: Home },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        height: '62px',
        backgroundColor: 'var(--bg-surface)',
        border: '3px solid var(--border-color)',
        borderRadius: '9999px',
        boxShadow: '4px 4px 0px var(--shadow-color)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
      }}
    >
      {items.map((item) => {
        const isActive = activePage === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            aria-label={item.label}
            style={{
              position: 'relative',
              width: '46px',
              height: '46px',
              borderRadius: '9999px',
              border: isActive ? '2px solid var(--border-color)' : '2px solid transparent',
              backgroundColor: isActive ? 'var(--user-pastel)' : 'transparent',
              boxShadow: isActive ? '2px 2px 0px var(--shadow-color)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.12s ease',
              transform: isActive ? 'translateY(-2px)' : 'none',
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.8 : 2.2}
              color={isActive ? 'var(--user-accent)' : 'var(--text-muted)'}
            />

            {Boolean(item.badge && item.badge > 0) && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  borderRadius: '9999px',
                  border: '1.5px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
