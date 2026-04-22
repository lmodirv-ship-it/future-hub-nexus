import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Currency = "USD" | "MAD";

const Ctx = createContext<{ currency: Currency; setCurrency: (c: Currency) => void; format: (cents: { usd: number; mad: number }) => string }>({
  currency: "USD",
  setCurrency: () => {},
  format: () => "",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("currency")) as Currency | null;
    if (saved === "USD" || saved === "MAD") setCurrencyState(saved);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") localStorage.setItem("currency", c);
  };

  const format = (cents: { usd: number; mad: number }) => {
    if (currency === "USD") {
      const v = cents.usd / 100;
      return `$${v.toLocaleString("en-US", { maximumFractionDigits: v < 100 ? 0 : 0 })}`;
    }
    const v = cents.mad / 100;
    return `${v.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`;
  };

  return <Ctx.Provider value={{ currency, setCurrency, format }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);