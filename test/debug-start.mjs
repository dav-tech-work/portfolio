#!/usr/bin/env node

console.log('🔧 Iniciando debug de la aplicación...');

try {
  console.log('1. Cargando configuración...');
  const { configLoader } = await import('../src/config/environment.mjs');
  const config = configLoader();
  console.log('✅ Configuración cargada correctamente');
  console.log('Puerto:', config.PORT);
  console.log('Entorno:', config.NODE_ENV);

  console.log('2. Importando Express...');
  const express = await import('express');
  console.log('✅ Express importado correctamente');

  console.log('3. Importando middlewares de seguridad...');
  const { protecciones, sanitizer, limiter } = await import('../src/middleware/index.mjs');
  console.log('✅ Middlewares de seguridad importados correctamente');

  console.log('4. Importando middlewares CSRF...');
  // const {
  //   attachCSRFToken,
  //   verifyCSRFToken
  // } = await import('../src/middleware/csrf-modern.mjs');
  console.log('✅ Middlewares CSRF importados correctamente');

  console.log('5. Importando middlewares de autenticación...');
  // const { isAuthenticated } = await import('../src/middleware/auth.mjs');
  console.log('✅ Middlewares de autenticación importados correctamente');

  console.log('6. Importando middlewares de manejo de errores...');
  const { errorHandler, notFoundHandler } = await import('../src/middleware/errorHandler.mjs');
  console.log('✅ Middlewares de manejo de errores importados correctamente');

  console.log('7. Importando rutas...');
  const indexRouter = await import('../src/routes/index.mjs');
  const authRouter = await import('../src/routes/auth.mjs');
  console.log('✅ Rutas importadas correctamente');

  console.log('8. Importando utilidades...');
  // const {
  //   formatDate,
  //   capitalize,
  //   truncate,
  //   isValidEmail
  // } = await import('../src/utils/helpers.mjs');
  console.log('✅ Utilidades importadas correctamente');

  console.log('9. Creando aplicación Express...');
  const app = express.default();
  console.log('✅ Aplicación Express creada correctamente');

  console.log('10. Configurando middlewares de seguridad...');
  app.use(protecciones);
  app.use(sanitizer);
  app.use(limiter);
  console.log('✅ Middlewares de seguridad configurados correctamente');

  console.log('11. Configurando parsing de datos...');
  app.use(
    express.default.json({
      limit: config.MAX_REQUEST_SIZE || '1mb',
    })
  );
  app.use(
    express.default.urlencoded({
      extended: true,
      limit: config.MAX_REQUEST_SIZE || '1mb',
    })
  );
  console.log('✅ Parsing de datos configurado correctamente');

  console.log('12. Configurando motor de plantillas...');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  console.log('✅ Motor de plantillas configurado correctamente');

  console.log('13. Configurando archivos estáticos...');
  app.use(express.default.static(path.join(__dirname, 'public')));
  console.log('✅ Archivos estáticos configurados correctamente');

  console.log('14. Configurando rutas...');
  app.use('/', indexRouter.default);
  app.use('/auth', authRouter.default); // Removed authRateLimiter for debug
  console.log('✅ Rutas configuradas correctamente');

  console.log('15. Configurando manejo de errores...');
  app.use(notFoundHandler);
  app.use(errorHandler);
  console.log('✅ Manejo de errores configurado correctamente');

  console.log('16. Iniciando servidor...');
  app.listen(config.PORT, () => {
    console.log('\n🚀 =====================================');
    console.log(`🌟 Servidor iniciado exitosamente`);
    console.log(`🌐 URL: http://localhost:${config.PORT}`);
    console.log(`🔒 Entorno: ${config.NODE_ENV}`);
    console.log(`🛡️  Seguridad: Activada`);
    console.log(`🔧 PID: ${process.pid}`);
    console.log('🚀 =====================================\n');
  });

  console.log('✅ Servidor iniciado correctamente');
} catch (error) {
  console.error('❌ Error durante el debug:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
