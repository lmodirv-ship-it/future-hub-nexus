import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { NavBar } from "@/components/nexus/NavBar";
import { Footer } from "@/components/nexus/Footer";
import { AuroraBackground } from "@/components/nexus/AuroraBackground";
import { CookieConsent } from "@/components/nexus/CookieConsent";
// touch: force module re-resolution
import { I18nProvider, getLangFromPath, useI18n } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { useEffect } from "react";

function NotFoundComponent() {
  return (
    <>
      <AuroraBackground />
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass max-w-md rounded-2xl p-10 text-center">
          <h1 className="font-display text-7xl font-bold neon-text">404</h1>
          <h2 className="mt-4 font-display text-xl font-semibold">الصفحة غير موجودة</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            الصفحة التي تبحث عنها لم تعد موجودة في هذا الفضاء.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-5 py-2.5 text-sm font-medium text-background neon-glow"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "HN-Dev" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "HN-Dev" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://www.google.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteSchema()),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <CurrencyProvider>
        <HtmlLangSync />
        <AuroraBackground />
        <NavBar />
        <main className="relative">
          <Outlet />
        </main>
        <Footer />
        <CookieConsent />
      </CurrencyProvider>
    </I18nProvider>
  );
}

/** Keeps <html lang> and <html dir> in sync with the URL/i18n state. */
function HtmlLangSync() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang } = useI18n();
  useEffect(() => {
    const urlLang = getLangFromPath(pathname);
    const seg = pathname.split("/")[1];
    if ((seg === "en" || seg === "fr") && urlLang !== lang) {
      setLang(urlLang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [pathname, lang, setLang]);
  return null;
}
