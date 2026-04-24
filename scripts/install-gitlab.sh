#!/usr/bin/env bash
# ============================================================
# GitLab CE Installation Script for Ubuntu 24.04 LTS
# Target: gitlab.slavacall-hiba.online
# Server: 4 vCPU / 8GB RAM / 150GB SSD (LWS)
# ============================================================
set -euo pipefail

GITLAB_DOMAIN="gitlab.slavacall-hiba.online"
EXTERNAL_URL="http://${GITLAB_DOMAIN}"   # SSL يُفعَّل لاحقاً عبر setup-gitlab-ssl.sh

log() { echo -e "\n\033[1;36m>> $*\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $*\033[0m"; }
err() { echo -e "\033[1;31m✗ $*\033[0m" >&2; }

if [ "$EUID" -ne 0 ]; then
  err "يجب تشغيل هذا السكريبت بصلاحيات root (sudo bash install-gitlab.sh)"
  exit 1
fi

log "1/7 — تحديث النظام (Ubuntu 24.04)"
apt-get update -y
apt-get upgrade -y
ok "تم تحديث النظام"

log "2/7 — تثبيت Dependencies المطلوبة لـ GitLab"
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl openssh-server ca-certificates tzdata perl \
  debian-archive-keyring apt-transport-https
ok "تم تثبيت dependencies الأساسية"

log "3/7 — تثبيت Postfix لإرسال إيميلات GitLab"
debconf-set-selections <<< "postfix postfix/mailname string ${GITLAB_DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
DEBIAN_FRONTEND=noninteractive apt-get install -y postfix
ok "تم تثبيت Postfix"

log "4/7 — إعداد UFW Firewall (يفتح فقط 22, 80, 443)"
if ! command -v ufw >/dev/null 2>&1; then
  apt-get install -y ufw
fi
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Let'"'"'s Encrypt)'
ufw allow 443/tcp comment 'HTTPS (GitLab)'
ufw --force enable
ufw status verbose
ok "Firewall مُعَدّ بأمان"

log "5/7 — إضافة GitLab Omnibus Repository الرسمي"
curl -fsSL https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | bash
ok "تمت إضافة GitLab repository"

log "6/7 — تثبيت GitLab CE (قد يستغرق 5-10 دقائق)"
EXTERNAL_URL="${EXTERNAL_URL}" apt-get install -y gitlab-ce
ok "تم تثبيت GitLab CE"

log "7/7 — التكوين الأولي وتشغيل GitLab"
# external_url مُعَدّ مسبقاً عبر env var أعلاه. تأكيد إضافي في gitlab.rb:
sed -i "s|^external_url.*|external_url '${EXTERNAL_URL}'|g" /etc/gitlab/gitlab.rb || \
  echo "external_url '${EXTERNAL_URL}'" >> /etc/gitlab/gitlab.rb

gitlab-ctl reconfigure
ok "GitLab يعمل الآن"

echo ""
echo "================================================================"
ok "تم تثبيت GitLab CE بنجاح! 🎉"
echo "================================================================"
echo ""
echo "🌐 العنوان المؤقت: ${EXTERNAL_URL}"
echo "👤 المستخدم الأولي: root"
echo ""
echo "🔑 كلمة المرور الأولية (احفظها فوراً):"
echo "   تم تخزينها في: /etc/gitlab/initial_root_password"
echo "   عرضها الآن:"
echo ""
if [ -f /etc/gitlab/initial_root_password ]; then
  grep "^Password:" /etc/gitlab/initial_root_password || cat /etc/gitlab/initial_root_password
fi
echo ""
echo "⚠️  هذه الكلمة ستُحذف تلقائياً بعد 24 ساعة!"
echo ""
echo "📋 الخطوات التالية:"
echo "   1. سجّل دخول على ${EXTERNAL_URL} بـ root + الكلمة أعلاه"
echo "   2. غيّر كلمة root فوراً (User Settings → Password)"
echo "   3. شغّل: sudo bash setup-gitlab-ssl.sh   (لتفعيل HTTPS)"
echo "   4. شغّل: sudo bash secure-gitlab.sh      (لتأمين GitLab)"
echo "================================================================"