// search.js — Motor de búsqueda y filtrado de fanfics
 
/**
 * Filtra y ordena fanfics según los criterios dados.
 * @param {Array} fanfics - Array completo de fanfics
 * @param {Object} filters
 * @param {string} filters.query - Búsqueda por título
 * @param {string} filters.autor - Filtro por autor exacto
 * @param {string} filters.fandom - Filtro por fandom
 * @param {string} filters.genero - Filtro por género
 * @param {string} filters.estado - Filtro por estado
 * @param {string} filters.tag - Filtro por etiqueta
 * @param {string} filters.orden - Criterio de ordenación
 * @returns {Array} Fanfics filtrados y ordenados
 */
export function filterFanfics(fanfics, filters = {}) {
  const { query = '', autor = '', fandom = '', genero = '', estado = '', tag = '', orden = 'valoracion' } = filters;
 
  let result = [...fanfics];
 
  // Búsqueda por título (insensible a mayúsculas y acentos)
  if (query.trim()) {
    const q = normalize(query.trim());
    result = result.filter(f =>
      normalize(f.titulo).includes(q) ||
      normalize(f.autor).includes(q) ||
      normalize(f.fandom).includes(q) ||
      f.relaciones?.some(t => normalize(t).includes(q))
    );
  }
 
  // Filtro por autor
  if (autor) {
    result = result.filter(f => f.autor === autor);
  }
 
  // Filtro por fandom
  if (fandom) {
    result = result.filter(f => f.fandom === fandom);
  }
 
  // Filtro por género
  if (genero) {
    result = result.filter(f => f.generos?.includes(genero));
  }
 
  // Filtro por estado
  if (estado) {
    result = result.filter(f => f.estado === estado);
  }
 
  // Filtro por etiqueta
  if (tag) {
    result = result.filter(f => f.relaciones?.includes(tag));
  }
 
  // Ordenación
  result = sortFanfics(result, orden);
 
  return result;
}
 
/**
 * Ordena fanfics por criterio.
 */
export function sortFanfics(fanfics, orden) {
  const sorted = [...fanfics];
  switch (orden) {
    case 'valoracion':
      return sorted.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
    case 'vistas':
      return sorted.sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
    case 'capitulos':
      return sorted.sort((a, b) => (b.capitulos || 0) - (a.capitulos || 0));
    case 'reciente':
      return sorted.sort((a, b) =>
        new Date(b.fechaActualizacion || 0) - new Date(a.fechaActualizacion || 0)
      );
    case 'titulo':
      return sorted.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    default:
      return sorted;
  }
}
 
/**
 * Extrae listas únicas de autores, fandoms, géneros y relaciones.
 */
export function extractFilterOptions(fanfics) {
  const autores = [...new Set(fanfics.map(f => f.autor))].sort((a, b) => a.localeCompare(b, 'es'));
  const fandoms = [...new Set(fanfics.map(f => f.fandom))].sort((a, b) => a.localeCompare(b, 'es'));
  const generos = [...new Set(fanfics.flatMap(f => f.generos || []))].sort((a, b) => a.localeCompare(b, 'es'));
  const relaciones = [...new Set(fanfics.flatMap(f => f.relaciones || []))].sort((a, b) => a.localeCompare(b, 'es'));
  return { autores, fandoms, generos, relaciones };
}
 
/**
 * Normaliza texto: minúsculas + quita acentos.
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
 
/**
 * Lee el estado actual de todos los filtros del DOM.
 * @returns {Object} filters
 */
export function readFiltersFromDOM() {
  return {
    query: document.getElementById('search-input')?.value || '',
    autor: document.getElementById('filter-autor')?.value || '',
    fandom: document.getElementById('filter-fandom')?.value || '',
    genero: document.getElementById('filter-genero')?.value || '',
    estado: document.getElementById('filter-estado')?.value || '',
    orden: document.getElementById('filter-orden')?.value || 'valoracion',
    tag: document.getElementById('active-tag-filter')?.value || '',
  };
}
 
/**
 * Limpia todos los filtros del DOM.
 */
export function clearFiltersDOM() {
  const ids = ['search-input', 'filter-autor', 'filter-fandom', 'filter-genero', 'filter-estado', 'filter-orden'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'SELECT') {
        el.value = id === 'filter-orden' ? 'valoracion' : '';
      } else {
        el.value = '';
        el.dispatchEvent(new Event('input'));
      }
    }
  });
  // Limpiar tag activo
  const activeTagInput = document.getElementById('active-tag-filter');
  if (activeTagInput) activeTagInput.value = '';
 
  // Quitar estilo activo de tags
  document.querySelectorAll('[data-action="filter-tag"]').forEach(t => t.classList.remove('active'));
}