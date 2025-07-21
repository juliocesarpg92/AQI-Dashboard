FROM node:22-alpine AS base

FROM base AS builder

USER root

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm i && \
  npm run build && \
  npm prune --production

FROM base AS runner

USER root
WORKDIR /app

# Accept port as build argument with default
ARG APP_PORT=3000
# create this ENV variable so it's available at runtime for the healthcheck
ENV HEALTHCHECK_PORT=${APP_PORT}

# Use existing node user instead of creating new one
RUN chown -R node:node /app

COPY --from=builder --chown=node:node /app/node_modules /app/node_modules
COPY --from=builder --chown=node:node /app/dist /app/dist
COPY --from=builder --chown=node:node /app/package.json /app/package.json

USER node

EXPOSE ${APP_PORT}

# Use ENV variable in health check instead of ARG
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${HEALTHCHECK_PORT}/health || exit 1

CMD ["node", "/app/dist/index.js"]