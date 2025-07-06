// Inicializamos el router
import { Router } from 'express';

const router = Router();

// Definimos las rutas

router.get('/', (req, res) => {
  res.render('pages/index', {
    titulo: 'Portafolio de Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'home',
  });
});

router.get('/pagina1', (req, res) => {
  res.render('pages/pagina1', {
    titulo: 'Página 1',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'pagina1',
  });
});

// Ruta de proyectos
router.get('/proyectos', (req, res) => {
  res.render('pages/proyectos', {
    titulo: 'Proyectos - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'proyectos',
  });
});

// Ruta de formación
router.get('/formacion', (req, res) => {
  res.render('pages/formacion', {
    titulo: 'Formación - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'formacion',
  });
});

// Ruta de curriculum
router.get('/curriculum', (req, res) => {
  res.render('pages/curriculum', {
    titulo: 'Currículum - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'curriculum',
  });
});

// Ruta de construcción
router.get('/construccion', (req, res) => {
  res.render('pages/construccion', {
    titulo: 'En Construcción - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'construccion',
  });
});

// Ruta de API contacto (GET para mostrar formulario)
router.get('/api/contacto', (req, res) => {
  res.render('pages/contacto', {
    titulo: 'Contacto - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'contacto',
    mensajeExito: undefined,
    mensajeError: undefined,
  });
});

// Ruta de API contacto (POST para procesar formulario)
router.post('/api/contacto', (req, res) => {
  // Aquí iría la lógica para procesar el formulario de contacto
  res.json({
    success: true,
    message: 'Mensaje recibido correctamente',
  });
});

// Ruta de páginas protegidas
router.get('/protegidas', (req, res) => {
  res.render('pages/zona-secreta', {
    titulo: 'Zona Protegida - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'protegidas',
  });
});

// Ruta de test
router.get('/test', (req, res) => {
  res.render('test', {
    titulo: 'Página de Test - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'test',
    mensajeExito: undefined,
    mensajeError: undefined,
  });
});

export default router;
