/**
 * @file HouseholdsPage.jsx
 * @description Vista del listado de hogares:
 * Separa hogares que administra y hogares a los que pertenece,
 * tarjetas con concepto visual de casa, miniaturas de miembros y botón flotante '+'.
 */

import React, { useState } from 'react';
import { Home, Plus, Users, ShieldCheck, ChevronRight, UserPlus, CreditCard } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import CreateHouseholdModal from '../components/households/CreateHouseholdModal';
import { useHousehold } from '../context/HouseholdContext';
import { useAuth } from '../context/AuthContext';
import { localStore } from '../data/localStore';

export default function HouseholdsPage({ onSelectHouseholdDetail }) {
  const { administeredHouseholds, memberHouseholds, selectHousehold } = useHousehold();
  const { currentUser } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenHousehold = (householdId) => {
    selectHousehold(householdId);
    if (onSelectHouseholdDetail) onSelectHouseholdDetail(householdId);
  };

  return (
    <div className="page-container animate-fade" style={{ position: 'relative', minHeight: '80vh' }}>
      {/* 1. Encabezado de la página */}
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
            Hogares Compartidos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
            Administra tus hogares o accede a los hogares en los que eres invitado.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Crear Hogar
        </Button>
      </div>

      {/* 2. Sección: Hogares que Administras */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="var(--user-accent)" strokeWidth={2.6} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Hogares que Administras ({administeredHouseholds.length})
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {administeredHouseholds.map((hh) => {
            const members = hh.memberUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
            const expenses = localStore.getExpenses(hh.id);
            const pendingExpenses = expenses.filter(e => e.status !== 'paid');

            return (
              <Card
                key={hh.id}
                onClick={() => handleOpenHousehold(hh.id)}
                className="animate-slide-up"
                style={{
                  position: 'relative',
                  borderTop: '8px solid var(--user-accent)',
                  cursor: 'pointer',
                }}
              >
                {/* Visual House Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      backgroundColor: 'var(--user-pastel)',
                      color: 'var(--user-accent)',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      boxShadow: '2px 2px 0px var(--shadow-color)',
                      display: 'flex',
                    }}>
                      <Home size={24} strokeWidth={2.6} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {hh.name}
                      </h4>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: 'var(--user-accent)',
                      }}>
                        Administrador
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>

                {/* Estadísticas rápidas del hogar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Gastos activos</span>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      {pendingExpenses.length}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Miembros</span>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      {members.length}
                    </p>
                  </div>
                </div>

                {/* Miniaturas de miembros */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Miembros:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
                      {members.map((m) => (
                        <Avatar key={m.uid} user={m} size={28} showTooltip />
                      ))}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--user-accent)' }}>
                    Administrar ➔
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Sección: Hogares a los que perteneces */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Users size={20} color="var(--text-muted)" strokeWidth={2.6} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Hogares a los que Perteneces ({memberHouseholds.length})
          </h3>
        </div>

        {memberHouseholds.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}>
            {memberHouseholds.map((hh) => {
              const members = hh.memberUids.map(uid => localStore.getUserById(uid)).filter(Boolean);
              const admin = localStore.getUserById(hh.adminUid);

              return (
                <Card
                  key={hh.id}
                  onClick={() => handleOpenHousehold(hh.id)}
                  className="animate-slide-up"
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        backgroundColor: 'var(--bg-surface-alt)',
                        color: 'var(--text-muted)',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '2px solid var(--border-color)',
                        display: 'flex',
                      }}>
                        <Home size={24} strokeWidth={2.4} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {hh.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Admin: {admin?.displayName || 'Otro miembro'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={20} color="var(--text-muted)" />
                  </div>

                  {/* Miniaturas de miembros */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Compañeros:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
                        {members.map((m) => (
                          <Avatar key={m.uid} user={m} size={28} showTooltip />
                        ))}
                      </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--user-accent)' }}>
                      Ver gastos ➔
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Aún no formas parte de otros hogares como invitado.
            </p>
          </Card>
        )}
      </div>

      {/* 4. Botón flotante '+' en la parte inferior derecha para crear nuevo hogar */}
      <button
        onClick={() => setCreateModalOpen(true)}
        aria-label="Crear nuevo hogar"
        title="Crear nuevo hogar"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '58px',
          height: '58px',
          borderRadius: '9999px',
          backgroundColor: 'var(--user-accent)',
          color: '#FFFFFF',
          border: '3px solid var(--border-color)',
          boxShadow: '4px 4px 0px var(--shadow-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
          transition: 'transform 0.12s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={30} strokeWidth={3} />
      </button>

      {/* Modal de creación de hogar */}
      <CreateHouseholdModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
