
# 🎯 الهدف
إنشاء بنية تحتية قابلة للتوسع على **سيرفر الإنتاج الحالي** لاستضافة عدة مشاريع Lovable في نفس الوقت، مع:
- ✅ الإبقاء على نسخ Lovable تعمل (`*.lovable.app`)
- ✅ نشر تلقائي عبر GitHub Actions لكل مشروع
- ✅ إضافة موقع جديد بأمر واحد (`add-site.sh`)
- ✅ Subdomain + SSL تلقائي لكل موقع
- ✅ المشروع الحالي `future-hub-nexus` يستمر بالعمل دون انقطاع

---

## 📦 الملفات التي سأنشئها/أعدّلها

### 1. سكريبتات إدارة المواقع
| الملف | الغرض |
|-------|-------|
| `scripts/add-site.sh` | إضافة موقع جديد (clone + docker + nginx + SSL) بأمر واحد |
| `scripts/list-sites.sh` | عرض كل المواقع المستضافة + حالتها + استهلاك الموارد |
| `scripts/remove-site.sh` | حذف موقع بأمان (مع backup للـ env) |
| `scripts/update-site.sh` | تحديث موقع محدد فقط (git pull + rebuild) |
| `scripts/init-multi-site.sh` | تهيئة البنية لأول مرة على السيرفر |

### 2. قوالب Docker
| الملف | الغرض |
|-------|-------|
| `templates/site-docker-compose.yml.template` | قالب docker-compose لكل موقع جديد |
| `templates/site.dockerfile` | Dockerfile موحّد لمواقع Lovable (TanStack Start + Wrangler) |
| `templates/site.env.example` | قالب env vars لكل موقع |

### 3. قوالب Nginx
| الملف | الغرض |
|-------|-------|
| `nginx/multi-site.conf` | إعداد Nginx الرئيسي (يحمّل vhosts من sites-enabled) |
| `nginx/templates/site-vhost.conf.template` | قالب vhost لكل موقع (HTTP + HTTPS) |
| `nginx/sites-available/.gitkeep` | مجلد vhosts المتاحة |
| `nginx/sites-enabled/.gitkeep` | مجلد vhosts المفعّلة |

### 4. GitHub Actions
| الملف | الغرض |
|-------|-------|
| `.github/workflows/deploy-template.yml` | workflow جاهز للنسخ في أي repo Lovable جديد |

### 5. التوثيق العربي
| الملف | الغرض |
|-------|-------|
| `docs/MULTI_SITE_DEPLOY_AR.md` | الدليل الشامل: كيف تضيف موقعاً، استكشاف الأخطاء، حدود الموارد |
| `docs/LOVABLE_TO_SERVER_AR.md` | كيف تربط مشروع Lovable جديد بالسيرفر مع الإبقاء على نسخة Lovable |
| `docs/GITHUB_ACTIONS_TEMPLATE_AR.md` | كيف تنسخ workflow النشر إلى repos أخرى |

### 6. تحديثات
| الملف | التغيير |
|-------|---------|
| `DEPLOY.md` | إضافة قسم "استضافة عدة مواقع" + روابط للأدلة الجديدة |

---

## 🏗️ المعمارية النهائية

```
Lovable (مشاريع متعددة)
    ↓ (auto-push)
GitHub (repo لكل مشروع)
    ↓ (GitHub Actions)
سيرفر الإنتاج
├─ Nginx (Reverse Proxy + SSL)
│  ├─ site1.slavacall-hiba.online → :3001
│  ├─ site2.slavacall-hiba.online → :3002
│  └─ site3.slavacall-hiba.online → :3003
└─ Docker Containers (واحد لكل موقع)
```

---

## ⚙️ كيف ستعمل إضافة موقع جديد (بعد التنفيذ)

```bash
# على السيرفر
sudo bash ~/app/scripts/add-site.sh \
  my-shop \
  https://github.com/user/my-shop.git \
  shop.slavacall-hiba.online \
  3002
```

السكريبت يقوم تلقائياً بـ:
1. استنساخ الـ repo في `~/sites/my-shop`
2. توليد `docker-compose.yml` للموقع
3. توليد nginx vhost في `sites-available/` ثم symlink لـ `sites-enabled/`
4. تشغيل Certbot لتفعيل SSL على `shop.slavacall-hiba.online`
5. تشغيل الحاوية + إعادة تحميل nginx
6. الموقع يعمل على `https://shop.slavacall-hiba.online` ✅

ثم في GitHub repo الجديد: انسخ `.github/workflows/deploy-template.yml` وعدّل اسم الموقع.

---

## ✅ ضمانات السلامة

- 🛡️ المشروع الحالي `future-hub-nexus` لن يتأثر — السكريبتات الجديدة منفصلة تماماً
- 🛡️ لا تعديل على `docker-compose.yml` الحالي ولا `nginx/nginx.conf` الحالي
- 🛡️ بنية جديدة موازية في `~/sites/` بدلاً من `~/app/`
- 🛡️ كل موقع له شبكة Docker معزولة
- 🛡️ Lovable يبقى يعمل لكل المشاريع بشكل طبيعي

---

## ⚠️ ملاحظات مهمة

1. **DNS يدوي**: لكل موقع جديد، يجب إضافة A Record للـ subdomain يدوياً عند مزوّد الدومين قبل تشغيل `add-site.sh`
2. **Lovable Cloud**: كل موقع يبقى متصلاً بقاعدة بياناته في Lovable (لا تغيير في الـ Supabase URLs)
3. **حدود الموارد**: السيرفر الحالي يكفي لـ ~5-8 مواقع متوسطة (سنراقب الاستهلاك عبر `list-sites.sh`)
4. **GitHub Secrets**: نفس الـ secrets الحالية (`SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SERVER_SSH_KEY`) يمكن استخدامها في كل repo جديد

---

## 🚫 ما لن يتم في هذه المرحلة

- ❌ نقل GitLab CE (سبق إعداده على سيرفر LWS منفصل)
- ❌ إعداد GitLab CI/CD (مؤجّل — GitHub Actions يكفي حالياً)
- ❌ Wildcard SSL (سنستخدم شهادة فردية لكل subdomain — أبسط وأكثر أماناً)
- ❌ تعديل المشروع الحالي `future-hub-nexus` (سيعمل كما هو)

---

## 📌 الخطوات بعد موافقتك

1. إنشاء كل الملفات والسكريبتات والقوالب أعلاه
2. تقديم تعليمات تشغيل واضحة بالعربية:
   - أمر واحد لتهيئة البنية على السيرفر
   - أمر واحد لإضافة كل موقع جديد
3. لن يحدث أي تنفيذ تلقائي على السيرفر — كل شيء يبقى تحت سيطرتك اليدوية

**هل توافق على هذه الخطة؟** ✅
