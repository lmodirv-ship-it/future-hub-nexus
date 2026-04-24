## الهدف
إضافة إعادة محاولة تلقائية لعملية النشر عبر SSH في `.github/workflows/deploy.yml`، مع تحقق مسبق من الـ secrets و logging محسّن لتشخيص أسرع.

## التغييرات

### تعديل `.github/workflows/deploy.yml`

استبدال المحتوى الحالي بنسخة محسّنة تتضمن:

1. **خطوة تحقق مسبق من الـ secrets** (`Validate required secrets`):
   - تتأكد من وجود `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SERVER_SSH_KEY`
   - تعطي رسالة خطأ واضحة فوراً (`::error::SECRET_NAME is empty`) بدلاً من الفشل المبهم لاحقاً

2. **استخدام `nick-fields/retry@v3`** بدلاً من `appleboy/ssh-action@v1.0.3`:
   - `max_attempts: 3` — حتى 3 محاولات
   - `timeout_minutes: 8` لكل محاولة
   - `retry_wait_seconds: 30` بين المحاولات
   - `retry_on: error` — إعادة المحاولة على أي فشل (بما فيه فشل SSH handshake)

3. **تنفيذ SSH مباشر** داخل الـ retry action:
   - كتابة المفتاح الخاص لملف مؤقت بصلاحيات `600`
   - `ssh-keyscan` تلقائي لإضافة الـ host لـ `known_hosts`
   - `StrictHostKeyChecking=accept-new` و `ConnectTimeout=20`
   - `set -eo pipefail` داخل السكربت البعيد للفشل المبكر

4. **Logging محسّن** مع timestamps لكل خطوة على السيرفر:
   - `>> [HH:MM:SS] Pulling latest code...`
   - `>> [HH:MM:SS] Rebuilding containers...`
   - `>> [HH:MM:SS] Cleaning old images...`
   - `>> [HH:MM:SS] ✅ Done`
   - متبوعة بـ `docker compose ps`

## الفائدة
- ✅ يحل المشاكل العابرة (network glitch, sshd restart, rate limiting) تلقائياً
- ✅ رسائل خطأ واضحة عند نقص secret
- ✅ تشخيص أسرع عبر timestamps
- ✅ يحافظ على نفس السلوك الوظيفي (git pull + docker compose up --build + image prune)

## ⚠️ تنبيه
إعادة المحاولة لن تحل مشكلة **مفتاح خاطئ أساساً**. لو الـ `SERVER_SSH_KEY` في GitHub لا يطابق `~/.ssh/authorized_keys` على الـ VPS، الـ 3 محاولات ستفشل جميعاً. يجب أولاً التأكد من تحديث `SERVER_SSH_KEY` بالمحتوى الكامل لـ `~/.ssh/github_deploy` كما ناقشنا سابقاً.

## ملفات لن تتغير
- لا تغييرات على الكود، الـ Dockerfile، أو إعدادات الـ Supabase
- التعديل محصور في ملف واحد: `.github/workflows/deploy.yml`