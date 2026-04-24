# 🔄 إعداد Mirror من GitHub إلى GitLab CE

مزامنة تلقائية للكود من `github.com/lmodirv-ship-it/future-hub-nexus` إلى GitLab الجديد على `gitlab.slavacall-hiba.online`.

---

## 📋 المتطلبات

- ✅ GitLab CE مُثبَّت ويعمل ([دليل التثبيت](./GITLAB_SETUP_AR.md))
- ✅ HTTPS مفعّل (`https://gitlab.slavacall-hiba.online`)
- ✅ حسابك الشخصي على GitLab مُنشأ ومُفعَّل بـ 2FA
- ✅ صلاحيات admin على مستودع GitHub

---

## 🚀 الخطوات

### 1️⃣ إنشاء Personal Access Token في GitLab

1. سجّل دخول إلى `https://gitlab.slavacall-hiba.online`
2. أعلى اليمين → **Edit Profile** → **Access Tokens**
3. اضغط **Add new token**:
   - **Token name:** `github-mirror-push`
   - **Expiration date:** بعد سنة (أو حسب رغبتك)
   - **Scopes:** ✅ `write_repository` فقط
4. اضغط **Create personal access token**
5. **انسخ الـ token فوراً** (يبدأ بـ `glpat-...`) — لن يظهر مرة أخرى!

مثال:
```
glpat-abc123XYZ456def789
```

---

### 2️⃣ إنشاء مشروع فارغ في GitLab

1. أعلى اليسار → **+** → **New project/repository**
2. اختر **Create blank project**
3. الإعدادات:
   - **Project name:** `future-hub-nexus`
   - **Project URL:** `gitlab.slavacall-hiba.online/<اسم_المستخدم>/`
   - **Visibility Level:** Private (موصى به) أو Internal
   - ❌ **لا تختر** "Initialize with README" — اتركه فارغاً تماماً
4. اضغط **Create project**

سيكون الـ URL النهائي مثل:
```
https://gitlab.slavacall-hiba.online/youruser/future-hub-nexus
```

---

### 3️⃣ إعداد Push Mirror في GitHub

1. اذهب إلى: https://github.com/lmodirv-ship-it/future-hub-nexus
2. **Settings** → القائمة الجانبية → **Code and automation** → **Mirroring repositories**
3. اضغط **Add**
4. أدخل **Repository URL** بهذه الصيغة:

```
https://oauth2:<GITLAB_TOKEN>@gitlab.slavacall-hiba.online/<user>/future-hub-nexus.git
```

مثال حقيقي:
```
https://oauth2:glpat-abc123XYZ456def789@gitlab.slavacall-hiba.online/youruser/future-hub-nexus.git
```

5. **Mirror direction:** ✅ Push
6. اضغط **Add mirror**

---

### 4️⃣ تشغيل المزامنة الأولى

بعد الإضافة، GitHub سيُجري Push أولي تلقائياً (قد يأخذ 1-5 دقائق).

لإجبار المزامنة فوراً:
- في صفحة Mirroring repositories
- بجانب الـ mirror الجديد، اضغط **🔄 (Sync now)**

---

### 5️⃣ التحقق من النجاح

#### من المتصفح:
1. افتح: `https://gitlab.slavacall-hiba.online/youruser/future-hub-nexus`
2. يجب أن ترى **كل الكود** + branches + tags
3. آخر commit يجب أن يطابق GitHub

#### من السيرفر (سكريبت تلقائي):
```bash
cd /opt/nexus/scripts
GITLAB_TOKEN="glpat-xxx" bash verify-gitlab-mirror.sh youruser/future-hub-nexus
```

الناتج المتوقع:
```
📦 GitHub HEAD:  abc123def456
📦 GitLab HEAD:  abc123def456
✅ متطابقان! Mirror يعمل بشكل صحيح.
```

---

## ⏱️ كيف يعمل Mirror؟

- GitHub يدفع التغييرات كل **5 دقائق تقريباً** (تلقائياً)
- يمكن إجبار المزامنة يدوياً في أي وقت من GitHub
- يدعم: commits, branches, tags
- ❌ لا يدعم: Issues, Pull Requests, Wiki, Releases (هذه تبقى على GitHub فقط)

---

## 🆘 استكشاف الأخطاء

### "Last failed to update" في GitHub
1. تحقق من الـ token صحيح وغير منتهي
2. تحقق من الـ URL يحتوي `oauth2:` قبل الـ token
3. تحقق من DNS و SSL سليمين

### "Permission denied"
- الـ token يحتاج scope `write_repository` (ليس فقط `read`)
- المستخدم في GitLab يحتاج صلاحية **Maintainer** أو أعلى على المشروع

### "SSL verification failed"
- تأكد من شهادة Let's Encrypt صالحة:
  ```bash
  curl -I https://gitlab.slavacall-hiba.online
  # يجب أن يُرجع 200 OK بدون أخطاء SSL
  ```

### "Repository is empty in GitLab"
- اضغط **Sync now** يدوياً
- إن استمر، احذف الـ mirror وأضفه من جديد

---

## 🔄 تجديد الـ Token (سنوياً)

قبل انتهاء الـ token:
1. أنشئ token جديد في GitLab بنفس الاسم/الصلاحيات
2. في GitHub Mirroring → احذف الـ mirror القديم
3. أضف mirror جديد بالـ token الجديد

---

## ✅ النتيجة النهائية

بعد إكمال هذا الدليل:

```
Lovable → GitHub → GitLab CE (LWS)  ✅ نسخة احتياطية حية
              ↓
         GitHub Actions → سيرفر الإنتاج  (يبقى يعمل بدون تغيير)
```

- ✅ كل push على GitHub يُنسخ إلى GitLab خلال دقائق
- ✅ نسخة احتياطية كاملة على بنيتك التحتية
- ✅ يمكن التبديل لاحقاً إلى GitLab CI/CD متى أردت
- ✅ الإنتاج لم يتأثر إطلاقاً