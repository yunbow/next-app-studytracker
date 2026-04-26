"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { Locale } from "./types";
import { defaultLocale } from "./types";
import { translations } from "./locales";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)[Locale];
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const localeStore = (() => {
  const listeners = new Set<() => void>();
  let overrideLocale: Locale | null = null;

  function readCookieLocale(): Locale | null {
    if (typeof document === "undefined") return null;
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] as Locale | undefined;
    return saved ?? null;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): Locale {
      return overrideLocale ?? readCookieLocale() ?? defaultLocale;
    },
    getServerSnapshot(): Locale {
      return defaultLocale;
    },
    setLocale(newLocale: Locale) {
      overrideLocale = newLocale;
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      listeners.forEach((listener) => listener());
    },
  };
})();

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  );

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale: localeStore.setLocale, t: translations[locale] }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return context;
}
