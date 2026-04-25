import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import hnLogo from "@/assets/hn-groupe-logo.png";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative mt-32 border-t border-white/10 pb-8 pt-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={hnLogo} alt="HN-Groupe" className="h-9 w-9 rounded-xl object-cover" />
              <span className="font-display text-lg font-bold neon-text">HN-Dev</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/projects" className="hover:text-foreground">{t("nav.projects")}</Link></li>
              <li><Link to="/services" className="hover:text-foreground">{t("nav.services")}</Link></li>
              <li><Link to="/admin" className="hover:text-foreground">{t("nav.admin")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">{t("footer.ecosystem")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">{t("nav.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display font-semibold">{t("footer.follow")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("footer.followText")}
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} {t("footer.rights")}</span>
          <span>{t("footer.made")}</span>
        </div>
      </div>
    </footer>
  );
}