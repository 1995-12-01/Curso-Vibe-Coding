/**
 * @file ExpenseFilterBar.jsx
 * @description Barra de búsqueda y filtros combinados:
 * Búsqueda por texto (nombre), Estado, Categoría y Miembro responsable.
 */

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../../domain/constants';

export default function ExpenseFilterBar({
  filters,
  setFilters,
  members = [],
}) {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.assignedTo !== 'all'
  );

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      assignedTo: 'all',
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '2.5px solid var(--border-color)',
        borderRadius: '14px',
        boxShadow: '3px 3px 0px var(--shadow-color)',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* 1. Buscador por texto de nombre de gasto */}
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
        }}>
          <Search size={18} strokeWidth={2.4} />
        </div>

        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Buscar gastos por nombre..."
          className="flat-input"
          style={{ paddingLeft: '2.5rem' }}
        />

        {filters.search && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 2. Filtros de selección rápida en cuadrícula */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        {/* Filtro por Estado */}
        <div>
          <label className="flat-label" style={{ fontSize: '0.75rem' }}>ESTADO</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="flat-select"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="all">Todos los estados</option>
            {Object.values(EXPENSE_STATUSES).map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Categoría */}
        <div>
          <label className="flat-label" style={{ fontSize: '0.75rem' }}>CATEGORÍA</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="flat-select"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="all">Todas las categorías</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Responsable Asignado */}
        <div>
          <label className="flat-label" style={{ fontSize: '0.75rem' }}>RESPONSABLE</label>
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="flat-select"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="all">Cualquier miembro</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName} (@{m.handle})
              </option>
            ))}
          </select>
        </div>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <button
              onClick={resetFilters}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-surface-alt)',
                color: '#EF4444',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <X size={15} /> Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
