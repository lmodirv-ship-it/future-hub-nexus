# 🦊 خطة تثبيت GitLab CE على سيرفر LWS + Mirror من GitHub

## 🎯 الهدف
إنشاء نسخة احتياطية كاملة للكود على سيرفر LWS الجديد عبر GitLab CE، مع مزامنة تلقائية من GitHub، **بدون أي تأثير على الإنتاج الحالي**.

---

## 📊 المعمارية النهائية

```
Lovable (تطوير)
    ↓
GitHub (المصدر الرسمي) ──Mirror──▶ GitLab CE (LWS - النسخة الاحتياطية)
    ↓
GitHub Actions
    ↓
سيرفر الإنتاج الحالي (التطبيق على Docker) — يبقى كما هو
```

| السيرفر | الدور | الحالة |
|---------|-------|--------|
| LWS الجديد (8GB / Ubuntu 24.04) | GitLab CE + Runner | 🆕 سيُثبَّت |
| سيرفر الإنتاج الحالي | التطبيق (Docker + Nginx + Wrangler) | ✅ بدون تغيير |

---

## 📂 الملفات التي ستُنشأ في المشروع

### سكريبتات قابلة للتنفيذ على سيرفر LWS

1. **`scripts/install-gitlab.sh`**
   - تحديث Ubuntu 24.04 + تثبيت dependencies (curl, ca-certificates, tzdata, perl, postfix)
   - إعداد UFW firewall (يفتح 22, 80, 443 فقط)
   - إضافة GitLab Omnibus repository الرسمي
   - تثبيت `gitlab-ce` بأحدث إصدار مستقر يدعم Ubuntu 24.04
   - تكوين `external_url` بـ `https://gitlab.slavacall-hiba.online`
   - تشغيل `gitlab-ctl reconfigure`
   - عرض كلمة مرور root الأولية من `/etc/gitlab/initial_root_password`

2. **`scripts/setup-gitlab-ssl.sh`**
   - تفعيل Let's Encrypt المدمج في GitLab Omnibus
   - تكوين تجديد تلقائي شهري
   - إعادة تشغيل آمنة لـ NGINX داخل GitLab

3. **`scripts/secure-gitlab.sh`**
   - تعطيل تسجيل المستخدمين العام (`signup_enabled = false`)
   - تفعيل 2FA enforcement (اختياري)
   - تكوين session timeout

4. **`scripts/install-gitlab-runner.sh`**
   - تثبيت GitLab Runner (Docker executor)
   - تعليمات التسجيل التفاعلي (للاستخدام المستقبلي عند تفعيل CI/CD)

5. **`scripts/verify-gitlab-mirror.sh`**
   - يقارن آخر commit بين GitHub و GitLab عبر API
   - مفيد للتحقق من سلامة المزامنة

### أدلة بالعربية

6. **`docs/GITLAB_SETUP_AR.md`** — دليل تثبيت كامل خطوة بخطوة:
   - قبل البدء (DNS A Record لـ `gitlab.slavacall-hiba.online`)
   - تشغيل السكريبتات بالترتيب الصحيح
   - تسجيل الدخول الأول وتغيير كلمة root
   - إنشاء مستخدمك الشخصي
   - استكشاف الأخطاء الشائعة

7. **`docs/GITLAB_MIRROR_AR.md`** — دليل إعداد Mirror:
   - إنشاء Personal Access Token في GitLab (`write_repository`)
   - إنشاء مشروع فارغ في GitLab باسم `future-hub-nexus`
   - إعداد Push Mirror في GitHub: `Settings → Code & automation → Mirroring repositories`
   - الصيغة الصحيحة لـ URL: `https://oauth2:<TOKEN>@gitlab.slavacall-hiba.online/<user>/future-hub-nexus.git`
   - اختبار + تأكيد المزامنة

### تحديث

8. **`DEPLOY.md`** — إضافة قسم جديد:
   - شرح المعمارية الجديدة (سيرفران منفصلان)
   - رابط للأدلة الجديدة
   - توضيح أن GitHub Actions الحالي يبقى يعمل

---

## ❌ ما لن يتأثر إطلاقاً

- ✅ كود التطبيق (React, TanStack Start)
- ✅ قاعدة البيانات (Lovable Cloud / Supabase)
- ✅ سيرفر الإنتاج الحالي
- ✅ GitHub Actions الحالي (`.github/workflows/deploy.yml`)
- ✅ Docker setup, Nginx config
- ✅ التطبيق المباشر على `slavacall-hiba.online`

---

## 📋 ما يجب على المستخدم فعله بعد التنفيذ

### قبل تشغيل السكريبتات (في لوحة DNS):
1. إضافة A Record: `gitlab.slavacall-hiba.online` → IP سيرفر LWS الجديد
2. انتظار 5-30 دقيقة لانتشار DNS
3. تحقق: `dig gitlab.slavacall-hiba.online +short`

### على سيرفر LWS الجديد (SSH كـ root):
```bash
# 1. استنساخ السكريبتات
git clone https://github.com/lmodirv-ship-it/future-hub-nexus.git /tmp/nexus
cd /tmp/nexus/scripts

# 2. التثبيت بالترتيب
sudo bash install-gitlab.sh
sudo bash setup-gitlab-ssl.sh
sudo bash secure-gitlab.sh

# 3. (اختياري لاحقاً)
sudo bash install-gitlab-runner.sh
```

### في GitHub (بعد تثبيت GitLab):
- اتباع `docs/GITLAB_MIRROR_AR.md` لإعداد Push Mirror

---

## 🔒 الأمان المضمّن

- UFW firewall: 22 / 80 / 443 فقط
- SSL تلقائي عبر Let's Encrypt (HTTPS إجباري)
- تعطيل التسجيل العام
- تجديد شهادات تلقائي
- تحذير صريح بتغيير كلمة root الأولية

---

## ⏭️ المراحل المؤجلة (لاحقاً عند الحاجة)

- **GitLab CI/CD** كبديل لـ GitHub Actions — جاهز للتفعيل لاحقاً عبر إضافة `.gitlab-ci.yml`
- **النشر المباشر من GitLab** بدون المرور بـ GitHub
- **استضافة مشاريع إضافية** على نفس GitLab

---

## ✅ النتيجة المتوقعة

بعد إكمال هذه الخطة:
1. GitLab CE يعمل على `https://gitlab.slavacall-hiba.online` بـ HTTPS
2. كل push على GitHub يُنسخ تلقائياً إلى GitLab خلال دقيقة
3. لديك نسخة احتياطية كاملة للكود على بنيتك التحتية
4. GitHub Actions يستمر بالنشر للإنتاج كما كان
5. خيار التوسع لاستخدام GitLab CI/CD متوفر متى أردت

**هل توافق على هذه الخطة للبدء بالتنفيذ؟** 🚀
