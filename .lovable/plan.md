
# 🎛️ Central Control Hub داخل HN-Dev

## 🎯 الهدف
تحويل HN-Dev إلى **لوحة تحكم عن بعد** لكل مشاريعك الـ 20 في Lovable، تعرض حالتها، نطاقاتها المخصّصة، وتوفّر "علبة أدوات AdSense" جاهزة للنسخ.

---

## ⚠️ توضيح تقني مهم (قبل البدء)

Lovable لا يوفّر API عام لتعديل ملفات مشاريع أخرى من داخل مشروع. يعني:
- ✅ **ما يمكن فعله من HN-Dev**: عرض، تتبّع، فحص الحالة (HEAD requests)، تخزين النطاقات، توليد كود AdSense + ads.txt جاهز للنسخ.
- ❌ **ما لا يمكن فعله تلقائياً**: حقن السكريبت أو ads.txt مباشرة في الـ 19 مشروع الآخر — يجب لصقه في كل مشروع مرّة واحدة (سأعطيك prompt جاهز ينسخ ويلصق فيُنفّذ التغيير في ثوانٍ).

---

## 📐 خطة التنفيذ

### 1) جدول قاعدة بيانات جديد: `lovable_projects`
يخزّن المشاريع الـ 20 + النطاقات المخصّصة لكل واحد + حالة AdSense.

| العمود | النوع | الوصف |
|---|---|---|
| `id` | uuid | PK |
| `lovable_project_id` | text unique | معرّف Lovable |
| `name` | text | اسم المشروع |
| `description` | text | وصف قصير |
| `lovable_url` | text | `*.lovable.app` |
| `published_url` | text | URL المنشور |
| `custom_domains` | jsonb | مصفوفة نطاقات مخصّصة `[{domain, primary, ssl_ok}]` |
| `category` | text | تصنيف (saas/store/portfolio/tool…) |
| `adsense_installed` | boolean | هل أُضيف السكريبت؟ |
| `adstxt_installed` | boolean | هل أُضيف ads.txt؟ |
| `last_health_check` | timestamptz | آخر فحص حالة |
| `last_status_code` | int | كود الاستجابة |
| `is_up` | bool | up/down |
| `notes` | text | ملاحظات |

RLS: قراءة/كتابة للمدير فقط (`is_admin()`).

### 2) Seed تلقائي للمشاريع الـ 20
Migration تُدخل القائمة كاملة (HN Chat Hub، HN Driver، AI Client Connect، AI Resume Genius، Smart Solutions Hub، Grand Tanger Print، CarWashManager، Souk-HN، Profitable Ventures، Agency Hub Pro، AI Scene Studio، Studio HN، Database Foundation، AI Studio Vision، hn-cima، HN-Dev، My Site Manager، Vigilant Guardian، Domain Monitor، Cloud Harmony) مع روابط `lovable.app` المعروفة + خانة فارغة للنطاقات المخصّصة لتعبئتها.

### 3) صفحة جديدة: `/admin/control-hub`
لوحة شبكة (grid) فيها بطاقة لكل مشروع تعرض:
- الاسم + الوصف + التصنيف
- حالة الموقع (🟢 up / 🔴 down / ⚪ unchecked) مع زمن الاستجابة
- الـ subdomain الافتراضي + النطاقات المخصّصة
- شارات AdSense + ads.txt (مُفعّل / لا)
- أزرار سريعة: فتح، نسخ الرابط، تعديل النطاقات، إعادة فحص

أعلى الصفحة: شريط إحصائيات (إجمالي المشاريع، المنشورة، أعلى مدّة استجابة، نطاقات مخصّصة، نسبة AdSense).

### 4) Modal "إدارة النطاقات" لكل مشروع
- إضافة/حذف نطاقات مخصّصة (text input + chip list).
- علامة "Primary".
- زر فحص (HEAD request عبر server function) يُحدّث `is_up` + `last_status_code`.
- زر فتح إعدادات Lovable للمشروع (link to `/projects/{id}/settings/domains`).

