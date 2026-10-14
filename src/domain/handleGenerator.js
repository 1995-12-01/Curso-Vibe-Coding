/**
 * @file handleGenerator.js
 * @description Generador de sugerencias de handles únicos para usuarios cuando el elegido ya existe.
 */

/**
 * Genera una lista de alternativas únicas para un handle solicitado.
 * @param {string} baseHandle Handle original solicitado (ej. "carlos")
 * @param {string[]} existingHandles Lista de handles ya registrados
 * @returns {string[]} Lista de 3 o 4 sugerencias disponibles
 */
export function generateHandleSuggestions(baseHandle, existingHandles = []) {
  const clean = baseHandle.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'usuario';
  const existingSet = new Set(existingHandles.map(h => h.toLowerCase()));

  const candidates = [
    `${clean}_${Math.floor(10 + Math.random() * 89)}`,
    `${clean}_es`,
    `${clean}_hogar`,
    `${clean}${new Date().getFullYear().toString().slice(-2)}`,
    `el_${clean}`,
    `${clean}_app`,
  ];

  // Filtrar aquellos que no existan
  const available = candidates.filter(cand => !existingSet.has(cand));

  // Retornar hasta 3 sugerencias únicas
  return [...new Set(available)].slice(0, 3);
}
