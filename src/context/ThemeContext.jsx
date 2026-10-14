/**
 * @file ThemeContext.jsx
 * @description Proveedor de contexto para el tema Claro/Oscuro y la inyección
 * dinámica de variables CSS para la trama pastel del usuario.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('expenseshare_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('expenseshare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  /**
   * Actualiza las variables CSS de acento y trama pastel en el documento
   * @param {Object} colorConfig { accent, pastel, dot }
   */
  const applyUserThemeColors = (colorConfig) => {
    if (!colorConfig) return;
    const root = document.documentElement;
    if (colorConfig.accent) root.style.setProperty('--user-accent', colorConfig.accent);
    if (colorConfig.pastel) root.style.setProperty('--user-pastel', colorConfig.pastel);
    if (colorConfig.dot) root.style.setProperty('--user-pastel-dot', colorConfig.dot);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyUserThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  return context;
}
