"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Locale } from "./types";
import { defaultLocale } from "./types";
import { translations } from "./locales";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)[Locale];
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("locale="))
      ?.split("=")[1] as Locale | undefined;

    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
  };

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t: translations[locale] }}
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
