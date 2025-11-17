# Script para pushear migraciones a Supabase
# Ejecuta este script desde la raíz del proyecto

Write-Host "=== Deploy de Migraciones a Supabase ===" -ForegroundColor Cyan

# 1. Ir al directorio de la app web
Set-Location apps\web

# 2. Verificar login (si no estás logueado, ejecuta: npx supabase login)
Write-Host "`n1. Verificando autenticación..." -ForegroundColor Yellow
npx supabase login --help | Out-Null

# 3. Linkear el proyecto remoto
Write-Host "`n2. Linkeando proyecto remoto..." -ForegroundColor Yellow
npx supabase link --project-ref ylhmberfibfsznyupmqb

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al linkear el proyecto. Asegúrate de estar autenticado." -ForegroundColor Red
    Write-Host "Ejecuta primero: npx supabase login" -ForegroundColor Yellow
    exit 1
}

# 4. Pushear las migraciones
Write-Host "`n3. Pusheando migraciones desde apps/web/supabase/migrations..." -ForegroundColor Yellow
npx supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migraciones aplicadas exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al aplicar migraciones. Revisa los errores arriba." -ForegroundColor Red
}

# Volver al directorio raíz
Set-Location ..\..

Write-Host "`n=== Proceso completado ===" -ForegroundColor Cyan

