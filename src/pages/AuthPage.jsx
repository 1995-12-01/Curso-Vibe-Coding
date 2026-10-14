/**
 * @file AuthPage.jsx
 * @description Pantalla de Inicio de Sesión y Registro con Firebase Auth:
 * Correo/contraseña con campo de handle único en registro, botón de Google Auth
 * y sugerencia instantánea de alternativas si el handle ya existe.
 */

import React, { useState } from 'react';
import { Home, Mail, Lock, User, AtSign, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { checkHandleAvailability } from '../data/usersRepo';

export default function AuthPage() {
  const { loginWithEmail, registerWithEmail, signInWithGoogle, loading } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    handle: '',
  });

  const [handleSuggestions, setHandleSuggestions] = useState([]);
  const [error, setError] = useState('');

  const handleHandleChange = async (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, handle: val }));
    setError('');
    if (!val.trim()) {
      setHandleSuggestions([]);
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        if (!formData.email || !formData.password) {
          setError('Ingresa tu correo y contraseña.');
          return;
        }
        await loginWithEmail(formData.email, formData.password);
      } else {
        if (!formData.email || !formData.password || !formData.handle) {
          setError('Todos los campos son obligatorios.');
          return;
        }

        const check = await checkHandleAvailability(formData.handle);
        if (!check.isAvailable) {
          setError(`El handle @${formData.handle.replace('@', '')} ya está en uso.`);
          setHandleSuggestions(check.suggestions);
          return;
        }

        await registerWithEmail(
          formData.email,
          formData.password,
          formData.displayName || formData.handle,
          formData.handle
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <Card
        className="animate-pop"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2rem 1.75rem',
        }}
      >
        {/* Logotipo y Título */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--user-accent)',
            color: '#FFFFFF',
            padding: '12px',
            borderRadius: '16px',
            border: '2.5px solid var(--border-color)',
            boxShadow: '3px 3px 0px var(--shadow-color)',
            marginBottom: '0.75rem',
          }}>
            <Home size={32} strokeWidth={2.6} />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: 'var(--text-heading-color)' }}>
            ExpenseShare
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            Control de gastos del hogar por asignación responsable
          </p>
        </div>

        {/* Alternador Modo: Login / Registro */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          backgroundColor: 'var(--bg-surface-alt)',
          padding: '4px',
          borderRadius: '10px',
          border: '2px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: mode === 'login' ? '2px solid var(--border-color)' : 'none',
              backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
              boxShadow: mode === 'login' ? '2px 2px 0px var(--shadow-color)' : 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: mode === 'register' ? '2px solid var(--border-color)' : 'none',
              backgroundColor: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
              boxShadow: mode === 'register' ? '2px 2px 0px var(--shadow-color)' : 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Botón de Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            padding: '0.75rem',
            borderRadius: '9999px',
            border: '2.5px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
            boxShadow: '3px 3px 0px var(--shadow-color)',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1.25rem',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          fontWeight: 700,
        }}>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--border-subtle)' }} />
          <span>O CON TU CORREO</span>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <Input
                label="Nombre completo"
                required
                icon={User}
                placeholder="Carlos Gómez"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />

              <Input
                label="Handle único de usuario"
                required
                icon={AtSign}
                placeholder="carlos_admin"
                value={formData.handle}
                onChange={handleHandleChange}
                helperText="Nombre único por el cual te encontrarán tus compañeros."
              />

              {/* Sugerencias si el handle está tomado */}
              {handleSuggestions.length > 0 && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '8px',
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    ALTERNATIVAS SUGERIDAS:
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {handleSuggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, handle: sug }));
                          setError('');
                          setHandleSuggestions([]);
                        }}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          borderRadius: '6px',
                          border: '1.5px solid var(--user-accent)',
                          backgroundColor: 'var(--user-pastel)',
                          color: 'var(--user-accent)',
                          cursor: 'pointer',
                        }}
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <Input
            label="Correo electrónico"
            required
            type="email"
            icon={Mail}
            placeholder="usuario@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />

          <Input
            label="Contraseña"
            required
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />

          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '2px solid #EF4444',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              marginBottom: '1rem',
              color: '#991B1B',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
