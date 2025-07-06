function initIdioma() {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;

  languageSelect.addEventListener('change', () => {
    const selected = languageSelect.value;
    // Establecer la cookie para mantener el idioma (por si se utiliza en otros momentos)
    document.cookie = `lang=${selected}; path=/; max-age=31536000; SameSite=Lax`; // 1 año

    // Actualizar la URL con el query parameter para forzar que el backend detecte el cambio
    const url = new URL(window.location.href);
    url.searchParams.set('lang', selected);
    window.location.href = url.toString();
  });
}

function getCurrentLang() {
  // Obtener el idioma actual de la cookie o de la URL
  const langMatch = document.cookie.match(/lang=([a-zA-Z-]+)/);
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  return urlLang || langMatch?.[1] || 'es'; // Default a español
}

function addLangToLinks() {
  const lang = getCurrentLang();
  if (!lang) return;

  // Seleccionar todos los enlaces internos
  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    // Evitar duplicar el parámetro lang
    const url = new URL(link.href, window.location.origin);
    if (url.searchParams.get('lang') !== lang) {
      url.searchParams.set('lang', lang);
      link.href = url.pathname + url.search + url.hash;
    }
  });
}

function interceptLinkClicks() {
  // Interceptar clics en enlaces para mantener el idioma
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link || !link.href || link.href.startsWith('javascript:') || link.href.startsWith('#')) {
      return;
    }

    // Solo procesar enlaces internos
    if (link.href.startsWith(window.location.origin)) {
      const lang = getCurrentLang();
      if (lang) {
        const url = new URL(link.href);
        if (url.searchParams.get('lang') !== lang) {
          url.searchParams.set('lang', lang);
          e.preventDefault();
          window.location.href = url.toString();
        }
      }
    }
  });
}

function updateFormActions() {
  // Actualizar acciones de formularios para mantener el idioma
  const lang = getCurrentLang();
  if (!lang) return;

  document.querySelectorAll('form[action^="/"]').forEach((form) => {
    const url = new URL(form.action, window.location.origin);
    if (url.searchParams.get('lang') !== lang) {
      url.searchParams.set('lang', lang);
      form.action = url.pathname + url.search;
    }
  });
}

function initLangPersistence() {
  // Inicializar todas las funcionalidades de persistencia de idioma
  addLangToLinks();
  interceptLinkClicks();
  updateFormActions();

  // Observar cambios en el DOM para enlaces dinámicos
  const observer = new MutationObserver(() => {
    addLangToLinks();
    updateFormActions();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIdioma();
  initLangPersistence();
});

// Exportar funciones para uso en otros módulos
export {
  initIdioma,
  addLangToLinks,
  getCurrentLang,
  interceptLinkClicks,
  updateFormActions,
  initLangPersistence,
};
