# Script para probar todas las rutas del servidor
$baseUrl = "http://localhost:3000"
$routes = @("/", "/proyectos", "/formacion", "/curriculum", "/construccion", "/api/contacto", "/protegidas", "/test")

Write-Host "🧪 Probando rutas del servidor..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($route in $routes) {
  try {
    $response = Invoke-WebRequest -Uri "$baseUrl$route" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ $route - Status: $($response.StatusCode)" -ForegroundColor Green
  }
  catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ $route - Status: $statusCode" -ForegroundColor Red
  }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Pruebas completadas!" -ForegroundColor Green
