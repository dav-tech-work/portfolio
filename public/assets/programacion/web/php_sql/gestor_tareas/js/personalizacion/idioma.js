// 🌐 Sistema de internacionalización
// --------------------------------------------------------------------------
// Inicializa el idioma del documento antes de que se cargue el DOM.
// Usa el idioma guardado en localStorage o el predeterminado 'es'.
(() => {
  const lang = localStorage.getItem('language') ?? 'es';
  const safeLang = ['es', 'en', 'ca', 'uk'].includes(lang) ? lang : 'es';
  document.documentElement.lang = safeLang;
})();

// 📚 Base de datos de traducciones
// --------------------------------------------------------------------------
// Objeto que contiene todas las traducciones para los diferentes idiomas.
// Cada idioma tiene sus propias traducciones para los textos de la interfaz.
const translations = {
  es: {
    'app.title': 'Gestión de Tareas',
    'task.input': 'Introduce una tarea',
    'task.add': 'Añadir tarea',
    'task.pending': 'Pendientes',
    'task.inProgress': 'En Ejecución',
    'task.completed': 'Realizadas',
    'calendar.title': 'Calendario de Tareas',
    'calendar.today': 'Hoy',
    'calendar.month': 'mes',
    'calendar.days.monday': 'lunes',
    'calendar.days.tuesday': 'martes',
    'calendar.days.wednesday': 'miércoles',
    'calendar.days.thursday': 'jueves',
    'calendar.days.friday': 'viernes',
    'calendar.days.saturday': 'sábado',
    'calendar.days.sunday': 'domingo',
    'date.start': 'Fecha inicio',
    'date.end': 'Fecha fin',
  },
  en: {
    'app.title': 'Task Management',
    'task.input': 'Enter a task',
    'task.add': 'Add task',
    'task.pending': 'Pending',
    'task.inProgress': 'In Progress',
    'task.completed': 'Completed',
    'calendar.title': 'Task Calendar',
    'calendar.today': 'Today',
    'calendar.month': 'month',
    'calendar.days.monday': 'monday',
    'calendar.days.tuesday': 'tuesday',
    'calendar.days.wednesday': 'wednesday',
    'calendar.days.thursday': 'thursday',
    'calendar.days.friday': 'friday',
    'calendar.days.saturday': 'saturday',
    'calendar.days.sunday': 'sunday',
    'date.start': 'Start date',
    'date.end': 'End date',
  },
  ca: {
    'app.title': 'Gestió de Tasques',
    'task.input': 'Introdueix una tasca',
    'task.add': 'Afegir tasca',
    'task.pending': 'Pendents',
    'task.inProgress': 'En Execució',
    'task.completed': 'Realitzades',
    'calendar.title': 'Calendari de Tasques',
    'calendar.today': 'Avui',
    'calendar.month': 'mes',
    'calendar.days.monday': 'dilluns',
    'calendar.days.tuesday': 'dimarts',
    'calendar.days.wednesday': 'dimecres',
    'calendar.days.thursday': 'dijous',
    'calendar.days.friday': 'divendres',
    'calendar.days.saturday': 'dissabte',
    'calendar.days.sunday': 'diumenge',
    'date.start': 'Data inici',
    'date.end': 'Data fi',
  },
  uk: {
    'app.title': 'Управління завданнями',
    'task.input': 'Введіть завдання',
    'task.add': 'Додати завдання',
    'task.pending': 'Очікує',
    'task.inProgress': 'В процесі',
    'task.completed': 'Завершено',
    'calendar.title': 'Календар завдань',
    'calendar.today': 'Сьогодні',
    'calendar.month': 'місяць',
    'calendar.days.monday': 'понеділок',
    'calendar.days.tuesday': 'вівторок',
    'calendar.days.wednesday': 'середа',
    'calendar.days.thursday': 'четвер',
    'calendar.days.friday': "п'ятниця",
    'calendar.days.saturday': 'субота',
    'calendar.days.sunday': 'неділя',
    'date.start': 'Дата початку',
    'date.end': 'Дата кінця',
  },
};

// 🔄 Actualización de textos
// --------------------------------------------------------------------------
// Función que actualiza todos los textos de la interfaz según el idioma seleccionado.
function updateTexts(lang) {
  try {
    if (!translations[lang]) throw new Error('Idioma no soportado');

    // Actualizar todos los elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      const translation = translations[lang][key];
      if (translation) {
        // Si es un input o textarea, actualizar el placeholder
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Actualizar el calendario si existe
    if (window.calendar) {
      calendar.setOption('locale', lang);
      calendar.setOption('buttonText', {
        today: translations[lang]['calendar.today'],
        month: translations[lang]['calendar.month'],
      });
    }
  } catch (error) {
    console.error('Error al actualizar textos:', error);
  }
}

// 🌍 Cambio de idioma
// --------------------------------------------------------------------------
// Función que maneja el cambio de idioma de la aplicación.
window.setLanguage = function (lang) {
  try {
    if (!['es', 'en', 'ca', 'uk'].includes(lang)) {
      throw new Error('Idioma no soportado');
    }

    // Actualizar el idioma del documento
    document.documentElement.lang = lang;

    // Guardar preferencia
    localStorage.setItem('language', lang);

    // Actualizar textos
    updateTexts(lang);

    // Actualizar estado visual de los botones
    document.querySelectorAll('.language-selector button').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      }
    });
  } catch (error) {
    console.error('Error al cambiar idioma:', error);
  }
};

// 🚀 Inicialización
// --------------------------------------------------------------------------
// Evento que se ejecuta cuando el DOM está completamente cargado.
// Inicializa el sistema de idiomas y establece los eventos necesarios.
document.addEventListener('DOMContentLoaded', () => {
  // Cargar idioma guardado o usar el predeterminado
  const savedLang = localStorage.getItem('language') || navigator.language.split('-')[0];
  setLanguage(['es', 'en', 'ca', 'uk'].includes(savedLang) ? savedLang : 'es');

  // Configurar eventos para los botones de cambio de idioma
  document.querySelectorAll('.language-switch').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang-switch');
      setLanguage(lang);
    });
  });

  // Configurar el select de idiomas si existe
  const select = document.getElementById('languageSelect');
  if (select) {
    select.value = savedLang;
    select.addEventListener('change', (e) => setLanguage(e.target.value));
  }
});
