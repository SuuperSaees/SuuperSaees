# Variables de Entorno Requeridas en Vercel

Este documento lista todas las variables de entorno que **debes configurar** en Vercel Dashboard para que la aplicación funcione correctamente en producción.

## 🔴 Variables OBLIGATORIAS (causan errores si faltan)

### Supabase
Estas variables son **críticas** y se validan al inicio. Si faltan, causarán el error genérico de Server Components.

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Dónde obtenerlas:**
1. Ve a tu proyecto en Supabase Dashboard
2. Settings → API
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Configuración de la Aplicación
Estas variables también son obligatorias y se validan durante el build/render.

```
NEXT_PUBLIC_PRODUCT_NAME=Tu Nombre de Producto
NEXT_PUBLIC_SITE_TITLE=Título de tu Sitio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

**Importante:** `NEXT_PUBLIC_SITE_URL` debe ser HTTPS en producción (no http://).

### Locale (opcional pero recomendado)
```
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

## 🟡 Variables OPCIONALES (necesarias para funcionalidades específicas)

### Suuper API (para envío de emails)
Si usas el sistema de emails de Suuper, necesitas estas variables:

```
NEXT_PUBLIC_SUUPER_CLIENT_ID=tu-client-id
NEXT_PUBLIC_SUUPER_CLIENT_SECRET=tu-client-secret
```

**Nota:** Estas variables ahora son "lazy", por lo que no causarán errores en el build, pero sí en runtime si intentas enviar emails sin ellas.

### Stripe (si usas pagos)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Email SMTP (si usas SMTP en lugar de Suuper API)
```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=tu-email@example.com
EMAIL_PASSWORD=tu-password
EMAIL_TLS=true
EMAIL_SENDER=tu-email@example.com
```

### Otros (según tus necesidades)
```
NEXT_PUBLIC_SITE_DESCRIPTION=Descripción de tu sitio
NEXT_PUBLIC_DEFAULT_THEME_MODE=system
CONTACT_EMAIL=contacto@example.com
CAPTCHA_SECRET_TOKEN=tu-captcha-secret
```

## 📝 Cómo Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable:
   - **Key**: El nombre de la variable (ej: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: El valor de la variable
   - **Environment**: Selecciona **Production**, **Preview**, y/o **Development** según corresponda
5. Haz clic en **Save**
6. **Re-deploy** tu aplicación para que los cambios surtan efecto

## 🔍 Cómo Verificar si Faltan Variables

Si ves el error:
```
An error occurred in the Server Components render. The specific message is omitted in production builds...
```

Es muy probable que falten las variables de **Supabase** o las de **Configuración de la Aplicación**.

### Verificación Rápida

Revisa los logs de Vercel durante el build o runtime. Aunque Next.js oculta los detalles en producción, a veces puedes ver errores de validación de Zod en los logs.

## ✅ Checklist Mínimo

Para que la aplicación funcione básicamente, asegúrate de tener al menos:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_PRODUCT_NAME`
- [ ] `NEXT_PUBLIC_SITE_TITLE`
- [ ] `NEXT_PUBLIC_SITE_URL` (con HTTPS)

## 🚨 Solución Rápida

Si estás viendo el error ahora mismo:

1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que tengas **todas** las variables de la sección "Variables OBLIGATORIAS"
3. Si falta alguna, agrégala
4. Ve a **Deployments** → Selecciona el último deployment → **Redeploy**

