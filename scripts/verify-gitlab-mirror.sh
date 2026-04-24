#!/usr/bin/env bash
# ============================================================
# تحقق من تطابق آخر commit بين GitHub و GitLab
# يُشغَّل من أي مكان (محلياً أو على السيرفر)
# ============================================================
set -euo pipefail

GITHUB_REPO="lmodirv-ship-it/future-hub-nexus"
GITLAB_HOST="gitlab.slavacall-hiba.online"
GITLAB_PROJECT_PATH="${1:-}"   # مثل "youruser/future-hub-nexus"
GITLAB_TOKEN="${GITLAB_TOKEN:-}"

if [ -z "${GITLAB_PROJECT_PATH}" ]; then
  cat << EOF
الاستخدام:
  GITLAB_TOKEN=glpat-xxx bash verify-gitlab-mirror.sh <user>/<project>

مثال:
  GITLAB_TOKEN=glpat-abc123 bash verify-gitlab-mirror.sh youruser/future-hub-nexus
EOF
  exit 1
fi

echo "🔍 التحقق من Mirror..."
echo "   GitHub:  ${GITHUB_REPO}"
echo "   GitLab:  ${GITLAB_HOST}/${GITLAB_PROJECT_PATH}"
echo ""

# آخر commit على GitHub (main)
GH_SHA="$(curl -fsSL "https://api.github.com/repos/${GITHUB_REPO}/commits/main" | grep -oP '(?<="sha": ")[a-f0-9]{40}' | head -n1)"
echo "📦 GitHub HEAD:  ${GH_SHA:0:12}"

# آخر commit على GitLab (main)
ENCODED_PATH="$(echo "${GITLAB_PROJECT_PATH}" | sed 's|/|%2F|g')"
if [ -n "${GITLAB_TOKEN}" ]; then
  AUTH_HEADER="-H PRIVATE-TOKEN:${GITLAB_TOKEN}"
else
  AUTH_HEADER=""
fi

GL_SHA="$(curl -fsSL ${AUTH_HEADER} \
  "https://${GITLAB_HOST}/api/v4/projects/${ENCODED_PATH}/repository/commits/main" \
  | grep -oP '(?<="id":")[a-f0-9]{40}' | head -n1 || echo "")"

if [ -z "${GL_SHA}" ]; then
  echo "❌ لم أتمكن من قراءة commits من GitLab"
  echo "   تأكد من: المشروع موجود + GITLAB_TOKEN صحيح + Mirror مُفعَّل"
  exit 1
fi
echo "📦 GitLab HEAD:  ${GL_SHA:0:12}"

echo ""
if [ "${GH_SHA}" = "${GL_SHA}" ]; then
  echo "✅ متطابقان! Mirror يعمل بشكل صحيح."
  exit 0
else
  echo "⚠️  مختلفان. قد يكون Mirror لم يُحدَّث بعد."
  echo "   جرّب: GitHub → Settings → Mirroring → اضغط 'Sync now'"
  exit 2
fi