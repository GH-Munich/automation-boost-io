# AWD-Detektor — Next.js Standalone (analog ki-boost-Muster im GHA-KI-KOSMOS).
# Baut ein schlankes Runtime-Image: server.js + nur benoetigte Deps + Content.

# ---- Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Nicht als root laufen.
RUN addgroup -S awd && adduser -S awd -G awd

# Standalone-Server (inkl. minimalem node_modules), Client-Assets und die
# Content-JSONs. Letztere werden zur Laufzeit per fs gelesen (content-loader),
# daher explizit kopieren — unabhaengig vom File-Tracing.
COPY --from=build --chown=awd:awd /app/.next/standalone ./
COPY --from=build --chown=awd:awd /app/.next/static ./.next/static
COPY --from=build --chown=awd:awd /app/content ./content

USER awd
EXPOSE 3000
CMD ["node", "server.js"]
