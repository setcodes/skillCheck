#!/usr/bin/env bash
# Запуск деплоя с машины разработчика: читает deploy/deploy.env (не коммитится),
# подключается по SSH и выполняет на сервере deploy/vps-install.sh.
#   ./deploy/deploy.sh                       # ветка из BRANCH в deploy.env (или main)
#   ./deploy/deploy.sh feature/some-branch   # другая ветка
set -euo pipefail
cd "$(dirname "$0")"
[ -f deploy.env ] || { echo "Нет deploy/deploy.env — скопируйте deploy.env.example и заполните." >&2; exit 1; }
set -a
# shellcheck disable=SC1091
. ./deploy.env
set +a
: "${SSH_TARGET:?задайте SSH_TARGET в deploy.env}"
# shellcheck disable=SC2034 # передаётся на сервер через ${!v}
[ $# -ge 1 ] && BRANCH="$1"

ssh_args=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=20)
[ -n "${SSH_KEY:-}" ] && ssh_args+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
[ -n "${SSH_KNOWN_HOSTS:-}" ] && ssh_args+=(-o "UserKnownHostsFile=$SSH_KNOWN_HOSTS")

remote_env=""
for v in DOMAIN EDGE_DIR EDGE_PROJECT EDGE_NETWORK BRANCH REPO APP_DIR EMAIL EDGE_SERVICE CERTBOT_SERVICE CERTBOT_PROFILE WEBROOT CERTS; do
  [ -n "${!v:-}" ] && remote_env+="$v=$(printf '%q' "${!v}") "
done

exec ssh "${ssh_args[@]}" "$SSH_TARGET" "env ${remote_env}bash -s" < vps-install.sh
