# 🌍 خطة تحويل HN-Dev إلى منصة عالمية متعددة اللغات

## القرارات المعتمدة
- **اللغات:** العربية (ar) + الإنجليزية (en) + الفرنسية (fr)
- **بنية URL:** منفصلة لكل لغة (`/en/services`, `/ar/services`, `/fr/services`)
- **اللغة الافتراضية:** العربية على المسار العاري (`/services` ≡ `/ar/services`)
- **العملة:** تلقائية حسب اللغة (AR→MAD, EN→USD, FR→EUR) مع إمكانية التبديل اليدوي
- **اتجاه النص:** RTL للعربية، LTR للإنجليزية والفرنسية

---

## المرحلة 1: توسيع نظام الـ i18n الأساسي

### `src/lib/i18n.tsx` (تحديث رئيسي)
- إضافة `fr` إلى نوع `Lang`
- توسيع القاموس بـ ~200 مفتاح ترجمة جديد يغطي جميع الصفحات
- إضافة دالة `getLangFromPath(pathname)` لقراءة اللغة من URL
- إضافة دالة `stripLangFromPath(pathname)` لإزالة بادئة اللغة
- إضافة دالة `buildLangPath(lang, path)` لبناء روابط
- كاشف لغة المتصفح عند أول زيارة (`navigator.language`)
- حفظ التفضيل في `cookie` (وليس localStorage فقط) لتمكين قراءته من السيرفر
- تحديث `<html lang>` و `dir` تلقائياً عند تغيير اللغة

### إنشاء `src/lib/i18n-locales/` (تنظيم القاموس)
- `ar.ts` — كل النصوص العربية
- `en.ts` — كل النصوص الإنجليزية
- `fr.ts` — كل النصوص الفرنسية
- يبقى `i18n.tsx` نظيفاً ويستورد من هذه الملفات

---

## المرحلة 2: ترجمة كاملة لجميع الصفحات

تحويل النصوص العربية المكتوبة مباشرة إلى مفاتيح `t("...")`:

| الملف | تقدير المفاتيح |
|---|---|
| `src/routes/contact.tsx` | ~12 |
| `src/routes/about.tsx` | ~15 |
| `src/routes/services.tsx` | ~25 (يدعم `lang` فقط حالياً) |
| `src/routes/projects.tsx` | ~10 |
| `src/routes/projects.$slug.tsx` | ~15 |
| `src/routes/pricing.tsx` | ~25 |
| `src/routes/marketplace.tsx` | ~15 |
| `src/routes/marketplace.$slug.tsx` | ~15 |
| `src/routes/login.tsx` | ~10 |
| `src/routes/privacy.tsx` | ~20 |
| `src/routes/terms.tsx` | ~20 |
| `src/routes/refund.tsx` | ~15 |
| `src/components/nexus/HeroNexus.tsx` | ~8 |
| `src/components/nexus/Footer.tsx` | تحديث (موجود جزئياً) |

> ملاحظة: صفحات الإدارة (`admin.*`) تبقى عربية فقط لأنها داخلية.

---

## المرحلة 3: بنية الـ Routing الجديدة

### الإستراتيجية: Layout Route مع بادئة اللغة

نضيف ملف `src/routes/$lang.tsx` كـ layout route، ولكن **بدون نقل ملفات** — بدلاً من ذلك:

**الطريقة المعتمدة (أبسط وأكثر أماناً):**
- إبقاء جميع المسارات الحالية كما هي (`/services`, `/about`, …)
- إضافة layout اختياري `src/routes/$lang.tsx` يحتوي فقط على Outlet
- إضافة ملفات pass-through تحت `src/routes/$lang/` تعيد التصدير من المسارات الأصلية:
  - `src/routes/$lang/services.tsx` → يستورد ويعرض نفس مكوّن `services.tsx`
  - وهكذا لباقي الصفحات العامة (about, contact, pricing, services, marketplace, projects, privacy, terms, refund)
