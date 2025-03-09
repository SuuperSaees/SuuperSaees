FROM node:20-alpine AS base

# Solo instalamos libc6-compat que es necesario para Next.js
RUN apk add --no-cache libc6-compat

# Configuramos pnpm
RUN npm install -g pnpm@latest

# Primera etapa: solo instalamos dependencias
FROM base AS deps
WORKDIR /app

# Copiamos solo los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Instalamos solo las dependencias de la app web
RUN cd apps/web && pnpm install --frozen-lockfile --ignore-scripts

# Segunda etapa: construimos la aplicación
FROM base AS builder
WORKDIR /app

# Configuramos memoria para Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096 --gc-global --optimize-for-size"
ENV NEXT_TELEMETRY_DISABLED 1

# Copiamos dependencias y archivos del proyecto
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Construimos directamente la app web sin usar Turborepo
RUN cd apps/web && NEXT_TELEMETRY_DISABLED=1 next build

# Etapa final: imagen de producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

# Creamos un usuario no privilegiado
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo los archivos necesarios para la ejecución
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/styles ./apps/web/styles

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]