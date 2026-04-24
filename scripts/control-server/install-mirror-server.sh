#!/usr/bin/env bash
# =============================================================
# Nexus Control Center — Mirror Server Installer
# =============================================================
# يثبّت سيرفر المرايا (Git mirrors + Control API) على VPS جديد.
# يعمل على Debian / Ubuntu.
#
# الاستخدام:
#   sudo bash install-mirror-server.sh
#
# لن يُستضاف أي دومين عام — هذا السيرفر للمرايا والتحكم فقط.
# =============================================================

set -euo pipefail

log() { echo -e "\n\033[1;36m▶ $*\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $*\033[0m"; }

if [[ $EUID -ne 0 ]]; then
  echo "يجب التشغيل بصلاحيات root (sudo)."; exit 1
fi

log "تحديث النظام"
apt-get update -y
apt-get upgrade -y

log "تثبيت الحزم الأساسية"
apt-get install -y curl git ufw build-essential ca-certificates gnupg

log "تثبيت Node.js LTS (20.x)"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
ok "Node: $(node -v) | npm: $(npm -v)"

log "إنشاء مستخدم خدمة nexus"
if ! id nexus >/dev/null 2>&1; then
  useradd -m -s /bin/bash nexus
fi

log "إنشاء بنية المجلدات"
mkdir -p /srv/mirrors
mkdir -p /srv/control-api
mkdir -p /var/log/control-api
chown -R nexus:nexus /srv/mirrors /srv/control-api /var/log/control-api

log "نسخ ملفات Control API"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/control-api.js"      /srv/control-api/control-api.js
cp "$SCRIPT_DIR/sync-site.sh"        /srv/control-api/sync-site.sh
cp "$SCRIPT_DIR/package.json"        /srv/control-api/package.json
chown -R nexus:nexus /srv/control-api
chmod +x /srv/control-api/sync-site.sh

log "تثبيت اعتماديات Control API"
sudo -u nexus -H bash -c 'cd /srv/control-api && npm install --omit=dev'

log "إعداد متغيرات البيئة"
if [[ ! -f /srv/control-api/.env ]]; then
  TOKEN="$(openssl rand -hex 32)"
  cat > /srv/control-api/.env <<EOF
CONTROL_API_TOKEN=$TOKEN
PORT=8787
MIRRORS_ROOT=/srv/mirrors
EOF
  chown nexus:nexus /srv/control-api/.env
  chmod 600 /srv/control-api/.env
  ok "تم توليد CONTROL_API_TOKEN — انسخه واحفظه:"
  echo
  echo "    $TOKEN"
  echo
  echo "أضِفه كسر (secret) باسم CONTROL_API_TOKEN في إعدادات Lovable Cloud."
else
  ok ".env موجود مسبقاً — لم يُلمس."
fi

log "تثبيت خدمة systemd"
cp "$SCRIPT_DIR/systemd/control-api.service" /etc/systemd/system/control-api.service
systemctl daemon-reload
systemctl enable control-api.service
systemctl restart control-api.service
sleep 2
systemctl --no-pager status control-api.service | head -n 20 || true

log "إعداد جدار الحماية (UFW)"
ufw allow OpenSSH || true
# نتركه داخلياً افتراضياً — لا نفتح المنفذ العام.
# لو أردت الوصول العام: ufw allow 8787/tcp
ufw --force enable || true

ok "تم التثبيت!"
echo
echo "للتحقق: curl -H 'Authorization: Bearer \$TOKEN' http://localhost:8787/health"
echo "السجلات: journalctl -u control-api -f"