- داخل layout `$lang`، نتحقق إن كانت `lang` ∈ {en, fr}؛ إن لم تكن، نوجّه إلى 404
- نتعامل مع `/ar/...` كإعادة توجيه إلى المسار العاري (`/...`) لتجنب المحتوى المكرر
- كل ملف pass-through يستدعي `setLang()` المناسب من خلال loader

> **تنبيه حول `routeTree.gen.ts`:** هذا الملف يُولَّد تلقائياً، لذلك لن نلمسه. ملفات المسارات الجديدة في `src/routes/$lang/` ستُسجَّل تلقائياً.

### الصفحات التي ستحصل على نسخ بلغة:
- `/en/`, `/fr/` (الرئيسية)
- `/en/services`, `/fr/services`
- `/en/about`, `/fr/about`
- `/en/contact`, `/fr/contact`
- `/en/pricing`, `/fr/pricing`
- `/en/projects`, `/fr/projects`
- `/en/projects/$slug`, `/fr/projects/$slug`
- `/en/marketplace`, `/fr/marketplace`
- `/en/marketplace/$slug`, `/fr/marketplace/$slug`
- `/en/privacy`, `/fr/privacy`
- `/en/terms`, `/fr/terms`
- `/en/refund`, `/fr/refund`

### المسارات التي **لن** تتغير (تبقى عربية فقط):
- `/admin/*` (داخلي)
- `/dashboard`, `/login`, `/monitor`, `/control-center` (وظيفية)
- `/api/*` (APIs)

---

## المرحلة 4: SEO عالمي (الأهم)

### أ. `src/routes/__root.tsx` — تحديثات
- إزالة الميتا الثابتة (`og:title`, `og:description` الحالية) لأنها بالعربية فقط
- إبقاء فقط الميتا الفنية (charSet, viewport, fonts)
- إضافة Schema.org Organization كـ JSON-LD ثابت
- جعل `<html lang>` و `dir` ديناميكية حسب اللغة الحالية في URL

### ب. كل route يحدد ميتا بلغته
كل صفحة في `src/routes/$lang/services.tsx` ستضع ميتا حسب `params.lang`:
```tsx
head: ({ params }) => ({
  meta: [
    { title: titles[params.lang] },
    { name: "description", content: descriptions[params.lang] },
    { property: "og:title", content: titles[params.lang] },
    ...
  ],
  links: [
    { rel: "canonical", href: `https://www.slavacall-hiba.online/${params.lang}/services` },
    { rel: "alternate", hreflang: "ar", href: ".../services" },
    { rel: "alternate", hreflang: "en", href: ".../en/services" },
    { rel: "alternate", hreflang: "fr", href: ".../fr/services" },
    { rel: "alternate", hreflang: "x-default", href: ".../services" },
  ],
})
```

### ج. مساعد مشترك `src/lib/seo.ts`
- دالة `buildHreflangLinks(path)` لتوليد روابط hreflang لأي صفحة
- دالة `buildCanonical(lang, path)` لتوليد canonical
- دالة `buildOrganizationSchema()` لإرجاع JSON-LD ثابت
- دالة `buildWebSiteSchema()` مع SearchAction

### د. تحديث `src/routes/sitemap[.]xml.ts`
- توليد URL لكل لغة لكل صفحة
- استخدام `xhtml:link rel="alternate"` لكل URL لربطه بنسخه الأخرى:
```xml
<url>
  <loc>https://.../en/services</loc>
  <xhtml:link rel="alternate" hreflang="ar" href="https://.../services"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://.../en/services"/>
  <xhtml:link rel="alternate" hreflang="fr" href="https://.../fr/services"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://.../services"/>
