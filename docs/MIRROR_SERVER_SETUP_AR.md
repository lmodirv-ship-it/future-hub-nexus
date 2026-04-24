# 🖥️ إعداد سيرفر المرايا (Mirror Server)

سيرفر مركزي **منفصل** يستقبل نسخاً من أكواد مشاريعك من GitHub.
**لا يستضيف أي دومين** — فقط مرايا للأكواد + خدمة API للتحكم.

## السيرفر المُوصى به

- **LWS VPS-119874** — `213.156.133.94`
- 8GB RAM / 150GB SSD
- Debian / Ubuntu LTS

> ⚠️ **مهم**: لا تستعمل السيرفر الذي يستضيف موقعاً منشوراً.

## التثبيت — خطوة بخطوة

### 1. اتصل بالسيرفر

```bash
ssh root@213.156.133.94
```

### 2. حمّل سكريبتات المشروع

استنسخ المشروع (أو انسخ مجلد `scripts/control-server/` فقط):

```bash
cd /tmp
git clone https://github.com/<your-user>/future-hub-nexus.git
cd future-hub-nexus/scripts/control-server
```

### 3. شغّل المثبّت

```bash
sudo bash install-mirror-server.sh
```

سيقوم السكريبت بـ:
- ✅ تحديث النظام
- ✅ تثبيت Node.js LTS + git + ufw
- ✅ إنشاء مستخدم خدمة `nexus`
- ✅ تجهيز `/srv/mirrors/` (للأكواد) و `/srv/control-api/` (للخدمة)
- ✅ توليد **CONTROL_API_TOKEN** عشوائي وحفظه في `.env`
- ✅ تثبيت خدمة systemd لتشغيل API دائماً
- ✅ تفعيل جدار الحماية UFW (SSH فقط)

في النهاية ستحصل على **TOKEN** — انسخه واحفظه في مكان آمن.

### 4. تحقّق

```bash
curl http://localhost:8787/health
# {"ok":true,"time":"..."}

systemctl status control-api
journalctl -u control-api -f
```

### 5. (اختياري) افتح المنفذ للوصول من Lovable

إذا أردت أن تستدعي Lovable السيرفر مباشرة:

```bash
sudo ufw allow 8787/tcp
```

ثم احفظ الـ TOKEN كسر في **Lovable Cloud**:
- اذهب إلى Lovable → Connectors → Lovable Cloud → Secrets
- أضف: `CONTROL_API_TOKEN` = القيمة المُولّدة
- وأيضاً: `MIRROR_SERVER_URL` = `http://213.156.133.94:8787`

> 🔒 **توصية أمنية**: استخدم HTTPS عبر Caddy/Nginx + Let's Encrypt على
> دومين فرعي مثل `control.example.com` بدل HTTP المباشر.

## التحقق من المرايا

بعد إضافة موقع وتفعيل المزامنة:

```bash
ls -lah /srv/mirrors/
# هنا تجد كل المشاريع المُمَرآة

sudo -u nexus git -C /srv/mirrors/<project-name> log -5 --oneline
```

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| `control-api` لا يبدأ | `journalctl -u control-api -n 50` |
| 401 Unauthorized | تحقّق من تطابق `CONTROL_API_TOKEN` |
| `git clone` يفشل | السيرفر يحتاج مفتاح SSH أو PAT لـ repos خاصة |
| المنفذ 8787 لا يستجيب | `sudo ufw status` و `ss -tlnp \| grep 8787` |

## التوقّف الآمن

```bash
sudo systemctl stop control-api
sudo systemctl disable control-api
```

لن يؤثر هذا على أي موقع منشور.