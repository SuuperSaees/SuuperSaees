FROM node:20-alpine AS build

RUN apk add --no-cache libc6-compat git
RUN npm install -g pnpm@9.5.0 dotenv-cli
WORKDIR /app
COPY . .

RUN rm -rf node_modules
RUN pnpm add -w -D @sentry/utils
RUN pnpm i

RUN NODE_OPTIONS="--max-old-space-size=4096" dotenv -- pnpm run build

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