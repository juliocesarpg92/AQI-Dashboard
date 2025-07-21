FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm i && \
  npm run build && \
  npm prune --production

FROM base AS runner
WORKDIR /app

# Accept port as build argument
ARG APP_PORT=3000

# Create a non-root user and group
# Use a specific UID and GID to avoid conflicts with host systems
# This is important for security and compatibility with various environments
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 --ingroup nodejs hono && \
  chown -R hono:nodejs /app

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono

# Now EXPOSE uses the build argument
EXPOSE ${APP_PORT}

CMD ["node", "/app/dist/index.js"]