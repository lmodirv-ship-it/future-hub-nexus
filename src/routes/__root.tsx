import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { NavBar } from "@/components/nexus/NavBar";
import { Footer } from "@/components/nexus/Footer";
import { AuroraBackground } from "@/components/nexus/AuroraBackground";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";

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
      { title: "HN-Dev — مركز التحكم لكل مشاريعك" },
      { name: "description", content: "منصة زجاجية من المستقبل تجمع كل مشاريعك الرقمية في فضاء واحد." },
      { name: "author", content: "HN-Dev" },
      { property: "og:title", content: "HN-Dev — مركز التحكم لكل مشاريعك" },
      { property: "og:description", content: "منصة زجاجية من المستقبل تجمع كل مشاريعك الرقمية في فضاء واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "HN-Dev — مركز التحكم لكل مشاريعك" },
      { name: "twitter:description", content: "منصة زجاجية من المستقبل تجمع كل مشاريعك الرقمية في فضاء واحد." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/49391f56-cbde-4fc7-b51b-79b95eebc3ee/id-preview-8f8a00d5--6c0d65e5-805e-4e64-8a3b-4a6f2c47f81f.lovable.app-1776692597292.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/49391f56-cbde-4fc7-b51b-79b95eebc3ee/id-preview-8f8a00d5--6c0d65e5-805e-4e64-8a3b-4a6f2c47f81f.lovable.app-1776692597292.png" },
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
        <AuroraBackground />
        <NavBar />
        <main className="relative">
          <Outlet />
        </main>
        <Footer />
      </CurrencyProvider>
    </I18nProvider>
  );
}
