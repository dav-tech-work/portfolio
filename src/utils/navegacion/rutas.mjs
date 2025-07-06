export const RUTAS = [
  {
    id: 'inicio',
    slug: 'inicio',
    path: '/',
    archivo: 'pages/index.html',
    titulo: 'Inicio',
    protegido: false,
    categoria: 'general',
  },
  {
    id: 'proyectos',
    slug: 'proyectos',
    path: '/proyectos',
    archivo: 'pages/proyectos.html',
    titulo: 'Proyectos',
    protegido: false,
    categoria: 'general',
  },
  {
    id: 'curriculum',
    slug: 'curriculum',
    path: '/curriculum',
    archivo: 'pages/curriculum.html',
    titulo: 'Currículum',
    protegido: false,
    categoria: 'general',
  },
  {
    id: 'formacion',
    slug: 'formacion',
    path: '/formacion',
    archivo: 'pages/formacion.html',
    titulo: 'Formación',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'python_teoria',
    slug: 'python_teoria',
    path: '/formacion/python/teoria',
    archivo: 'pages/python/teoria.html',
    titulo: 'Python - Teoría',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'python_practicas',
    slug: 'python_practicas',
    path: '/formacion/python/practicas',
    archivo: 'pages/python/practicas.html',
    titulo: 'Python - Prácticas',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'js_teoria',
    slug: 'js_teoria',
    path: '/formacion/javascript/teoria',
    archivo: 'pages/javascript/teoria.html',
    titulo: 'JavaScript - Teoría',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'js_practicas',
    slug: 'js_practicas',
    path: '/formacion/javascript/practicas',
    archivo: 'pages/javascript/practicas.html',
    titulo: 'JavaScript - Prácticas',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'practica_sistemas_01',
    slug: 'practica_sistemas_01',
    path: '/formacion/sistemas/practicas/practica_01_sistemas',
    archivo: 'pages/sistemas/practicas/practica_01_sistemas.html',
    titulo: 'Práctica Sistemas 01',
    protegido: false,
    categoria: 'formacion',
  },
  {
    id: 'error_404',
    slug: '404',
    path: '/404',
    archivo: 'pages/404.html',
    titulo: 'Página no encontrada',
    protegido: false,
    categoria: 'sistema',
  },
  {
    id: 'construccion',
    slug: 'construccion',
    path: '/construccion',
    archivo: 'pages/construccion.html',
    titulo: 'En construcción',
    protegido: false,
    categoria: 'sistema',
  },
];

/**
 * Utilidades para manejo de rutas y navegación
 */

/**
 * Genera una URL segura para navegación
 * @param {string} ruta - Ruta base
 * @param {Object} parametros - Parámetros de consulta
 * @returns {string} URL segura
 */
export function generarURL(ruta, parametros = {}) {
  try {
    const url = new URL(ruta, 'http://localhost');

    // Agregar parámetros de consulta
    Object.entries(parametros).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.pathname + url.search;
  } catch (error) {
    console.error('Error generando URL:', error);
    return ruta;
  }
}

/**
 * Obtiene la ruta actual sin parámetros de consulta
 * @param {string} url - URL completa
 * @returns {string} Ruta base
 */
export function obtenerRutaBase(url) {
  try {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.pathname;
  } catch (error) {
    return url.split('?')[0];
  }
}

/**
 * Verifica si una ruta coincide con un patrón
 * @param {string} ruta - Ruta a verificar
 * @param {string|RegExp} patron - Patrón a comparar
 * @returns {boolean} True si coincide
 */
export function rutaCoincide(ruta, patron) {
  if (typeof patron === 'string') {
    return ruta === patron || ruta.startsWith(patron + '/');
  }
  return patron.test(ruta);
}

/**
 * Obtiene parámetros de la URL
 * @param {string} url - URL completa
 * @returns {Object} Parámetros de consulta
 */
export function obtenerParametros(url) {
  try {
    const urlObj = new URL(url, 'http://localhost');
    const parametros = {};

    urlObj.searchParams.forEach((value, key) => {
      parametros[key] = value;
    });

    return parametros;
  } catch (error) {
    return {};
  }
}

/**
 * Construye breadcrumbs para navegación
 * @param {string} ruta - Ruta actual
 * @param {Object} traducciones - Traducciones disponibles
 * @returns {Array} Array de breadcrumbs
 */
