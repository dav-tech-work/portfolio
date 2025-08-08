import fetch from 'node-fetch';

async function testContactoPage() {
  try {
    console.log('🧪 Probando página de contacto...');

    const response = await fetch('http://localhost:3000/contacto');

    if (response.ok) {
      const html = await response.text();

      // Verificar que la página contiene elementos esperados
      const checks = [
        { name: 'Título de la página', test: html.includes('Contacto') },
        { name: 'Información de contacto', test: html.includes('Información de Contacto') },
        { name: 'Estructura de contacto', test: html.includes('contacto-item') },
        { name: 'Etiquetas de contacto', test: html.includes('contacto-label') },
        { name: 'Formulario de contacto', test: html.includes('formulario-contacto') },
        { name: 'CSS cargado', test: html.includes('contacto.min.css') },
        { name: 'Elemento email', test: html.includes('id="email"') },
        { name: 'Ubicación', test: html.includes('Barcelona, España') },
        { name: 'LinkedIn', test: html.includes('Daniel Arribas Velázquez') },
      ];

      console.log('\n✅ Página cargada correctamente');
      console.log('📊 Resultados de las verificaciones:');

      checks.forEach((check) => {
        const status = check.test ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.test ? 'PASÓ' : 'FALLÓ'}`);
      });

      const passedChecks = checks.filter((check) => check.test).length;
      console.log(`\n📈 Resumen: ${passedChecks}/${checks.length} verificaciones pasaron`);

      // Verificar estructura específica del correo
      if (html.includes('contacto-label') && html.includes('Email:')) {
        console.log('✅ Estructura del correo electrónico correcta');
      } else {
        console.log('❌ Estructura del correo electrónico incorrecta');
      }
    } else {
      console.log(`❌ Error al cargar la página: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
  }
}

testContactoPage();
