#!/usr/bin/env bash
# Деплой SkillCheck на сервер за существующим reverse proxy (Nginx + Certbot в Docker Compose).
# Выполняется на сервере. Обычно его запускает deploy/deploy.sh с машины разработчика:
# все значения — домен, сервер, пути — живут в deploy/deploy.env, который не коммитится.
#
# Обязательные переменные:
#   DOMAIN         — домен сайта (A-запись уже указывает на сервер)
#   EDGE_DIR       — каталог compose-проекта reverse proxy на сервере
#   EDGE_PROJECT   — имя этого compose-проекта
#   EDGE_NETWORK   — внешняя Docker-сеть, в которой reverse proxy видит приложения
# Необязательные (значения по умолчанию в скобках):
#   BRANCH (main), REPO (адрес origin), EMAIL (пусто),
#   APP_DIR (/opt/skillcheck, если он есть и доступен на запись, иначе ~/skillcheck — sudo не нужен),
#   EDGE_SERVICE (nginx), CERTBOT_SERVICE (certbot), CERTBOT_PROFILE (operations),
#   WEBROOT (/var/www/certbot), CERTS (/etc/letsencrypt)
#
# Что делает (повторный запуск безопасен и обновляет сайт):
#   1. проверки окружения и DNS;
#   2. клонирует/обновляет код и поднимает контейнер приложения;
#   3. если сертификата нет — включает HTTP-конфиг, выпускает сертификат;
#   4. включает HTTPS-конфиг.
# Перед каждым пересозданием reverse proxy запоминаются HTTP-коды всех уже обслуживаемых
# доменов; после — nginx -t и сверка кодов. При расхождении конфигурация откатывается.
set -Eeuo pipefail

: "${DOMAIN:?задайте DOMAIN}" "${EDGE_DIR:?задайте EDGE_DIR}" "${EDGE_PROJECT:?задайте EDGE_PROJECT}" "${EDGE_NETWORK:?задайте EDGE_NETWORK}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-https://github.com/setcodes/skillCheck.git}"
if [ -z "${APP_DIR:-}" ]; then
  if [ -w /opt/skillcheck ]; then APP_DIR=/opt/skillcheck; else APP_DIR="$HOME/skillcheck"; fi
fi
EMAIL="${EMAIL:-}"
EDGE_SERVICE="${EDGE_SERVICE:-nginx}"
CERTBOT_SERVICE="${CERTBOT_SERVICE:-certbot}"
CERTBOT_PROFILE="${CERTBOT_PROFILE:-operations}"
WEBROOT="${WEBROOT:-/var/www/certbot}"
CERTS="${CERTS:-/etc/letsencrypt}"
UPSTREAM="skillcheck-web:8080"
RENDERED="$APP_DIR/deploy/edge/rendered"
export EDGE_NETWORK

step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die() { printf '\n\033[1;31mОшибка: %s\033[0m\n' "$*" >&2; exit 1; }

case "$DOMAIN" in *[!A-Za-z0-9.-]* | "" | .* | *.) die "некорректный DOMAIN" ;; esac

# ---------- 1. Проверки ----------
step "Проверки окружения"
docker info >/dev/null 2>&1 || die "нет доступа к Docker (пользователь $(id -un) должен быть в группе docker)"
docker compose version >/dev/null 2>&1 || die "нужен Docker Compose v2"
command -v git >/dev/null || die "нужен git"
command -v curl >/dev/null || die "нужен curl"
docker network inspect "$EDGE_NETWORK" >/dev/null 2>&1 || die "нет Docker-сети $EDGE_NETWORK"

edge_container() {
  docker ps -q --filter "label=com.docker.compose.project=$EDGE_PROJECT" \
    --filter "label=com.docker.compose.service=$EDGE_SERVICE" | head -n1
}
EDGE_ID="$(edge_container)"
[ -n "$EDGE_ID" ] || die "reverse proxy ($EDGE_PROJECT/$EDGE_SERVICE) не запущен"

