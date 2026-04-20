import type { LucideIcon } from "lucide-react";
import {
  Sparkles, Film, Clapperboard, ShoppingBag, Building2, TrendingUp,
  Car, Cpu, Printer, Droplets, Waves, Palette, Globe2, Cloud,
} from "lucide-react";

export type ProjectCategory =
  | "ai"
  | "ecommerce"
  | "realestate"
  | "business"
  | "transport"
  | "services"
  | "design"
  | "studio"
  | "infra";

export interface NexusProject {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  categoryLabel: string;
  url: string;
  icon: LucideIcon;
  glow: "violet" | "cyan" | "magenta" | "pink";
  features: string[];
}

export const CATEGORIES: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "كل المشاريع" },
  { value: "ai", label: "الذكاء الاصطناعي" },
  { value: "ecommerce", label: "تجارة إلكترونية" },
  { value: "realestate", label: "عقارات" },
  { value: "business", label: "أعمال" },
  { value: "transport", label: "نقل" },
  { value: "services", label: "خدمات" },
  { value: "design", label: "تصميم وطباعة" },
  { value: "studio", label: "استوديو" },
  { value: "infra", label: "بنية تحتية" },
];

export const PROJECTS: NexusProject[] = [
  {
    id: "1", slug: "ai-studio-vision", name: "HN AI Studio Vision",
    nameAr: "HN استوديو الرؤية الذكية", tagline: "توليد فيديوهات بالذكاء الاصطناعي",
    description: "منصة متقدمة لإنشاء وتحرير الفيديوهات بالاعتماد على نماذج الذكاء الاصطناعي الحديثة.",
    category: "ai", categoryLabel: "ذكاء اصطناعي", url: "https://hn-videoai.lovable.app",
    icon: Sparkles, glow: "violet",
    features: ["توليد فيديو من النص", "تحرير ذكي", "مكتبة قوالب", "تصدير عالي الجودة"],
  },
  {
    id: "2", slug: "ai-scene-studio", name: "HN AI Scene Studio",
    nameAr: "HN استوديو المشاهد الذكية", tagline: "إنشاء مشاهد سينمائية بالذكاء الاصطناعي",
    description: "أداة لتوليد مشاهد بصرية متكاملة مع تحكم دقيق في الإضاءة والكاميرا.",
    category: "ai", categoryLabel: "ذكاء اصطناعي", url: "https://hn-aivideo.lovable.app",
    icon: Clapperboard, glow: "magenta",
    features: ["مشاهد سينمائية", "تحكم بالكاميرا", "إضاءة ذكية", "تركيب الصوت"],
  },
  {
    id: "3", slug: "hn-cima", name: "HN Cima",
    nameAr: "سينما HN", tagline: "منصة بث الأفلام والمسلسلات",
    description: "منصة ترفيه متكاملة لمشاهدة أحدث الأفلام والمسلسلات بجودة عالية.",
    category: "studio", categoryLabel: "ترفيه", url: "https://hn-vi.lovable.app",
    icon: Film, glow: "pink",
    features: ["مكتبة ضخمة", "جودة 4K", "ترجمة عربية", "قوائم مفضلة"],
  },
  {
    id: "4", slug: "souk-hn", name: "HN Souk Express",
    nameAr: "HN سوق السريع", tagline: "منصة تجارة إلكترونية حديثة",
    description: "متجر إلكتروني متكامل مع نظام دفع آمن وتوصيل سريع.",
    category: "ecommerce", categoryLabel: "تجارة", url: "https://souk-hn.lovable.app",
    icon: ShoppingBag, glow: "cyan",
    features: ["كتالوج ذكي", "دفع متعدد", "تتبع الطلبات", "تقييمات المستخدمين"],
  },
  {
    id: "5", slug: "agency-hub-pro", name: "HN Agency Hub Pro",
    nameAr: "HN وكالة العقارات الاحترافية", tagline: "إدارة العقارات والوكالات",
    description: "منصة شاملة لإدارة العقارات وعرضها مع أدوات تسويقية متقدمة.",
    category: "realestate", categoryLabel: "عقارات", url: "https://hn-immobiler.lovable.app",
    icon: Building2, glow: "violet",
    features: ["إدراج العقارات", "بحث متقدم", "جولة افتراضية", "إدارة العملاء"],
  },
  {
    id: "6", slug: "profitable-ventures", name: "HN Profitable Ventures",
    nameAr: "HN مركز المشاريع المربحة", tagline: "اكتشف فرص الاستثمار الذكية",
    description: "منصة تحليلية لاكتشاف وتقييم المشاريع الاستثمارية المربحة.",
    category: "business", categoryLabel: "أعمال", url: "https://income-igniter-ide.lovable.app",
    icon: TrendingUp, glow: "cyan",
    features: ["تحليل السوق", "تقييم الفرص", "تقارير ذكية", "حاسبات الربحية"],
  },
  {
    id: "7", slug: "hn-driver", name: "HN Driver",
    nameAr: "سائق HN", tagline: "تطبيق نقل وتوصيل ذكي",
    description: "خدمة نقل وتوصيل بأسعار تنافسية مع تتبع لحظي للرحلات.",
    category: "transport", categoryLabel: "نقل", url: "https://smooth-route-guide.lovable.app",
    icon: Car, glow: "magenta",
    features: ["حجز فوري", "تتبع GPS", "دفع إلكتروني", "تقييم السائقين"],
  },
  {
    id: "8", slug: "smart-solutions", name: "HN Smart Solutions",
    nameAr: "HN مركز الحلول الذكية", tagline: "حلول رقمية متكاملة للأعمال",
    description: "بوابة شاملة تجمع أفضل الحلول الذكية للشركات والمؤسسات.",
    category: "services", categoryLabel: "خدمات", url: "https://hn-gr.lovable.app",
    icon: Cpu, glow: "violet",
    features: ["استشارات تقنية", "حلول مخصصة", "دعم 24/7", "تكامل API"],
  },
  {
    id: "9", slug: "tangier-print", name: "HN Tanger Print Studio",
    nameAr: "HN استوديو طنجة للطباعة", tagline: "خدمات طباعة وتصميم احترافية",
    description: "خدمات طباعة وتصميم بجودة عالية مع توصيل سريع لجميع المدن.",
    category: "design", categoryLabel: "تصميم", url: "https://tangier-print-hub.lovable.app",
    icon: Printer, glow: "pink",
    features: ["تصميم احترافي", "طباعة عالية الجودة", "توصيل سريع", "أسعار تنافسية"],
  },
  {
    id: "10", slug: "carwash-manager", name: "HN CarWash Manager",
    nameAr: "HN مدير غسيل السيارات", tagline: "إدارة محطات غسيل السيارات",
    description: "نظام متكامل لإدارة محطات غسيل السيارات والحجوزات والمدفوعات.",
    category: "services", categoryLabel: "خدمات سيارات", url: "https://hn-carwash.lovable.app",
    icon: Droplets, glow: "cyan",
    features: ["حجز المواعيد", "إدارة الموظفين", "تقارير مالية", "نظام ولاء"],
  },
  {
    id: "11", slug: "wash-pal", name: "HN WashPal",
    nameAr: "HN رفيق الغسيل", tagline: "نسخة محسّنة لإدارة غسيل السيارات",
    description: "تطبيق متطور لحجز وإدارة خدمات غسيل السيارات بواجهة عصرية.",
    category: "services", categoryLabel: "خدمات سيارات", url: "https://wash-pal-app.lovable.app",
    icon: Waves, glow: "cyan",
    features: ["حجز سهل", "تتبع الخدمة", "تقييمات", "عروض خاصة"],
  },
  {
    id: "12", slug: "studio-hn", name: "Studio HN",
    nameAr: "استوديو HN", tagline: "استوديو إبداعي للمشاريع الجديدة",
    description: "مساحة إبداعية لإنشاء وتطوير المشاريع الرقمية المبتكرة.",
    category: "studio", categoryLabel: "استوديو", url: "https://studio-hn.lovable.app",
    icon: Palette, glow: "magenta",
    features: ["قوالب جاهزة", "أدوات تصميم", "تعاون فوري", "نشر سريع"],
  },
  {
    id: "13", slug: "domain-monitor", name: "HN Domain Monitor",
    nameAr: "HN مراقب النطاقات", tagline: "مراقبة أداء وحالة النطاقات",
    description: "أداة احترافية لمراقبة حالة النطاقات وتنبيهات الانتهاء والأمان.",
    category: "infra", categoryLabel: "بنية تحتية", url: "#",
    icon: Globe2, glow: "violet",
    features: ["مراقبة 24/7", "تنبيهات فورية", "تقارير SSL", "تحليل DNS"],
  },
  {
    id: "14", slug: "cloud-harmony", name: "HN Cloud Harmony",
    nameAr: "HN تناغم السحابة", tagline: "إدارة الخدمات السحابية بسلاسة",
    description: "منصة موحدة لإدارة ومراقبة خدماتك السحابية عبر مزودين متعددين.",
    category: "infra", categoryLabel: "سحابة", url: "#",
    icon: Cloud, glow: "cyan",
    features: ["لوحة موحدة", "مراقبة الموارد", "تحسين التكاليف", "أمان متقدم"],
  },
];

export function getProjectBySlug(slug: string): NexusProject | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}