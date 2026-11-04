# Деплой

SkillCheck — статический SPA. В продакшене это контейнер `skillcheck-web` (Nginx со сборкой),
который стоит за уже существующим reverse proxy (Nginx + Certbot в Docker Compose) и подключён
к его Docker-сети. Наружу контейнер портов не публикует.

```
браузер ─443─▶ reverse proxy (TLS, HSTS) ─▶ skillcheck-web:8080 (SPA, CSP, кэш)
```

Конкретные значения — сервер, домен, пути, ключи — в репозиторий не попадают: они живут
в `deploy/deploy.env`, который в `.gitignore`.

## Файлы

| Файл | Что делает |
|---|---|
| `../Dockerfile` | сборка с `npm run check`, раздача `dist/` через `nginx:1.28-alpine` |
| `nginx.conf` | SPA-fallback, кэш ассетов, `no-cache` для `index.html`, CSP (`unsafe-eval` только для воркера-песочницы) |
| `docker-compose.yml` | контейнер приложения, read-only, сеть из `EDGE_NETWORK` |
| `edge/site-acme.conf.in` | конфиг reverse proxy, этап 1: только HTTP для выпуска сертификата |
| `edge/site.conf.in` | конфиг reverse proxy, этап 2: HTTPS и проксирование на приложение |
| `vps-install.sh` | деплой на сервере: проверки, сборка, сертификат, включение с проверкой и откатом |
| `deploy.sh` | запуск `vps-install.sh` по SSH со значениями из `deploy.env` |
| `deploy.env.example` | шаблон локального `deploy.env` |

## Запуск

```sh
cp deploy/deploy.env.example deploy/deploy.env   # один раз; заполнить своими значениями
./deploy/deploy.sh                               # или ./deploy/deploy.sh <ветка>
```

Скрипт идемпотентный: повторный запуск подтягивает код и пересобирает контейнер,
выпуск сертификата пропускается, если он уже есть.

Что происходит на сервере:

1. Проверки: Docker и Compose v2, сеть `EDGE_NETWORK`, запущенный reverse proxy, DNS домена
   указывает на этот сервер, свободное место.
2. Код в `APP_DIR` (`/opt/skillcheck`, если он доступен на запись, иначе `~/skillcheck` — sudo не нужен),
   сборка образа, ожидание `healthy`.
3. Конфиги из `edge/*.conf.in` рендерятся в `APP_DIR/deploy/edge/rendered/` и подключаются
   к reverse proxy отдельным compose-оверлеем поверх текущего набора его файлов.
4. Если сертификата нет: HTTP-конфиг → проверка ACME-пути → `certbot certonly --webroot`.
5. HTTPS-конфиг, проверка сайта.

Перед каждым пересозданием reverse proxy скрипт запоминает HTTP-коды всех доменов, которые он
уже обслуживает; после — `nginx -t` и сверка кодов. При расхождении прежняя конфигурация
возвращается автоматически.

Продление сертификата — штатным `certbot renew` reverse proxy.
