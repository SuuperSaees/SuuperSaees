# Script para actualizar variables de entorno de Supabase
# Ejecuta este script desde la raíz del proyecto

Write-Host "=== Actualizar Variables de Entorno de Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Ir al directorio de la app web
Set-Location apps\web

Write-Host "Para actualizar las variables de entorno, necesitas obtener las siguientes credenciales" -ForegroundColor Yellow
Write-Host "desde tu proyecto en Supabase Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a: https://supabase.com/dashboard/project/ylhmberfibfsznyupmqb/settings/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Necesitas estas 3 variables:" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL (Project URL)" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public key)" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY (service_role secret key)" -ForegroundColor White
Write-Host ""

# Solicitar las variables
$supabaseUrl = Read-Host "Ingresa NEXT_PUBLIC_SUPABASE_URL (ej: https://xxxxx.supabase.co)"
$anonKey = Read-Host "Ingresa NEXT_PUBLIC_SUPABASE_ANON_KEY"
$serviceRoleKey = Read-Host "Ingresa SUPABASE_SERVICE_ROLE_KEY"

# Verificar que se ingresaron valores
if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($anonKey) -or [string]::IsNullOrWhiteSpace($serviceRoleKey)) {
    Write-Host "`n❌ Error: Todas las variables son requeridas" -ForegroundColor Red
    exit 1
}

# Leer el archivo .env.local si existe, o crear uno nuevo
$envFile = ".env.local"
$envContent = @()

if (Test-Path $envFile) {
    Write-Host "`n✓ Archivo .env.local encontrado, actualizando..." -ForegroundColor Green
    $envContent = Get-Content $envFile
    
    # Actualizar o agregar las variables
    $updated = $false
    $newContent = @()
    
    foreach ($line in $envContent) {
        if ($line -match "^NEXT_PUBLIC_SUPABASE_URL=") {
            $newContent += "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
            $updated = $true
        }
        elseif ($line -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY=") {
            $newContent += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
            $updated = $true
        }
        elseif ($line -match "^SUPABASE_SERVICE_ROLE_KEY=") {
            $newContent += "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
            $updated = $true
        }
        else {
            $newContent += $line
        }
    }
    
    # Agregar las variables que no existían
    if (-not ($envContent -match "^NEXT_PUBLIC_SUPABASE_URL=")) {
        $newContent += "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
    }
    if (-not ($envContent -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
        $newContent += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
    }
    if (-not ($envContent -match "^SUPABASE_SERVICE_ROLE_KEY=")) {
        $newContent += "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
    }
    
    $newContent | Set-Content $envFile
} else {
    Write-Host "`n✓ Creando nuevo archivo .env.local..." -ForegroundColor Green
    $envContent = @(
        "# Supabase Configuration",
        "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey",
        "SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey"
    )
    $envContent | Set-Content $envFile
}

Write-Host "`n✅ Variables de entorno actualizadas exitosamente!" -ForegroundColor Green
Write-Host "`nArchivo actualizado: apps/web/.env.local" -ForegroundColor Cyan

# Volver al directorio raíz
Set-Location ..\..

Write-Host "`n=== Proceso completado ===" -ForegroundColor Cyan
Write-Host "`nAhora puedes ejecutar: pnpm dev" -ForegroundColor Yellow