</url>
```
- إضافة `xmlns:xhtml="http://www.w3.org/1999/xhtml"` إلى عنصر urlset

---

## المرحلة 5: محوّل اللغة في NavBar

### `src/components/nexus/NavBar.tsx`
- استبدال زر AR/EN الحالي بقائمة منسدلة (`DropdownMenu`) بثلاث لغات:
  - 🇲🇦 العربية
  - 🇬🇧 English
  - 🇫🇷 Français
- عند التبديل: حساب المسار الجديد `buildLangPath(newLang, currentStrippedPath)` والتنقل إليه عبر `useNavigate`
- جميع الـ `<Link>` في NavBar/Footer تستخدم المسار حسب اللغة الحالية

### `src/components/nexus/Footer.tsx`
- ترجمة أي نصوص متبقية
- روابط الفوتر تتبع اللغة الحالية

---

## المرحلة 6: العملة التلقائية حسب اللغة

### `src/lib/currency.tsx` — تحديث
- إضافة `useEffect` يراقب تغير اللغة
- عند تغيّر اللغة لأول مرة (والمستخدم لم يختر عملة يدوياً)، تتغير العملة:
  - `ar` → MAD
  - `en` → USD
  - `fr` → EUR
- إذا غيّر المستخدم العملة يدوياً، نحفظ ذلك ولا نعيد التغيير تلقائياً (flag في localStorage)

---

## المرحلة 7: إضافات عالمية أساسية

### أ. Cookie Consent Banner (GDPR)
- إنشاء `src/components/nexus/CookieConsent.tsx`
- يظهر مرة واحدة عند أول زيارة، يحفظ الموافقة في cookie
- مترجم بـ 3 لغات
- يضاف داخل `__root.tsx`

### ب. تحديث `src/routes/robots[.]txt.ts`
- إضافة سطر `Sitemap:` يشير للنطاق الرسمي (موجود بالفعل، نتأكد فقط)

### ج. ملف `.well-known/` — اختياري
- لا نضيفه الآن، يمكن لاحقاً عند الحاجة

---

## ⚠️ مخاطر ونقاط حذر

1. **`routeTree.gen.ts` يُولَّد تلقائياً** — لن نلمسه، لكن ملفات المسارات الجديدة قد تحتاج جولة dev واحدة لإعادة التوليد.
2. **Layout route `$lang`** قد يتعارض مع المسارات الموجودة. سنستخدم regex/validation داخل الـ loader لضمان قبول `en` و `fr` فقط.
3. **حجم القاموس** سيكبر — تنظيمه في ملفات منفصلة تحت `src/lib/i18n-locales/` يحل ذلك.
4. **صفحات `/admin/*`** ستبقى بدون تدويل (داخلية فقط).
5. **روابط قديمة في الـ sitemap وفي النشرات الخارجية** ستبقى تعمل لأن العربية على المسار العاري.

---

## 📊 الترتيب الزمني للتنفيذ

1. ✅ توسيع `i18n.tsx` + إنشاء ملفات الترجمة الثلاثة
2. ✅ ترجمة الصفحات الموجودة (استبدال النصوص بـ `t(...)`)
3. ✅ إنشاء مساعد `src/lib/seo.ts`
4. ✅ إنشاء `$lang` layout + ملفات pass-through
5. ✅ تحديث NavBar بقائمة اللغات + Footer
6. ✅ تحديث sitemap.xml للغات المتعددة
7. ✅ ربط العملة باللغة
8. ✅ Cookie Consent Banner
9. ✅ اختبار يدوي لكل صفحة بكل لغة

---

## 🎯 النتيجة المتوقعة

- ✅ موقع متاح بالكامل بـ 3 لغات
- ✅ Google يفهرس 3 نسخ من كل صفحة (ar/en/fr) مع hreflang صحيح
- ✅ مشاركات السوشيال ميديا تظهر بلغة الزائر
- ✅ Schema.org يحسّن ظهور الموقع في نتائج البحث الغنية
- ✅ زائر فرنسي يرى السعر بـ EUR، أمريكي بـ USD، مغربي بـ MAD
- ✅ امتثال GDPR الأساسي عبر Cookie Consent
- ✅ تجربة عالمية احترافية تنافس Apple/Microsoft في البنية

