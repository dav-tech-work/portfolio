import fetch from 'node-fetch';

async function testPrivacidadPage() {
  try {
    console.log('🧪 Probando página de privacidad...');

    const response = await fetch('http://localhost:3000/privacidad');

    if (response.ok) {
      const html = await response.text();

      // Verificar que la página contiene elementos esperados
      const checks = [
        { name: 'Título de la página', test: html.includes('Política de Privacidad') },
        { name: 'Contenedor CSS', test: html.includes('privacy-container') },
        { name: 'Secciones CSS', test: html.includes('privacy-section') },
        { name: 'Información de contacto', test: html.includes('contact-info') },
        { name: 'CSS cargado', test: html.includes('privacidad.min.css') },
        { name: 'Traducciones funcionando', test: html.includes('t.privacy') },
      ];

      console.log('\n✅ Página cargada correctamente');
      console.log('📊 Resultados de las verificaciones:');

      checks.forEach((check) => {
        const status = check.test ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.test ? 'PASÓ' : 'FALLÓ'}`);
      });

      const passedChecks = checks.filter((check) => check.test).length;
      console.log(`\n📈 Resumen: ${passedChecks}/${checks.length} verificaciones pasaron`);
    } else {
      console.log(`❌ Error al cargar la página: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
  }
}

testPrivacidadPage();
