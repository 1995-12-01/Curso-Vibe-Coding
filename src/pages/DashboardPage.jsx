/**
 * @file DashboardPage.jsx
 * @description Vista principal de Dashboard:
 * Muestra el resumen de hogares administrados, hogares de pertenencia,
 * pagos a cargo del usuario y métricas financieras de alto impacto.
 */

import React, { useState } from 'react';
import {
  Home,
  ShieldCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpensePaymentModal from '../components/expenses/ExpensePaymentModal';
import ExpenseRejectModal from '../components/expenses/ExpenseRejectModal';
import ExpenseHelpModal from '../components/expenses/ExpenseHelpModal';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { localStore } from '../data/localStore';
import { acceptExpenseResponsibility, joinAsExpenseHelper } from '../data/expensesRepo';
import { EXPENSE_STATUSES } from '../domain/constants';

export default function DashboardPage({
  onNavigateToHouseholds,
  onOpenCreateHousehold,
  onOpenCreateExpense,
}) {
  const { currentUser } = useAuth();
  const { currentHousehold, administeredHouseholds, memberHouseholds, isCurrentAdmin } = useHousehold();

  // Estados para modales de gastos
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);
  const [selectedExpenseForReject, setSelectedExpenseForReject] = useState(null);
  const [selectedExpenseForHelp, setSelectedExpenseForHelp] = useState(null);

  const allExpenses = localStore.getExpenses(currentHousehold?.id);
  const householdMembers = (currentHousehold?.memberUids || [])
    .map(uid => localStore.getUserById(uid))
    .filter(Boolean);

  // Gastos a cargo del usuario actual en el hogar activo
  const myAssignedExpenses = allExpenses.filter(e => e.assignedUids.includes(currentUser?.uid));
  const myPendingAcceptance = myAssignedExpenses.filter(e => e.status === EXPENSE_STATUSES.PENDING.id);
  const myActiveExpenses = myAssignedExpenses.filter(
    e => e.status === EXPENSE_STATUSES.IN_PROGRESS.id || e.status === EXPENSE_STATUSES.PARTIALLY_PAID.id
  );

  // Métricas financieras
  const totalDueByMe = myActiveExpenses.reduce((sum, e) => {
    const remaining = Math.max(0, Number(e.amount) - Number(e.totalPaid || 0));
    return sum + remaining;
  }, 0);

  const totalHouseholdBudget = allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalHouseholdPaid = allExpenses.reduce((sum, e) => sum + Number(e.totalPaid || 0), 0);

  // Manejadores de acciones sobre gastos
  const handleAccept = async (expenseId) => {
    await acceptExpenseResponsibility(expenseId, currentUser.uid);
  };

  const handleJoinHelp = async (expenseId) => {
    await joinAsExpenseHelper(expenseId, currentUser.uid);
  };

  return (
    <div className="page-container animate-fade">
      {/* 1. Saludo y Encabezado del Dashboard */}
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
            ¡Hola, {currentUser?.displayName?.split(' ')[0] || 'Usuario'}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
            Aquí tienes el resumen de tus pagos asignados y la actividad de tus hogares.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isCurrentAdmin && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={onOpenCreateExpense}
            >
              Nuevo Gasto
            </Button>
          )}
          <Button
            variant="secondary"
            icon={Home}
            onClick={onOpenCreateHousehold}
          >
            Nuevo Hogar
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen y Métricas Principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* Métrica 1: Pagos a mi cargo */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              PAGOS A MI CARGO
            </span>
            <div style={{
              background: 'var(--user-pastel)',
              color: 'var(--user-accent)',
              padding: '6px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
            }}>
              <CreditCard size={18} strokeWidth={2.5} />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-heading-color)', margin: 0 }}>
            ${totalDueByMe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {myActiveExpenses.length} gasto{myActiveExpenses.length !== 1 ? 's' : ''} en curso
          </span>
        </Card>

        {/* Métrica 2: Gastos por Aceptar */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              POR ACEPTAR
            </span>
            <div style={{
              background: '#FEF08A',
              color: '#854D0E',
              padding: '6px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
            }}>
              <Clock size={18} strokeWidth={2.5} />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: myPendingAcceptance.length > 0 ? '#CA8A04' : 'var(--text-main)', margin: 0 }}>
            {myPendingAcceptance.length}
          </p>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {myPendingAcceptance.length > 0 ? 'Requieren tu confirmación' : 'Todo al día'}
          </span>
        </Card>

        {/* Métrica 3: Hogares que administro */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              HOGARES QUE ADMINISTRO
            </span>
            <div style={{
              background: 'var(--user-pastel)',
              color: 'var(--user-accent)',
              padding: '6px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
            }}>
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            {administeredHouseholds.length}
          </p>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {memberHouseholds.length} más como miembro
          </span>
        </Card>

        {/* Métrica 4: Avance general del hogar activo */}
        <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              RECAUDADO EN EL HOGAR
            </span>
            <div style={{
              background: '#BBF7D0',
              color: '#166534',
              padding: '6px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)',
              display: 'flex',
            }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A', margin: 0 }}>
            ${totalHouseholdPaid.toLocaleString('es-MX')}
          </p>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            de ${totalHouseholdBudget.toLocaleString('es-MX')} presupuestados
          </span>
        </Card>
      </div>

      {/* 3. Sección: Pagos a mi cargo */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
              Tus Pagos Asignados en "{currentHousehold?.name || 'Hogar Activo'}"
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Gastos de los cuales eres responsable o has ofrecido ayuda para liquidar
            </p>
          </div>

          <button
            onClick={onNavigateToHouseholds}
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--user-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            Ver todos los gastos <ArrowRight size={15} />
          </button>
        </div>

        {myAssignedExpenses.length > 0 ? (
          <div>
            {myAssignedExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                currentUid={currentUser?.uid}
                isAdmin={isCurrentAdmin}
                onAccept={handleAccept}
                onReject={(exp) => setSelectedExpenseForReject(exp)}
                onOpenPayment={(exp) => setSelectedExpenseForPayment(exp)}
                onRequestHelp={(exp) => setSelectedExpenseForHelp(exp)}
                onJoinHelp={handleJoinHelp}
              />
            ))}
          </div>
        ) : (
          <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <CheckCircle2 size={40} color="#22C55E" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>¡No tienes pagos pendientes a tu cargo!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              En este momento estás al corriente en este hogar.
            </p>
          </Card>
        )}
      </div>

      {/* 4. Resumen de Hogares Administrados y de Pertenencia */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
          Tus Hogares
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Hogares Administrados */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              HOGARES QUE ADMINISTRAS ({administeredHouseholds.length})
            </span>
            {administeredHouseholds.map((hh) => {
              const members = hh.memberUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
              return (
                <Card
                  key={hh.id}
                  onClick={onNavigateToHouseholds}
                  style={{
                    marginBottom: '0.75rem',
                    borderLeft: '6px solid var(--user-accent)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>{hh.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--user-accent)', fontWeight: 800 }}>
                        Administrador
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
                      {members.map(m => (
                        <Avatar key={m.uid} user={m} size={26} />
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Hogares de Pertenencia (Miembro) */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              HOGARES A LOS QUE PERTENECES ({memberHouseholds.length})
            </span>
            {memberHouseholds.length > 0 ? (
              memberHouseholds.map((hh) => {
                const members = hh.memberUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
                return (
                  <Card
                    key={hh.id}
                    onClick={onNavigateToHouseholds}
                    style={{
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>{hh.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          Miembro
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
                        {members.map(m => (
                          <Avatar key={m.uid} user={m} size={26} />
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No perteneces a otros hogares como invitado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modales de operaciones sobre gastos */}
      {selectedExpenseForPayment && (
        <ExpensePaymentModal
          isOpen={Boolean(selectedExpenseForPayment)}
          onClose={() => setSelectedExpenseForPayment(null)}
          expense={selectedExpenseForPayment}
          currentUser={currentUser}
        />
      )}

      {selectedExpenseForReject && (
        <ExpenseRejectModal
          isOpen={Boolean(selectedExpenseForReject)}
          onClose={() => setSelectedExpenseForReject(null)}
          expense={selectedExpenseForReject}
          currentUser={currentUser}
          householdMembers={householdMembers}
        />
      )}

      {selectedExpenseForHelp && (
        <ExpenseHelpModal
          isOpen={Boolean(selectedExpenseForHelp)}
          onClose={() => setSelectedExpenseForHelp(null)}
          expense={selectedExpenseForHelp}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
