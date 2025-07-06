// 🌓 Sistema de tema oscuro/claro
// --------------------------------------------------------------------------
// Inicializa el tema del documento antes de que se cargue el DOM.
// Usa el tema guardado en localStorage o el predeterminado 'dark'.
(() => {
  const theme =
    window.seguridad?.storage?.get?.('theme') ?? localStorage.getItem('theme') ?? 'dark';
  const safeTheme = ['light', 'dark'].includes(theme) ? theme : 'dark';
  document.documentElement.setAttribute('data-bs-theme', safeTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.querySelector('.theme-toggle');

  // 🔄 Actualización del icono del tema
  // --------------------------------------------------------------------------
  // Actualiza el icono del botón de tema según el tema actual.
  const updateThemeIcon = (theme) => {
    const icon = themeBtn?.querySelector('i');
    if (!icon) return;
    icon.className = 'fas';
    icon.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
  };

  // 🔄 Actualización del icono inicial
  // --------------------------------------------------------------------------
  // Establece el icono inicial según el tema actual.
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  updateThemeIcon(currentTheme);

  // 🔁 Cambiar tema
  // --------------------------------------------------------------------------
  // Maneja el cambio de tema cuando se hace clic en el botón de tema.
  themeBtn?.addEventListener('click', () => {
    try {
      const html = document.documentElement;
      const current = html.getAttribute('data-bs-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      if (!['light', 'dark'].includes(newTheme)) throw new Error('Tema inválido');

      // Actualizar el tema
      html.setAttribute('data-bs-theme', newTheme);

      // Guardar preferencia
      if (seguridad?.storage?.set) {
        seguridad.storage.set('theme', newTheme);
      } else {
        localStorage.setItem('theme', newTheme);
      }

      // Actualizar icono
      updateThemeIcon(newTheme);
    } catch (err) {
      console.error('Error al cambiar tema:', err);
    }
  });
});
