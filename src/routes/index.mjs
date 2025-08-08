// Inicializamos el router
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const jsPath = path.join(process.cwd(), 'data', 'public', 'assets', 'js', 'index.js');
const jsInline = fs.readFileSync(jsPath, 'utf8');

// Script específico para contacto
const contactoJsPath = path.join(process.cwd(), 'public', 'assets', 'js', 'contacto.min.js');
const contactoJsInline = fs.readFileSync(contactoJsPath, 'utf8');

// Definimos las rutas

router.get('/', (req, res) => {
  res.render('pages/index', {
    titulo: 'Portafolio de Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'home',
    onepage: true,
    jsInline,
  });
});

router.get('/pagina1', (req, res) => {
  res.render('pages/pagina1', {
    titulo: 'Página 1',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'pagina1',
    jsInline,
  });
});

// Ruta de about
router.get('/about', (req, res) => {
  res.render('pages/about', {
    titulo: 'Sobre Mí - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'about',
    jsInline,
  });
});

// Ruta de formación
router.get('/formacion', (req, res) => {
  res.render('pages/formacion', {
    titulo: 'Formación - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'formacion',
    jsInline,
  });
});

// Ruta de proyectos
router.get('/proyectos', (req, res) => {
  res.render('pages/proyectos', {
    titulo: 'Proyectos - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'proyectos',
    jsInline,
  });
});

// Ruta de homelab

router.get('/homelab', (req, res) => {
  res.render('pages/homelab', {
    titulo: 'Homelab - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'homelab',
    jsInline,
  });
});

// Ruta de contacto
router.get('/contacto', (req, res) => {
  // Obtener mensajes de la URL
  const mensajeExito = req.query.success ? decodeURIComponent(req.query.success) : undefined;
  const mensajeError = req.query.error ? decodeURIComponent(req.query.error) : undefined;

  res.render('pages/contacto', {
    titulo: 'Contacto - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'contacto',
    mensajeExito,
    mensajeError,
    jsInline: contactoJsInline, // Usar script específico de contacto minificado
  });
});

// Ruta de curriculum
router.get('/curriculum', (req, res) => {
  res.render('pages/curriculum', {
    titulo: 'Currículum - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'curriculum',
    jsInline,
  });
});

// Ruta de construcción
router.get('/construccion', (req, res) => {
  res.render('pages/construccion', {
    titulo: 'En Construcción - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'construccion',
    jsInline,
  });
});

// Ruta de páginas protegidas
router.get('/protegidas', (req, res) => {
  res.render('pages/zona-secreta', {
    titulo: 'Zona Protegida - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'protegidas',
    jsInline,
  });
});

// Ruta de privacidad
router.get('/privacidad', (req, res) => {
  res.render('pages/privacidad', {
    titulo: 'Política de Privacidad - Daniel Arribas',
    idioma: req.idioma || 'es',
    t: req.traducciones || {},
    tipo: 'privacidad',
    jsInline,
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
    jsInline,
  });
});

export default router;
