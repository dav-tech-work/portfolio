import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ruta principal: /
router.get('/', (req, res) => {
  res.render('pages/formacion', {
    titulo: req.traducciones?.education?.title || 'Formación',
    tipo: 'formacion',
    idioma: req.idioma,
    t: req.traducciones,
    csrfToken: res.locals.csrfToken || req.csrfToken,
    nonce: res.locals.nonce,
  });
});

// Rutas dinámicas para secciones específicas
const secciones = [
  'python/teoria',
  'python/practicas',
  'javascript/teoria',
  'javascript/practicas',
  'html',
  'php',
  'sistemas',
  'seguridad',
  'construccion',
].map((s) => s.replace(/^\/+|\/+$/g, ''));

// ✅ CORREGIDO: Cache para verificación de vistas (optimización)
const vistaCache = new Map();

// Función para verificar si existe una vista
function existeVista(app, nombreVista) {
  // ✅ CORREGIDO: Usar caché para evitar verificaciones repetidas
  if (vistaCache.has(nombreVista)) {
    return vistaCache.get(nombreVista);
  }

  try {
    const viewsPath = app.get('views');
    const rutaVista = path.join(viewsPath, 'pages', 'formacion', `${nombreVista}.ejs`);
    const existe = fs.existsSync(rutaVista);

    // Cachear resultado
    vistaCache.set(nombreVista, existe);
    return existe;
  } catch {
    // Manejo de error eliminado por no usarse
  }
}

// Renderizado dinámico usando EJS desde views/pages/formacion/<slug>.ejs
secciones.forEach((slug) => {
  router.get(`/${slug}`, (req, res) => {
    const slugParts = slug.split('/');
    const nombreVista = slugParts.join('_'); // Ejemplo: python_teoria

    console.log(`🔍 Ruta solicitada: /${slug}, nombreVista: ${nombreVista}`);

    // Caso especial para sistemas - servir archivo HTML estático
    if (slug === 'sistemas') {
      return res.sendFile(
        path.join(process.cwd(), 'public', 'pages', 'sistemas', 'practica_01_sistemas.html')
      );
    }

    // Verifica si la vista existe
    const vistaExiste = existeVista(req.app, nombreVista);
    console.log(`📁 Vista existe: ${vistaExiste} para ${nombreVista}`);

    if (!vistaExiste) {
      console.log(`❌ Vista no encontrada: ${nombreVista}, redirigiendo a construcción`);
      return res.render('pages/construccion', {
        titulo: req.traducciones?.construction?.title || 'En construcción',
        tipo: 'construccion',
        idioma: req.idioma,
        t: req.traducciones,
        csrfToken: res.locals.csrfToken || req.csrfToken,
        nonce: res.locals.nonce,
      });
    }

    console.log(`✅ Renderizando vista: pages/formacion/${nombreVista}`);
    // Renderiza la vista correspondiente
    res.render(`pages/formacion/${nombreVista}`, {
      titulo: req.traducciones?.education?.[nombreVista]?.title || slug,
      tipo: nombreVista, // Usar el nombre de la vista como tipo para cargar CSS específico
      idioma: req.idioma,
      t: req.traducciones,
      csrfToken: res.locals.csrfToken || req.csrfToken,
      nonce: res.locals.nonce,
      scriptAdicional: '/assets/js/muestra_contenido.min.js',
      cssAdicional: nombreVista === 'seguridad' ? '/assets/css/secciones/seguridad.css' : undefined,
    });
  });
});

export default router;
