

# منصة "Glass Nexus" — موقع زجاجي من المستقبل يجمع كل مشاريعك

سأبني منصة واحدة موحدة تجمع جميع مشاريعك الـ 14 على Lovable في واجهة واحدة تبدو وكأنها من المستقبل: زجاج شفاف، إضاءات نيون، حركات سلسة، خلفيات متحركة ثلاثية الأبعاد. الموقع سيكون بمثابة "مركز التحكم" (Command Center) لكل أعمالك.

## المشاريع التي سيتم تجميعها (14 مشروع)

| # | المشروع | الفئة | الرابط |
|---|---------|-------|--------|
| 1 | AI Studio Vision | ذكاء اصطناعي / فيديو | hn-videoai |
| 2 | AI Scene Studio | ذكاء اصطناعي / مشاهد | hn-aivideo |
| 3 | hn-cima | سينما / ترفيه | hn-vi |
| 4 | Souk-HN Express | تجارة إلكترونية | souk-hn |
| 5 | Agency Hub Pro | عقارات / وكالات | hn-immobiler |
| 6 | Profitable Ventures Hub | أعمال / استثمار | income-igniter-ide |
| 7 | HN Driver | نقل / توصيل | smooth-route-guide |
| 8 | Smart Solutions Hub | حلول ذكية | hn-gr |
| 9 | Grand Tanger Print Studio | طباعة / تصميم | tangier-print-hub |
| 10 | CarWashManager | خدمات سيارات | hn-carwash |
| 11 | Remix CarWashManager | خدمات سيارات | wash-pal-app |
| 12 | Create New Project | استوديو | studio-hn |
| 13 | Domain Monitor | مراقبة نطاقات | — |
| 14 | Cloud Harmony | سحابة | — |

## الهوية البصرية — "Glass from the Future"

- **خلفية**: أسود فضائي عميق (#05060A) مع طبقات Aurora متحركة (بنفسجي/سماوي/وردي) باستخدام CSS gradients + blur
- **البطاقات**: زجاج حقيقي (`backdrop-filter: blur(24px)` + حدود نيون رفيعة + reflections داخلية)
- **التوهج**: حواف نيون متغيرة الألوان عند التحويم (cyan → magenta → violet)
- **حركات**: parallax عند التمرير، tilt 3D للبطاقات عند المرور بالماوس، شبكة نقاط متحركة في الخلفية
- **الخط**: Inter للنصوص + Space Grotesk للعناوين، مع دعم RTL كامل للعربية
- **اللغة**: عربية كاملة مع اتجاه RTL (الواجهة بلسان عربي مستقبلي)

## بنية الموقع (الصفحات)

```text
/                  → الصفحة الرئيسية (Hero فضائي + شبكة المشاريع الـ 14)
/projects          → استعراض كامل بفلترة حسب الفئة + بحث فوري
/projects/$slug    → صفحة تفاصيل لكل مشروع (وصف + لقطات + زر "افتح المشروع")
/dashboard         → لوحة تحكم موحدة (إحصائيات لكل مشروع، روابط سريعة)
/services          → كل الخدمات المُجمَّعة من المشاريع في مكان واحد
/about             → قصة المنصة والرؤية
/contact           → تواصل + AI assistant مدمج
```

## المكونات الرئيسية

1. **HeroNexus** — بطل الصفحة: عنوان عملاق "نكسس — كل مشاريعك في مكان واحد"، خلفية aurora متحركة، عداد حي للمشاريع
2. **ProjectGrid** — شبكة بطاقات زجاجية للمشاريع الـ 14 مع أيقونة + وصف + شارة الفئة + زر فتح
3. **ProjectCard** — بطاقة زجاجية بتأثير tilt 3D وتوهج نيون عند التحويم
4. **CategoryFilter** — أزرار زجاجية للتصفية: AI، تجارة، خدمات، نقل، طباعة، عقارات
5. **GlobalSearch** — شريط بحث (⌘K) للوصول السريع لأي مشروع
6. **NavBar** — شريط علوي زجاجي عائم مع شعار + روابط + مبدّل لغة
7. **AuroraBackground** — مكون خلفية متحركة (CSS pure، خفيف على الأداء)
8. **StatsBar** — عدّادات حية: 14 مشروع، X خدمة، Y مستخدم
9. **ServicesShowcase** — عرض موحد لكل الخدمات المستخرجة من المشاريع
10. **Footer** — تذييل زجاجي بسيط

## بيانات المشاريع

سأنشئ ملف `src/data/projects.ts` يحوي كائنًا لكل مشروع (id، slug، اسم عربي، وصف، فئة، رابط، أيقونة Lucide، لون توهج). كل البيانات ثابتة TypeScript — لا حاجة لقاعدة بيانات في هذه المرحلة.

## التفاصيل التقنية

- **Stack**: TanStack Start (موجود) + Tailwind v4 + shadcn/ui
- **Routing**: ملفات منفصلة لكل صفحة في `src/routes/` (لـ SSR/SEO صحيح)
- **RTL**: `dir="rtl"` على `<html>` في `__root.tsx` + خطوط عربية من Google Fonts
- **الحركات**: Tailwind animations + CSS transforms (لا مكتبات ثقيلة)
- **الأيقونات**: lucide-react (موجود)
- **الأداء**: كل التأثيرات CSS-only، لا canvas/WebGL ثقيل
- **SEO**: head() مخصص لكل route مع og:title/description بالعربية
- **التوسعة**: لاحقًا يمكن إضافة Lovable Cloud + Auth لربط حقيقي بالمشاريع

## ملفات سيتم إنشاؤها

```text
src/
  routes/
    __root.tsx           (تحديث: RTL + خطوط + AuroraBackground)
    index.tsx            (استبدال placeholder بالصفحة الرئيسية)
    projects.tsx         (جديد)
    projects.$slug.tsx   (جديد)
    dashboard.tsx        (جديد)
    services.tsx         (جديد)
    about.tsx            (جديد)
    contact.tsx          (جديد)
  components/
    nexus/
      NavBar.tsx
      HeroNexus.tsx
      ProjectGrid.tsx
      ProjectCard.tsx
      CategoryFilter.tsx
      GlobalSearch.tsx
      AuroraBackground.tsx
      StatsBar.tsx
      ServicesShowcase.tsx
      Footer.tsx
  data/
    projects.ts          (بيانات الـ 14 مشروع)
    services.ts          (الخدمات المُجمَّعة)
  styles.css             (تحديث: ألوان نيون + glass tokens + RTL)
```

## ما لن يُحذف

- كل مكونات shadcn/ui الموجودة تبقى كما هي
- بنية TanStack Start الأساسية (router.tsx, __root.tsx shell) تبقى
- فقط `src/routes/index.tsx` placeholder سيُستبدل

## الخطوة التالية بعد الموافقة

أنفّذ كل شيء دفعة واحدة: تحديث styles.css بالنظام الزجاجي → إنشاء بيانات المشاريع → بناء كل المكونات → إنشاء كل الصفحات → تحديث __root.tsx مع RTL وخلفية Aurora.

