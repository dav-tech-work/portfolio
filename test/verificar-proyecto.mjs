#!/usr/bin/env node

/**
 * Script principal para verificar el proyecto
 * Ejecuta todas las verificaciones de seguridad, código y estructura
 */

import { ejecutarVerificacionesSeguridad } from '../src/checks/verificarSeguridad.mjs';
import { registrar } from '../src/utils/servicios/logger.mjs';
import { auditar } from '../src/utils/servicios/loggerAuditoria.mjs';

console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DEL PROYECTO');
console.log('===============================================\n');

async function verificarProyecto() {
  const inicio = Date.now();

  try {
    // Verificación 1: Seguridad
    console.log('🔒 EJECUTANDO VERIFICACIONES DE SEGURIDAD...');
    const resultadosSeguridad = await ejecutarVerificacionesSeguridad();

    // Verificación 2: Estructura del proyecto
    console.log('\n📁 VERIFICANDO ESTRUCTURA DEL PROYECTO...');
    const resultadosEstructura = await verificarEstructuraProyecto();

    // Verificación 3: Configuración
    console.log('\n⚙️ VERIFICANDO CONFIGURACIÓN...');
    const resultadosConfiguracion = verificarConfiguracion();

    // Verificación 4: Dependencias
    console.log('\n📦 VERIFICANDO DEPENDENCIAS...');
    const resultadosDependencias = await verificarDependencias();

    // Generar reporte final
    const tiempoTotal = Date.now() - inicio;
    generarReporteFinal({
      seguridad: resultadosSeguridad,
      estructura: resultadosEstructura,
      configuracion: resultadosConfiguracion,
      dependencias: resultadosDependencias,
      tiempoTotal,
    });

    // Registrar auditoría
    auditar({
      tipo: 'verificacion_proyecto',
      usuario: 'sistema',
      ip: 'localhost',
      mensaje: 'Verificación completa del proyecto ejecutada',
      datos: {
        tiempoTotal,
        resultados: {
          seguridad: resultadosSeguridad.resumen,
          estructura: resultadosEstructura,
          configuracion: resultadosConfiguracion,
          dependencias: resultadosDependencias,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    registrar(`Error en verificación del proyecto: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function verificarEstructuraProyecto() {
  const resultados = {
    carpetasRequeridas: [],
    archivosRequeridos: [],
    errores: [],
    advertencias: [],
  };

  const carpetasRequeridas = [
    'src',
    'src/middleware',
    'src/routes',
    'src/utils',
    'src/utils/servicios',
    'src/utils/seguridad',
    'src/utils/idioma',
    'src/utils/navegacion',
    'src/utils/optimizacion',
    'src/checks',
    'src/tools',
    'views',
    'views/auth',
    'views/templates',
    'public',
    'public/css',
    'public/js',
    'data',
    'data/idiomas',
    'logs',
  ];

  const archivosRequeridos = [
    'app.mjs',
    'config.env',
    'package.json',
    'src/config/index.mjs',
    'src/middleware/index.mjs',
    'src/utils/helpers.js',
    'src/utils/servicios/logger.mjs',
    'src/utils/seguridad/index.mjs',
    'views/layout.ejs',
    'views/index.ejs',
    'public/css/base.css',
  ];

  // Verificar carpetas
  for (const carpeta of carpetasRequeridas) {
    try {
      const fs = await import('fs');
      const existe = fs.existsSync(carpeta);
      resultados.carpetasRequeridas.push({
        nombre: carpeta,
        existe,
        recomendacion: existe ? 'OK' : 'Crear carpeta',
      });

      if (!existe) {
        resultados.advertencias.push(`Carpeta faltante: ${carpeta}`);
      }
    } catch (error) {
      resultados.errores.push(`Error verificando carpeta ${carpeta}: ${error.message}`);
    }
  }

  // Verificar archivos
  for (const archivo of archivosRequeridos) {
    try {
      const fs = await import('fs');
      const existe = fs.existsSync(archivo);
      resultados.archivosRequeridos.push({
        nombre: archivo,
        existe,
        recomendacion: existe ? 'OK' : 'Crear archivo',
      });

      if (!existe) {
        resultados.advertencias.push(`Archivo faltante: ${archivo}`);
      }
    } catch (error) {
      resultados.errores.push(`Error verificando archivo ${archivo}: ${error.message}`);
    }
  }

  return resultados;
}

function verificarConfiguracion() {
  const resultados = {
    configuraciones: [],
    errores: [],
    advertencias: [],
  };

  // Verificar variables de entorno críticas
  const variablesCriticas = ['SESSION_SECRET', 'JWT_SECRET', 'NODE_ENV'];

  variablesCriticas.forEach((variable) => {
    const valor = process.env[variable];
    const configurada = valor && !valor.includes('fallback');

    resultados.configuraciones.push({
      nombre: variable,
      configurada,
      recomendacion: configurada ? 'OK' : 'Configurar variable de entorno',
    });

    if (!configurada) {
      resultados.errores.push(`${variable} no está configurada correctamente`);
    }
  });

  // Verificar configuración del servidor
  const puerto = process.env.PORT || 3000;
  const entorno = process.env.NODE_ENV || 'development';

  resultados.configuraciones.push({
    nombre: 'PORT',
    configurada: true,
    valor: puerto,
    recomendacion: 'OK',
  });

  resultados.configuraciones.push({
    nombre: 'NODE_ENV',
    configurada: true,
    valor: entorno,
    recomendacion: entorno === 'production' ? 'OK' : 'Considerar producción',
  });

  return resultados;
}

async function verificarDependencias() {
  const resultados = {
    dependencias: [],
    errores: [],
    advertencias: [],
  };

  try {
    const fs = await import('fs');
    const packageJsonText = await fs.promises.readFile('../package.json', 'utf8');
    const dependencias = JSON.parse(packageJsonText);

    const dependenciasRequeridas = [
      'express',
      'ejs',
      'express-session',
      'connect-flash',
      'dotenv',
      'helmet',
      'express-rate-limit',
      'cors',
      'hpp',
      'bcryptjs',
      'jsonwebtoken',
    ];

    dependenciasRequeridas.forEach((dep) => {
      const instalada = dependencias.dependencies?.[dep] || dependencias.devDependencies?.[dep];

      resultados.dependencias.push({
        nombre: dep,
        instalada: !!instalada,
        version: instalada || 'No instalada',
        recomendacion: instalada ? 'OK' : 'Instalar dependencia',
      });

      if (!instalada) {
        resultados.advertencias.push(`${dep} no está instalada`);
      }
    });

    // Verificar tipo de módulo
    const tipoModulo = dependencias.type;
    if (tipoModulo !== 'module') {
      resultados.advertencias.push('Considerar usar "type": "module" en package.json');
    }
  } catch (error) {
    resultados.errores.push(`Error verificando dependencias: ${error.message}`);
  }

  return resultados;
}

function generarReporteFinal(resultados) {
  console.log('\n📊 REPORTE FINAL DE VERIFICACIÓN');
  console.log('================================\n');

  // Resumen de seguridad
  if (resultados.seguridad) {
    const resumen = resultados.seguridad.resumen;
    console.log(`🔒 Seguridad: ${resumen.exitosas}/${resumen.total} verificaciones exitosas`);
    console.log(`   ❌ Errores: ${resumen.errores}`);
    console.log(`   ⚠️ Advertencias: ${resumen.advertencias}\n`);
  }

  // Resumen de estructura
  if (resultados.estructura) {
    const carpetasExistentes = resultados.estructura.carpetasRequeridas.filter(
      (c) => c.existe
    ).length;
    const archivosExistentes = resultados.estructura.archivosRequeridos.filter(
      (a) => a.existe
    ).length;
    console.log(
      `📁 Estructura: ${carpetasExistentes}/${resultados.estructura.carpetasRequeridas.length} carpetas, ${archivosExistentes}/${resultados.estructura.archivosRequeridos.length} archivos`
    );
    console.log(`   ❌ Errores: ${resultados.estructura.errores.length}`);
    console.log(`   ⚠️ Advertencias: ${resultados.estructura.advertencias.length}\n`);
  }

  // Resumen de configuración
  if (resultados.configuracion) {
    const configuracionesCorrectas = resultados.configuracion.configuraciones.filter(
      (c) => c.configurada
    ).length;
    console.log(
      `⚙️ Configuración: ${configuracionesCorrectas}/${resultados.configuracion.configuraciones.length} correctas`
    );
    console.log(`   ❌ Errores: ${resultados.configuracion.errores.length}`);
    console.log(`   ⚠️ Advertencias: ${resultados.configuracion.advertencias.length}\n`);
  }

  // Resumen de dependencias
  if (resultados.dependencias) {
    const dependenciasInstaladas = resultados.dependencias.dependencias.filter(
      (d) => d.instalada
    ).length;
    console.log(
      `📦 Dependencias: ${dependenciasInstaladas}/${resultados.dependencias.dependencias.length} instaladas`
    );
    console.log(`   ❌ Errores: ${resultados.dependencias.errores.length}`);
    console.log(`   ⚠️ Advertencias: ${resultados.dependencias.advertencias.length}\n`);
  }

  // Tiempo total
  console.log(`⏱️ Tiempo total: ${resultados.tiempoTotal}ms`);

  // Estado general
  const totalErrores =
    (resultados.seguridad?.resumen?.errores || 0) +
    (resultados.estructura?.errores?.length || 0) +
    (resultados.configuracion?.errores?.length || 0) +
    (resultados.dependencias?.errores?.length || 0);

  if (totalErrores === 0) {
    console.log('\n✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('El proyecto está bien configurado y listo para usar.');
  } else {
    console.log(`\n⚠️ VERIFICACIÓN COMPLETADA CON ${totalErrores} ERRORES`);
    console.log('Revisa los errores encontrados antes de continuar.');
  }

  console.log(`\n🔍 Verificación completada: ${new Date().toLocaleString()}`);
}

// Ejecutar verificación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verificarProyecto().catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

export { verificarProyecto };
