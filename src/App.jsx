/**
 * @file App.jsx
 * @description Ensamblador principal de ExpenseShare:
 * Integra el Shell adaptativo (Sidebar de escritorio / Barra flotante móvil),
 * el Router de navegación interna por páginas y los diálogos modales globales.
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HouseholdProvider, useHousehold } from './context/HouseholdContext';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import HouseholdsPage from './pages/HouseholdsPage';
import HouseholdDetailPage from './pages/HouseholdDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AuthPage from './pages/AuthPage';
import CreateHouseholdModal from './components/households/CreateHouseholdModal';
import CreateExpenseModal from './components/expenses/CreateExpenseModal';
import GoogleOnboardingModal from './components/auth/GoogleOnboardingModal';
import { localStore } from './data/localStore';

function MainAppShell() {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();

  // Página activa: 'dashboard' | 'households' | 'household_detail' | 'notifications' | 'profile'
  const [activePage, setActivePage] = useState('dashboard');
  const [detailHouseholdId, setDetailHouseholdId] = useState(null);

  // Modales globales
  const [createHouseholdOpen, setCreateHouseholdOpen] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);

  // Si no hay usuario autenticado, mostrar pantalla de inicio de sesión
  if (!currentUser) {
    return <AuthPage />;
  }

  // Título según la página activa
  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return { title: 'Dashboard General', subtitle: 'Resumen financiero y pagos a tu cargo' };
      case 'households':
        return { title: 'Tus Hogares', subtitle: 'Listado de hogares que administras o integras' };
      case 'household_detail':
        return { title: 'Detalle del Hogar', subtitle: 'Administración de gastos y miembros' };
      case 'notifications':
        return { title: 'Bandeja de Notificaciones', subtitle: 'Invitaciones, asignaciones y avisos' };
      case 'profile':
        return { title: 'Perfil de Usuario', subtitle: 'Datos y color de identificación' };
      default:
        return { title: 'ExpenseShare', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  const handleOpenHouseholdDetail = (hhId) => {
    setDetailHouseholdId(hhId);
    setActivePage('household_detail');
  };

  const householdMembers = (currentHousehold?.memberUids || [])
    .map(uid => localStore.getUserById(uid))
    .filter(Boolean);

  return (
    <div className="app-container">
      {/* 1. Barra Lateral Fija (Escritorio) */}
      <Sidebar
        activePage={activePage === 'household_detail' ? 'households' : activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setDetailHouseholdId(null);
        }}
        onOpenCreateHousehold={() => setCreateHouseholdOpen(true)}
      />

      {/* 2. Área de Contenido Principal */}
      <main className="main-content">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />

        {activePage === 'dashboard' && (
          <DashboardPage
            onNavigateToHouseholds={() => setActivePage('households')}
            onOpenCreateHousehold={() => setCreateHouseholdOpen(true)}
            onOpenCreateExpense={() => setCreateExpenseOpen(true)}
          />
        )}

        {activePage === 'households' && (
          <HouseholdsPage
            onSelectHouseholdDetail={handleOpenHouseholdDetail}
          />
        )}

        {activePage === 'household_detail' && (
          <HouseholdDetailPage
            householdId={detailHouseholdId || currentHousehold?.id}
            onBack={() => setActivePage('households')}
          />
        )}

        {activePage === 'notifications' && (
          <NotificationsPage
            onNavigateToHouseholds={() => setActivePage('households')}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage />
        )}
      </main>

      {/* 3. Barra Flotante Inferior (Móvil) */}
      <BottomNav
        activePage={activePage === 'household_detail' ? 'households' : activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setDetailHouseholdId(null);
        }}
      />

      {/* 4. Modales Globales */}
      <CreateHouseholdModal
        isOpen={createHouseholdOpen}
        onClose={() => setCreateHouseholdOpen(false)}
      />

      {currentHousehold && (
        <CreateExpenseModal
          isOpen={createExpenseOpen}
          onClose={() => setCreateExpenseOpen(false)}
          householdId={currentHousehold.id}
          householdMembers={householdMembers}
          adminName={currentUser.displayName}
        />
      )}

      {/* Modal de onboarding para nuevos ingresos con Google */}
      <GoogleOnboardingModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HouseholdProvider>
          <MainAppShell />
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
