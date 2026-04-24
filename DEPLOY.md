# 🚀 دليل النشر على سيرفرك الخاص

هذا الدليل يشرح كيفية تشغيل تطبيق **نكسس** على سيرفر VPS خاص باستخدام Docker، مع نشر تلقائي عند كل تحديث في Lovable.

---

## 📋 المعمارية

```
Lovable (تطوير) → GitHub (تخزين الكود) → GitHub Actions → سيرفرك (إنتاج)
                                                              │
                                                  ┌───────────┴───────────┐
                                                  │  Nginx (المنفذ 80)    │
                                                  │      ↓                │
                                                  │  Wrangler (المنفذ 3000)│
                                                  │  (worker bundle)      │
                                                  │      ↓                │
                                                  │  Lovable Cloud (DB)   │
                                                  └───────────────────────┘
```

> **ملاحظة تقنية**: المشروع مبني لـ Cloudflare Workers (هذا ما يولّده `vite build`).
> داخل الحاوية نشغّله بـ **Wrangler** في وضع `--local` (يستخدم محرك `workerd`).
> النتيجة: نفس السلوك تماماً كنشره على Cloudflare — لكن على VPS الخاص بك.

---

## ✅ المتطلبات على السيرفر

- **نظام**: Ubuntu 22.04 أو أحدث
- **RAM**: 2 GB كحد أدنى (4 GB موصى به)
- **Disk**: 20 GB كحد أدنى
- **مثبَّت مسبقاً**: Docker + Docker Compose + Git

تحقق من التثبيت:
```bash
docker --version
docker compose version
git --version
```

---

## 🔧 الإعداد لأول مرة (مرة واحدة فقط)

### 1. اتصل بالسيرفر كمستخدم `deploy`

```bash
ssh deploy@YOUR_SERVER_IP
```

### 2. احذف أي ملف `.env` قديم في المجلد الرئيسي

```bash
rm -f ~/.env
```

### 3. استنسخ المشروع من GitHub

```bash
mkdir -p ~/app && cd ~/app
git clone https://github.com/lmodirv-ship-it/future-hub-nexus.git .
```

### 4. أنشئ ملف `.env` من القالب

```bash
cp .env.example .env
```

### 5. عدّل القيم السرية

```bash
nano .env
```

غيّر هذين السطرين فقط:
```
SUPABASE_SERVICE_ROLE_KEY=<انسخها من Lovable: Cloud → Secrets>
LOVABLE_API_KEY=<انسخها من Lovable: Cloud → Secrets>
```

احفظ بـ `Ctrl+O` ثم `Enter` ثم `Ctrl+X` للخروج.

### 6. شغّل التطبيق لأول مرة

```bash
docker compose up -d --build
```

⏱️ أول بناء يأخذ 3-5 دقائق. الـ builds اللاحقة أسرع بكثير (cache).

### 7. تأكد من نجاح التشغيل

```bash
docker compose ps
docker compose logs -f app
```

يجب أن ترى في السجلات سطراً مثل:
```
[wrangler:info] Ready on http://0.0.0.0:3000
```

✅ افتح المتصفح على: **`http://YOUR_SERVER_IP`** ويجب أن يظهر الموقع.

---

## 🔄 النشر التلقائي (بعد الإعداد الأول)

من الآن فصاعداً:

1. أي تعديل في **Lovable** → يُدفع تلقائياً إلى **GitHub**
2. **GitHub Actions** يلتقط الـ push ويتصل بسيرفرك عبر SSH
3. السيرفر يسحب التحديثات ويُعيد بناء الحاويات تلقائياً
4. الموقع يصبح live خلال 2-3 دقائق ✨

**لست بحاجة لفعل أي شيء يدوياً بعد الإعداد الأول.**

---

## 📊 المراقبة والصيانة

### عرض السجلات الحية
```bash
cd ~/app
docker compose logs -f app      # سجلات التطبيق
docker compose logs -f nginx    # سجلات Nginx
docker compose logs -f          # كل السجلات
```

### إعادة تشغيل
```bash
docker compose restart
```

### إيقاف كامل
```bash
docker compose down
```

### بناء يدوي + تشغيل
```bash
git pull origin main
docker compose up -d --build
```

### فحص استخدام الموارد
```bash
docker stats
```

### تنظيف الصور القديمة
```bash
docker image prune -af
docker volume prune -f
```

---

## 🔒 إضافة دومين + SSL (اختياري لاحقاً)

عندما تكون جاهزاً لربط دومين:

### 1. أضف A Record في DNS
```
Type: A   Name: @     Value: YOUR_SERVER_IP
Type: A   Name: www   Value: YOUR_SERVER_IP
```

انتظر 5-10 دقائق لانتشار DNS.

### 2. ثبّت Certbot على السيرفر

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 3. أوقف Nginx مؤقتاً

```bash
cd ~/app
docker compose stop nginx
```

### 4. احصل على شهادة SSL

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 5. حدّث `nginx/nginx.conf` لدعم HTTPS

اطلب من Lovable: *"أضف دعم SSL في nginx.conf لدومين yourdomain.com"*.

### 6. أعد تشغيل
```bash
docker compose up -d
```

### 7. تجديد تلقائي
```bash
sudo crontab -e
# أضف هذا السطر:
0 3 * * * certbot renew --quiet && cd /home/deploy/app && docker compose restart nginx
```

---

## 🆘 استكشاف الأخطاء

### الموقع لا يفتح بعد التشغيل

```bash
# تحقق أن الحاويات شغالة
docker compose ps

# تحقق من السجلات
docker compose logs app | tail -50
docker compose logs nginx | tail -50

# تحقق أن المنفذ 80 مفتوح
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### خطأ "Port 80 already in use"

شيء آخر يستخدم المنفذ 80 (مثل Apache أو Nginx مثبت بشكل مباشر):
```bash
sudo systemctl stop apache2 nginx
sudo systemctl disable apache2 nginx
docker compose up -d
```

### GitHub Actions يفشل بـ "Permission denied"

تأكد من:
1. أن الـ 4 Secrets مضافة بشكل صحيح في GitHub
2. أن المفتاح العام `~/.ssh/github_deploy.pub` موجود في `~/.ssh/authorized_keys`
3. أن المستخدم `deploy` عضو في مجموعة `docker`:
   ```bash
   sudo usermod -aG docker deploy
   ```
   (يحتاج تسجيل خروج ودخول لتطبيق التغيير)

### البناء فاشل مع "out of memory"

السيرفر صغير جداً. زِد الـ swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### أريد إعادة البناء من الصفر

```bash
cd ~/app
docker compose down -v
docker system prune -af --volumes
docker compose up -d --build
```

---

## 🌐 نشر عدة دومينات على نفس السيرفر

أضف خدمة nginx جديدة في `docker-compose.yml` لكل دومين، أو عدّل `nginx.conf` لإضافة `server` blocks متعددة. اطلب من Lovable: *"أضف دومين ثانٍ لنفس السيرفر"*.

---

## 📞 الدعم

- الكود: https://github.com/lmodirv-ship-it/future-hub-nexus
- المطور: عبر Lovable
