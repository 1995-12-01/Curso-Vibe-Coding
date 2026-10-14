/**
 * @file Sidebar.jsx
 * @description Barra lateral fija para escritorio con selector de hogar superior,
 * navegación principal, información del usuario activo y cambio de tema.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Bell,
  User,
  Sun,
  Moon,
  PlusCircle,
  ChevronDown,
  ShieldCheck,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useHousehold } from '../../context/HouseholdContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import { localStore } from '../../data/localStore';

export default function Sidebar({ activePage, setActivePage, onOpenCreateHousehold }) {
  const { households, currentHousehold, selectedHouseholdId, selectHousehold, isCurrentAdmin } = useHousehold();
  const { currentUser, switchDemoUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [householdMenuOpen, setHouseholdMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  // Calcular notificaciones no leídas
  const userNotifs = localStore.getNotifications(currentUser?.uid);
  const unreadCount = userNotifs.filter(n => n.status === 'unread').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'households', label: 'Hogares', icon: Home },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside
      className="hidden md:flex"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '270px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '3px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* 1. Logotipo y Nombre */}
      <div style={{
        padding: '1.25rem 1.25rem 0.75rem',
        borderBottom: '2.5px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'var(--user-accent)',
            color: '#FFFFFF',
            padding: '8px',
            borderRadius: '12px',
            border: '2px solid var(--border-color)',
            boxShadow: '2px 2px 0px var(--shadow-color)',
            display: 'flex',
          }}>
            <Home size={22} strokeWidth={2.6} />
          </div>
          <div>
            <span style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-heading-color)',
            }}>
              ExpenseShare
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Control por asignación
            </p>
          </div>
        </div>

        {/* 2. Selector de Hogar Superior */}
        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <button
            onClick={() => setHouseholdMenuOpen(!householdMenuOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              background: 'var(--bg-surface-alt)',
              border: '2px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: '2px 2px 0px var(--shadow-color)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{
                color: isCurrentAdmin ? 'var(--user-accent)' : 'var(--text-muted)',
                display: 'flex',
              }}>
                {isCurrentAdmin ? <ShieldCheck size={18} strokeWidth={2.5} /> : <Users size={18} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-main)',
                }}>
                  {currentHousehold ? currentHousehold.name : 'Sin Hogar'}
                </p>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {isCurrentAdmin ? 'Administrador' : 'Miembro'}
                </span>
              </div>
            </div>
            <ChevronDown size={16} strokeWidth={2.5} color="var(--text-muted)" />
          </button>

          {/* Menú desplegable de hogares */}
          {householdMenuOpen && (
            <div
              className="animate-pop"
              style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px var(--shadow-color)',
                padding: '0.4rem',
                zIndex: 60,
              }}
            >
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', padding: '0.3rem 0.5rem' }}>
                TUS HOGARES
              </p>
              {households.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    selectHousehold(h.id);
                    setHouseholdMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.5rem',
                    borderRadius: '6px',
                    border: h.id === selectedHouseholdId ? '1.5px solid var(--border-color)' : '1px solid transparent',
                    background: h.id === selectedHouseholdId ? 'var(--user-pastel)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '2px',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {h.name}
                  </span>
                  {h.adminUid === currentUser?.uid && (
                    <span style={{ fontSize: '0.65rem', background: 'var(--user-accent)', color: '#FFF', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                      Admin
                    </span>
                  )}
                </button>
              ))}

              <div style={{ borderTop: '1.5px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                <button
                  onClick={() => {
                    setHouseholdMenuOpen(false);
                    onOpenCreateHousehold();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: 'var(--user-accent)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                >
                  <PlusCircle size={16} strokeWidth={2.5} />
                  <span>Crear nuevo hogar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Enlaces de Navegación Principal */}
      <nav style={{ flex: 1, padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: isActive ? '2.5px solid var(--border-color)' : '2px solid transparent',
                backgroundColor: isActive ? 'var(--user-pastel)' : 'transparent',
                boxShadow: isActive ? '3px 3px 0px var(--shadow-color)' : 'none',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-alt)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.8 : 2.2}
                  color={isActive ? 'var(--user-accent)' : 'currentColor'}
                />
                <span>{item.label}</span>
              </div>

              {Boolean(item.badge && item.badge > 0) && (
                <span
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    border: '1.5px solid var(--border-color)',
                    boxShadow: '1px 1px 0px var(--shadow-color)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Selector de Usuario Demo para pruebas rápidas */}
      <div style={{
        padding: '0.75rem 1rem',
        margin: '0 0.85rem',
        backgroundColor: 'var(--bg-surface-alt)',
        border: '2px dashed var(--border-subtle)',
        borderRadius: '10px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--user-accent)" /> ROL DE PRUEBA
          </span>
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--user-accent)', cursor: 'pointer' }}
          >
            Cambiar ▾
          </button>
        </div>

        {demoMenuOpen && (
          <div
            className="animate-pop"
            style={{
              position: 'absolute',
              bottom: '105%',
              left: 0,
              right: 0,
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: '4px 4px 0px var(--shadow-color)',
              padding: '0.5rem',
              zIndex: 70,
            }}
          >
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
              PROBAR COMO:
            </p>
            {localStore.getUsers().map(u => (
              <button
                key={u.uid}
                onClick={() => {
                  switchDemoUser(u.uid);
                  setDemoMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: u.uid === currentUser?.uid ? '1.5px solid var(--border-color)' : 'none',
                  background: u.uid === currentUser?.uid ? 'var(--user-pastel)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Avatar user={u} size={24} />
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>{u.displayName}</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@{u.handle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Pie del Sidebar: Usuario actual y Tema */}
      <div style={{
        padding: '1rem',
        borderTop: '2.5px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <Avatar user={currentUser} size={38} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-main)',
            }}>
              {currentUser?.displayName || 'Usuario'}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              @{currentUser?.handle || 'handle'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema claro/oscuro"
            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            style={{
              padding: '7px',
              borderRadius: '8px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-surface-alt)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px var(--shadow-color)',
            }}
          >
            {theme === 'light' ? (
              <Moon size={16} strokeWidth={2.4} color="var(--text-main)" />
            ) : (
              <Sun size={16} strokeWidth={2.4} color="#FBBF24" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
