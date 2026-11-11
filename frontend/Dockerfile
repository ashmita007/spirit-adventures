# Spirit Adventures website + owner portal + CRM (Next.js 15) - production image
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked in at build time (Next.js inlines NEXT_PUBLIC_* and the rewrite targets)
ARG BACKEND_URL=http://backend:8000
ARG NEXT_PUBLIC_SITE_URL=https://www.spiritadventures.in
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=+919666567551
ARG NEXT_PUBLIC_PHONE_NUMBER="+91 96665 67551"
ARG NEXT_PUBLIC_EMAIL=info@spiritadventures.in
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
ENV BACKEND_URL=$BACKEND_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_PHONE_NUMBER=$NEXT_PUBLIC_PHONE_NUMBER \
    NEXT_PUBLIC_EMAIL=$NEXT_PUBLIC_EMAIL \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]
