import express from 'express';

const router = express.Router();

// Ruta de prueba para verificar el sistema de idiomas
router.get('/', (req, res) => {
  res.json({
    idioma: req.idioma,
    traducciones: {
      // Pruebas con la nueva estructura organizada
      nav_home: req.traducciones?.navigation?.home,
      nav_projects: req.traducciones?.navigation?.projects,
      home_title: req.traducciones?.home?.title,
      home_subtitle: req.traducciones?.home?.subtitle,
      meta_title: req.traducciones?.meta?.title,
      cv_subtitle: req.traducciones?.cv?.subtitle,
      projects_title: req.traducciones?.projects?.title,
      education_title: req.traducciones?.education?.title,
      contact_title: req.traducciones?.contact?.title,

      // Pruebas con la estructura antigua (para compatibilidad)
      nav_home_old: req.traducciones?.['nav.home'],
      home_title_old: req.traducciones?.['home.title'],

      // Pruebas de acceso anidado
      home_sections_development: req.traducciones?.home?.sections?.development?.title,
      cv_experience_title: req.traducciones?.cv?.experience?.title,
      education_python_title: req.traducciones?.education?.python?.title,
    },
    estructura_completa: {
      meta: req.traducciones?.meta,
      navigation: req.traducciones?.navigation,
      home: req.traducciones?.home,
      cv: req.traducciones?.cv,
      projects: req.traducciones?.projects,
      education: req.traducciones?.education,
      contact: req.traducciones?.contact,
    },
    cookies: req.cookies,
    query: req.query,
  });
});

export default router;
