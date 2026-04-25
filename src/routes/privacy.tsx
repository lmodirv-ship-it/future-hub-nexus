import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — HN-Dev" },
      { name: "description", content: "كيف تجمع HN-Dev بياناتك وتستخدمها وتحميها." },
      { property: "og:title", content: "سياسة الخصوصية — HN-Dev" },
      { property: "og:description", content: "كيف تجمع HN-Dev بياناتك وتستخدمها وتحميها." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <div className="glass rounded-2xl p-8 md:p-12">
        <h1 className="font-display text-4xl font-bold neon-text">سياسة الخصوصية</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString("ar")}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/90">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. مقدمة</h2>
            <p>
              تحترم HN-Dev خصوصيتك. توضّح هذه السياسة أنواع البيانات التي نجمعها عند
              استخدامك للمنصة، وكيفية استخدامها وحمايتها ومشاركتها.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. البيانات التي نجمعها</h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>بيانات الحساب: الاسم، البريد الإلكتروني، كلمة مرور مشفّرة.</li>
              <li>بيانات الدفع: تُعالَج بالكامل عبر Paddle، ولا نخزّن بيانات بطاقتك.</li>
              <li>بيانات الاستخدام: إحصاءات زيارات وأداء المشاريع التي تربطها بالمنصة.</li>
              <li>بيانات تقنية: عنوان IP، نوع المتصفح، نظام التشغيل، وسجلات الأخطاء.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. كيف نستخدم بياناتك</h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>تشغيل الخدمة وتقديم الميزات التي اشتركت فيها.</li>
              <li>إرسال إشعارات الفوترة، التنبيهات الفنية، وتحديثات الخدمة.</li>
              <li>تحسين الأداء وكشف الاستخدام المسيء أو الاحتيال.</li>
              <li>الامتثال للالتزامات القانونية.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. مشاركة البيانات</h2>
            <p>
              لا نبيع بياناتك. نشاركها فقط مع مزوّدي خدمات موثوقين لأغراض التشغيل،
              وأبرزهم: <strong>Paddle</strong> (المدفوعات والفوترة)،
              <strong> Supabase / Lovable Cloud</strong> (الاستضافة وقاعدة البيانات)،
              ومزوّدو البريد لإرسال الإشعارات.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم كوكيز ضرورية لتسجيل الدخول وتذكّر تفضيلاتك (اللغة، العملة)،
              وكوكيز تحليلية لفهم استخدام المنصة وتحسينها.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. أمان البيانات</h2>
            <p>
              نطبّق إجراءات تقنية وتنظيمية لحماية بياناتك، تشمل التشفير أثناء النقل
              (HTTPS)، وسياسات وصول صارمة (Row Level Security)، ونسخاً احتياطية منتظمة.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. مدة الاحتفاظ</h2>
            <p>
              نحتفظ ببياناتك طالما حسابك نشط أو حسب ما يلزم لتقديم الخدمة. عند حذف
              الحساب، تُحذف بياناتك خلال 30 يوماً، باستثناء ما يلزمنا الاحتفاظ به قانونياً
              (سجلات الفوترة).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">8. حقوقك</h2>
            <p>
              يحق لك الوصول إلى بياناتك، تعديلها، طلب حذفها، أو سحب موافقتك على
              المعالجة، وذلك وفق القوانين المعمول بها (مثل GDPR). للتقديم على أي طلب،
              تواصل معنا.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">9. خصوصية الأطفال</h2>
            <p>
              الخدمة غير موجّهة لمن هم دون 16 عاماً، ولا نجمع بياناتهم عمداً.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">10. تحديث السياسة</h2>
            <p>
              قد نحدّث هذه السياسة من وقت لآخر. ستُنشر التحديثات على هذه الصفحة مع
              تحديث تاريخ &quot;آخر تحديث&quot; أعلاه.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">11. التواصل</h2>
            <p>
              لأي سؤال حول الخصوصية، تواصل معنا عبر صفحة{" "}
              <a href="/contact" className="text-primary underline">التواصل</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
