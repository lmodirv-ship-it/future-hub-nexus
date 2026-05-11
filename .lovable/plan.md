## الهدف

ربط جميع المواقع الـ20 بـ hnChat بحيث:
1. **المواقع التي عندها blog** → تجلب مقالات hnChat وتعرضها (مدمجة مع مقالاتها).
2. **المواقع التي ما عندها blog** → ننشئ صفحة `/blog` جديدة + زر "المدونة" في القائمة.
3. **اختياري**: عند نشر مقال جديد في أي موقع، يُرسَل تلقائياً لـ hnChat باستخدام `HNCHAT_BLOG_SECRET`.

كل شيء **إضافي فقط** — لا حذف، لا تعديل لأي صفحة موجودة (التزام بقاعدة `mem://constraints/no-destructive-ops`).

---

## الخطة

### 1. صفحة Toolkit مركزية في HN-Dev
ملف جديد: `src/routes/admin.hnchat-kit.tsx` (مثل `adsense-kit`)
يحتوي على:
- **Snippet 1 — قارئ المقالات** (يُلصق في صفحة blog أو صفحة جديدة):
  - مكوّن React يجلب من `https://hn-chat.com/api/public/articles` ويعرض البطاقات.
- **Snippet 2 — صفحة blog كاملة** للمواقع التي ما عندها واحدة (route file جاهز للصق في `src/routes/blog.tsx`).
- **Snippet 3 — رابط "المدونة"** للقائمة (`<Link to="/blog">المدونة</Link>`).
- **Snippet 4 — ناشر تلقائي** (دالة `publishToHnChat()` تستدعي `POST /api/public/articles` مع الهيدر `x-blog-secret`).
- **Prompt جاهز للصق في Lovable** بكل موقع: "أضف صفحة /blog فقط، لا تعدّل أي صفحة أخرى".

جدول حالة لكل مشروع (من `lovable_projects`): هل عنده blog؟ هل تم تركيب الـ kit؟ — مع toggle يدوي.

### 2. حقول جديدة في `lovable_projects` (إضافية فقط)
عبر migration:
- `has_blog boolean default false`
- `hnchat_kit_installed boolean default false`

### 3. سر `HNCHAT_BLOG_SECRET`
نطلب من المستخدم إضافته عبر `add_secret` (لاستخدامه لاحقاً إذا أردنا proxy للنشر من HN-Dev، لكن الكود الفعلي للنشر سيعيش في كل موقع ويستخدم سرّه المحلي).

### 4. (اختياري لاحقاً) Auto-inject عبر GitHub
زر في `/admin/github-sync` يضيف `src/routes/blog.tsx` للمشاريع التي `has_blog = false` — **بدون لمس** أي ملف موجود (يتحقق أولاً، ثم ينشئ فقط).

---

## ما لن نلمسه

- لا تعديل لأي route موجود في أي موقع.
- لا حذف أي ملف.
- لا تغيير لـ `__root.tsx` أو navigation موجودة (نضيف فقط Link في snippet جاهز للنسخ).

---

## الملفات الجديدة

| ملف | غاية |
|-----|------|
| `supabase/migrations/<ts>_add_blog_flags.sql` | حقلين `has_blog` و `hnchat_kit_installed` |
| `src/routes/admin.hnchat-kit.tsx` | صفحة Toolkit مع كل الـ snippets + جدول الحالة |
| `src/components/admin/AdminLayout.tsx` (تحديث) | إضافة لينك "hnChat Kit" في الشريط الجانبي |

---

## أسئلة قبل التنفيذ

1. **السر `HNCHAT_BLOG_SECRET`**: تريد إضافته الآن في HN-Dev؟ (سيُستخدم فقط إذا بنينا proxy لاحقاً). كل موقع يحتاج إضافته بنفسه أيضاً للنشر.
2. **Auto-inject عبر GitHub**: نضيفها الآن أم نكتفي بالـ Toolkit للنسخ اليدوي في هذه الجولة؟