### 5) صفحة "AdSense Toolkit" (`/admin/adsense-kit`)
كل ما يلزم لتفعيل AdSense على أي مشروع، مع:
- **سكريبت AdSense** جاهز للنسخ:
  ```html
  <script async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3443455318197857"
    crossorigin="anonymous"></script>
  ```
- **محتوى ads.txt**:
  ```
  google.com, pub-3443455318197857, DIRECT, f08c47fec0942fa0
  ```
- **زرّ نسخ** بجانب كل قطعة.
- **Prompt جاهز للصق في أي مشروع Lovable** (يُنفّذه الـ AI تلقائياً):
  > "أضف سكريبت Google AdSense (`ca-pub-3443455318197857`) إلى الـ `<head>` في `__root.tsx`، وأنشئ ملف `public/ads.txt` يحتوي السطر: `google.com, pub-3443455318197857, DIRECT, f08c47fec0942fa0`."
- جدول يعرض حالة كل مشروع (مُفعّل/لا) مع checkbox يحدّث الجدول بعد التفعيل اليدوي.

### 6) ads.txt في HN-Dev نفسه
إنشاء `public/ads.txt` يحوي السطر المطلوب → يُخدَم تلقائياً على `https://www.slavacall-hiba.online/ads.txt`.
(السكريبت موجود فعلاً في `__root.tsx`).

### 7) فحص جماعي (Bulk Health Check)
زر "فحص الكل" في أعلى Control Hub يُشغّل server function تستدعي `HEAD` لكل URL منشور (لن تتعدّى 10s) وتحدّث الجدول دفعة واحدة.

### 8) تنقل
إضافة رابط "Control Hub" + "AdSense Kit" داخل قائمة `/admin` الجانبية.

---

## 🗂️ بنية الملفات المتوقّعة

```
src/
  routes/
    admin.control-hub.tsx          ← الشبكة + الإحصائيات
    admin.adsense-kit.tsx          ← أدوات AdSense + ads.txt
  components/admin/
    ProjectControlCard.tsx
    DomainManagerModal.tsx
    AdsenseStatusTable.tsx
    CopySnippet.tsx
  server/
    control-hub.ts                 ← bulk health check + CRUD
public/
  ads.txt                          ← google.com, pub-3443455318197857, ...
supabase/migrations/
  YYYYMMDD_lovable_projects.sql    ← جدول + RLS + seed للـ 20 مشروع
```

---

## 🎨 التصميم
- يتبع الهوية الزجاجية الداكنة الحالية (glass-strong, neon-text, oklch tokens).
- Grid 1 / 2 / 3 / 4 أعمدة حسب breakpoint.
- شارات حالة ملوّنة (status pills).
- أيقونات Lucide: `LayoutGrid`, `Globe`, `ShieldCheck`, `Activity`, `Copy`, `ExternalLink`.

---

## 📋 ما ستحصل عليه فور التنفيذ
1. لوحة `/admin/control-hub` فيها كل مشاريعك الـ 20 مرتّبة كبطاقات.
2. إمكانية إضافة نطاقاتك المخصّصة لكل مشروع (تُعبّأ مرّة واحدة).
3. فحص حالة جميع المواقع بنقرة واحدة.
4. صفحة `/admin/adsense-kit` تعطيك السكريبت + ads.txt + Prompt جاهز للصقه في الـ 19 مشروع لتفعيل AdSense دون كتابة كود.
5. ملف `ads.txt` نشط على HN-Dev نفسه.

---

## 🛠️ خطوات ما بعد التنفيذ (يدوية لكن سريعة)
لكل مشروع من الـ 19:
1. افتح المشروع → الصق Prompt من AdSense Kit → ينفّذ Lovable AI الإضافة.
2. ارجع لـ Control Hub → فعّل checkbox "AdSense Installed" للمشروع.
خلال نصف ساعة تكون كل مشاريعك مُفعّلة على نفس حساب AdSense.

