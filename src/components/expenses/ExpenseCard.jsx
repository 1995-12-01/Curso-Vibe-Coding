/**
 * @file ExpenseCard.jsx
 * @description Tarjeta visual interactiva de gasto con insignia de estado,
 * barra de progreso de pago, avatares de miembros responsables y botones de acción.
 */

import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  AlertCircle,
  HandHelping,
  Check,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../../domain/constants';
import { localStore } from '../../data/localStore';

export default function ExpenseCard({
  expense,
  currentUid,
  isAdmin,
  onAccept,
  onReject,
  onOpenPayment,
  onRequestHelp,
  onJoinHelp,
}) {
  const [showPaymentsDetail, setShowPaymentsDetail] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category) || {
    label: expense.category,
    icon: 'Layers',
  };

  // Obtener perfiles de usuarios asignados
  const assignedUsers = expense.assignedUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
  const isAssignedToMe = expense.assignedUids.includes(currentUid);

  const totalPaid = Number(expense.totalPaid || 0);
  const totalAmount = Number(expense.amount || 0);
  const percentPaid = Math.min(100, Math.round((totalPaid / totalAmount) * 100));
  const remaining = Math.max(0, totalAmount - totalPaid);

  // Formato de moneda
  const formatMoney = (val) => `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  // Formato de fecha
  const formattedDueDate = new Date(expense.dueDate).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="animate-slide-up" style={{ position: 'relative', marginBottom: '1.25rem' }}>
      {/* 1. Cabecera de la Tarjeta: Categoría, Insignia y Estado de Ayuda */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'var(--bg-surface-alt)',
              border: '1.5px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            {category.label}
          </span>

          {expense.openHelpRequested && expense.status !== EXPENSE_STATUSES.PAID.id && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#FED7AA',
                color: '#9A3412',
                border: '1.5px solid #EA580C',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <HandHelping size={13} strokeWidth={2.8} />
              AYUDA SOLICITADA
            </span>
          )}
        </div>

        <Badge status={expense.status} />
      </div>

      {/* 2. Nombre del Gasto y Monto Presupuestado */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '0.85rem',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          margin: 0,
        }}>
          {expense.name}
        </h3>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: 'var(--text-heading-color)',
            letterSpacing: '-0.02em',
          }}>
            {formatMoney(totalAmount)}
          </span>
        </div>
      </div>

      {/* 3. Barra de Progreso de Pago */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          fontWeight: 800,
          marginBottom: '4px',
          color: 'var(--text-muted)',
        }}>
          <span>Aportado: {formatMoney(totalPaid)} ({percentPaid}%)</span>
          {remaining > 0 ? (
            <span style={{ color: '#EA580C' }}>Resta: {formatMoney(remaining)}</span>
          ) : (
            <span style={{ color: '#16A34A' }}>¡Completado!</span>
          )}
        </div>

        <div style={{
          width: '100%',
          height: '14px',
          backgroundColor: 'var(--bg-surface-alt)',
          border: '2px solid var(--border-color)',
          borderRadius: '999px',
          overflow: 'hidden',
          boxShadow: '1px 1px 0px var(--shadow-color)',
        }}>
          <div
            style={{
              width: `${percentPaid}%`,
              height: '100%',
              backgroundColor: percentPaid >= 100 ? '#22C55E' : 'var(--user-accent)',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* 4. Metadatos: Fecha límite y Miembros Asignados */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.65rem 0.85rem',
        background: 'var(--bg-surface-alt)',
        border: '2px solid var(--border-color)',
        borderRadius: '10px',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <Calendar size={16} strokeWidth={2.4} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Vence: {formattedDueDate}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Asignado a:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }}>
            {assignedUsers.map((u) => (
              <Avatar key={u.uid} user={u} size={28} showTooltip />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Alerta de Rechazo con Justificación si aplica */}
      {expense.status === EXPENSE_STATUSES.REJECTED.id && expense.rejectionReason && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '2px solid #EF4444',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991B1B', marginBottom: '2px' }}>
            Motivo del rechazo:
          </p>
          <p style={{ fontSize: '0.82rem', color: '#7F1D1D', fontStyle: 'italic' }}>
            "{expense.rejectionReason}"
          </p>
        </div>
      )}

      {/* 6. Botones de Acción según el estado y asignación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderTop: '2px dashed var(--border-subtle)',
        paddingTop: '0.85rem',
      }}>
        {/* Desglose de pagos realizados */}
        <div>
          {expense.payments?.length > 0 ? (
            <button
              onClick={() => setShowPaymentsDetail(!showPaymentsDetail)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--user-accent)',
                cursor: 'pointer',
              }}
            >
              <span>{expense.payments.length} contribución{expense.payments.length > 1 ? 'es' : ''}</span>
              {showPaymentsDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Sin aportes aún
            </span>
          )}
        </div>

        {/* Acciones principales */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Si está pendiente y el usuario actual es uno de los asignados */}
          {expense.status === EXPENSE_STATUSES.PENDING.id && isAssignedToMe && (
            <>
              <Button
                variant="danger"
                size="sm"
                icon={X}
                onClick={() => onReject(expense)}
              >
                Rechazar
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={() => onAccept(expense.id)}
              >
                Aceptar
              </Button>
            </>
          )}

          {/* Si está en progreso o parcialmente pagado y el usuario es asignado */}
          {isAssignedToMe && expense.status !== EXPENSE_STATUSES.PAID.id && expense.status !== EXPENSE_STATUSES.REJECTED.id && (
            <>
              {!expense.openHelpRequested && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={HandHelping}
                  onClick={() => onRequestHelp(expense)}
                >
                  Pedir ayuda
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                onClick={() => onOpenPayment(expense)}
              >
                Aportar pago
              </Button>
            </>
          )}

          {/* Si hay ayuda abierta y el usuario actual NO está asignado aún */}
          {expense.openHelpRequested && !isAssignedToMe && expense.status !== EXPENSE_STATUSES.PAID.id && (
            <Button
              variant="success"
              size="sm"
              icon={HandHelping}
              onClick={() => onJoinHelp(expense.id)}
            >
              Ayudar a pagar
            </Button>
          )}

          {/* Si el usuario no es asignado pero ya aceptó ayudar previamente */}
          {!isAssignedToMe && expense.payments?.some(p => p.uid === currentUid) && expense.status !== EXPENSE_STATUSES.PAID.id && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => onOpenPayment(expense)}
            >
              Aportar más
            </Button>
          )}
        </div>
      </div>

      {/* 7. Desglose detallado de pagos / contribuciones */}
      {showPaymentsDetail && expense.payments?.length > 0 && (
        <div
          className="animate-pop"
          style={{
            marginTop: '1rem',
            padding: '0.85rem',
            backgroundColor: 'var(--bg-surface-alt)',
            border: '2px solid var(--border-color)',
            borderRadius: '10px',
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
            HISTORIAL DE CONTRIBUCIONES
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {expense.payments.map((p) => {
              const paymentUser = localStore.getUserById(p.uid);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '0.6rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '8px',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <Avatar user={paymentUser} name={p.userName} size={30} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {p.userName}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(p.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.comment}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16A34A' }}>
                      +{formatMoney(p.amount)}
                    </span>
                    {p.receiptUrl && (
                      <button
                        onClick={() => setSelectedReceipt(p.receiptUrl)}
                        title="Ver comprobante de pago"
                        style={{
                          padding: '4px',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: '6px',
                          background: 'var(--bg-surface-alt)',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <ImageIcon size={16} color="var(--user-accent)" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal visor de comprobante de pago */}
      {selectedReceipt && (
        <div
          className="modal-overlay animate-fade"
          onClick={() => setSelectedReceipt(null)}
          style={{ zIndex: 1200 }}
        >
          <div
            className="modal-content animate-pop"
            style={{ maxWidth: '480px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Comprobante de Pago</h4>
              <button onClick={() => setSelectedReceipt(null)} style={{ cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <img
              src={selectedReceipt}
              alt="Comprobante de pago"
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '2px solid var(--border-color)',
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
