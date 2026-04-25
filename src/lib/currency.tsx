import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export type Currency = "USD" | "MAD" | "EUR";

const Ctx = createContext<{ currency: Currency; setCurrency: (c: Currency) => void; format: (cents: { usd: number; mad: number; eur?: number }) => string }>({
  currency: "USD",
  setCurrency: () => {},
  format: () => "",
});

const MANUAL_FLAG = "currency-manual";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const { lang } = useI18n();
  const initialized = useRef(false);

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("currency")) as Currency | null;
    if (saved === "USD" || saved === "MAD" || saved === "EUR") setCurrencyState(saved);
    initialized.current = true;
  }, []);

  // Auto-switch currency based on language unless user manually picked one
  useEffect(() => {
    if (!initialized.current) return;
    if (typeof window === "undefined") return;
    const manual = localStorage.getItem(MANUAL_FLAG) === "1";
    if (manual) return;
    const next: Currency = lang === "ar" ? "MAD" : lang === "fr" ? "EUR" : "USD";
    setCurrencyState(next);
    localStorage.setItem("currency", next);
  }, [lang]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", c);
      localStorage.setItem(MANUAL_FLAG, "1");
    }
  };

  const format = (cents: { usd: number; mad: number; eur?: number }) => {
    if (currency === "USD") {
      const v = cents.usd / 100;
      return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (currency === "EUR") {
      // If no EUR value provided, derive from USD with a stable approx rate (0.92).
      const cEur = cents.eur ?? Math.round(cents.usd * 0.92);
      const v = cEur / 100;
      return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
    }
    const v = cents.mad / 100;
    return `${v.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`;
  };

  return <Ctx.Provider value={{ currency, setCurrency, format }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);
