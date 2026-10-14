/**
 * @file HouseholdDetailPage.jsx
 * @description Vista de detalle de un hogar:
 * Pestañas de Gastos y Administración de Miembros (aceptados y pendientes),
 * creación y edición de gastos, filtros combinados y buscador en tiempo real.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Users,
  CreditCard,
  UserPlus,
  ShieldCheck,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpenseFilterBar from '../components/expenses/ExpenseFilterBar';
import CreateExpenseModal from '../components/expenses/CreateExpenseModal';
import ExpensePaymentModal from '../components/expenses/ExpensePaymentModal';
import ExpenseRejectModal from '../components/expenses/ExpenseRejectModal';
import ExpenseHelpModal from '../components/expenses/ExpenseHelpModal';
import InviteMemberModal from '../components/households/InviteMemberModal';
import { useHousehold } from '../context/HouseholdContext';
import { useAuth } from '../context/AuthContext';
import { localStore } from '../data/localStore';
import {
  acceptExpenseResponsibility,
  joinAsExpenseHelper,
} from '../data/expensesRepo';
import { declineHouseholdInvite } from '../data/householdsRepo';

export default function HouseholdDetailPage({ householdId, onBack }) {
  const { currentUser } = useAuth();
  const household = localStore.getHouseholdById(householdId);

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'members'
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);

  // Modales de acciones sobre gastos
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);
  const [selectedExpenseForReject, setSelectedExpenseForReject] = useState(null);
  const [selectedExpenseForHelp, setSelectedExpenseForHelp] = useState(null);

  // Filtros de gastos
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    assignedTo: 'all',
  });

  if (!household) {
    return (
      <div className="page-container">
        <p>Hogar no encontrado.</p>
        <Button onClick={onBack}>Volver a Hogares</Button>
      </div>
    );
  }

  const isAdmin = household.adminUid === currentUser?.uid;

  // Obtener miembros completos
  const members = household.memberUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
  const pendingInvitedUsers = (household.pendingInvites || []).map(uid => localStore.getUserById(uid)).filter(Boolean);

  // Obtener gastos del hogar
  const allExpenses = localStore.getExpenses(household.id);

  // Aplicar filtros
  const filteredExpenses = allExpenses.filter((exp) => {
    // Filtro por texto
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      if (!exp.name.toLowerCase().includes(q)) return false;
    }

    // Filtro por estado
    if (filters.status !== 'all' && exp.status !== filters.status) {
      return false;
    }

    // Filtro por categoría
    if (filters.category !== 'all' && exp.category !== filters.category) {
      return false;
    }

    // Filtro por miembro responsable
    if (filters.assignedTo !== 'all' && !exp.assignedUids.includes(filters.assignedTo)) {
      return false;
    }

    return true;
  });

  // Acciones sobre gastos
  const handleAccept = async (expenseId) => {
    await acceptExpenseResponsibility(expenseId, currentUser.uid);
  };

  const handleJoinHelp = async (expenseId) => {
    await joinAsExpenseHelper(expenseId, currentUser.uid);
  };

  const handleCancelInvite = async (userUid) => {
    await declineHouseholdInvite(household.id, userUid);
  };

  return (
    <div className="page-container animate-fade">
      {/* Botón de retroceso */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          fontWeight: 800,
          color: 'var(--user-accent)',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        <ArrowLeft size={18} strokeWidth={2.6} /> Volver a lista de hogares
      </button>

      {/* Cabecera del Hogar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '2.5px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: 'var(--text-heading-color)' }}>
              {household.name}
            </h2>
            {isAdmin && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--user-pastel)',
                color: 'var(--user-accent)',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <ShieldCheck size={14} /> Eres Administrador
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
            {members.length} miembros activos • {allExpenses.length} gastos registrados
          </p>
        </div>

        {/* Acciones principales */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <Button
                variant="secondary"
                icon={UserPlus}
                onClick={() => setInviteMemberOpen(true)}
              >
                Invitar Miembro
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setCreateExpenseOpen(true)}
              >
                Nuevo Gasto
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pestañas de navegación interna: Gastos vs Miembros */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
      }}>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            border: activeTab === 'expenses' ? '2.5px solid var(--border-color)' : '2px solid transparent',
            backgroundColor: activeTab === 'expenses' ? 'var(--user-pastel)' : 'transparent',
            boxShadow: activeTab === 'expenses' ? '3px 3px 0px var(--shadow-color)' : 'none',
            color: activeTab === 'expenses' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <CreditCard size={18} strokeWidth={2.4} />
          <span>Gastos del Hogar ({allExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            border: activeTab === 'members' ? '2.5px solid var(--border-color)' : '2px solid transparent',
            backgroundColor: activeTab === 'members' ? 'var(--user-pastel)' : 'transparent',
            boxShadow: activeTab === 'members' ? '3px 3px 0px var(--shadow-color)' : 'none',
            color: activeTab === 'members' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Users size={18} strokeWidth={2.4} />
          <span>Administrar Miembros ({members.length})</span>
        </button>
      </div>

      {/* Pestaña 1: Gastos del Hogar */}
      {activeTab === 'expenses' && (
        <div className="animate-fade">
          {/* Barra de Búsqueda y Filtros */}
          <ExpenseFilterBar
            filters={filters}
            setFilters={setFilters}
            members={members}
          />

          {/* Listado de Gastos Filtrados */}
          {filteredExpenses.length > 0 ? (
            <div>
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  currentUid={currentUser?.uid}
                  isAdmin={isAdmin}
                  onAccept={handleAccept}
                  onReject={(exp) => setSelectedExpenseForReject(exp)}
                  onOpenPayment={(exp) => setSelectedExpenseForPayment(exp)}
                  onRequestHelp={(exp) => setSelectedExpenseForHelp(exp)}
                  onJoinHelp={handleJoinHelp}
                />
              ))}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CreditCard size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>No se encontraron gastos con estos filtros</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Prueba a restablecer los filtros o crear un nuevo gasto si eres el administrador.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Pestaña 2: Administrar Miembros */}
      {activeTab === 'members' && (
        <div className="animate-fade">
          {/* Miembros Aceptados */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Miembros Activos
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {members.map((member) => (
                <Card key={member.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar user={member} size={42} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {member.displayName}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        @{member.handle}
                      </span>
                    </div>
                  </div>

                  {member.uid === household.adminUid ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--user-accent)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      Admin
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-surface-alt)',
                      color: 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      Miembro
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Invitaciones Pendientes de Aceptación */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Invitaciones Pendientes ({pendingInvitedUsers.length})
            </h3>

            {pendingInvitedUsers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {pendingInvitedUsers.map((pendingUser) => (
                  <Card key={pendingUser.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar user={pendingUser} size={38} />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {pendingUser.displayName}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          @{pendingUser.handle}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: '#FEF08A',
                        color: '#854D0E',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #CA8A04',
                      }}>
                        Pendiente
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => handleCancelInvite(pendingUser.uid)}
                          title="Cancelar invitación"
                          style={{
                            padding: '4px',
                            cursor: 'pointer',
                            color: '#EF4444',
                            borderRadius: '4px',
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  No hay invitaciones pendientes en este momento.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateExpenseModal
        isOpen={createExpenseOpen}
        onClose={() => setCreateExpenseOpen(false)}
        householdId={household.id}
        householdMembers={members}
        adminName={currentUser?.displayName}
      />

      <InviteMemberModal
        isOpen={inviteMemberOpen}
        onClose={() => setInviteMemberOpen(false)}
        household={household}
      />

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
          householdMembers={members}
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
