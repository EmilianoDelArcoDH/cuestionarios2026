# Script de inicio rápido para Windows PowerShell
# Ejecutar desde la raíz del proyecto: .\start.ps1

Write-Host "🚀 Iniciando Plataforma de Cuestionarios..." -ForegroundColor Green
Write-Host ""

# Verificar si Docker está corriendo
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Cyan
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker está corriendo" -ForegroundColor Green
    
    # Levantar PostgreSQL
    Write-Host "2️⃣ Levantando PostgreSQL con Docker..." -ForegroundColor Cyan
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL iniciado" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } else {
        Write-Host "✗ Error al iniciar PostgreSQL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠ Docker no está corriendo. Asegúrate de tener PostgreSQL instalado manualmente." -ForegroundColor Yellow
}

Write-Host ""

# Backend
Write-Host "3️⃣ Configurando Backend..." -ForegroundColor Cyan
Set-Location backend

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
    npm install
}

# Verificar si hay migraciones aplicadas
Write-Host "🗄️ Verificando base de datos..." -ForegroundColor Yellow
$migrationNeeded = $true

if ($migrationNeeded) {
    Write-Host "📊 Aplicando migraciones..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    Write-Host "🌱 Poblando base de datos..." -ForegroundColor Yellow
    npm run seed
}

Write-Host "✓ Backend configurado" -ForegroundColor Green
Write-Host ""

# Volver a raíz
Set-Location ..

# Frontend
Write-Host "4️⃣ Configurando Frontend..." -ForegroundColor Cyan
Set-Location frontend

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
}

Write-Host "✓ Frontend configurado" -ForegroundColor Green
Write-Host ""

# Volver a raíz
Set-Location ..

Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Para iniciar los servidores:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
