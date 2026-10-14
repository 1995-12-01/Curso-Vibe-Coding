/**
 * @file NotificationsPage.jsx
 * @description Vista de notificaciones:
 * Muestra invitaciones a hogares (con botones Aceptar/Rechazar directos),
 * gastos nuevos asignados, respuestas de rechazo con justificación y solicitudes de ayuda.
 */

import React from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Home,
  HandHelping,
  XCircle,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { localStore } from '../data/localStore';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../data/notificationsRepo';
import {
  acceptHouseholdInvite,
  declineHouseholdInvite,
} from '../data/householdsRepo';

export default function NotificationsPage({ onNavigateToHouseholds }) {
  const { currentUser } = useAuth();
  const notifications = localStore.getNotifications(currentUser?.uid);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handleMarkAsRead = async (notifId) => {
    await markNotificationAsRead(notifId);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(currentUser.uid);
  };

  const handleAcceptInvite = async (notif) => {
    if (notif.householdId) {
      await acceptHouseholdInvite(notif.householdId, currentUser.uid);
      await markNotificationAsRead(notif.id);
      if (onNavigateToHouseholds) onNavigateToHouseholds();
    }
  };

  const handleDeclineInvite = async (notif) => {
    if (notif.householdId) {
      await declineHouseholdInvite(notif.householdId, currentUser.uid);
      await markNotificationAsRead(notif.id);
    }
  };

  // Iconos según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invite':
        return <Home size={20} color="var(--user-accent)" />;
      case 'help_request':
        return <HandHelping size={20} color="#EA580C" />;
      case 'rejection':
        return <XCircle size={20} color="#EF4444" />;
      case 'expense_assigned':
        return <CreditCard size={20} color="var(--user-accent)" />;
      default:
        return <Bell size={20} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="page-container animate-fade">
      {/* 1. Encabezado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--text-heading-color)' }}>
            Notificaciones y Avisos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
            Invitaciones, solicitudes de ayuda comunitaria y fechas de pago.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCircle}
            onClick={handleMarkAllRead}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* 2. Listado de notificaciones */}
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map((notif) => {
            const isUnread = notif.status === 'unread';

            return (
              <Card
                key={notif.id}
                style={{
                  backgroundColor: isUnread ? 'var(--bg-surface)' : 'var(--bg-surface-alt)',
                  borderLeft: isUnread ? '6px solid var(--user-accent)' : '3px solid var(--border-color)',
                  opacity: isUnread ? 1 : 0.85,
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{
                      backgroundColor: 'var(--bg-surface-alt)',
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-color)',
                      display: 'flex',
                    }}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            backgroundColor: 'var(--user-accent)',
                            color: '#FFFFFF',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}>
                            Nueva
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {notif.message}
                      </p>

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        {new Date(notif.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Acciones de la notificación */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {/* Si es invitación a hogar, mostrar botones de Aceptar / Rechazar */}
                    {notif.type === 'invite' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          icon={Check}
                          onClick={() => handleAcceptInvite(notif)}
                        >
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={X}
                          onClick={() => handleDeclineInvite(notif)}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}

                    {isUnread && notif.type !== 'invite' && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Marcar como leída"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--user-accent)',
                          padding: '4px 8px',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: '6px',
                          background: 'var(--bg-surface)',
                          cursor: 'pointer',
                        }}
                      >
                        Marcar leída
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>No tienes notificaciones pendientes</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Te avisaremos cuando seas asignado a un gasto o te inviten a un hogar.
          </p>
        </Card>
      )}
    </div>
  );
}
