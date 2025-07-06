import express from 'express';

const router = express.Router();

// Ruta de prueba para verificar el sistema de idiomas
router.get('/', (req, res) => {
  res.json({
    idioma: req.idioma,
    traducciones: {
      nav_home: req.traducciones?.['nav.home'],
      home_title: req.traducciones?.['home.title'],
      home_subtitle: req.traducciones?.['home.subtitle'],
    },
    cookies: req.cookies,
    query: req.query,
  });
});

export default router;
