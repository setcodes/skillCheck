# Сборка: те же проверки, что в CI, затем статический бандл.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Коммит для футера: .git в образ не копируется (.dockerignore), его передаёт скрипт деплоя
ARG APP_COMMIT=""
ENV APP_COMMIT=$APP_COMMIT
RUN npm run check

# Раздача: только dist и конфиг Nginx, без node и исходников.
FROM nginx:1.28-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
