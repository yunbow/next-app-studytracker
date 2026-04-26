"use client";

import { useLocaleContext } from "./context";

export function useLocale() {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}
