#!/usr/bin/env bash
# مزامنة يدوية لموقع واحد. الاستخدام:
#   sudo -u nexus bash sync-site.sh <name> <repo-url> [branch]
set -euo pipefail
NAME="${1:?name required}"
REPO="${2:?repo url required}"
BRANCH="${3:-main}"
ROOT="${MIRRORS_ROOT:-/srv/mirrors}"
TARGET="$ROOT/$NAME"
if [[ -d "$TARGET/.git" ]]; then
  git -C "$TARGET" fetch origin "$BRANCH"
  git -C "$TARGET" reset --hard "origin/$BRANCH"
else
  git clone --depth=20 --branch "$BRANCH" "$REPO" "$TARGET"
fi
git -C "$TARGET" rev-parse HEAD