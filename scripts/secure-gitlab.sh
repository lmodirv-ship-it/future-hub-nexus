#!/usr/bin/env bash
# ============================================================
# تأمين GitLab CE — تعطيل التسجيل العام + إعدادات أمان
# يُشغَّل بعد setup-gitlab-ssl.sh
# ============================================================
set -euo pipefail

log() { echo -e "\n\033[1;36m>> $*\033[0m"; }
ok()  { echo -e "\033[1;32m✓ $*\033[0m"; }

if [ "$EUID" -ne 0 ]; then
  echo "يجب تشغيل بصلاحيات root" >&2; exit 1
fi

log "1/3 — تطبيق إعدادات الأمان في /etc/gitlab/gitlab.rb"

# تعطيل التسجيل العام
if grep -q "^# gitlab_rails\['gitlab_signup_enabled'\]" /etc/gitlab/gitlab.rb; then
  sed -i "s|^# gitlab_rails\['gitlab_signup_enabled'\].*|gitlab_rails['gitlab_signup_enabled'] = false|g" /etc/gitlab/gitlab.rb
elif ! grep -q "^gitlab_rails\['gitlab_signup_enabled'\]" /etc/gitlab/gitlab.rb; then
  echo "gitlab_rails['gitlab_signup_enabled'] = false" >> /etc/gitlab/gitlab.rb
fi

# session timeout (8 ساعات بدل أسبوعين)
if ! grep -q "^gitlab_rails\['session_expire_delay'\]" /etc/gitlab/gitlab.rb; then
  echo "gitlab_rails['session_expire_delay'] = 480" >> /etc/gitlab/gitlab.rb
fi

# منع تخمين كلمات المرور (rate limiting)
if ! grep -q "^# Rate limiting" /etc/gitlab/gitlab.rb; then
  cat >> /etc/gitlab/gitlab.rb << 'EOF'

# Rate limiting لحماية من brute-force
gitlab_rails['rack_attack_git_basic_auth'] = {
  'enabled' => true,
  'ip_whitelist' => ["127.0.0.1"],
  'maxretry' => 10,
  'findtime' => 60,
  'bantime' => 3600
}
EOF
fi
ok "إعدادات الأمان مُطبَّقة"

log "2/3 — تطبيق التغييرات"
gitlab-ctl reconfigure
ok "GitLab أُعيد تكوينه"

log "3/3 — التحقق من حالة الخدمات"
gitlab-ctl status

echo ""
echo "================================================================"
ok "تم تأمين GitLab بنجاح! 🛡️"
echo "================================================================"
echo "✅ التسجيل العام: معطل (admin يضيف المستخدمين يدوياً)"
echo "✅ Session timeout: 8 ساعات"
echo "✅ Rate limiting: مفعّل (10 محاولات/دقيقة)"
echo ""
echo "💡 توصيات إضافية يدوية في GitLab UI:"
echo "   • Admin Area → Settings → Sign-in restrictions → فعّل 2FA"
echo "   • User Settings → Account → Two-Factor Authentication"
echo "   • Admin Area → Users → احذف 'ghost' إن أردت"
echo "================================================================"