# Набор compose-файлов и env-файл, с которыми reverse proxy запущен сейчас
IFS=',' read -r -a CURRENT_FILES <<<"$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.config_files"}}' "$EDGE_ID")"
IFS=',' read -r -a ENV_FILES <<<"$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.environment_file"}}' "$EDGE_ID" 2>/dev/null || true)"
[ "${#ENV_FILES[@]}" -gt 0 ] && [ -n "${ENV_FILES[0]}" ] || ENV_FILES=("$EDGE_DIR/.env")
ENV_ARGS=()
for f in "${ENV_FILES[@]}"; do ENV_ARGS+=(--env-file "$f"); done
BASE_FILES=()
for f in "${CURRENT_FILES[@]}"; do
  case "$f" in "$RENDERED"/*) ;; *) BASE_FILES+=("$f") ;; esac
done
[ "${#BASE_FILES[@]}" -gt 0 ] || die "не удалось прочитать конфигурацию reverse proxy"

server_ip="$(curl -4 -fsS --max-time 10 https://api.ipify.org || true)"
dns_ip="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')"
[ -n "$dns_ip" ] || die "$DOMAIN не резолвится"
if [ -n "$server_ip" ] && [ "$dns_ip" != "$server_ip" ]; then
  die "$DOMAIN указывает не на этот сервер"
fi
info "DNS указывает на этот сервер"

avail_kb="$(df -Pk / | awk 'NR==2{print $4}')"
[ "$avail_kb" -gt $((2 * 1024 * 1024)) ] || die "на диске меньше 2 ГБ свободно"

# ---------- 2. Приложение ----------
step "Код ($BRANCH) → $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --quiet origin "$BRANCH"
  git -C "$APP_DIR" checkout --quiet -B "$BRANCH" "origin/$BRANCH"
else
  mkdir -p "$APP_DIR" 2>/dev/null || die "нет прав создать $APP_DIR — уберите APP_DIR из deploy.env (будет ~/skillcheck) или создайте каталог: sudo mkdir -p $APP_DIR && sudo chown $(id -un) $APP_DIR"
  git clone --quiet --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
info "коммит $(git -C "$APP_DIR" log -1 --format='%h %s')"

step "Сборка и запуск контейнера (внутри npm run check — несколько минут)"
docker compose -f "$APP_DIR/deploy/docker-compose.yml" up -d --build
for i in $(seq 1 30); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' skillcheck-web-1 2>/dev/null || true)" = healthy ] && break
  [ "$i" = 30 ] && die "контейнер не стал healthy: docker logs skillcheck-web-1"
  sleep 2
done
info "контейнер healthy"

# ---------- Рендер конфигов reverse proxy (вне git: deploy/edge/rendered) ----------
mkdir -p "$RENDERED"
render() { # шаблон → готовый .conf и оверлей compose, который монтирует его в conf.d
  local name="$1"
  sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__WEBROOT__|$WEBROOT|g" -e "s|__CERTS__|$CERTS|g" -e "s|__UPSTREAM__|$UPSTREAM|g" \
    "$APP_DIR/deploy/edge/$name.conf.in" >"$RENDERED/$name.conf"
  printf 'services:\n  %s:\n    volumes:\n      - %s:/etc/nginx/conf.d/zz-skillcheck.conf:ro\n' \
    "$EDGE_SERVICE" "$RENDERED/$name.conf" >"$RENDERED/$name.compose.yml"
}
render site-acme
render site

compose_edge() { # compose-файлы... -- команда
  local args=() f
  while [ "$1" != -- ]; do args+=(-f "$1"); shift; done
  shift
  (cd "$EDGE_DIR" && docker compose -p "$EDGE_PROJECT" "${ENV_ARGS[@]}" "${args[@]}" "$@")
}

# Домены, которые reverse proxy уже обслуживает, и их текущие HTTP-коды
neighbour_hosts() {
  docker exec "$(edge_container)" nginx -T 2>/dev/null \
    | awk '$1=="server_name"{for(i=2;i<=NF;i++){gsub(";","",$i); print $i}}' \
    | grep -E '^[A-Za-z0-9.-]+\.[A-Za-z]+$' | grep -vx "$DOMAIN" | sort -u
}
http_code() { # host
  curl -s -o /dev/null -w '%{http_code}' --max-time 15 --resolve "$1:443:127.0.0.1" "https://$1/" || true
}
declare -A BEFORE=()
snapshot() {
  local h
  BEFORE=()
  for h in $(neighbour_hosts); do BEFORE[$h]="$(http_code "$h")"; done
  info "соседних доменов: ${#BEFORE[@]}"
}
neighbours_same() {
  local h now i
  for h in "${!BEFORE[@]}"; do
    [ "${BEFORE[$h]}" = 000 ] && continue
    for i in 1 2 3 4 5; do
      now="$(http_code "$h")"
      [ "$now" = "${BEFORE[$h]}" ] && break
      sleep 2
    done
    [ "$now" = "${BEFORE[$h]}" ] || { echo "    сосед изменил ответ: ${BEFORE[$h]} → $now" >&2; return 1; }
  done
}

edge_apply() { # описание оверлей [доп. проверка]
  local label="$1" overlay="$2" extra="${3:-}"
  step "Reverse proxy: $label"
  snapshot
  if compose_edge "${BASE_FILES[@]}" "$overlay" -- up -d --force-recreate --no-deps "$EDGE_SERVICE" \
    && sleep 2 \
    && docker exec "$(edge_container)" nginx -t \
    && neighbours_same \
    && { [ -z "$extra" ] || "$extra"; }; then
    info "готово, соседние домены отвечают как раньше"
    return 0
  fi
  printf '\n\033[1;33m    проверка не прошла — возвращаю прежнюю конфигурацию\033[0m\n' >&2
  compose_edge "${CURRENT_FILES[@]}" -- up -d --force-recreate --no-deps "$EDGE_SERVICE" || true
  if neighbours_same; then info "откат выполнен"; else info "ВНИМАНИЕ: после отката проверьте соседние сайты вручную"; fi
  die "$label — не удалось"
}

certbot_run() {
  compose_edge "${BASE_FILES[@]}" -- --profile "$CERTBOT_PROFILE" run --rm --pull never "$@"
}

have_cert() { docker exec "$(edge_container)" test -f "$CERTS/live/$DOMAIN/fullchain.pem"; }

acme_ok() {
  local token got
  token="acme-check-$(date +%s)-$$"
  certbot_run --entrypoint sh "$CERTBOT_SERVICE" -ceu \
    "mkdir -p $WEBROOT/.well-known/acme-challenge && printf '%s' '$token' > $WEBROOT/.well-known/acme-challenge/$token" >/dev/null
  got="$(curl -fsS --max-time 15 --resolve "$DOMAIN:80:127.0.0.1" "http://$DOMAIN/.well-known/acme-challenge/$token" || true)"
  certbot_run --entrypoint sh "$CERTBOT_SERVICE" -ceu "rm -f $WEBROOT/.well-known/acme-challenge/$token" >/dev/null || true
  [ "$got" = "$token" ]
}

site_ok() {
  local code i
  for i in 1 2 3 4 5; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/theory")"
    [ "$code" = 200 ] && return 0
    sleep 2
  done
  echo "    сайт отвечает $code" >&2
  return 1
}

# ---------- 3. Сертификат ----------
if have_cert; then
  step "Сертификат уже есть — выпуск пропускаю"
else
  edge_apply "HTTP-конфиг для выпуска сертификата" "$RENDERED/site-acme.compose.yml" acme_ok
  step "Выпуск сертификата Let's Encrypt"
  certbot_args=(certonly --webroot --webroot-path "$WEBROOT" --non-interactive --agree-tos --cert-name "$DOMAIN" -d "$DOMAIN")
  if [ -n "$EMAIL" ]; then certbot_args+=(--email "$EMAIL"); fi
  certbot_run "$CERTBOT_SERVICE" "${certbot_args[@]}"
fi

# ---------- 4. HTTPS ----------
edge_apply "HTTPS-конфиг сайта" "$RENDERED/site.compose.yml" site_ok

step "Готово: https://$DOMAIN"
info "обновление — повторный запуск: код подтянется, контейнер пересоберётся"
