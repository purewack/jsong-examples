# Vue (Vite) multi-stage Dockerfile: build with node, serve with nginx
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Use a lightweight nginx image to serve the built static files
FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA routing: fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
