// pagination.js — Sistema de Paginación
 
const PAGE_SIZE = 20;
 
/**
 * Aplica paginación a un array de items.
 * @param {Array} items - Array completo
 * @param {number} page - Página actual (1-based)
 * @param {number} size - Items por página
 * @returns {{ items: Array, totalPages: number, currentPage: number }}
 */
export function paginate(items, page = 1, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * size;
  const end = start + size;
  return {
    items: items.slice(start, end),
    totalPages,
    currentPage,
    totalItems: items.length,
  };
}
 
/**
 * Crea un controlador de paginación client-side.
 * @param {Object} options
 * @param {Array} options.allItems - Todos los items
 * @param {number} [options.pageSize=20]
 * @param {Function} options.onPageChange - Callback(paginatedItems, currentPage, totalPages)
 * @returns {{ goTo, next, prev, getCurrentPage, getTotalPages }}
 */
export function createPaginator({ allItems, pageSize = PAGE_SIZE, onPageChange }) {
  let currentPage = 1;
  let items = allItems;
 
  function render() {
    const result = paginate(items, currentPage, pageSize);
    currentPage = result.currentPage;
    onPageChange(result.items, result.currentPage, result.totalPages, result.totalItems);
  }
 
  return {
    goTo(page) {
      currentPage = page;
      render();
    },
    next() {
      const { totalPages } = paginate(items, currentPage, pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    },
    prev() {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    },
    setItems(newItems) {
      items = newItems;
      currentPage = 1;
      render();
    },
    getCurrentPage() { return currentPage; },
    getTotalPages() {
      return Math.max(1, Math.ceil(items.length / pageSize));
    },
  };
}
 
/**
 * Renderiza la UI de paginación en un contenedor dado.
 * @param {HTMLElement} container
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {Function} onPageClick - Callback(page)
 */
export function renderPaginationUI(container, currentPage, totalPages, onPageClick) {
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }
 
  const pages = getPageNumbers(currentPage, totalPages);
 
  container.innerHTML = `
    <div class="flex items-center justify-center gap-1 flex-wrap">
      <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Anterior">‹</button>
      ${pages.map(p =>
        p === '...'
          ? `<span class="page-btn" style="cursor:default;pointer-events:none;">…</span>`
          : `<button class="page-btn ${p === currentPage ? 'current' : ''}" data-page="${p}" aria-label="Página ${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>`
      ).join('')}
      <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Siguiente">›</button>
      <span class="ml-2 font-['Raleway'] text-xs" style="color:var(--color-muted);">${currentPage}/${totalPages}</span>
    </div>
  `;
 
  container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-page'));
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageClick(page);
        // Scroll suave al top del grid
        document.getElementById('fanfic-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
 
/**
 * Genera array de números/puntos para mostrar en la paginación.
 */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}