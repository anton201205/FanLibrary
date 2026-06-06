const STORAGE_KEY = 'fanfic_library';

/**
 * Obtiene todos los fanfics guardados.
 */
export function getLibrary() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Guarda la biblioteca.
 */
function saveLibrary(library) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));

  window.dispatchEvent(
    new CustomEvent('libraryUpdated', {
      detail: library,
    })
  );
}

/**
 * Añadir fanfic.
 */
export function addToLibrary(fanfic) {
  const library = getLibrary();

  const exists = library.some((f) => Number(f.id) === Number(fanfic.id));
  if (exists) return false;

  library.push({
    id:            fanfic.id,
    titulo:        fanfic.titulo,
    autor:         fanfic.autor,
    portada:       fanfic.portada,
    capitulos:     fanfic.capitulos,
    estado:        fanfic.estado,
    generos:       fanfic.generos,
    etiquetas:     fanfic.etiquetas,
    personajes:    fanfic.personajes,
    palabras:      fanfic.palabras,
    clasificacion: fanfic.clasificacion,
    descripcion:   fanfic.descripcion,
    enlaces:       fanfic.enlaces,
    fechaGuardado: new Date().toISOString(),
  });

  saveLibrary(library);
  return true;
}
/**
 * Eliminar fanfic.
 */
export function removeFromLibrary(id) {
  const library = getLibrary();

  const newLibrary = library.filter(
    (f) => Number(f.id) !== Number(id)
  );

  if (newLibrary.length === library.length) {
    return false;
  }

  saveLibrary(newLibrary);

  return true;
}

/**
 * Verifica si existe.
 */
export function isInLibrary(id) {
  return getLibrary().some(
    (f) => Number(f.id) === Number(id)
  );
}

/**
 * Limpiar biblioteca.
 */
export function clearLibrary() {
  saveLibrary([]);
}

/**
 * Actualiza apariencia del botón.
 */
function updateButtonState(btn, inLibrary) {
  if (inLibrary) {
    btn.innerHTML = '✓ En tu biblioteca';
    btn.classList.remove('from-pink-500', 'to-orange-500', 'bg-gradient-to-r');
    btn.classList.add('bg-emerald-600');
    btn.disabled = true;
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.innerHTML = '<span>＋</span> Añadir a biblioteca';
    btn.classList.add('from-pink-500', 'to-orange-500', 'bg-gradient-to-r');
    btn.classList.remove('bg-emerald-600');
    btn.disabled = false;
    btn.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Inicializa botones añadir.
 */
export function initLibraryButtons() {
  const buttons = document.querySelectorAll(
    '[data-action="add"]'
  );

  buttons.forEach((btn) => {
    if (btn.dataset.libraryReady === 'true') {
      return;
    }

    btn.dataset.libraryReady = 'true';

    const id = btn.dataset.id;

    if (!id) return;

    updateButtonState(
      btn,
      isInLibrary(id)
    );

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      let fanficData;

      try {
        fanficData = JSON.parse(
          btn.dataset.fanfic || '{}'
        );
      } catch (err) {
        console.error(
          'Error leyendo fanfic:',
          err
        );
        return;
      }

      const added =
        addToLibrary(fanficData);

      if (added) {
        updateButtonState(btn, true);

        window.showToast?.(
          `"${fanficData.titulo}" añadido a tu biblioteca 📚`,
          'success'
        );
      } else {
        window.showToast?.(
          'Ya está en tu biblioteca',
          'info'
        );
      }
    });
  });
}

/**
 * Inicializa botones quitar.
 */
export function initRemoveButtons(onRemove) {
  const buttons = document.querySelectorAll(
    '[data-action="remove"]'
  );

  buttons.forEach((btn) => {
    if (btn.dataset.removeReady === 'true') {
      return;
    }

    btn.dataset.removeReady = 'true';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.dataset.id;

      if (!id) return;

      const removed =
        removeFromLibrary(id);

      if (removed) {
        onRemove?.(id);
      }
    });
  });
}

/**
 * Auto inicialización.
 */
function autoInit() {
  initLibraryButtons();
}

if (typeof window !== 'undefined') {
  document.addEventListener(
    'DOMContentLoaded',
    autoInit
  );

  document.addEventListener(
    'astro:page-load',
    autoInit
  );
}