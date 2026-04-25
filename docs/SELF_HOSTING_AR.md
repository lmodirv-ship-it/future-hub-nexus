# 🚀 دليل النقل إلى سيرفرك الخاص

نقل **HN-Dev** كاملاً (Frontend + Supabase + قاعدة البيانات) إلى سيرفر Ubuntu خاص.

## 📋 المتطلبات

- سيرفر Ubuntu **22.04** أو **24.04** نظيف
- **4GB RAM** على الأقل + **40GB** قرص
- صلاحية **root** أو `sudo`
- نطاق `slavacall-hiba.online` يشير إلى IP السيرفر (A records)

## ⚡ التثبيت بأمر واحد

```bash
# 1. اتصل بالسيرفر
ssh root@213.156.133.94

# 2. حمّل السكريبت
wget https://raw.githubusercontent.com/<USER>/<REPO>/main/scripts/self-host/install-all.sh
chmod +x install-all.sh

# 3. شغّله (عدّل REPO_URL داخل السكريبت أولاً!)
REPO_URL="https://github.com/<USER>/<REPO>.git" \
  bash install-all.sh slavacall-hiba.online admin@hn-groupe.com
```

يستغرق التثبيت ~10 دقائق ويقوم بـ:

| الخطوة | المكوّن |
|--------|----------|
| 1 | تحديث النظام + UFW |
| 2 | Docker + Compose |
| 3 | Node.js 20 + Bun + PM2 |
| 4 | Supabase Self-Hosted (Postgres + Auth + Storage + Studio) |
| 5 | Clone + Build التطبيق |
| 6 | Nginx + SSL مجاني (Let's Encrypt) |

## 🗄️ نقل البيانات الحالية

بعد اكتمال التثبيت، انقل بياناتك من Lovable Cloud:

### الطريقة 1: عبر Studio (الأسهل)
1. **Lovable**: Cloud → Database → Tables → Export (لكل جدول)
2. **سيرفرك**: افتح `http://213.156.133.94:8000` (Supabase Studio)
3. استورد ملفات CSV في الجداول المقابلة

### الطريقة 2: SQL Dump (الأكمل)
```bash
# على جهازك المحلي
pg_dump "postgresql://...lovable-cloud..." \
  --schema=public --data-only --no-owner > data.sql

# ارفعه للسيرفر
scp data.sql root@213.156.133.94:/tmp/

# على السيرفر
docker exec -i supabase-db psql -U postgres -d postgres < /tmp/data.sql
```

## 🌐 إعداد DNS

في لوحة مزوّد النطاق (Namecheap/Cloudflare/...):

| Type | Name | Value |
|------|------|-------|
| A | @ | `213.156.133.94` |
| A | www | `213.156.133.94` |
| A | api | `213.156.133.94` |

انتظر 5-60 دقيقة للانتشار، ثم أعد:
```bash
certbot --nginx -d slavacall-hiba.online -d www.slavacall-hiba.online -d api.slavacall-hiba.online
```

## 🔄 التحديثات المستقبلية

```bash
cd /srv/hn-dev
git pull
bun install
bun run build
pm2 restart hn-dev
```

## 🆘 استكشاف الأعطال

| المشكلة | الحل |
|---------|------|
| `502 Bad Gateway` | `pm2 logs hn-dev` للتشخيص |
| Supabase لا يبدأ | `cd /srv/supabase && docker compose logs` |
| SSL فشل | تحقق من DNS ثم: `certbot --nginx` |
| التطبيق بطيء | زِد الـ RAM أو أضف Swap |

## ⚠️ ما يفقده التطبيق بعد النقل

- ❌ **Lovable AI Gateway** — تحتاج إضافة `OPENAI_API_KEY` بنفسك
- ❌ تحديثات تلقائية من Lovable
- ❌ زر النشر — استبدل بـ `git pull && pm2 restart`
- ✅ **تحكم كامل** + بياناتك على سيرفرك