
# خطة تحويل الموقع إلى مشروع ناجح يدرّ مداخيل (متوافق مع المغرب 🇲🇦)

## ملاحظة مهمة عن المدفوعات في المغرب

Stripe **غير مدعوم رسمياً للبائعين في المغرب** (لا يمكن فتح حساب Stripe بـ ID مغربي). لكن **Paddle مدعوم بالكامل في المغرب** لأنه يعمل كـ **Merchant of Record** — أنت تبيع لـ Paddle، و Paddle يبيع للعميل النهائي ويحوّل لك الأرباح بالـ USD/EUR إلى:
- حساب بنكي مغربي (تحويل دولي SWIFT)
- أو **Payoneer** / **Wise** (الأسهل والأسرع للمغاربة)

**القرار**: نستخدم **Paddle** كبوابة دفع رئيسية. بديل مغربي محلي: **CMI** (للعملاء المغاربة بالدرهم) — يمكن إضافته لاحقاً كقناة ثانية.

---

## الفكرة الإستراتيجية

تحويل **Future Hub Nexus** من كتالوج إلى **منصة SaaS عربية** بأربع قنوات دخل، كلها تعمل عبر Paddle.

---

## مصادر الدخل (4 قنوات)

### 1) خدمة "مراقبة المواقع" (الأهم — دخل متكرر MRR)
نملك البنية أصلاً (`project_checks` + `alerts` + cron). نحوّلها لـ SaaS:
- **Free**: موقع واحد، فحص كل ساعة
- **Pro — 9$/شهر**: 10 مواقع، فحص كل 5 دقائق، تنبيهات Email
- **Business — 29$/شهر**: 50 موقع، فحص كل دقيقة، تقارير، API، تنبيهات WhatsApp

### 2) سوق القوالب (Marketplace) — دخل One-time
بيع نسخ من مشاريعك الـ14 كقوالب جاهزة:
- 19$ – 99$ لكل قالب
- تسليم فوري عبر رابط download token موقّت

### 3) خدمات احترافية (Done-For-You) — Leads عالية القيمة
- "أنشئ لي موقعاً" — 199$ – 999$
- استشارة ساعة — 49$
- نموذج طلب → جدول `service_requests` → لوحة `/admin/leads`

### 4) رعاية / إعلانات (Sponsored Slots)
- بطاقة مميزة في الصفحة الرئيسية — 49$/شهر
- إدارة من `/admin/sponsorships`

---

## البنية التقنية

### قاعدة البيانات (جداول جديدة + RLS)
```text
plans              (id, name, price_cents, currency, max_sites, check_interval_min, features jsonb)
subscriptions      (id, user_id, plan_id, status, paddle_sub_id, current_period_end)
monitored_sites    (id, user_id, url, name, is_up, last_checked_at)
templates          (id, slug, title, description, price_cents, demo_url, source_url)
template_purchases (id, user_id, template_id, paddle_txn_id, download_token, expires_at)
service_requests   (id, name, email, service_type, budget, message, status)
sponsorships       (id, project_id, starts_at, ends_at, amount_cents, sponsor_name)
```

### تكامل المدفوعات
- استخدام أداة Lovable المدمجة `enable_paddle_payments` (لا تحتاج حساب Paddle شخصي للبدء — Lovable يدير الـ sandbox)
- Edge Functions تلقائية: checkout, subscription, webhook
- Webhook signature verification إجباري
- عند الانتقال للـ live: تتطلب verification من Paddle (مدة 1-3 أيام)

### المسارات الجديدة

**عامة (تدر دخل):**
- `/pricing` — الخطط الثلاثية
- `/marketplace` + `/marketplace/$slug` — القوالب
- `/monitor` — Landing لخدمة المراقبة
- `/services` (تحديث) — نموذج طلب احترافي

**لوحة المشترك `_authenticated`:**
- `/app/sites` — إدارة المواقع المراقَبة
- `/app/billing` — Customer Portal
- `/app/downloads` — القوالب المُشتراة

**إضافات Admin:**
- `/admin/revenue` — MRR + إيرادات + funnel
- `/admin/leads` — طلبات الخدمات
- `/admin/templates` — إدارة القوالب
- `/admin/sponsorships` — إدارة الرعاية

### نظام المراقبة
- cron الحالي يفحص `projects` (للعرض) — يبقى
- cron جديد يفحص `monitored_sites` بحسب `plan.check_interval_min`
- تنبيهات Email عبر **Resend** (متاح كـ connector)

### SEO وجلب الزوار (مجاناً)
- `/sitemap.xml` ديناميكي
- JSON-LD Schema.org لكل قالب/مشروع
- Open Graph + Twitter Card لكل route
- صفحة `/blog` + `/blog/$slug` (مقالات في DB)
- robots.txt

### تحليلات
- جدول `events` (page_view, pricing_view, checkout_start, purchase)
- لوحة `/admin/revenue`: Visitors → Trial → Paid

---

## مراحل التنفيذ

**المرحلة 1 — الدفع + Pricing (الأهم):**
- تشغيل `recommend_payment_provider` ثم `enable_paddle_payments`
- إنشاء `plans` + `subscriptions` + webhook handler
- صفحة `/pricing` تعمل end-to-end (sandbox)

**المرحلة 2 — Marketplace:**
- جداول `templates` + `template_purchases`
- صفحات `/marketplace` + تفاصيل القالب + شراء + تسليم آمن
- زرع 14 مشروع كقوالب أولية

**المرحلة 3 — خدمة المراقبة:**
- `monitored_sites` + cron منفصل + ربط حدود الخطة
- صفحات `/monitor` + `/app/sites`

**المرحلة 4 — الخدمات والـ Leads:**
- `/services` form + `service_requests`
- `/admin/leads`
- إيميل تنبيه للأدمن (Resend)

**المرحلة 5 — SEO + التحليلات + Blog:**
- sitemap + JSON-LD + meta
- `/admin/revenue` dashboard
- `/blog` أساسي

---

## ما سأطلبه أثناء التنفيذ
1. **تفعيل Paddle** (يتطلب **خطة Pro** على Lovable)
2. **Resend connector** للإيميلات
3. (اختياري) **Twilio** لتنبيهات WhatsApp في خطة Business
4. أسعار الخطط النهائية (المقترح أعلاه قابل للتعديل)
5. هل تريد أيضاً قناة دفع مغربية محلية (**CMI**) للعملاء المغاربة بالدرهم؟ يمكن إضافتها كمرحلة 6.

---

## النتيجة المتوقعة
- 💰 دخل متكرر شهرياً (MRR) من اشتراكات المراقبة
- 💵 دخل One-time من بيع القوالب
- 📞 Pipeline من Leads عالية القيمة للخدمات
- 🇲🇦 يعمل من المغرب بدون مشاكل (Paddle MoR)
- 📈 SEO قوي يجلب trafic عضوي مجاني
- 📊 لوحة تحكم تُظهر إيرادات حقيقية

هل أبدأ بالمرحلة 1 (Paddle + Pricing)؟
