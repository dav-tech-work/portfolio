#!/usr/bin/env node

console.log('🔧 Iniciando debug simple...');

try {
  console.log('1. Cargando configuración...');
  const { configLoader } = await import('../src/config/environment.mjs');
  const config = configLoader();
  console.log('✅ Configuración cargada');

  console.log('2. Importando Express...');
  const express = await import('express');
  console.log('✅ Express importado');

  console.log('3. Importando middlewares de seguridad...');
  const { protecciones } = await import('../src/middleware/index.mjs');
  console.log('✅ Middlewares de seguridad importados');

  console.log('4. Creando aplicación Express...');
  const app = express.default();
  console.log('✅ Aplicación Express creada');

  console.log('5. Configurando middlewares de seguridad...');
  app.use(protecciones);
  console.log('✅ Middlewares de seguridad configurados');

  console.log('6. Configurando parsing de datos...');
  app.use(express.default.json());
  app.use(express.default.urlencoded({ extended: true }));
  console.log('✅ Parsing de datos configurado');

  console.log('7. Configurando motor de plantillas...');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  console.log('✅ Motor de plantillas configurado');

  console.log('8. Importando express-ejs-layouts...');
  const expressLayouts = await import('express-ejs-layouts');
  console.log('✅ express-ejs-layouts importado');

  console.log('9. Configurando express-ejs-layouts...');
  app.use(expressLayouts.default);
  console.log('✅ express-ejs-layouts configurado');

  console.log('10. Configurando archivos estáticos...');
  app.use(express.default.static(path.join(__dirname, 'public')));
  console.log('✅ Archivos estáticos configurados');

  console.log('11. Configurando ruta de prueba...');
  app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working' });
  });
  console.log('✅ Ruta de prueba configurada');

  console.log('12. Iniciando servidor...');
  app.listen(config.PORT, () => {
    console.log(`✅ Servidor iniciado en puerto ${config.PORT}`);
  });

  console.log('✅ Todo funcionando correctamente');
} catch (error) {
  console.error('❌ Error durante el debug:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
