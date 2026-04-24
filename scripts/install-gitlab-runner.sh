#!/usr/bin/env bash
# ============================================================
# تثبيت GitLab Runner مع Docker executor
# للاستخدام المستقبلي عند تفعيل GitLab CI/CD
# ============================================================
set -euo pipefail

log() { echo -e "\n\033[1;36m>> $*\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $*\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  echo "يجب تشغيل بصلاحيات root" >&2; exit 1
fi

log "1/4 — التحقق من Docker"
if ! command -v docker >/dev/null 2>&1; then
  log "تثبيت Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi
ok "Docker جاهز"

log "2/4 — إضافة GitLab Runner repository"
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | bash
ok "Repository مُضاف"

log "3/4 — تثبيت GitLab Runner"
apt-get install -y gitlab-runner
usermod -aG docker gitlab-runner
ok "Runner مُثبَّت"

log "4/4 — تشغيل Runner"
systemctl enable --now gitlab-runner
systemctl status gitlab-runner --no-pager

echo ""
echo "================================================================"
ok "تم تثبيت GitLab Runner! 🏃"
echo "================================================================"
echo ""
echo "📋 لتسجيل Runner مع مشروع نكسس:"
echo ""
echo "   1. اذهب إلى: https://gitlab.slavacall-hiba.online/<user>/future-hub-nexus"
echo "   2. Settings → CI/CD → Runners → Expand"
echo "   3. انسخ 'registration token'"
echo ""
echo "   4. شغّل على هذا السيرفر:"
echo ""
echo "      sudo gitlab-runner register \\"
echo "        --url https://gitlab.slavacall-hiba.online \\"
echo "        --token <REGISTRATION_TOKEN> \\"
echo "        --executor docker \\"
echo "        --docker-image alpine:latest \\"
echo "        --description 'lws-runner' \\"
echo "        --non-interactive"
echo ""
echo "💡 ملاحظة: لن نحتاج Runner الآن — هو للاستخدام المستقبلي"
echo "   عند الانتقال من GitHub Actions إلى GitLab CI/CD."
echo "================================================================"