export function construirBreadcrumbs(ruta, traducciones = {}) {
  const breadcrumbs = [];
  const partes = ruta.split('/').filter((parte) => parte);

  let rutaAcumulada = '';

  // Agregar home
  breadcrumbs.push({
    nombre: traducciones.home || 'Inicio',
    ruta: '/',
    activo: partes.length === 0,
  });

  // Construir breadcrumbs para cada parte
  partes.forEach((parte, index) => {
    rutaAcumulada += `/${parte}`;

    breadcrumbs.push({
      nombre: traducciones[parte] || parte.charAt(0).toUpperCase() + parte.slice(1),
      ruta: rutaAcumulada,
      activo: index === partes.length - 1,
    });
  });

  return breadcrumbs;
}

/**
 * Valida si una ruta es segura para redirección
 * @param {string} ruta - Ruta a validar
 * @returns {boolean} True si es segura
 */
export function esRutaSegura(ruta) {
  if (!ruta || typeof ruta !== 'string') return false;

  // Verificar que no contenga caracteres peligrosos
  const caracteresPeligrosos = /[<>"'`&/\\(){}[\];!%$#@*+,:?^~]/;
  if (caracteresPeligrosos.test(ruta)) return false;

  // Verificar que no sea una ruta absoluta externa
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return false;

  // Verificar que no contenga patrones peligrosos
  const patronesPeligrosos = [
    /\.\./,
    /\/etc\//,
    /\/var\//,
    /\/bin\//,
    /\/usr\//,
    /\\windows\\/,
    /\\system32\\/,
  ];

  return !patronesPeligrosos.some((patron) => patron.test(ruta));
}

/**
 * Sanitiza una ruta para uso seguro
 * @param {string} ruta - Ruta a sanitizar
 * @returns {string} Ruta sanitizada
 */
export function sanitizarRuta(ruta) {
  if (!ruta || typeof ruta !== 'string') return '/';

  // Eliminar caracteres peligrosos
  let sanitizada = ruta.replace(/[<>"'`&/\\(){}[\];!%$#@*+,:?^~]/g, '');

  // Eliminar secuencias peligrosas
  sanitizada = sanitizada.replace(/\.\./g, '');
  sanitizada = sanitizada.replace(/\/etc\//g, '');
  sanitizada = sanitizada.replace(/\/var\//g, '');
  sanitizada = sanitizada.replace(/\/bin\//g, '');
  sanitizada = sanitizada.replace(/\/usr\//g, '');
  sanitizada = sanitizada.replace(/\\windows\\/g, '');
  sanitizada = sanitizada.replace(/\\system32\\/g, '');

  // Asegurar que empiece con /
  if (!sanitizada.startsWith('/')) {
    sanitizada = '/' + sanitizada;
  }

  // Eliminar múltiples barras consecutivas
  sanitizada = sanitizada.replace(/\/+/g, '/');

  return sanitizada || '/';
}

/**
 * Obtiene la ruta anterior desde el referer
 * @param {string} referer - Header referer
 * @param {string} dominio - Dominio actual
 * @returns {string} Ruta anterior o '/'
 */
export function obtenerRutaAnterior(referer, dominio) {
  if (!referer || !dominio) return '/';

  try {
    const url = new URL(referer);

    // Verificar que sea del mismo dominio
    if (url.hostname !== dominio) return '/';

    return url.pathname || '/';
  } catch (error) {
    return '/';
  }
}

/**
 * Genera una URL de redirección segura
 * @param {string} ruta - Ruta de destino
 * @param {string} fallback - Ruta de respaldo
 * @returns {string} URL segura
 */
export function generarRedireccion(ruta, fallback = '/') {
  if (!ruta) return fallback;

  // Si es una ruta relativa, sanitizarla
  if (!ruta.startsWith('http')) {
    return sanitizarRuta(ruta);
  }

  // Si es una URL externa, verificar que sea segura
  try {
    const url = new URL(ruta);

    // Solo permitir HTTPS en producción
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      return fallback;
    }

    // Verificar dominio permitido (opcional)
    const dominiosPermitidos = process.env.DOMINIOS_PERMITIDOS?.split(',') || [];
    if (dominiosPermitidos.length > 0 && !dominiosPermitidos.includes(url.hostname)) {
      return fallback;
    }

    return ruta;
  } catch (error) {
    return fallback;
  }
}
