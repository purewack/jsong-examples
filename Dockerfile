# builder: build all apps
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
# React
WORKDIR /app/react
RUN npm install --silent
# NEXT_BASE_PATH is read by next.config.js
RUN NEXT_BASE_PATH=/react npm run build
# Vue
WORKDIR /app/vue
RUN npm install --silent
# VITE_BASE is read by vite.config.js
RUN VITE_BASE=/vue npm run build
# Vanilla
WORKDIR /app/vanilla
RUN npm install --silent
RUN npm run build

# runtime: nginx
FROM nginx:stable-alpine
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=builder /app/react/out /usr/share/nginx/html/react
COPY --from=builder /app/vue/dist /usr/share/nginx/html/vue
COPY --from=builder /app/vanilla/dist /usr/share/nginx/html/vanilla
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
CMD ["/docker-entrypoint.sh"]