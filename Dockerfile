FROM node:20 AS build

RUN apt-get update && apt-get install -y libc6-compat
RUN npm install -g pnpm@latest
RUN pnpm store prune
WORKDIR /app
COPY . .

RUN rm -rf node_modules
RUN pnpm add -w -D @sentry/utils

# Instalar solo las dependencias necesarias para la app web
RUN cd apps/web && pnpm install --frozen-lockfile

# Configurar opciones de memoria y compilar solo la app web
ENV NODE_OPTIONS="--max-old-space-size=6144 --gc-global --optimize-for-size"
RUN cd apps/web && NEXT_TELEMETRY_DISABLED=1 next build

FROM node:20-alpine

ENV NODE_ENV production
ENV PORT 3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app

COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/styles ./apps/web/styles

USER nextjs

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["node", "apps/web/server.js"]