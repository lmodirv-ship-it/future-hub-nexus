# 🦊 دليل تثبيت GitLab CE على سيرفر LWS

دليل خطوة بخطوة لتثبيت GitLab Community Edition على سيرفر **LWS** الجديد (Ubuntu 24.04 LTS) وربطه بالدومين `gitlab.slavacall-hiba.online`.

---

## 📋 المتطلبات

| المتطلب | القيمة |
|---------|--------|
| نظام التشغيل | Ubuntu 24.04 LTS (Noble Numbat) |
| RAM | 8 GB ✅ (4GB حد أدنى) |
| CPU | 4 vCPU ✅ |
| Disk | 150 GB SSD ✅ (50GB حد أدنى) |
| الدومين | `gitlab.slavacall-hiba.online` |
| الوصول | SSH كـ root |

---

## 🔧 المرحلة 0: إعداد DNS (قبل أي شيء)

### الخطوة 1: احصل على IP سيرفر LWS الجديد
من لوحة LWS، انسخ عنوان IP العام للسيرفر.

### الخطوة 2: أضف A Record
في لوحة DNS لدومين `slavacall-hiba.online`:

```
Type:  A
Name:  gitlab
Value: <IP_LWS_السيرفر>
TTL:   3600
```

### الخطوة 3: تحقق من انتشار DNS (انتظر 5-30 دقيقة)
```bash
dig gitlab.slavacall-hiba.online +short
# يجب أن يُرجع IP سيرفر LWS
```

✅ **لا تتقدم للمرحلة التالية حتى يعمل DNS بشكل صحيح.**

---

## 🚀 المرحلة 1: تثبيت GitLab CE

### اتصل بالسيرفر
```bash
ssh root@<IP_LWS>
```

### استنسخ المشروع للحصول على السكريبتات
```bash
apt-get update && apt-get install -y git
git clone https://github.com/lmodirv-ship-it/future-hub-nexus.git /opt/nexus
cd /opt/nexus/scripts
chmod +x *.sh
```

### شغّل التثبيت
```bash
sudo bash install-gitlab.sh
```

⏱️ **يستغرق 10-15 دقيقة** (تحديث النظام + تنزيل + تثبيت).

بعد الانتهاء، السكريبت سيعرض:
- 🔑 **كلمة root الأولية** (احفظها فوراً — تُحذف بعد 24 ساعة)
- 🌐 رابط GitLab المؤقت: `http://gitlab.slavacall-hiba.online`

---

## 🔒 المرحلة 2: تفعيل HTTPS

```bash
sudo bash setup-gitlab-ssl.sh
```

سيطلب منك:
- 📧 بريد إلكتروني صالح (لإشعارات Let's Encrypt)

بعد ~3 دقائق، GitLab سيكون متاحاً على:

```
https://gitlab.slavacall-hiba.online
```

---

## 🛡️ المرحلة 3: تأمين GitLab

```bash
sudo bash secure-gitlab.sh
```

هذا السكريبت:
- ✅ يعطّل التسجيل العام (لا أحد يستطيع إنشاء حساب)
- ✅ يضبط Session timeout على 8 ساعات
- ✅ يفعّل rate limiting (حماية من brute-force)

---

## 👤 المرحلة 4: التسجيل الأول وإنشاء حسابك

1. افتح: `https://gitlab.slavacall-hiba.online`
2. سجّل دخول:
   - **Username:** `root`
   - **Password:** الكلمة من المرحلة 1
3. **غيّر كلمة root فوراً:** أعلى يمين → Edit Profile → Password
4. **أنشئ حسابك الشخصي:**
   - أعلى يسار (شكل المفتاح) → Admin Area
   - Overview → Users → New user
   - أدخل بياناتك واحفظ
   - عدّل المستخدم → Access level: **Administrator**
   - اضغط "Impersonate" أو سجّل خروج وادخل بحسابك الجديد
5. **فعّل 2FA لحسابك:**
   - Edit Profile → Account → Enable two-factor authentication

---

## ✅ التحقق من نجاح التثبيت

```bash
# على سيرفر LWS
gitlab-ctl status

# يجب أن ترى كل الخدمات "run"
# nginx, postgresql, redis, puma, sidekiq, gitaly, ...
```

اختبر من المتصفح: `https://gitlab.slavacall-hiba.online` — يجب أن تظهر صفحة GitLab بشهادة SSL خضراء 🔒

---

## 🆘 استكشاف الأخطاء

### "Let's Encrypt failed"
- تأكد من DNS يشير للسيرفر الصحيح
- تأكد من المنفذ 80 مفتوح (UFW)
- جرّب يدوياً: `gitlab-ctl renew-le-certs`

### "502 Bad Gateway"
```bash
gitlab-ctl tail   # شاهد الأخطاء
gitlab-ctl restart
```

### "ذاكرة منخفضة"
8GB يجب أن يكفي. لكن إن احتجت:
```bash
# أضف 4GB swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### "نسيت كلمة root"
```bash
gitlab-rake "gitlab:password:reset[root]"
```

### "أريد إعادة تكوين كل شيء"
```bash
gitlab-ctl reconfigure
gitlab-ctl restart
```

---

## 📋 الخطوة التالية

بعد التأكد أن GitLab يعمل، انتقل إلى:

👉 **[إعداد Mirror من GitHub](./GITLAB_MIRROR_AR.md)**

لمزامنة الكود تلقائياً من `lmodirv-ship-it/future-hub-nexus` إلى GitLab الجديد.

---

## 🔧 صيانة دورية

### نسخ احتياطي يومي
```bash
# يدوي
gitlab-backup create

# تلقائي (كل ليلة 2 صباحاً)
echo "0 2 * * * root gitlab-backup create CRON=1" >> /etc/cron.d/gitlab-backup
```

### تحديث GitLab
```bash
apt-get update
apt-get upgrade gitlab-ce
gitlab-ctl reconfigure
```

### مراقبة الموارد
```bash
gitlab-ctl status      # حالة الخدمات
free -h                # الذاكرة
df -h                  # المساحة
```