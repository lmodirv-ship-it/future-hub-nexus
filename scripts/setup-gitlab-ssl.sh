#!/usr/bin/env bash
# ============================================================
# تفعيل HTTPS لـ GitLab CE عبر Let's Encrypt المدمج
# يُشغَّل بعد install-gitlab.sh والتأكد من DNS
# ============================================================
set -euo pipefail

GITLAB_DOMAIN="gitlab.slavacall-hiba.online"
ADMIN_EMAIL=""   # سيُطلب من المستخدم إن لم يُحدَّد

log() { echo -e "\n\033[1;36m>> $*\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $*\033[0m"; }
err() { echo -e "\033[1;31m✗ $*\033[0m" >&2; }

if [ "$EUID" -ne 0 ]; then
  err "يجب تشغيل بصلاحيات root"
  exit 1
fi

log "1/4 — التحقق من DNS"
RESOLVED_IP="$(getent hosts "${GITLAB_DOMAIN}" | awk '{print $1}' | head -n1 || true)"
SERVER_IP="$(curl -s4 ifconfig.me || curl -s4 ipinfo.io/ip || echo 'unknown')"

if [ -z "${RESOLVED_IP}" ]; then
  err "DNS لـ ${GITLAB_DOMAIN} غير مُعَدّ بعد!"
  echo "   أضف A Record: gitlab → ${SERVER_IP}"
  echo "   ثم انتظر انتشار DNS (5-30 دقيقة) وأعد المحاولة."
  exit 1
fi

if [ "${RESOLVED_IP}" != "${SERVER_IP}" ] && [ "${SERVER_IP}" != "unknown" ]; then
  err "DNS يشير لـ ${RESOLVED_IP} بينما IP السيرفر هو ${SERVER_IP}"
  echo "   تأكد من تحديث A Record وانتظر انتشار DNS."
  read -rp "هل تريد المتابعة رغم ذلك؟ (yes/no): " CONFIRM
  [ "${CONFIRM}" = "yes" ] || exit 1
fi
ok "DNS صحيح: ${GITLAB_DOMAIN} → ${RESOLVED_IP}"

log "2/4 — طلب بريد المسؤول لـ Let's Encrypt"
if [ -z "${ADMIN_EMAIL}" ]; then
  read -rp "📧 أدخل بريداً صالحاً للإشعارات (مثل: admin@slavacall-hiba.online): " ADMIN_EMAIL
fi
if [[ ! "${ADMIN_EMAIL}" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; then
  err "البريد غير صالح"
  exit 1
fi
ok "البريد: ${ADMIN_EMAIL}"

log "3/4 — تفعيل HTTPS + Let's Encrypt في /etc/gitlab/gitlab.rb"
# تحديث external_url إلى https
sed -i "s|^external_url.*|external_url 'https://${GITLAB_DOMAIN}'|g" /etc/gitlab/gitlab.rb

# تفعيل Let's Encrypt
if grep -q "^# letsencrypt\['enable'\]" /etc/gitlab/gitlab.rb; then
  sed -i "s|^# letsencrypt\['enable'\].*|letsencrypt['enable'] = true|g" /etc/gitlab/gitlab.rb
elif ! grep -q "^letsencrypt\['enable'\]" /etc/gitlab/gitlab.rb; then
  echo "letsencrypt['enable'] = true" >> /etc/gitlab/gitlab.rb
fi

# بريد المسؤول
if grep -q "^# letsencrypt\['contact_emails'\]" /etc/gitlab/gitlab.rb; then
  sed -i "s|^# letsencrypt\['contact_emails'\].*|letsencrypt['contact_emails'] = ['${ADMIN_EMAIL}']|g" /etc/gitlab/gitlab.rb
elif ! grep -q "^letsencrypt\['contact_emails'\]" /etc/gitlab/gitlab.rb; then
  echo "letsencrypt['contact_emails'] = ['${ADMIN_EMAIL}']" >> /etc/gitlab/gitlab.rb
fi

# تجديد تلقائي شهري (يوم 1، الساعة 4 صباحاً)
if grep -q "^# letsencrypt\['auto_renew'\]" /etc/gitlab/gitlab.rb; then
  sed -i "s|^# letsencrypt\['auto_renew'\].*|letsencrypt['auto_renew'] = true|g" /etc/gitlab/gitlab.rb
elif ! grep -q "^letsencrypt\['auto_renew'\]" /etc/gitlab/gitlab.rb; then
  cat >> /etc/gitlab/gitlab.rb << 'EOF'

# Let's Encrypt تجديد تلقائي شهرياً
letsencrypt['auto_renew'] = true
letsencrypt['auto_renew_hour'] = 4
letsencrypt['auto_renew_minute'] = 30
letsencrypt['auto_renew_day_of_month'] = "*/30"
EOF
fi
ok "تم تكوين HTTPS"

log "4/4 — تطبيق التغييرات (gitlab-ctl reconfigure)"
gitlab-ctl reconfigure
ok "GitLab الآن يعمل بـ HTTPS"

echo ""
echo "================================================================"
ok "تم تفعيل HTTPS بنجاح! 🔒"
echo "================================================================"
echo "🌐 GitLab الآن على: https://${GITLAB_DOMAIN}"
echo "🔄 الشهادة تتجدد تلقائياً كل 30 يوم"
echo "📋 الخطوة التالية: sudo bash secure-gitlab.sh"
echo "================================================================"