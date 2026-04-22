import {
  Sparkles, Film, Clapperboard, ShoppingBag, Building2, TrendingUp,
  Car, Cpu, Printer, Droplets, Waves, Palette, Globe2, Cloud,
  Brain, Video, Globe, Briefcase, Wrench, Layers, Zap,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, Film, Clapperboard, ShoppingBag, Building2, TrendingUp,
  Car, Cpu, Printer, Droplets, Waves, Palette, Globe2, Cloud,
  Brain, Video, Globe, Briefcase, Wrench, Layers, Zap,
};

export const GLOW_MAP = {
  violet: "from-[oklch(0.65_0.25_290)] to-[oklch(0.7_0.28_330)]",
  cyan: "from-[oklch(0.85_0.18_200)] to-[oklch(0.65_0.25_290)]",
  magenta: "from-[oklch(0.7_0.28_330)] to-[oklch(0.78_0.22_350)]",
  pink: "from-[oklch(0.78_0.22_350)] to-[oklch(0.65_0.25_290)]",
} as const;

export type GlowKey = keyof typeof GLOW_MAP;

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Sparkles;
  return ICON_MAP[name] ?? Sparkles;
}