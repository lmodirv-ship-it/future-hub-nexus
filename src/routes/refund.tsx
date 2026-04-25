import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "سياسة الاسترداد — HN-Dev" },
      { name: "description", content: "سياسة الاسترداد لاشتراكات HN-Dev وقوالب السوق." },
      { property: "og:title", content: "سياسة الاسترداد — HN-Dev" },
      { property: "og:description", content: "سياسة الاسترداد لاشتراكات HN-Dev وقوالب السوق." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <div className="glass rounded-2xl p-8 md:p-12">
        <h1 className="font-display text-4xl font-bold neon-text">سياسة الاسترداد</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString("ar")}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/90">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. مبدأ عام</h2>
            <p>
              نسعى لرضاك التام. توضّح هذه السياسة متى يحق لك طلب استرداد المبلغ المدفوع
              عبر منصة HN-Dev، والشروط والمدد المعتمدة. تُعالَج جميع المدفوعات وعمليات
              الاسترداد عبر مزوّدنا الرسمي <strong>Paddle</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. الاشتراكات (خطط المراقبة)</h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>
                <strong>ضمان 14 يوماً:</strong> يحق لك طلب استرداد كامل خلال 14 يوماً من
                أول عملية اشتراك، شرط ألا يكون قد تم استهلاك جزء كبير من الخدمة.
              </li>
              <li>
                <strong>التجديدات:</strong> طلبات الاسترداد على دفعات التجديد التلقائي
                تُقبل خلال 7 أيام من تاريخ الفوترة إذا لم يتم استخدام ميزات الخطة بشكل
                ملحوظ في تلك الدورة.
              </li>
              <li>
                <strong>الإلغاء:</strong> يمكنك إلغاء الاشتراك في أي وقت من لوحة التحكم،
                ويبقى نشطاً حتى نهاية الدورة المدفوعة دون أي رسوم إضافية.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. قوالب السوق (Marketplace)</h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>
                <strong>قبل التنزيل:</strong> استرداد كامل خلال 14 يوماً ما لم يتم تنزيل
                ملفات القالب أو استخدام رمز التنزيل.
              </li>
              <li>
                <strong>بعد التنزيل:</strong> نظراً للطبيعة الرقمية للمنتج، لا يُسترد
                المبلغ بعد التنزيل إلا في حالات خاصة (عيب جوهري لا يمكن إصلاحه، أو
                وصف مضلِّل).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. خدمات التطوير المخصصة</h2>
            <p>
              تخضع لاتفاق منفصل يُحدِّد مراحل الدفع والتسليم. يحق لك استرداد ما لم
              يُنفَّذ من العمل وفق ذلك الاتفاق. الأعمال المسلَّمة والمقبولة لا تُسترد.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. حالات لا تشملها السياسة</h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>تغيير الرأي بعد استخدام واسع للخدمة خلال نفس الدورة.</li>
              <li>مخالفة شروط الاستخدام أو الاستخدام المسيء للمنصة.</li>
              <li>المشاكل الناتجة عن طرف ثالث خارج عن سيطرتنا.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. كيفية طلب الاسترداد</h2>
            <ol className="list-decimal pr-5 space-y-2">
              <li>تواصل معنا عبر صفحة <a href="/contact" className="text-primary underline">التواصل</a> مع رقم الفاتورة وسبب الطلب.</li>
              <li>سنردّ خلال 3 أيام عمل بقرار الموافقة أو طلب توضيحات.</li>
              <li>عند الموافقة، يصلك المبلغ خلال 5–10 أيام عمل عبر نفس وسيلة الدفع الأصلية.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. تعديل السياسة</h2>
            <p>
              قد نحدّث هذه السياسة من وقت لآخر. الإصدار الساري هو المعروض على هذه الصفحة
              مع تاريخ &quot;آخر تحديث&quot; أعلاه.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
