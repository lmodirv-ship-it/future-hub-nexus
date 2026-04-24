import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط والأحكام — نكسس" },
      { name: "description", content: "الشروط والأحكام لاستخدام منصة نكسس وخدماتها." },
      { property: "og:title", content: "الشروط والأحكام — نكسس" },
      { property: "og:description", content: "الشروط والأحكام لاستخدام منصة نكسس وخدماتها." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20">
      <div className="glass rounded-2xl p-8 md:p-12">
        <h1 className="font-display text-4xl font-bold neon-text">الشروط والأحكام</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString("ar")}
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-foreground/90">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. القبول بالشروط</h2>
            <p>
              باستخدامك لمنصة نكسس (&quot;الخدمة&quot;)، فإنك توافق على الالتزام بهذه الشروط
              والأحكام. إذا لم توافق على أي جزء منها، يُرجى عدم استخدام الخدمة.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. وصف الخدمة</h2>
            <p>
              تقدّم نكسس منصة لإدارة ومراقبة المشاريع الرقمية، تشمل خططاً مدفوعة لمراقبة
              المواقع، وسوقاً للقوالب الجاهزة، وخدمات تطوير مخصصة.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. الحساب والتسجيل</h2>
            <p>
              يجب أن تكون المعلومات التي تقدّمها عند التسجيل دقيقة وكاملة. أنت مسؤول عن
              الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. المدفوعات والاشتراكات</h2>
            <p>
              تُعالج المدفوعات عبر مزوّد دفع طرف ثالث (Paddle). الاشتراكات تتجدد تلقائياً
              في نهاية كل دورة فوترة ما لم يتم إلغاؤها قبل تاريخ التجديد. الأسعار قد تتغيّر
              مع إشعار مسبق.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. سياسة الاسترداد</h2>
            <p>
              يحق لك طلب استرداد المبلغ خلال 14 يوماً من تاريخ الشراء للقوالب التي لم
              يتم تنزيلها، وللاشتراكات الجديدة فقط. الاسترداد بعد ذلك يخضع لتقدير فريقنا.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. الملكية الفكرية</h2>
            <p>
              جميع المحتويات والقوالب والأكواد المقدّمة عبر الخدمة محمية بموجب قوانين
              الملكية الفكرية. يُمنح المشتري ترخيص استخدام شخصي/تجاري وفق شروط كل منتج.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. الاستخدام المقبول</h2>
            <p>
              يُمنع استخدام الخدمة لأي أنشطة غير قانونية، أو إرسال محتوى ضار، أو محاولة
              اختراق البنية التحتية، أو إساءة استخدام واجهات البرمجة.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">8. إخلاء المسؤولية</h2>
            <p>
              تُقدَّم الخدمة &quot;كما هي&quot; دون أي ضمانات صريحة أو ضمنية. لا نضمن أن
              الخدمة ستكون متاحة دائماً أو خالية تماماً من الأخطاء.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">9. تعديل الشروط</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستُنشر التحديثات على هذه الصفحة
              مع تحديث تاريخ &quot;آخر تحديث&quot;.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">10. التواصل</h2>
            <p>
              لأي استفسار حول هذه الشروط، تواصل معنا عبر صفحة{" "}
              <a href="/contact" className="text-primary underline">التواصل</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
