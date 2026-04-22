
# تحويل المشروع إلى نظام حقيقي بالكامل

## الوضع الحالي (تشخيص)

بعد فحص المشروع، الواقع مختلف قليلاً عما ذُكر:

✅ **موجود فعلاً وحقيقي:**
- جدول `projects` في قاعدة البيانات (مع 14 عمود + RLS)
- جدول `project_checks` (سجل الفحوصات)
- جدول `project_visits` (إحصائيات الزيارات)
- 4 دوال SQL: `is_admin`, `get_dashboard_stats`, `log_project_visit`, `update_updated_at_column`
- مصادقة Google OAuth حقيقية عبر `lovable.auth.signInWithOAuth` + Supabase Auth
- `useProjects` hook يقرأ من Supabase مع Realtime
- `AdminGuard` يتحقق من البريد عبر `auth.users` الحقيقي
- Server function `checkAllProjects` تفحص المواقع فعلياً

❌ **الناقص فعلاً (Mock / فارغ):**
1. **جدول `projects` فارغ** — البيانات الـ14 موجودة فقط في `src/data/projects.ts` (ثابتة)
2. **صفحات Admin (checks/visits/alerts/settings) تعرض UI فقط** بدون استعلامات حقيقية كاملة
3. **لا يوجد جدول `alerts`** للتنبيهات
4. **لا يوجد جدول `admin_settings`** للإعدادات
5. **الفحص التلقائي يدوي فقط** — لا cron job
6. **تسجيل الزيارات `log_project_visit` غير مستدعى** من الواجهة
7. **نظام الأدوار** يعتمد على بريد ثابت (`is_admin` يقارن بـ `lmodirv@gmail.com`) بدل جدول `user_roles`

---

## الخطة التنفيذية

### 1. ترحيل البيانات الـ14 من الكود إلى قاعدة البيانات
- `INSERT` للمشاريع الـ14 من `src/data/projects.ts` إلى جدول `projects` الحقيقي
- حذف `src/data/projects.ts` (أو إبقاؤه فقط كـ seed reference)
- `ProjectGrid` و `ProjectCard` يقرآن من Supabase مباشرة (موجود مسبقاً)

### 2. إنشاء الجداول الناقصة (Migration)

**جدول `user_roles`** (بديل آمن للبريد الثابت):
- `app_role` enum: `admin`, `viewer`
- جدول `user_roles (user_id, role)` + RLS
- تحديث دالة `is_admin()` لتستخدم `has_role()` بدل مقارنة البريد
- زرع المستخدم الحالي كـ admin

**جدول `alerts`**:
- `id, project_id, type (down/slow/ssl), severity, message, is_read, created_at`
- RLS: admin فقط
- Trigger: عند `is_up=false` في `project_checks` يُنشئ تنبيه تلقائياً

**جدول `admin_settings`** (key-value):
- `key, value (jsonb), updated_at`
- مفاتيح أولية: `check_interval_minutes`, `alert_email`, `slow_threshold_ms`

### 3. ربط صفحات Admin بالبيانات الحقيقية

| الصفحة | المصدر الحقيقي |
|--------|----------------|
| `/admin` | `get_dashboard_stats()` RPC (موجودة) |
| `/admin/projects` | `projects` table CRUD (موجود) |
| `/admin/checks` | `project_checks` SELECT مع pagination |
| `/admin/visits` | `project_visits` + chart زمني |
| `/admin/alerts` | `alerts` table + mark as read |
| `/admin/settings` | `admin_settings` upsert |

### 4. تفعيل تسجيل الزيارات الحقيقي
- في `ProjectCard` عند النقر: استدعاء RPC `log_project_visit(project_id)`
- زيادة `visit_count` تلقائياً (الدالة موجودة)

### 5. الفحص التلقائي الدوري
- Server route عام: `/api/public/cron/check-projects`
- Verification عبر `CRON_SECRET` header
- إعداد pg_cron داخل Supabase لاستدعائه كل 15 دقيقة (حسب `admin_settings.check_interval_minutes`)

### 6. توحيد المصادقة
- إزالة الاعتماد على `ADMIN_EMAIL` الثابت في `src/lib/admin.ts`
- استبداله بـ hook `useIsAdmin()` يستدعي RPC `is_admin()`
- `AdminGuard` يستخدم الـ hook الجديد

---

## التفاصيل التقنية

**Migrations مطلوبة:**
```sql
-- 1. user_roles + has_role
CREATE TYPE app_role AS ENUM ('admin','viewer');
CREATE TABLE user_roles (...);
CREATE FUNCTION has_role(_uid uuid, _role app_role) ...
-- إعادة تعريف is_admin() لاستخدام has_role

-- 2. alerts + trigger
CREATE TABLE alerts (...);
CREATE FUNCTION create_alert_on_down() RETURNS trigger ...
CREATE TRIGGER on_check_insert AFTER INSERT ON project_checks ...

-- 3. admin_settings
CREATE TABLE admin_settings (key text PK, value jsonb, ...);
INSERT defaults;

-- 4. seed user_roles بالبريد الحالي كـ admin
-- 5. seed projects بالـ14 مشروع
```

**Secrets جديدة:** `CRON_SECRET` (للحماية endpoint الفحص الدوري)

**ملفات ستُعدَّل/تُنشأ:**
- جديد: `src/hooks/use-is-admin.ts`, `src/hooks/use-alerts.ts`, `src/hooks/use-checks.ts`, `src/hooks/use-visits.ts`, `src/hooks/use-settings.ts`
- جديد: `src/routes/api.public.cron.check-projects.ts`
- تعديل: `src/components/nexus/AdminGuard.tsx`, `src/lib/admin.ts`, `src/components/nexus/ProjectCard.tsx`
- تعديل: `src/routes/admin.checks.tsx`, `admin.visits.tsx`, `admin.alerts.tsx`, `admin.settings.tsx`
- حذف: `src/data/projects.ts` (بعد الترحيل)

---

## النتيجة النهائية

- ✅ مصادقة Google حقيقية (موجودة أصلاً) + نظام أدوار قابل للتوسع
- ✅ 14 مشروع في قاعدة بيانات حقيقية + قابلة للإضافة من لوحة التحكم
- ✅ فحص حالة المواقع تلقائي كل X دقيقة
- ✅ تنبيهات تلقائية عند تعطل أي موقع
- ✅ إحصائيات زيارات حقيقية
- ✅ إعدادات قابلة للتعديل من الواجهة
- ✅ كل صفحات `/admin` تعرض بيانات حية من Supabase

هل أبدأ التنفيذ؟
