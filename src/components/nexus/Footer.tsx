import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/10 pb-8 pt-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <span className="font-display text-lg font-bold neon-text">نكسس</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              مركز تحكم موحد لكل مشاريعك الرقمية في فضاء واحد من المستقبل.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">المنصة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/projects" className="hover:text-foreground">المشاريع</Link></li>
              <li><Link to="/services" className="hover:text-foreground">الخدمات</Link></li>
              <li><Link to="/admin" className="hover:text-foreground">لوحة التحكم</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">المنظومة</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">عن المنصة</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">تواصل</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">تابعنا</h4>
            <p className="text-sm text-muted-foreground">
              صُمم بإتقان على Lovable — كل المشاريع في مكان واحد.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} نكسس. جميع الحقوق محفوظة.</span>
          <span>صُنع بـ ✦ في عالم رقمي بلا حدود</span>
        </div>
      </div>
    </footer>
  );
}