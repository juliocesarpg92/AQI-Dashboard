# Build stage
FROM node:22-alpine AS builder

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY ./ ./

RUN npm run build && \
  npm prune --production

# Deploy stage
FROM nginx:1.29-alpine3.22 AS deploy

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]