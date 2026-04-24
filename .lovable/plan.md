# خطة النشر الذاتي (Self-Hosting) عبر Docker + GitHub Actions

## الإعدادات المعتمدة
- **الدومين**: IP فقط مؤقتاً (HTTP بدون SSL)
- **منفذ التطبيق الداخلي**: `3000`
- **SSL**: لا (يمكن إضافته لاحقاً)
- **قاعدة البيانات**: تبقى على Lovable Cloud

## الملفات التي ستُنشأ (6 ملفات جديدة فقط — لا تعديل على الكود الحالي)

### 1. `Dockerfile`
- مرحلة `builder`: `oven/bun:1` — `bun install` + `bun run build` مع تمرير `VITE_SUPABASE_*` كـ build args
- مرحلة `runner`: `node:20-alpine` خفيفة — تشغّل المخرجات على المنفذ 3000
- `EXPOSE 3000` و `CMD ["node", ".output/server/index.mjs"]`

### 2. `docker-compose.yml`
- خدمة `app`: تبني من `Dockerfile`، تقرأ `.env`، منفذ داخلي 3000
- خدمة `nginx`: `nginx:alpine`، تربط المنفذ 80 الخارجي، تعتمد على `app`
- شبكة `appnet` داخلية
- `restart: unless-stopped` للخدمتين

### 3. `nginx/nginx.conf`
- `upstream app { server app:3000; }`
- `server { listen 80; ... }` يوجّه كل شيء إلى `app`
- رؤوس Proxy + دعم WebSocket/SSE (`Upgrade`, `Connection`)
- `gzip on` للأصول النصية
- رؤوس أمان (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### 4. `.github/workflows/deploy.yml`
- Trigger: `push` على فرع `main`
- خطوات:
  1. `appleboy/ssh-action@v1` يتصل عبر `SERVER_HOST` + `SERVER_USER` + `SERVER_PORT` + `SERVER_SSH_KEY`
  2. على السيرفر: `cd ~/app && git pull origin main`
  3. `docker compose up -d --build`
  4. `docker image prune -f`

### 5. `.env.example`
```
VITE_SUPABASE_URL=https://vuecrydmovopxobamyoz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWNyeWRtb3ZvcHhvYmFteW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODU5OTQsImV4cCI6MjA5MjI2MTk5NH0.o5ESzCORyZlROcPDMKHqa9j73p6Ul9hGI98HgyzyPxU
VITE_SUPABASE_PROJECT_ID=vuecrydmovopxobamyoz
```

### 6. `DEPLOY.md` (دليل عربي)
- متطلبات السيرفر: Docker + Docker Compose + Git
- خطوات التشغيل الأول (clone, .env, up)
- مراقبة السجلات
- إضافة دومين + Let's Encrypt لاحقاً
- استكشاف الأخطاء الشائعة

## ⚠️ ملاحظة حول SSR على Worker vs Node
المشروع الحالي مُعدّ لـ Cloudflare Workers (`wrangler.jsonc`). عند البناء بـ Docker سنستخدم مخرجات Node العادية. إذا فشل البناء بسبب `target: "cloudflare-module"` في `vite.config.ts`، سأضيف خطوة في الـ Dockerfile لاستخدام preset Node أو سأطلب موافقتك لتعديل بسيط في `vite.config.ts` لدعم البيئتين.

## الخطوات بعد إنشاء الملفات
سأعطيك سلسلة أوامر مرتبة لتنفيذها على السيرفر **مرة واحدة**:
```bash
rm -f ~/.env
mkdir -p ~/app && cd ~/app
git clone https://github.com/lmodirv-ship-it/future-hub-nexus.git .
cp .env.example .env
docker compose up -d --build
```
بعدها كل `git push` = نشر تلقائي.

---
**اضغط Approve لبدء إنشاء الملفات.**