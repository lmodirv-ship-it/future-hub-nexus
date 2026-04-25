#!/usr/bin/env bash
###############################################################################
# HN-Dev — Self-Hosting Installer (All-in-One)
# -----------------------------------------------------------------------------
# يثبّت على سيرفر Ubuntu 22.04/24.04 نظيف:
#   1. Docker + Docker Compose
#   2. Supabase Self-Hosted (DB + Auth + Storage + Studio)
#   3. Node.js 20 + Bun + PM2
#   4. Nginx + Certbot (SSL مجاني)
#   5. التطبيق نفسه (build + serve)
#
# الاستعمال (على السيرفر بصلاحية root):
#   bash install-all.sh <DOMAIN> <EMAIL>
# مثال:
#   bash install-all.sh slavacall-hiba.online admin@hn-groupe.com
###############################################################################
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <email>}"
EMAIL="${2:?Usage: $0 <domain> <email>}"
APP_DIR="/srv/hn-dev"
SUPA_DIR="/srv/supabase"
REPO_URL="${REPO_URL:-https://github.com/CHANGE_ME/hn-dev.git}"   # ← غيّره
REPO_BRANCH="${REPO_BRANCH:-main}"

log()  { echo -e "\n\033[1;36m▶ $*\033[0m"; }
ok()   { echo -e "\033[1;32m✓ $*\033[0m"; }
fail() { echo -e "\033[1;31m✗ $*\033[0m" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail "شغّل السكريبت كـ root (أو عبر sudo)."

###############################################################################
log "1/7 — تحديث النظام وتثبيت الحزم الأساسية"
###############################################################################
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git ufw ca-certificates gnupg lsb-release \
  software-properties-common openssl jq unzip

###############################################################################
log "2/7 — إعداد الجدار الناري (UFW)"
###############################################################################
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "UFW مفعّل (22, 80, 443)."

###############################################################################
log "3/7 — تثبيت Docker + Compose"
###############################################################################
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

###############################################################################
log "4/7 — تثبيت Node.js 20 + Bun + PM2"
###############################################################################
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1)" != "v20" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v bun &>/dev/null || curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
npm install -g pm2 >/dev/null 2>&1 || true
ok "Node $(node -v) | Bun $(bun -v 2>/dev/null || echo n/a) | PM2 $(pm2 -v)"

###############################################################################
log "5/7 — تثبيت Supabase Self-Hosted"
###############################################################################
if [[ ! -d "$SUPA_DIR" ]]; then
  git clone --depth 1 https://github.com/supabase/supabase "$SUPA_DIR-src"
  mkdir -p "$SUPA_DIR"
  cp -rf "$SUPA_DIR-src/docker/." "$SUPA_DIR/"
  rm -rf "$SUPA_DIR-src"
  cp "$SUPA_DIR/.env.example" "$SUPA_DIR/.env"

  # توليد أسرار قوية
  PG_PASS=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  ANON_KEY=$(openssl rand -hex 32)
  SERVICE_KEY=$(openssl rand -hex 32)
  DASH_PASS=$(openssl rand -hex 12)

  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$PG_PASS|"   "$SUPA_DIR/.env"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|"              "$SUPA_DIR/.env"
  sed -i "s|^ANON_KEY=.*|ANON_KEY=$ANON_KEY|"                    "$SUPA_DIR/.env"
  sed -i "s|^SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_KEY|" "$SUPA_DIR/.env"
  sed -i "s|^DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=$DASH_PASS|" "$SUPA_DIR/.env"
  sed -i "s|^SITE_URL=.*|SITE_URL=https://$DOMAIN|"              "$SUPA_DIR/.env"
  sed -i "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://api.$DOMAIN|" "$SUPA_DIR/.env"

  cat > "$SUPA_DIR/SECRETS.txt" <<EOF
# 🔐 احفظ هذا الملف في مكان آمن ثم احذفه من السيرفر
POSTGRES_PASSWORD=$PG_PASS
JWT_SECRET=$JWT_SECRET
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_KEY
DASHBOARD_PASSWORD=$DASH_PASS
EOF
  chmod 600 "$SUPA_DIR/SECRETS.txt"
fi

cd "$SUPA_DIR"
docker compose pull
docker compose up -d
ok "Supabase يعمل على المنافذ الداخلية (Kong: 8000, Studio: 3000)."

###############################################################################
log "6/7 — Clone + Build التطبيق"
###############################################################################
if [[ ! -d "$APP_DIR" ]]; then
  git clone --depth 1 -b "$REPO_BRANCH" "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# إنشاء .env للتطبيق
ANON_KEY=$(grep '^ANON_KEY=' "$SUPA_DIR/.env" | cut -d= -f2)
SERVICE_KEY=$(grep '^SERVICE_ROLE_KEY=' "$SUPA_DIR/.env" | cut -d= -f2)
cat > "$APP_DIR/.env" <<EOF
VITE_SUPABASE_URL=https://api.$DOMAIN
VITE_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
SUPABASE_URL=https://api.$DOMAIN
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
EOF

~/.bun/bin/bun install
~/.bun/bin/bun run build

# تشغيل عبر PM2
pm2 delete hn-dev 2>/dev/null || true
pm2 start "bun run start" --name hn-dev --cwd "$APP_DIR"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true
ok "التطبيق يعمل على http://127.0.0.1:3000"

###############################################################################
log "7/7 — Nginx + SSL (Let's Encrypt)"
###############################################################################
apt-get install -y nginx certbot python3-certbot-nginx

cat > /etc/nginx/sites-available/hn-dev <<NGINX
# التطبيق الرئيسي
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
# Supabase API
server {
  listen 80;
  server_name api.$DOMAIN;
  client_max_body_size 50M;
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX

ln -sf /etc/nginx/sites-available/hn-dev /etc/nginx/sites-enabled/hn-dev
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

certbot --nginx --non-interactive --agree-tos -m "$EMAIL" \
  -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" --redirect || \
  echo "⚠️  فشل SSL — تأكد أن DNS يشير إلى هذا السيرفر ثم أعد: certbot --nginx"

###############################################################################
ok "🎉 اكتمل التثبيت!"
###############################################################################
cat <<DONE

──────────────────────────────────────────────────────────────
  التطبيق:        https://$DOMAIN
  Supabase API:   https://api.$DOMAIN
  Studio (لوحة):  http://$(hostname -I | awk '{print $1}'):8000
                  user: supabase  pass: (في $SUPA_DIR/SECRETS.txt)

  الأسرار محفوظة في: $SUPA_DIR/SECRETS.txt  ← انسخها واحذفها!

  📌 الخطوات التالية:
     1. وجّه DNS التالية إلى IP السيرفر:
        A   @     → IP
        A   www   → IP
        A   api   → IP
     2. صدّر بيانات Lovable Cloud الحالية:
        Cloud → Database → Tables → Export
        ثم استورد SQL في: psql -h localhost -U postgres -d postgres
     3. أعد بناء التطبيق بعد أي تحديث:
        cd $APP_DIR && git pull && bun install && bun run build && pm2 restart hn-dev
──────────────────────────────────────────────────────────────
DONE